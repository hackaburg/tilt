import { validate } from "class-validator";
import { IApiResponse } from "../../../types/api";
import { User } from "../../src/entities/user";
import { ErrorHandlerMiddleware } from "../../src/middlewares/error-handler-middleware";
import { ILoggerService } from "../../src/services/logger-service";
import { ISlackNotificationService } from "../../src/services/slack-service";
import { MockedService } from "../services/mock";
import { MockLoggerService } from "../services/mock/mock-logger-service";
import { MockSlackNotificationService } from "../services/mock/mock-slack-service";
import { MockRequest, MockResponse } from "./mock/express";

describe("ErrorHandlerMiddleware", () => {
  let logger: MockedService<ILoggerService>;
  let slack: MockedService<ISlackNotificationService>;
  let middleware: ErrorHandlerMiddleware;

  beforeEach(() => {
    logger = new MockLoggerService();
    slack = new MockSlackNotificationService();
    middleware = new ErrorHandlerMiddleware(logger.instance, slack.instance);
  });

  it("extracts the first validation error", async () => {
    expect.assertions(1);

    const user = new User();
    const errors = await validate(user);
    const error = {
      errors,
    };

    const req = new MockRequest();
    const res = new MockResponse();
    const next = jest.fn();

    middleware.error(error, req.instance, res.instance, next);

    expect(res.mocks.json).toBeCalledWith({
      error: errors[0].constraints[Object.keys(errors[0].constraints)[0]],
      status: "error",
    } as IApiResponse<any>);
  });

  it("sends the error message", () => {
    const error = {
      message: "test",
    };

    const req = new MockRequest();
    const res = new MockResponse();
    const next = jest.fn();

    middleware.error(error, req.instance, res.instance, next);
    expect(res.mocks.json).toBeCalledWith({
      error: error.message,
      status: "error",
    } as IApiResponse<any>);
  });

  it("keeps the given http code", () => {
    const error = {
      httpCode: 401,
      message: "test",
    };

    const req = new MockRequest();
    const res = new MockResponse();
    const next = jest.fn();

    middleware.error(error, req.instance, res.instance, next);
    expect(res.mocks.status).toBeCalledWith(error.httpCode);
  });

  it("defaults to 500 for missing http codes", () => {
    const error = {
      message: "test",
    };

    const req = new MockRequest();
    const res = new MockResponse();
    const next = jest.fn();

    middleware.error(error, req.instance, res.instance, next);
    expect(res.mocks.status).toBeCalledWith(500);
  });

  it("logs errors without http code", () => {
    const error = {
      message: "test",
      stack: "test",
    };

    const req = new MockRequest();
    const res = new MockResponse();
    const next = jest.fn();

    middleware.error(error, req.instance, res.instance, next);
    expect(logger.mocks.error).toBeCalled();
  });

  it("sends errors without http code to slack", () => {
    const error = {
      message: "test",
      stack: "test",
    };

    const req = new MockRequest();
    const res = new MockResponse();
    const next = jest.fn();

    middleware.error(error, req.instance, res.instance, next);
    expect(slack.mocks.sendMessage).toBeCalled();
  });
});

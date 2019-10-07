import { IConfigurationService } from "../../src/services/config-service";
import {
  ILoggerService,
  LoggerService,
} from "../../src/services/logger-service";
import { MockedService } from "./mock";
import { MockConfigurationService } from "./mock/mock-config-service";

interface IMockedLogger {
  debug: jest.Mock<any, any[]>;
  info: jest.Mock<any, any[]>;
  error: jest.Mock<any, any[]>;
}

interface IMockedWinston {
  createLogger: jest.Mock<IMockedLogger>;
  format: {
    colorize: jest.Mock;
    combine: jest.Mock;
    printf: jest.Mock<any, [(info: any) => string]>;
  };
  transports: {
    Console: jest.Mock;
    File: jest.Mock;
  };
}

jest.mock(
  "winston",
  jest.fn(
    () =>
      ({
        createLogger: jest.fn(),
        format: {
          colorize: jest.fn(),
          combine: jest.fn(),
          printf: jest.fn(),
        },
        transports: {
          Console: jest.fn(),
          File: jest.fn(),
        },
      } as IMockedWinston),
  ),
);

describe("LoggerService", () => {
  let config: MockedService<IConfigurationService>;
  let service: ILoggerService;
  let winston: IMockedWinston;

  beforeEach(() => {
    winston = require("winston");

    config = new MockConfigurationService({
      config: {
        log: {
          filename: "log.log",
          level: "verbose",
        },
      },
    } as any);

    service = new LoggerService(config.instance);
  });

  it("sets up winston", async () => {
    expect.assertions(1);
    await service.bootstrap();
    expect(winston.createLogger).toBeCalled();
  });

  it("logs to both file and console", async () => {
    expect.assertions(2);
    await service.bootstrap();
    expect(winston.transports.File).toBeCalled();
    expect(winston.transports.Console).toBeCalled();
  });

  it("creates a custom log format", async () => {
    expect.assertions(5);
    let messageTransformer: ((info: any) => string) | undefined;
    winston.format.printf.mockImplementation(
      (callback) => (messageTransformer = callback),
    );
    await service.bootstrap();

    expect(winston.format.printf).toBeCalled();
    expect(winston.format.colorize).toBeCalled();

    if (messageTransformer) {
      const logMessage = "test";
      const logLevel = "info";
      const messageWithoutData = messageTransformer({
        caller: {},
        level: logLevel,
        message: logMessage,
        meta: {},
      });

      expect(messageWithoutData).toContain(logMessage);
      expect(messageWithoutData).toContain(logLevel);

      const data = {
        value: 10,
      };
      const messageWithData = messageTransformer({
        caller: {},
        level: logLevel,
        message: logMessage,
        meta: data,
      });
      expect(messageWithData).toContain(JSON.stringify(data));
    }
  });

  it("logs", async () => {
    expect.assertions(3);
    const debug = jest.fn();
    const info = jest.fn();
    const error = jest.fn();

    winston.createLogger.mockImplementation(() => ({
      debug,
      error,
      info,
    }));
    await service.bootstrap();

    const debugMessage = "debug";
    service.debug(debugMessage);
    expect(debug).toBeCalledWith(debugMessage, expect.anything());

    const infoMessage = "info";
    service.info(infoMessage);
    expect(info).toBeCalledWith(infoMessage, expect.anything());

    const errorMessage = "error";
    service.error(errorMessage);
    expect(error).toBeCalledWith(errorMessage, expect.anything());
  });
});

import { Request, Response } from "express";
import { MockedService } from "../../services/mock";

/**
 * A mocked express request.
 */
export const MockRequest = jest.fn(() => (
  new MockedService<Request>({ } as any)
));

/**
 * A mocked express response.
 */
export const MockResponse = jest.fn(() => (
  new MockedService<Response>({
    json: jest.fn(),
    status: jest.fn(),
  } as Partial<Response> as Response)
));

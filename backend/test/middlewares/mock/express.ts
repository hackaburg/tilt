import { Request, Response } from "express";
import { MockedService } from "../../services/mock";

export const MockRequest = jest.fn(() => (
  new MockedService<Request>({ } as any)
));

export const MockResponse = jest.fn(() => (
  new MockedService<Response>({
    json: jest.fn(),
    status: jest.fn(),
  } as Partial<Response> as Response)
));

import { MockedService } from ".";
import { IHttpService } from "../../../src/services/http";

export const MockHttpService = jest.fn(() =>
  new MockedService<IHttpService>({
    bootstrap: jest.fn(),
  })
);

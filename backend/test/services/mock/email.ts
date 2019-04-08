import { MockedService } from ".";
import { IEmailService } from "../../../src/services/email";

export const MockEmailService = jest.fn(() =>
  new MockedService<IEmailService>({
    bootstrap: jest.fn(),
    sendEmail: jest.fn(),
  }),
);

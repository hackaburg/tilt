import { MockedService } from ".";
import { IEmailService } from "../../../src/services/email-service";

/**
 * A mocked email service.
 */
export const MockEmailService = jest.fn(() =>
  new MockedService<IEmailService>({
    bootstrap: jest.fn(),
    sendEmail: jest.fn(),
  }),
);

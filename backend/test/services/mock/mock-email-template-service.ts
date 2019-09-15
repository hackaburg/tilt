import { MockedService } from ".";
import { IEmailTemplateService } from "../../../src/services/email-template-service";

export const MockEmailTemplateService = jest.fn(() => (
  new MockedService<IEmailTemplateService>({
    bootstrap: jest.fn(),
    sendVerifyEmail: jest.fn(),
  })
));

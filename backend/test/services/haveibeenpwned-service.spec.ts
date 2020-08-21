import { IConfigurationService } from "../../src/services/config-service";
import {
  HaveibeenpwnedService,
  IHaveibeenpwnedService,
} from "../../src/services/haveibeenpwned-service";
import { MockedService } from "./mock";
import { MockConfigurationService } from "./mock/mock-config-service";

interface IMockedHIBP {
  pwnedPassword: jest.Mock;
}

jest.mock(
  "hibp",
  jest.fn(
    () =>
      ({
        pwnedPassword: jest.fn(),
      } as IMockedHIBP),
  ),
);

describe("HaveibeenpwnedService", () => {
  let hibp: IMockedHIBP;
  let service: IHaveibeenpwnedService;
  let config: MockedService<IConfigurationService>;

  beforeAll(() => {
    hibp = require("hibp");
  });

  beforeEach(async () => {
    config = new MockConfigurationService({
      config: {
        services: {
          enableHaveibeenpwnedService: true,
        },
      },
    } as any);

    service = new HaveibeenpwnedService(config.instance);
    await service.bootstrap();
  });

  it("queries passwords", async () => {
    expect.assertions(1);

    const value = 100;
    hibp.pwnedPassword.mockResolvedValue(value);

    const count = await service.getPasswordUsedCount("password");
    expect(count).toBe(value);
  });

  it("ignores checks when not enabled", async () => {
    expect.assertions(1);

    config.instance.config.services.enableHaveibeenpwnedService = false;

    const value = 100;
    hibp.pwnedPassword.mockResolvedValue(value);

    const count = await service.getPasswordUsedCount("password");
    expect(count).toBe(0);
  });
});

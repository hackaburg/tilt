import { IConfigurationService } from "../../../src/services/config-service";
import { MockedService } from ".";

export const MockConfigurationService = jest.fn(({ config, isProductionEnabled }: Partial<IConfigurationService>) =>
  new MockedService<IConfigurationService>({
    bootstrap: jest.fn(),
    config: config!,
    isProductionEnabled: isProductionEnabled!,
  })
);

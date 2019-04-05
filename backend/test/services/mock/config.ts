import { IConfigurationService } from "../../../src/services/config";
import { MockedService } from ".";

export const MockConfigurationService = jest.fn(({ config, isProductionEnabled }: Partial<IConfigurationService>) =>
  new MockedService<IConfigurationService>({
    bootstrap: jest.fn(),
    config: config!,
    isProductionEnabled: isProductionEnabled!,
  })
);

import { MockedService } from ".";
import { IConfigurationService } from "../../../src/services/config-service";

/**
 * A mocked configuration service.
 */
export const MockConfigurationService = jest.fn(
  ({ config, isProductionEnabled }: Partial<IConfigurationService>) =>
    new MockedService<IConfigurationService>({
      bootstrap: jest.fn(),
      config: config!,
      isProductionEnabled: isProductionEnabled!,
    }),
);

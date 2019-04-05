import { Tilt } from "../../src/services/tilt";
import { MockConfigurationService } from "./mock/config";
import { MockActivityService } from "./mock/activity";
import { MockLoggerService } from "./mock/logger";
import { MockDatabaseService } from "./mock/database";
import { MockHttpService } from "./mock/http";

describe("TiltService", () => {
  it("bootstraps all services", async () => {
    const logger = new MockLoggerService();
    const config = new MockConfigurationService({ });
    const database = new MockDatabaseService();
    const activity = new MockActivityService();
    const http = new MockHttpService();

    const services = [
      config,
      logger,
      database,
      activity,
      http,
    ];

    expect.assertions(services.length);

    const instances = services.map((service) => service.instance) as ConstructorParameters<typeof Tilt>;
    const tilt = new Tilt(...instances);
    await tilt.bootstrap();

    for (const { mocks } of services) {
      expect(mocks.bootstrap).toBeCalled();
    }
  });
});

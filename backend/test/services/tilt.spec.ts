import { Tilt } from "../../src/services/tilt";
import { MockActivityService } from "./mock/activity";
import { MockConfigurationService } from "./mock/config";
import { MockDatabaseService } from "./mock/database";
import { MockHttpService } from "./mock/http";
import { MockLoggerService } from "./mock/logger";
import { MockUserService } from "./mock/users";

describe("TiltService", () => {
  it("bootstraps all services", async () => {
    const logger = new MockLoggerService();
    const config = new MockConfigurationService({ });
    const database = new MockDatabaseService();
    const activity = new MockActivityService();
    const users = new MockUserService();
    const http = new MockHttpService();

    const services = [
      config,
      logger,
      database,
      activity,
      users,
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

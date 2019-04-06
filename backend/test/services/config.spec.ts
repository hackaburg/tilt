import { ConfigurationService } from "../../src/services/config";

describe("ConfigurationService", () => {
  let env: any;

  beforeAll(() => {
    env = process.env;
    process.env = {
      ...env,
    };
  });

  afterAll(() => {
    process.env = env;
  });

  it("uses default config without a .env file", async () => {
    const dotenv = jest.fn(() => ({ error: new Error("no .env file found") }));
    jest.setMock("dotenv", dotenv);

    const service = new ConfigurationService();
    await service.bootstrap();
    expect(service.config.http.port).toBe(3000);
  });

  it("extracts the environment into the config", async () => {
    const dotenv = jest.fn(() => ({ }));
    jest.setMock("dotenv", dotenv);

    const port = 1337;
    process.env.PORT = `${port}`;

    const service = new ConfigurationService();
    await service.bootstrap();
    expect(service.config.http.port).toBe(port);
  });
});

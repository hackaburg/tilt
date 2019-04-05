import { IConfigurationService } from "../../src/services/config";
import { ITokenService, TokenService } from "../../src/services/tokens";
import { MockedService } from "./mock";
import { MockConfigurationService } from "./mock/config";

interface ITokenData {
  id: number;
}

describe("TokenService", () => {
  let configService: MockedService<IConfigurationService>;
  let tokenService: ITokenService<ITokenData>;

  beforeEach(() => {
    configService = new MockConfigurationService({
      config: {
        secrets: {
          jwtSecret: "secret",
        },
      },
    } as any);

    tokenService = new TokenService(configService.instance);
  });

  it("encrypts data", () => {
    const data: ITokenData = {
      id: 10,
    };
    const encrypted = tokenService.sign(data);
    expect(encrypted).not.toBe(data);
  });

  it("decrypts data", () => {
    const data: ITokenData = {
      id: 10,
    };
    const encrypted = tokenService.sign(data);
    const decrypted = tokenService.decode(encrypted);
    expect(decrypted.id).toBe(data.id);
  });

  it("verifies encrypted data", () => {
    const data: ITokenData = {
      id: 10,
    };
    const encrypted = tokenService.sign(data);
    const [header, value, signature] = encrypted.split(".");
    const brokenSignature = signature.toLowerCase();
    const brokenEncrypted = `${header}.${value}.${brokenSignature}`;
    const throws = () => tokenService.decode(brokenEncrypted);
    expect(throws).toThrow();
  });
});

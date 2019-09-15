import { HaveibeenpwnedService, IHaveibeenpwnedService } from "../../src/services/haveibeenpwned-service";

describe("HaveibeenpwnedService", () => {
  let service: IHaveibeenpwnedService;

  beforeEach(async () => {
    service = new HaveibeenpwnedService();
    await service.bootstrap();
  });

  it("queries passwords", async () => {
    expect.assertions(1);

    const count = await service.getPasswordUsedCount("password");
    expect(count).toBeDefined();
  });
});

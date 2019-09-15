import { join } from "path";
import { Connection, createConnection, Repository } from "typeorm";
import { MockedService } from ".";
import { IDatabaseService } from "../../../src/services/database-service";

export const MockDatabaseService = jest.fn(() =>
  new MockedService<IDatabaseService>({
    bootstrap: jest.fn(),
    getRepository: jest.fn(),
  }),
);

export class TestDatabaseService implements IDatabaseService {
  private _connection?: Connection;

  public getRepository<T>(entity: new () => T): Repository<T> {
    return this._connection!.getRepository<T>(entity);
  }

  public async bootstrap(): Promise<void> {
    this._connection = await createConnection({
      database: ":memory:",
      entities: [
        join(__dirname, "../../../src/entities/*"),
      ],
      synchronize: true,
      type: "sqlite",
    });
  }
}

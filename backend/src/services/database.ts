import { join } from "path";
import { Container, Service } from "typedi";
import { Connection, createConnection, Repository, useContainer } from "typeorm";
import { IService } from ".";
import { ConfigurationService } from "./config";
import { LoggerService } from "./log";

type Entity<T> = new () => T;

/**
 * A service providing access to a database.
 */
@Service()
export class DatabaseService implements IService {
  private _connection?: Connection;

  public constructor(
    private readonly _config: ConfigurationService,
    private readonly _logger: LoggerService,
  ) { }

  /**
   * Connects to a database.
   */
  public async bootstrap(): Promise<void> {
    useContainer(Container);

    try {
      this._connection = await createConnection({
        database: this._config.config.database.databaseName,
        entities: [
          join(__dirname, "../entities/*"),
        ],
        host: this._config.config.database.host,
        password: this._config.config.database.password,
        port: this._config.config.database.port,
        synchronize: true,
        type: "mariadb",
        username: this._config.config.database.username,
      });

      this._logger.info(`connected to database on ${this._config.config.database.host}`);
    } catch (error) {
      this._logger.error(`unable to connect to database: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Gets a repository for the given entity.
   * @param entity The entity to get a repository for
   */
  public getRepository<T>(entity: Entity<T>): Repository<T> {
    if (!this._connection) {
      this._logger.error("no database connection, unable to access repository");
      process.exit(1);
    }

    return this._connection!.manager.getRepository<T>(entity);
  }
}

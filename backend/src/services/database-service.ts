import { join } from "path";
import { Container, Inject, Service, Token } from "typedi";
import {
  Connection,
  createConnection,
  Repository,
  useContainer,
} from "typeorm";
import { IService } from ".";
import {
  ConfigurationServiceToken,
  IConfigurationService,
} from "./config-service";
import { ILoggerService, LoggerServiceToken } from "./logger-service";

type Entity<T> = new () => T;

/**
 * An interface describing database access.
 */
export interface IDatabaseService extends IService {
  /**
   * Gets a repository for the given entity.
   * @param entity The entity to retrieve a repository for
   */
  getRepository<T>(entity: Entity<T>): Repository<T>;
}

/**
 * A token used to inject a database service implementation.
 */
export const DatabaseServiceToken = new Token<IDatabaseService>();

/**
 * A service providing access to a database.
 */
@Service(DatabaseServiceToken)
export class DatabaseService implements IDatabaseService {
  private _connection?: Connection;

  public constructor(
    @Inject(ConfigurationServiceToken)
    private readonly _config: IConfigurationService,
    @Inject(LoggerServiceToken) private readonly _logger: ILoggerService,
  ) {}

  /**
   * Connects to a database.
   */
  public async bootstrap(): Promise<void> {
    useContainer(Container);

    try {
      this._connection = await createConnection({
        database: this._config.config.database.databaseName,
        entities: [join(__dirname, "../entities/*")],
        host: this._config.config.database.host,
        password: this._config.config.database.password,
        port: this._config.config.database.port,
        synchronize: true,
        type: "mariadb",
        username: this._config.config.database.username,
      });

      this._logger.info(
        `connected to database on ${this._config.config.database.host}`,
      );
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

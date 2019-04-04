import * as convict from "convict";
import * as dotenv from "dotenv";
import { Service } from "typedi";
import { IService } from ".";

interface ITiltConfiguration {
  app: IAppConfiguration;
  database: IDatabaseConfiguration;
  http: IHttpConfiguration;
  log: ILoggerConfiguration;
}

interface IAppConfiguration {
  nodeEnv: string;
}

interface IHttpConfiguration {
  port: number;
}

interface ILoggerConfiguration {
  filename: string;
  level: string;
}

interface IDatabaseConfiguration {
  host: string;
  port: number;
  username: string;
  password: string;
  databaseName: string;
}

/**
 * The environment this process currently runs in.
 */
export enum NodeEnvironment {
  Production = "production",
  Development = "development",
}

/**
 * Provides access to tilt's configuration.
 */
@Service()
export class ConfigurationService implements IService {
  private _config?: ITiltConfiguration;

  public get isProductionEnabled(): boolean {
    return this.config.app.nodeEnv === NodeEnvironment.Production;
  }

  public get config(): ITiltConfiguration {
    if (!this._config) {
      // tslint:disable-next-line: no-console
      console.error("no configuration found, exiting");
      process.exit(1);
    }

    return this._config!;
  }

  /**
   * Loads environment variables from the .env file.
   */
  private async loadEnvFile() {
    const { error } = dotenv.config();

    if (error) {
      // tslint:disable-next-line: no-console
      console.warn(`error loading .env configuration: ${error}`);
    }
  }

  /**
   * Loads tilt's configuration from the environment variables.
   */
  public async bootstrap(): Promise<void> {
    await this.loadEnvFile();

    const schema = convict<ITiltConfiguration>({
      app: {
        nodeEnv: {
          default: NodeEnvironment.Development,
          env: "NODE_ENV",
          format: String,
        },
      },
      database: {
        databaseName: {
          default: "tilt",
          env: "DATABASE_NAME",
          format: String,
        },
        host: {
          default: "",
          env: "DATABASE_HOST",
          format: String,
        },
        password: {
          default: "",
          env: "DATABASE_PASSWORD",
          format: String,
        },
        port: {
          default: 0,
          env: "DATABASE_PORT",
          format: "port",
        },
        username: {
          default: "",
          env: "DATABASE_USERNAME",
          format: String,
        },
      },
      http: {
        port: {
          default: 3000,
          env: "PORT",
          format: "int",
        },
      },
      log: {
        filename: {
          default: "tilt.log",
          env: "LOG_FILENAME",
          format: String,
        },
        level: {
          default: "info",
          env: "LOG_LEVEL",
          format: String,
        },
      },
    });

    schema.validate({
      allowed: "strict",
    });

    this._config = schema.getProperties();
  }
}

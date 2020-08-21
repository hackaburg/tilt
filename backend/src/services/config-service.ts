import { genSalt } from "bcrypt";
import * as convict from "convict";
import * as dotenv from "dotenv";
import { Service, Token } from "typedi";
import { IService } from ".";

interface ITiltConfiguration {
  app: IAppConfiguration;
  database: IDatabaseConfiguration;
  http: IHttpConfiguration;
  log: ILoggerConfiguration;
  mail: IMailConfiguration;
  secrets: ISecretsConfiguration;
  services: IServicesConfiguration;
}

interface IAppConfiguration {
  nodeEnv: string;
}

interface IHttpConfiguration {
  port: number;
  publicDirectory: string;
  baseURL: string;
}

interface ILoggerConfiguration {
  filename: string;
  level: string;
  slackWebhookUrl: string;
}

interface IMailConfiguration {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface IDatabaseConfiguration {
  host: string;
  port: number;
  username: string;
  password: string;
  databaseName: string;
}

interface ISecretsConfiguration {
  jwtSecret: string;
}

interface IServicesConfiguration {
  enableHaveibeenpwnedService: boolean;
}

/**
 * The environment this process currently runs in.
 */
export enum NodeEnvironment {
  Production = "production",
  Development = "development",
}

/**
 * An interface describing the configuration service.
 */
export interface IConfigurationService extends IService {
  readonly isProductionEnabled: boolean;
  readonly config: ITiltConfiguration;
}

/**
 * A token used to inject a configuration service implementation.
 */
export const ConfigurationServiceToken = new Token<IConfigurationService>();

/**
 * Provides access to tilt's configuration.
 */
@Service(ConfigurationServiceToken)
export class ConfigurationService implements IConfigurationService {
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
        baseURL: {
          default: "",
          env: "BASE_URL",
          format: String,
        },
        port: {
          default: 3000,
          env: "PORT",
          format: "int",
        },
        publicDirectory: {
          default: __dirname,
          env: "HTTP_PUBLIC_DIRECTORY",
          format: String,
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
        slackWebhookUrl: {
          default: "",
          env: "LOG_SLACK_WEBHOOK_URL",
          format: String,
        },
      },
      mail: {
        host: {
          default: "",
          env: "MAIL_HOST",
          format: String,
        },
        password: {
          default: "",
          env: "MAIL_PASSWORD",
          format: String,
        },
        port: {
          default: 467,
          env: "MAIL_PORT",
          format: "port",
        },
        username: {
          default: "",
          env: "MAIL_USERNAME",
          format: String,
        },
      },
      secrets: {
        jwtSecret: {
          default: await genSalt(3),
          env: "SECRET_JWT",
          format: String,
        },
      },
      services: {
        enableHaveibeenpwnedService: {
          default: true,
          env: "ENABLE_HAVEIBEENPWNED_SERVICE",
          format: Boolean,
        },
      },
    });

    schema.validate({
      allowed: "strict",
    });

    this._config = schema.getProperties();
  }
}

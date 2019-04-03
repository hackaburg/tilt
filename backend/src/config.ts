import * as convict from "convict";
import * as dotenv from "dotenv";

const envParseResult = dotenv.config();

if (envParseResult.error) {
  // tslint:disable-next-line: no-console
  console.warn(`Error loading .env configuration: ${envParseResult.error}`);
}

interface ITiltConfiguration {
  http: IHttpConfiguration;
}

interface IHttpConfiguration {
  port: number;
}

const schema = convict<ITiltConfiguration>({
  http: {
    port: {
      default: 3000,
      env: "PORT",
      format: "int",
    },
  },
});

schema.validate({
  allowed: "strict",
});

/**
 * The tilt configuration, created from environment variables.
 */
export const config = schema.getProperties();

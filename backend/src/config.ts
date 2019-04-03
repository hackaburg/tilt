import * as convict from "convict";

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

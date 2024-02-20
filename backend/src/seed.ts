import { configDotenv } from "dotenv";
import { join } from "path";
import Container from "typedi";
import { Connection, createConnection, useContainer } from "typeorm";

declare var connection: Connection | undefined;

async function bootstrap() {
  configDotenv();
  useContainer(Container);

  try {
    connection = await createConnection({
      database: process.env.DATABASE_NAME,
      entities: [join(__dirname, "../entities/*")],
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASSWORD,
      port: +process.env.DATABASE_PORT!,
      synchronize: true,
      type: "mariadb",
      username: process.env.DATABASE_USERNAME,
    });

    console.log("connected to database", connection.options.database);
  } catch (error) {
    console.error(`unable to connect to database: ${error}`);
    process.exit(1);
  }
}

bootstrap();

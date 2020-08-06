import "reflect-metadata";
import { Container } from "typedi";
import { User } from "./entities/user";
import { UserRole } from "./entities/user-role";
import { ConfigurationServiceToken } from "./services/config-service";
import { DatabaseServiceToken } from "./services/database-service";
import { LoggerServiceToken } from "./services/logger-service";

(async () => {
  const config = Container.get(ConfigurationServiceToken);
  await config.bootstrap();

  const logger = Container.get(LoggerServiceToken);
  await logger.bootstrap();

  const argv = process.argv
    .slice(2)
    .map((arg) => arg.trim())
    .filter((arg) => arg.length > 0);

  if (argv.length !== 2) {
    logger.error("invalid argument count provided. expected email and role");
    process.exit(1);
  }

  const [email, role] = argv as [string, UserRole];
  const validRoles = Object.values(UserRole);
  const isValidRole = validRoles.includes(role);

  if (!isValidRole) {
    const availableRoles = validRoles.join(", ");

    logger.error(
      `'${role}' is not a valid user role (available roles: ${availableRoles})`,
    );

    process.exit(1);
  }

  const database = Container.get(DatabaseServiceToken);
  await database.bootstrap();

  const repo = database.getRepository(User);
  const user = await repo.findOne({
    email,
  });

  if (!user) {
    logger.error(`no user with email '${email}' found`);
    process.exit(1);
  }

  user.role = role;
  await repo.save(user);

  logger.info(`user ${user.id} (${user.email}) set to ${user.role}`);
  process.exit(0);
})();

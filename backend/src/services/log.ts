import { Service } from "typedi";
import { createLogger, format, Logger, transports } from "winston";
import { IService } from ".";
import { ConfigurationService } from "./config";

const loggerFormat = format.printf(({ level, message, ...meta }) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}]\t${message}`;

  if (Object.keys(meta).length > 0) {
    const json = JSON.stringify(meta);
    return `${logMessage} ${json}`;
  }

  return logMessage;
});

@Service()
export class LoggerService implements IService {
  private _logger?: Logger;

  public constructor(
    private readonly _config: ConfigurationService,
  ) { }

  /**
   * Sets up the logger service.
   */
  public async bootstrap(): Promise<void> {
    this._logger = createLogger({
      level: this._config.config.log.level,
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            loggerFormat,
          ),
        }),
        new transports.File({
          filename: this._config.config.log.filename,
          format: loggerFormat,
        }),
      ],
    });
  }

  /**
   * Logs a debug message.
   * @param message The message to log
   * @param meta Additional data to log
   */
  public debug(message: string, ...meta: any[]) {
    if (this._logger) {
      this._logger.debug(message, ...meta);
    }
  }

  /**
   * Logs an info message.
   * @param message The message to log
   * @param meta Additional data to log
   */
  public info(message: string, ...meta: any[]) {
    if (this._logger) {
      this._logger.info(message, ...meta);
    }
  }

  /**
   * Logs an error message.
   * @param message The message to log
   * @param meta Additional data to log
   */
  public error(message: string, ...meta: any[]) {
    if (this._logger) {
      this._logger.error(message, ...meta);
    }
  }
}

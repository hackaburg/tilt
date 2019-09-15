import { relative } from "path";
import { Inject, Service, Token } from "typedi";
import { createLogger, format, Logger, transports } from "winston";
import { IService } from ".";
import { ConfigurationServiceToken, IConfigurationService } from "./config-service";

interface ICallerInformation {
  file: string;
  line: number;
  function: string;
}

/**
 * An interface describing the logger service.
 */
export interface ILoggerService extends IService {
  /**
   * Logs a debug message.
   * @param message The message to log
   * @param meta Additional data to log
   */
  debug(message: string, ...meta: any[]): void;

  /**
   * Logs an info message.
   * @param message The message to log
   * @param meta Additional data to log
   */
  info(message: string, ...meta: any[]): void;

  /**
   * Logs an error message.
   * @param message The message to log
   * @param meta Additional data to log
   */
  error(message: string, ...meta: any[]): void;
}

/**
 * A token used to inject a concrete logger service.
 */
export const LoggerServiceToken = new Token<ILoggerService>();

@Service(LoggerServiceToken)
export class LoggerService implements ILoggerService {
  private _logger?: Logger;

  public constructor(
    @Inject(ConfigurationServiceToken) private readonly _config: IConfigurationService,
  ) { }

  /**
   * Gets the information of the function calling the logger.
   */
  private getCallerInformation(): ICallerInformation {
    const stack = new Error().stack;
    const unknownInfo: ICallerInformation = {
      file: "unknown",
      function: "unknown",
      line: 0,
    };

    if (!stack) {
      return unknownInfo;
    }

    const callerLine = stack.split("\n")[3];

    if (!callerLine) {
      return unknownInfo;
    }

    const info = /at (\S+) \(([^\:]+):(\d+)/g.exec(callerLine);

    if (!info) {
      return unknownInfo;
    }

    return {
      file: relative(process.cwd(), info[2]),
      function: info[1],
      line: Number(info[3]),
    };
  }

  /**
   * Sets up the logger service.
   */
  public async bootstrap(): Promise<void> {
    const loggerFormat = format.printf(({ level, message, ...args }) => {
      const timestamp = new Date().toISOString();
      const { meta, caller } = args;
      const logMessage = `[${timestamp}] [${level}] [${caller.file}:${caller.line}] [${caller.function}] ${message}`;

      if (Object.keys(meta).length > 0) {
        const json = JSON.stringify(meta);
        return `${logMessage} ${json}`;
      }

      return logMessage;
    });

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
      this._logger.debug(message, {
        caller: this.getCallerInformation(),
        meta,
      });
    }
  }

  /**
   * Logs an info message.
   * @param message The message to log
   * @param meta Additional data to log
   */
  public info(message: string, ...meta: any[]) {
    if (this._logger) {
      this._logger.info(message, {
        caller: this.getCallerInformation(),
        meta,
      });
    }
  }

  /**
   * Logs an error message.
   * @param message The message to log
   * @param meta Additional data to log
   */
  public error(message: string, ...meta: any[]) {
    if (this._logger) {
      this._logger.error(message, {
        caller: this.getCallerInformation(),
        meta,
      });
    }
  }
}

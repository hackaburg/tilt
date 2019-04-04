import { ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { ExpressErrorMiddlewareInterface, Middleware } from "routing-controllers";
import { IApiResponse } from "../../../types/api";
import { LoggerService } from "../services/log";

/**
 * Get the first validation error message from an array of validation errors.
 * @param errors Errors from validating an object
 */
const findFirstValidationError = (errors: ValidationError[]): string => {
  for (const { constraints, children } of errors) {
    if (constraints) {
      const keys = Object.keys(constraints);

      if (keys.length > 0) {
        return constraints[keys[0]];
      }
    }

    if (children) {
      const childrenConstraint = findFirstValidationError(children);

      if (childrenConstraint) {
        return childrenConstraint;
      }
    }
  }

  return "";
};

/**
 * An error handler, which transforms errors to @see IApiResponse.
 */
@Middleware({ type: "after" })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  public constructor(
    private readonly _logger: LoggerService,
  ) { }

  /**
   * Sends an error message as defined in @see IApiResponse
   * @param error The thing that happened
   * @param _req The express request
   * @param res The express response
   * @param _next The express next function
   */
  public error(error: any, _req: Request, res: Response, _next: NextFunction): void {
    const response: IApiResponse<never> = {
      error: error.message,
      status: "error",
    };

    if (Array.isArray(error.errors)) {
      const validations = error.errors as ValidationError[];
      response.error = findFirstValidationError(validations) || "unknown validation error";
    }

    if (!error.httpCode) {
      this._logger.error(error.message, { error });
    }

    res.status(error.httpCode || 500);
    res.json(response);
  }
}

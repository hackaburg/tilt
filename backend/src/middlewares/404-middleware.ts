import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { IApiResponse } from "../controllers/api";

@Middleware({ type: "after", priority: 1000 })
export class FinalMiddleware implements ExpressMiddlewareInterface {
  /**
   * Sends a 404 error api response.
   * @param req The incoming request
   * @param res The response
   * @param next The express next function
   */
  public use(req: Request, res: Response, next: NextFunction): void {
    if (!res.headersSent && req.path.startsWith("/api")) {
      res.status(404);
      res.send({
        error: `route ${req.path} not found`,
        status: "error",
      } as IApiResponse<any>);
      res.end();
      return;
    }

    next();
  }
}

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
    // we need to explicitly exclude the websocket endpoint, as this
    // middleware is run before the websocket one
    // also, we can't reorder the ws endpoint in the http service,
    // because it requires the http server to be present already,
    // which in turn requires the controllers and middlewares to
    // be registered already
    if (req.path.startsWith("/api/ws/")) {
      next();
      return;
    }

    if (!res.headersSent) {
      res.status(404);
      res.send({
        error: `route ${req.path} not found`,
        status: "error",
      } as IApiResponse<any>);
    }

    res.end();
  }
}

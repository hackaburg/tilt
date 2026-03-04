import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";

@Middleware({ type: "before" })
export class LoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: any, response: any, next: (err: any) => any): void {
    // TODO maybe remove this middleware, idk if I'll really need it.
    //  Or maybe keep it but only do this if debugging is on.
    //  But I'd want the proper logging object for this.
    console.log("Incoming", request.method, request.url);
    next(undefined);
  }
}

import { Action, Interceptor, InterceptorInterface } from "routing-controllers";
import { IApiResponse } from "../../../types/api";

/**
 * An interceptor to modify responses according to @see IApiResponse
 */
@Interceptor()
export class ResponseInterceptor implements InterceptorInterface {
  /**
   * Adjusts the response according to @see IApiResponse
   * @param action The action performed in the controller
   * @param result The controller's response
   */
  public intercept(_action: Action, data: any): IApiResponse<any> {
    return {
      data,
      status: "ok",
    };
  }
}

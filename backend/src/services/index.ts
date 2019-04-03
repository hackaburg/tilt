/**
 * An interface describing services.
 */
export interface IService {
  /**
   * Bootstraps the service, i.e. does setup work.
   */
  bootstrap(): Promise<void>;
}

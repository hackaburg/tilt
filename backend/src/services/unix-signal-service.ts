import { Service, Token } from "typedi";
import { IService } from ".";

type ISignalHandler = (signal: string) => Promise<void>;

/**
 * A service to interact with unix signals.
 */
export interface IUnixSignalService extends IService {
  /**
   * Registers a handler for the given unix signal.
   * @param signal The signal to register
   * @param handler The handler to use for the signal
   */
  registerSignalHandler(
    signal: NodeJS.Signals,
    handler: ISignalHandler,
  ): Promise<void>;
}

/**
 * A token used to inject a concrete unix signal service.
 */
export const UnixSignalServiceToken = new Token<IUnixSignalService>();

@Service(UnixSignalServiceToken)
export class UnixSignalService implements IUnixSignalService {
  private readonly _handlers: Map<NodeJS.Signals, ISignalHandler[]>;

  constructor() {
    this._handlers = new Map();
  }

  /**
   * Bootstraps the signal service, i.e. noop.
   */
  public async bootstrap(): Promise<void> {
    return;
  }

  /**
   * Executes all handlers for the given signal.
   * @param signal The signal to handle
   */
  private async handleSignal(signal: NodeJS.Signals): Promise<void> {
    const handlers = this._handlers.get(signal) || [];

    for (const handler of handlers) {
      await handler(signal);
    }
  }

  /**
   * Registers the given handler to execute for the given signal.
   * @param signal The signal to register
   * @param handler The handler to use for the signal
   */
  public async registerSignalHandler(
    signal: NodeJS.Signals,
    handler: ISignalHandler,
  ): Promise<void> {
    if (!this._handlers.has(signal)) {
      this._handlers.set(signal, [() => process.exit()]);

      process.on(signal, () => this.handleSignal(signal));
    }

    this._handlers.get(signal)?.unshift(handler);
  }
}

import { Authorized, Delete, JsonController } from "routing-controllers";
import { Inject } from "typedi";
import { UserRole } from "../entities/user-role";
import { IPruneService, PruneServiceToken } from "../services/prune-service";

@JsonController("/system")
export class SystemController {
  public constructor(
    @Inject(PruneServiceToken) private readonly _prune: IPruneService,
  ) {}

  /**
   * Prunes all user data.
   */
  @Delete("/prune")
  @Authorized(UserRole.Root)
  public async prune(): Promise<void> {
    await this._prune.prune();
  }
}

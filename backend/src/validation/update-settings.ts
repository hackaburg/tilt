import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { IRecursivePartial } from "../../../types/api";
import { ISettings, IUpdateSettingsApiRequest } from "../../../types/settings";
import { Settings } from "../entities/settings";

export class UpdateSettingsApiRequest implements IUpdateSettingsApiRequest {
  @ValidateNested()
  @Type(() => Settings)
  public data!: IRecursivePartial<ISettings>;
}

import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { IApiRequest } from "../../../types/api";
import { IUserSignupRequestBody } from "../../../types/user-signup";
import { User } from "../entities/user";

export class UserSignupApiRequest implements IApiRequest<IUserSignupRequestBody> {
  @IsDefined()
  @ValidateNested()
  @Type(() => User)
  public data!: IUserSignupRequestBody;
}

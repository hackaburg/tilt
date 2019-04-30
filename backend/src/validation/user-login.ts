import { Type } from "class-transformer";
import { IsDefined, ValidateNested } from "class-validator";
import { IApiRequest } from "../../../types/api";
import { IUserLoginRequestBody } from "../../../types/user-login";
import { User } from "../entities/user";

export class UserLoginApiRequest implements IApiRequest<IUserLoginRequestBody> {
  @IsDefined()
  @ValidateNested()
  @Type(() => User)
  public data!: IUserLoginRequestBody;
}

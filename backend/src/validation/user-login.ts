import { Type } from "class-transformer";
import { IsDefined, IsEmail, IsString, ValidateNested } from "class-validator";
import { IApiRequest } from "../../../types/api";
import { IUserLoginRequestBody } from "../../../types/user-login";

class UserLoginRequestBody implements IUserLoginRequestBody {
  @IsEmail()
  public email!: string;

  @IsString()
  public password!: string;
}

export class UserLoginApiRequest implements IApiRequest<UserLoginRequestBody> {
  @IsDefined()
  @ValidateNested()
  @Type(() => UserLoginRequestBody)
  public data!: IUserLoginRequestBody;
}

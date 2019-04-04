import { Type } from "class-transformer";
import { IsDefined, IsEmail, MinLength, ValidateNested } from "class-validator";
import { IApiRequest } from "../../../types/api";
import { IUserSignupRequestBody } from "../../../types/user-signup";

class UserSignupRequestBody implements IUserSignupRequestBody {
  @IsEmail()
  public email!: string;

  @MinLength(6)
  public password!: string;
}

export class UserSignupApiRequest implements IApiRequest<UserSignupRequestBody> {
  @IsDefined()
  @ValidateNested()
  @Type(() => UserSignupRequestBody)
  public data!: UserSignupRequestBody;
}

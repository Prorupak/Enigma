import { ValidateRequest } from "@/helpers/validation";
import { AuthMethod, UserModel } from "@/models/auth/user";
import { catchAsync } from "@/utils/catchAsync";
import * as signupValidator from "@/validations/auth/signup.validations";

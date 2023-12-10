import { Request as ExpressRequest } from "express";
import { TUser } from "@/types";
import { Types } from "mongoose";

declare module "express" {
  interface Request {
    user: TUser;
  }
}

// TODO: fix (any) types
declare global {
  namespace Express {
    interface Request {
      clientIp: string | undefined;
      isUserCompleted: boolean;
      providerAuthToken: string | undefined;
      accessToken: string | undefined;
      accessId: string | undefined;
      serviceTokenData: any;
      apiKeyData: any;
      query?: any;
      tokenVersionId?: Types.ObjectId;
      authData: any;
      realIP: string;
      requestData: {
        [key: string]: string;
      };
    }
  }
}

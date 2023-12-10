import crypto from "crypto";
import { config } from "@/config";
import {
  TOKEN_EMAIL_CONFIRMATION,
  TOKEN_EMAIL_ENTERPRISE_INVITATION,
  TOKEN_EMAIL_MFA,
  TOKEN_EMAIL_PASSWORD_RESET,
} from "@/constants";
import { TokenDataModel } from "@/models/auth/token";
import { UnauthorizedRequestError } from "@/utils/errors";
import bcrypt from "bcrypt";
import { Types } from "mongoose";

export type TokenTypes =
  | "emailConfirmation"
  | "emailMfa"
  | "enterpriseInvitation"
  | "passwordReset";

export type ITokenHelper<T = {}> = {
  type: TokenTypes;
  email?: string;
  phoneNumber?: string;
  enterpriseId?: Types.ObjectId;
} & {
  [key in keyof T]: T[key];
};

export type ICreateTokenHelper = ITokenHelper;
export type IValidateTokenHelper = ITokenHelper<{
  token: string;
}>;

export type TokenDataQuery = {
  type: string;
  email?: string;
  phoneNumber?: string;
  enterprise?: Types.ObjectId;
};

export type TokenDataUpdate = {
  type: string;
  email?: string;
  phoneNumber?: string;
  enterprise?: Types.ObjectId;
  tokenHash: string;
  triesLeft?: number;
  expiresAt: Date;
};

export const createToken = async ({
  type,
  email,
  phoneNumber,
  enterpriseId,
}: ICreateTokenHelper) => {
  let token, expiresAt, triesLeft;

  switch (type) {
    case TOKEN_EMAIL_CONFIRMATION:
      token = String(crypto.randomInt(Math.pow(10, 5), Math.pow(10, 6) - 1)); // random 6-digit code
      expiresAt = new Date(new Date().getTime() + 86400000); // 24 hours
      break;
    case TOKEN_EMAIL_MFA:
      token = String(crypto.randomInt(Math.pow(10, 5), Math.pow(10, 6) - 1)); // random 6-digit code
      triesLeft = 5; // 5 tries
      expiresAt = new Date(new Date().getTime() + 300000); // 5 minutes
      break;
    case TOKEN_EMAIL_ENTERPRISE_INVITATION:
      token = crypto.randomBytes(16).toString("hex"); // random hex
      expiresAt = new Date(new Date().getTime() + 259200000); // 3 days
      break;
    case TOKEN_EMAIL_PASSWORD_RESET:
      token = crypto.randomBytes(16).toString("hex"); // random hex
      expiresAt = new Date(new Date().getTime() + 86400000); // 24 hours
      break;
    default:
      token = crypto.randomBytes(16).toString("hex"); // random hex
      expiresAt = new Date(); // expired
      break;
  }

  const query: TokenDataQuery = { type };
  const update: TokenDataUpdate = {
    type,
    tokenHash: await bcrypt.hash(token, config.saltRounds),
    expiresAt,
  };

  if (email) {
    query.email = email;
    update.email = email;
  }

  if (phoneNumber) {
    query.phoneNumber = phoneNumber;
    update.phoneNumber = phoneNumber;
  }

  if (enterpriseId) {
    query.enterprise = enterpriseId;
    update.enterprise = enterpriseId;
  }

  if (triesLeft) {
    update.triesLeft = triesLeft;
  }

  await TokenDataModel.updateOne(
    {
      ...query,
      expiresAt: { $gt: new Date() },
    },
    update,
    { upsert: true },
  );

  return token;
};

/**
 * Validates the provided token.
 * @param {IValidateTokenHelper} params - Parameters for validating the token.
 * @returns {Promise<void>} - Resolves if the token is valid; otherwise, rejects with an error.
 */
export const validateTokenHelper = async ({
  token,
  type,
  email,
  enterpriseId,
  phoneNumber,
}: IValidateTokenHelper): Promise<void> => {
  type Query = Omit<
    ITokenHelper<{
      enterprise?: Types.ObjectId;
    }>,
    "enterpriseId"
  >;

  const query: Query = { type };

  if (email) {
    query.email = email;
  }

  if (phoneNumber) {
    query.phoneNumber = phoneNumber;
  }

  if (enterpriseId) {
    query.enterprise = enterpriseId;
  }

  const tokenData = await TokenDataModel.findOne(query)
    .select("+tokenHash")
    .lean();

  if (!tokenData) {
    throw new Error(
      "Sorry, we couldn't validate your token. Please double-check it for accuracy.",
    );
  }

  if (tokenData.expiresAt < new Date()) {
    throw UnauthorizedRequestError({
      message: "Sorry, your session has expired. Please log in again.",
      context: {
        code: "mfa_expired",
      },
    });
  }

  const isTokenValid = await bcrypt.compare(token, tokenData.tokenHash);

  if (!isTokenValid) {
    if (tokenData.triesLeft !== undefined) {
      if (tokenData.triesLeft === 1) {
        await TokenDataModel.findByIdAndDelete(tokenData._id);
      } else {
        await TokenDataModel.findByIdAndUpdate(
          tokenData._id,
          {
            triesLeft: tokenData.triesLeft - 1,
          },
          {
            new: true,
          },
        );
      }

      throw UnauthorizedRequestError({
        message:
          "Oops! The MFA code you entered is not valid. Please double-check the code and try again.",
        context: {
          code: "mfa_invalid",
          triesLeft: tokenData.triesLeft - 1,
        },
      });
    }

    throw UnauthorizedRequestError({
      message:
        "Oops! The MFA code you entered is not valid. Please double-check the code and try again.",
      context: {
        code: "mfa_invalid",
      },
    });
  }

  // Token is valid
  await TokenDataModel.findByIdAndDelete(tokenData._id);
};

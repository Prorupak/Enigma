import { Types } from "mongoose";

export type IToken = {
  email: string;
  token: string;
  createdAt: Date;
  ttl: number;
};

export type ITokenData = {
  type: string;
  email?: string;
  phoneNumber?: string;
  entity?: Types.ObjectId;
  tokenHash: string;
  triesLeft?: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ITokenVersion = Document & {
  user: Types.ObjectId;
  ip: string;
  userAgent: string;
  refreshVersion: number;
  accessVersion: number;
  lastUsed: Date;
};

import { Document, Types } from "mongoose";

export enum AuthMethod {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
}

export type IUser = Document & {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email?: string;
  admin?: boolean;
  authProvider?: AuthMethod;
  authMethods: AuthMethod[];
  protectedKey: string;
  protectedKeyIV: string;
  protectedKeyTag: string;
  publicKey?: string;
  encryptedPrivateKey?: string;
  iv?: string;
  tag?: string;
  salt?: string;
  verifier?: string;
  isMfaEnabled?: boolean;
  mfaMethods?: boolean;
  devices: {
    ip: string;
    userAgent: string;
  }[];
}

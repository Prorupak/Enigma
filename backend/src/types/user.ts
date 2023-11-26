import { Types } from "mongoose";

export enum Providers {
  LOCAL = "local",
  GOOGLE = "google",
  FACEBOOK = "facebook",
  GITHUB = "github",
  TWITTER = "twitter",
  LINKEDIN = "linkedin",
}

export type DeviceInfo = {
  ip: string;
  useAgent: string;
};

export type TUser = {
  profile: {
    email: string;
    admin?: boolean;
    firstName?: string;
    lastName?: string;
  };
  encryption: {
    iv?: string;
    salt?: string;
    tag?: string;
    authenticator?: string;
    encryptionVersion?: number;
    protectedKey: string;
    protectedKeyIV: string;
    protectedKeyTag: string;
    publicKey?: string;
    encryptedPrivateKey?: string;
  };
  provider: Providers;
  authProviders: Providers[];
  isMfaEnabled?: boolean; // multi-factor authentication
  mfaMethods?: boolean;
  devices?: DeviceInfo[];
};

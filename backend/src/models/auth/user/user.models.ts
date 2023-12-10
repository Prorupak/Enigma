import { Schema, model } from "mongoose";
import { IUser, AuthMethod } from "./user.types";

const userSchema = new Schema<IUser>({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  admin: Boolean,
  authProvider: {
    type: String,
    enum: AuthMethod,
  },
  authMethods: {
    type : [{
      type: String,
      enum: AuthMethod,
    }],
    default: [AuthMethod.EMAIL],
    required: true,
  },
  protectedKey: {
    type: String,
    select: false,
  },
  protectedKeyIV: {
    type: String,
    select: false
  },
  protectedKeyTag: {
    type: String,
    select: false
  },
  publicKey: {
    type: String,
    select: false
  },
  encryptedPrivateKey: {
    type: String,
    select: false
  },
  iv: { // iv of [encryptedPrivateKey]
    type: String,
    select: false
  },
  tag: { // tag of [encryptedPrivateKey]
    type: String,
    select: false
  },
  salt: {
    type: String,
    select: false
  },
  verifier: {
    type: String,
    select: false
  },
  isMfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaMethods: [
    {
      type: String
    }
  ],
  devices: {
    type: [
      {
        ip: String,
        userAgent: String
      }
    ],
    default: [],
    select: false
  }
}, { timestamps: true });

export default model<IUser>("User", userSchema);

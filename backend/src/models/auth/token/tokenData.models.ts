import { model, Schema, Types } from "mongoose";
import type { ITokenData } from "./token.types";


const tokenDataSchema = new Schema<ITokenData>(
  {
    type: {
      type: String,
      enum: [
        "emailConfirmation",
        "emailMfa",
        "organizationInvitation",
        "passwordReset",
      ],
      required: true,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    enterprise: {
      type: Schema.Types.ObjectId,
      ref: "Enterprise",
    },
    tokenHash: {
      type: String,
      select: false,
      required: true,
    },
    triesLeft: {
      type: Number,
    },
    expiresAt: {
      type: Date,
      expires: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<ITokenData>("TokenData", tokenDataSchema);
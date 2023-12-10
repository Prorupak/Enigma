import { model, Schema } from "mongoose";
import type { IToken } from "./token.types";

const tokenSchema = new Schema<IToken>({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  ttl: {
    type: Number,
  },
});

tokenSchema.index({ email: 1 });

export const Token = model<IToken>("Token", tokenSchema);

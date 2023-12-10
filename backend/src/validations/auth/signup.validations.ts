import { z } from "zod";

export const BeginEmailSignUp = z.object({
  body: z.object({
    email: z.string().email().trim(),
  }),
});

export const VerifyEmailSignUp = z.object({
  body: z.object({
    email: z.string().email().trim(),
    code: z.string().trim(),
  }),
});

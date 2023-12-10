import { sendMail } from "@/config/nodemailer";
import { ACCEPTED, ADMIN, TOKEN_EMAIL_CONFIRMATION } from "@/constants";
import { IUser } from "@/models/auth/user";
import TokenService from "./services/TokenService";

/**
 * Sends an email verification with a generated token.
 * @param {object} params - Parameters for sending the email verification.
 * @param {string} params.email - The email address to send the verification email to.
 * @returns {Promise<void>} - Resolves after successfully sending the email.
 */
export const sendEmailVerification = async ({ email }: { email: string }) => {
  const token = await TokenService.createToken({
    type: TOKEN_EMAIL_CONFIRMATION,
    email,
  });

  // send email verification
  await sendMail({
    template: "emailVerification.handlebars",
    subjectLine: "Enigma Email Verification",
    recipients: [email],
    substitutions: {
      code: token,
    },
  });
};

/**
 * Checks the email verification token for a given email.
 * @param {object} params - Parameters for checking the email verification token.
 * @param {string} params.email - The email address associated with the verification token.
 * @param {string} params.code - The verification code to check.
 * @returns {Promise<void>} - Resolves if the token is valid; otherwise, throws an error.
 * @throws {Error} - Throws an error if the token is invalid or expired.
 */
export const checkEmailVerification = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  // Validate the email verification token
  await TokenService.validateToken({
    type: TOKEN_EMAIL_CONFIRMATION,
    email,
    token: code,
  });
};

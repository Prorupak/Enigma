import { SMTP_HOST_GMAIL, SMTP_HOST_SENDGRID } from "@/constants";
import nodemailer, { TransportOptions } from "nodemailer";
import SMTPConnection from "nodemailer/lib/smtp-connection";
import { config } from "../config";

/**
 * Initializes and returns a nodemailer transporter based on the provided SMTP configuration.
 *
 * @returns {Promise<nodemailer.Transporter>} A promise that resolves to the nodemailer transporter.
 */
export const initSmtp = async (): Promise<nodemailer.Transporter> => {
  const mailOpts: SMTPConnection.Options = {
    host: config.smtp.host,
    port: config.smtp.port,
  };

  if (config.smtp.username && config.smtp.password) {
    mailOpts.auth = {
      user: config.smtp.username,
      pass: config.smtp.password,
    };
  }

  if (config.smtp.secure) {
    switch (config.smtp.host) {
      case SMTP_HOST_SENDGRID:
        mailOpts.requireTLS = true;
        break;
      case SMTP_HOST_GMAIL:
        mailOpts.requireTLS = true;
        mailOpts.tls = {
          ciphers: "TLSv1.2",
        };
        break;
      default:
        mailOpts.secure = true;
        break;
    }
  }

  const transporter = nodemailer.createTransport(mailOpts);
  return transporter;
};

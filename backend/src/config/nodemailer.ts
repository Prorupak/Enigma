import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import nodemailer, { Transporter } from "nodemailer";
import { config } from "."; 

let smtpTransporter: Transporter;

/**
 * Sends an email using the configured SMTP transporter.
 *
 * @param {Object} options - The email sending options.
 * @param {string} options.template - The template file name (located in the 'templates' directory).
 * @param {string} options.subjectLine - The subject line of the email.
 * @param {string[]} options.recipients - An array of email addresses of the recipients.
 * @param {Object} options.substitutions - An object containing data to substitute into the email template.
 *
 * @example
 * const emailOptions = {
 *   template: "welcome-email.html",
 *   subjectLine: "Welcome to Our Platform",
 *   recipients: ["user@example.com"],
 *   substitutions: { username: "John Doe" },
 * };
 *
 * await sendMail(emailOptions);
 */
export const sendMail = async ({
  template,
  subjectLine,
  recipients,
  substitutions,
}: {
  template: string;
  subjectLine: string;
  recipients: string[];
  substitutions: Record<string, any>;
}) => {
  if (config.smtp.host && config.smtp.port && config.smtp.fromName && config.smtp.fromAddress) {
    const html = fs.readFileSync(
      path.resolve(__dirname, "../templates/" + template),
      "utf8"
    );
    const templateCompiler = handlebars.compile(html);
    const htmlToSend = templateCompiler(substitutions);

    await smtpTransporter.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
      to: recipients.join(", "),
      subject: subjectLine,
      html: htmlToSend,
    });
  }
};

/**
 * Sets the SMTP transporter to be used for sending emails.
 *
 * @param {nodemailer.Transporter} transporter - The nodemailer transporter instance.
 *
 * @example
 * const transporter = nodemailer.createTransport({
 *   host: "smtp.example.com",
 *   port: 587,
 *   auth: {
 *     user: "your_username",
 *     pass: "your_password",
 *   },
 * });
 *
 * setTransporter(transporter);
 */
export const setTransporter = (transporter: Transporter) => {
  smtpTransporter = transporter;
};

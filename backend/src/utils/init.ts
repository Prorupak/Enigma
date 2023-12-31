import { initSmtp } from "@/config/smtp";
import { setTransporter } from "@/config/nodemailer";

/**
 * performs tasks  like:
 * - Initialize SMTP configuration
 * - Set the transporter for nodemailer
 * - Perform additional startup tasks
 *
 * @returns {Promise<void>} A promise that resolves after the initialization and startup tasks are complete.
 * @throws {Error} Throws an error if SMTP initialization fails.
 *
 */
export const init = async (): Promise<void> => {
  try {
    // Initialize SMTP configuration
    const transporter = await initSmtp();
    setTransporter(transporter);
  } catch (error) {
    throw new Error(`Initialization failed: ${error.message}`);
  }
};

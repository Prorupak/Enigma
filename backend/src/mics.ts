import { config } from "@/config";
import { logger } from "@/utils/logger";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import ora from "ora";

type MicsOpt = {
  transporter: nodemailer.Transporter;
};

export const mics = async ({ transporter }: MicsOpt) => {
  const spinner = ora().start();
  spinner.info("Checking configurations...");
  spinner.info("Testing smtp connection....");

  await transporter
    .verify()
    .then(async () => {
      spinner.succeed("SMTP successfully connected");
    })
    .catch(async err => {
      spinner.fail(
        `SMTP - Failed to connect to ${config.smtp.host}:${config.smtp.port}`,
      );
      logger.error(err);
    });

  spinner.info("Testing mongodb connection....");
  if (mongoose.connection.readyState !== mongoose.ConnectionStates.connected) {
    spinner.fail("Mongo DB - Failed to connect");
  } else {
    spinner.succeed("Mongodb successfully connected");
  }

  spinner.stop();
};

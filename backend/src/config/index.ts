import { config as dotConfig } from "dotenv";
import { z } from "zod";


const envVarsSchema = z.object({
  NODE_ENV: z.string().default("development").transform((val) => val.toLowerCase()),
  PORT: z.number().default(8000),
  VERBOSE_ERROR_OUTPUT: z.boolean().default(false),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_SECURE: z.boolean().default(true),
  SMTP_PASSWORD: z.string(),
  SMTP_USERNAME: z.string(),
  SMTP_FROM_ADDRESS: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_NAME: z.string(),
  GITHUB_APP_ID: z.string(),
  GITHUB_PRIVATE_KEY: z.string(),
  GITHUB_CLIENT_WEBHOOK_SECRET: z.string(),
  WEBHOOk_PROXY: z.string(),
  MONGO_URI: z.string(),
  SALT_ROUNDS: z.number().default(10),
});

// Load and validate environment variables
dotConfig({ path: `.env.${process.env.NODE_ENV || "development"}` });

const envVars = envVarsSchema.parse(process.env);

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  verboseErrorOutput: envVars.VERBOSE_ERROR_OUTPUT,
  mongoUri: envVars.MONGO_URI,
  smtp: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    secure: envVars.SMTP_SECURE,
    username: envVars.SMTP_USERNAME,
    password: envVars.SMTP_PASSWORD,
    fromAddress: envVars.SMTP_FROM_ADDRESS,
    fromName: envVars.SMTP_FROM_NAME,
  },
  github: {
    appId: envVars.GITHUB_APP_ID,
    privateKey: envVars.GITHUB_PRIVATE_KEY,
    clientWebhookSecret: envVars.GITHUB_CLIENT_WEBHOOK_SECRET,
  },
  webhookProxy: envVars.WEBHOOk_PROXY,
  saltRounds: envVars.SALT_ROUNDS,
};

export { config };
import { config as dotConfig } from "dotenv";
import joi from "joi";


dotConfig({ path: `.env.${process.env.NODE_ENV || "development"}` });

const validateEnvVariables = () => {
  const envVarsSchema = joi
    .object()
    .keys({
      NODE_ENV: joi.string().valid("development", "production", "test"),
      PORT: joi.number().default(8000),
      VERBOSE_ERROR_OUTPUT: joi.boolean().default(false),
      SMTP_HOST: joi.string().required(),
      SMTP_PORT: joi.string().required(),
      SMTP_PASSWORD: joi.string().required(),
      SMTP_USERNAME: joi.string().required(),
      SMTP_FROM_ADDRESS: joi.string().required(),
      SMTP_FROM_NAME: joi.string().required(),
      SMTP_NAME: joi.string().required(),
      GITHUB_APP_ID: joi.string().required(),
      GITHUB_PRIVATE_KEY: joi.string().required(),
      GITHUB_CLIENT_WEBHOOK_SECRET: joi.string().required(),
      WEBHOOk_PROXY: joi.string().required(),
      MONGO_URI: joi.string().required(),
      SALT_ROUNDS: joi.number().default(10),
    })
    .unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return envVars;
};

const envVars = validateEnvVariables();

export const config = {
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
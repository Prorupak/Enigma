export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: "development" | "staging" | "testing" | "production";
      VERBOSE_ERROR_OUTPUT: string;
      CLIENT_ID_GITHUB: string;
      CLIENT_SECRET_GITHUB: string;
      POSTHOG_HOST: string;
      POSTHOG_PROJECT_API_KEY: string;
      SENTRY_DSN: string;
      SITE_URL: string;
      SMTP_HOST: string;
      SMTP_SECURE: string;
      SMTP_PORT: string;
      SMTP_USERNAME: string;
      SMTP_PASSWORD: string;
      SMTP_FROM_ADDRESS: string;
      SMTP_FROM_NAME: string;
    }
  }
}

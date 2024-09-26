import * as dotenv from "dotenv";
import {EnvironmentSchema} from "./environment-schema.js";

dotenv.config();

/**
 * A class containing configuration for use across the application.
 *
 * Although configuration is basically just a plain object its wrapped in this class to allow it
 * to be used in the NestJS DI system.
 * The config uses a zod schema, so it will throw an error if the config doesn't follow the schema.
 */
export class EnvironmentService {
  readonly vars: EnvironmentSchema = EnvironmentSchema.parse({
    general: {
      applicationName: process.env.APPLICATION_NAME,
      port: parseInt(process.env.PORT as string),
      environment: process.env.ENVIRONMENT ?? "production",
      allowedOrigins: process.env.APP_ALLOWED_ORIGINS ? process.env.APP_ALLOWED_ORIGINS.split(",") : []
    },
    database: {
      url: process.env.DATABASE_URL,
    },
    dataStore: {
      redisUrl: process.env.DATA_STORE_REDIS_URL
    },
    auth: {
      issuer: process.env.AUTH_ISSUER ?? null,
      audience: process.env.AUTH_AUDIENCE ?? null,
      accessToken: {
        secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
        expiry: "15 mins",
      },
      refreshToken: {
        secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
        expiry: "7 days"
      },
      emailVerification: {
        secret: process.env.AUTH_EMAIL_VERIFICATION_SECRET,
        url: process.env.AUTH_EMAIL_VERIFICATION_URL,
        expiry: "15 mins"
      },
      passwordReset: {
        secret: process.env.AUTH_PASSWORD_RESET_SECRET,
        url: process.env.AUTH_PASSWORD_RESET_URL,
        expiry: "15 mins"
      }
    },
    email:{
      sendMode: process.env.EMAIL_SEND_MODE ?? "mailgun",
      mailgun: {
        domain: process.env.EMAIL_MAILGUN_DOMAIN,
        apiKey: process.env.EMAIL_MAILGUN_API_KEY,
        sender: {
          name: process.env.EMAIL_MAILGUN_SENDER_NAME,
          address: process.env.EMAIL_MAILGUN_SENDER_ADDRESS
        },
        isEu: process.env.EMAIL_MAILGUN_IS_EU === "true"
      }
    },
  });
}

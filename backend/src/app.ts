import "express-async-errors";
import path from "path";
import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import httpLogger from "pino-http";
import { Probot } from "probot";
import SmeeClient from "smee-client";
import xss from "xss-clean";
import { config } from "./config";
import { requestErrorHandler } from "./middlewares/requestErrorHandler";
import DatabaseService from "./utils/database";
import { RouteNotFoundError } from "./utils/errors";
import { init } from "./utils/init";
import { initLogger, logger } from "./utils/logger";
import rateLimiter from "./utils/rateLimiter";

let handler: null | any = null;

const main = async () => {
  await initLogger();

  await DatabaseService.initDatabase(config.mongoUri);

  await init();

  const app = express();
  app.enable("trust proxy");

  app.use(httpLogger({ logger, autoLogging: false }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(compression());
  app.use(cookieParser());
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
    }),
  );
  if (
    config.github.appId &&
    config.github.privateKey &&
    config.github.clientWebhookSecret
  ) {
    const probot = new Probot({
      appId: config.github.appId,
      privateKey: config.github.privateKey,
      secret: config.github.clientWebhookSecret,
      logLevel: "warn",
    });

    if (config.env !== "production") {
      const smee = new SmeeClient({
        source: config.webhookProxy,
        target: `http://backend:4000/webhooks/github`,
        logger,
      });

      smee.start();
    }

    // app.use(createNodeMiddleware(appFn, { probot })); //TODO: due Nov 30, 2023
  }

  if (config.env === "production") {
    app.use("x-powered-by");
    app.use(rateLimiter.apiLimiterMiddleware);
    app.use(helmet());
    app.use(mongoSanitize());
    app.use(xss());
  }

  app.use((req, res, next) => {
    // ip address provided by cloudflare
    const cfIp = req.headers["cf-connecting-ip"];
    console.log({ cfIp });
    // req.realIP = Array.isArray(cfIp) ? cfIp[0] : cfIp || req.ip;
    next();
  });

  if (config.env === "production" && process.env.STANDALONE_BUILD === "true") {
    const nextAppBuild = path.join(__dirname, "../frontend-build");
    const config = require("../frontend-build/.next/required-server-files.json");
    const NextServer =
      require("../frontend-build/node_modules/next/dist/server/next-server").default;

    const nextApp = new NextServer({
      dev: false,
      dir: nextAppBuild,
      port: config.port,
      conf: config,
      hostname: "local",
      customServer: false,
    });

    handler = nextApp.getRequestHandler();
  }

  // api routes
  app.use((req, res) => {
    res.send("Hello World!");
  });

  if (handler) {
    app.all("*", (req, res) => handler(req, res));
  }

  // handle 404 requests
  app.use((req, res, next) => {
    if (res.headersSent) return next();
    next(
      RouteNotFoundError(Error(`Route ${req.method} ${req.url} not found.`)),
    );
  });

  app.use(requestErrorHandler);

  const server = app.listen(5000, () => {
    logger.info(`Server listening on port ${config.port}`);
  });

  const serverCleanup = async () => {
    await DatabaseService.closeDatabase();

    process.exit(0);
  };

  process.on("SIGINT", function () {
    server.close(async () => {
      await serverCleanup();
    });
  });

  process.on("SIGTERM", function () {
    server.close(async () => {
      await serverCleanup();
    });
  });

  return server;
};

export default main;

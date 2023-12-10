import express, { Express, Request, Response, NextFunction } from "express";
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
import path from "path";

class MainServer {
  private app: Express;
  private handler: null | any = null;

  constructor() {
    this.app = express();
    this.setupServer();
  }

  private async setupServer() {
    await initLogger();
    await DatabaseService.initDatabase(config.mongoUri);
    await init();

    this.app.enable("trust proxy");

    this.app.use(httpLogger({ logger, autoLogging: false }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
    this.app.use(cookieParser());
    this.app.use(
      cors({
        credentials: true,
      })
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
    //  this.app.use(createNodeMiddleware(appFn, { probot })); //TODO: fix this
    }

    if (config.env === "production") {
      this.app.use("x-powered-by");
      this.app.use(rateLimiter.apiLimiterMiddleware);
      this.app.use(helmet());
      this.app.use(mongoSanitize());
      this.app.use(xss());
    }

    this.app.use((req, res, next) => {
      const cfIp = req.headers["cf-connecting-ip"];
      console.log({ cfIp });
       req.realIP = Array.isArray(cfIp) ? cfIp[0] : cfIp || req.ip;
      next();
    });

    if (config.env === "production" && process.env.STANDALONE_BUILD === "true") {
      const nextAppBuild = path.join(__dirname, "../frontend-build");
      const config = require("../frontend-build/.next/required-server-files.json");
      const NextServer = require("../frontend-build/node_modules/next/dist/server/next-server").default;

      const nextApp = new NextServer({
        dev: false,
        dir: nextAppBuild,
        port: config.port,
        conf: config,
        hostname: "local",
        customServer: false,
      });

      this.handler = nextApp.getRequestHandler();
    }

    this.app.use((req: Request, res: Response) => {
      res.send("Hello World!");
    });

    if (this.handler) {
      this.app.all("*", (req: Request, res: Response) => this.handler(req, res));
    }

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) return next();
      next(RouteNotFoundError(Error(`Route ${req.method} ${req.url} not found.`)));
    });

    this.app.use(requestErrorHandler);

    const server = this.app.listen(5000, () => {
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
  }
}

const mainServer = new MainServer();
export default mainServer;


import { Request } from "express";
import { config } from "@/config";

/**
 * Enumeration for log levels.
 */
export enum ELogLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
}

/**
 * Type: pino log levels.
 */
export type TLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Maps custom log levels to Pino log levels.
 *
 * @param {ELogLevel} customLogLevel - Custom log level.
 * @returns {TLogLevel} Corresponding Pino log level.
 */
export const mapToLogLevel = (customLogLevel: ELogLevel): TLogLevel => {
  switch (customLogLevel) {
    case ELogLevel.TRACE:
      return "trace";
    case ELogLevel.DEBUG:
      return "debug";
    case ELogLevel.INFO:
      return "info";
    case ELogLevel.WARN:
      return "warn";
    case ELogLevel.ERROR:
      return "error";
    case ELogLevel.FATAL:
      return "fatal";
  }
};

export type RequestErrorContext = {
  logLevel?: ELogLevel;
  statusCode: number;
  type: string;
  message: string;
  context?: Record<string, unknown>;
  stack?: string | undefined;
};

export default class RequestError extends Error {
  private _logLevel: ELogLevel;
  private _logName: string;
  statusCode: number;
  type: string;
  context: Record<string, unknown>;
  extra: Record<string, string | number | symbol>[];
  private stacktrace: string | undefined | string[];

  constructor({
    logLevel,
    statusCode,
    type,
    message,
    context,
    stack,
  }: RequestErrorContext) {
    super(message);
    this._logLevel = logLevel || ELogLevel.INFO;
    this._logName = ELogLevel[this._logLevel];
    this.statusCode = statusCode;
    this.type = type;
    this.context = context || {};
    this.extra = [];

    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
    this.stacktrace = this.stack?.split("\n");
  }

  /**
   * Converts a generic error to a RequestError.
   *
   * @param {Error} error - The error to convert.
   * @returns {RequestError} The converted RequestError.
   */
  static convertFrom(error: Error): RequestError {
    // This error was not handled by the error handler.
    return new RequestError({
      logLevel: ELogLevel.ERROR,
      statusCode: 500,
      type: "internal_server_error",
      message: "This error was not handled by the error handler.",
      context: {
        message: error.message,
        name: error.name,
      },
      stack: error.stack,
    });
  }

  /**
   * @type {ELogLevel}
   */
  get level(): ELogLevel {
    return this._logLevel;
  }

  /**
   * @type {string}
   */
  get levelName(): string {
    return this._logName;
  }

  /**
   * @param {...string[] | number[]} tags - Tags to add.
   * @returns {RequestError} The current RequestError instance.
   */
  withTags(...tags: (string | number)[]): RequestError {
    this.context["tags"] = Object.assign(tags, this.context["tags"]);
    return this;
  }

  /**
   * @param {...Record<string, string | boolean | number>[]} extras - Extra information to add.
   * @returns {RequestError} The current RequestError instance.
   */
  withExtras(
    ...extras: Record<string, string | boolean | number>[]
  ): RequestError {
    this.extra = Object.assign(extras, this.extra);
    return this;
  }

  private _omit(obj: any, keys: string[]): typeof obj {
    const exclude = new Set(keys);
    obj = Object.fromEntries(
      Object.entries(obj).filter(e => !exclude.has(e[0])),
    );
    return obj;
  }

  /**
   * Formats the error for logging.
   *
   * @param {Request} req - The Express request object.
   * @returns {Promise<Record<string, any>>} The formatted error object.
   */
  public async format(req: Request): Promise<Record<string, any>> {
    let _context = Object.assign(
      {
        stacktrace: this.stacktrace,
      },
      this.context,
    );

    // Omit sensitive information from context that can leak internal workings of this program if the user is not a developer.
    if (!config.verboseErrorOutput) {
      _context = this._omit(_context, ["stacktrace", "exception"]);
    }

    const formatObject = {
      type: this.type,
      message: this.message,
      context: _context,
      level: this.level,
      level_name: this.levelName,
      status_code: this.statusCode,
      datetime_iso: new Date().toISOString(),
      application: process.env.npm_package_name || "unknown",
      request_id: req.headers["Request-Id"],
      extra: this.extra,
    };

    return formatObject;
  }
}

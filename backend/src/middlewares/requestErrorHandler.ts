import { ErrorRequestHandler } from "express";
import { InternalServerError, UnauthorizedRequestError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import RequestError, { mapToLogLevel } from "@/utils/requestError";
import { ForbiddenError } from "@casl/ability";
import { TokenExpiredError } from "jsonwebtoken";

/**
 * Error request handler middleware to handle and respond to errors.
 *
 * @param {RequestError | Error} err - The error object.
 * @param {Express.Request} req - The Express request object.
 * @param {Express.Response} res - The Express response object.
 * @param {Express.NextFunction} next - The Express next function.
 */
export const requestErrorHandler: ErrorRequestHandler = async (
  err: RequestError | Error,
  req,
  res,
  next,
) => {
  if (res.headersSent) return next();

  let error: RequestError;

  switch (true) {
    case err instanceof TokenExpiredError:
      error = UnauthorizedRequestError({
        stack: err.stack,
        message: "Token expired",
      });
      break;
    case err instanceof ForbiddenError:
      error = UnauthorizedRequestError({
        context: { exception: err.message },
        stack: err.stack,
      });
      break;
    case err instanceof RequestError:
      error = err as RequestError;
      break;
    default:
      error = InternalServerError({
        context: { exception: err.message },
        stack: err.stack,
      });
      break;
  }

  logger[mapToLogLevel(error.level)]({ msg: error });

  delete (error as any).stacktrace; // remove stacktrace from response
  res.status(error.statusCode).json(error); // send error response

  next();
};

import RequestError, { ELogLevel, RequestErrorContext } from "./requestError";

class CustomErrors {
  private createError({
    logLevel,
    statusCode,
    type,
    message,
    context,
    stack,
  }: Partial<RequestErrorContext>): RequestError {
    return new RequestError({
      logLevel: logLevel ?? ELogLevel.INFO,
      statusCode: statusCode ?? 500,
      type: type ?? "unknown_error",
      message: message ?? "An unexpected error occurred",
      context,
      stack,
    });
  }

  public routeNotFoundError(
    error?: Partial<RequestErrorContext>,
  ): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 404,
      type: error?.type ?? "route_not_found",
      message: error?.message ?? "The requested source was not found",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public methodNotAllowedError(
    error?: Partial<RequestErrorContext>,
  ): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 405,
      type: error?.type ?? "method_not_allowed",
      message:
        error?.message ??
        "The requested method is not allowed for the resource",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public unauthorizedRequestError(
    error?: Partial<RequestErrorContext>,
  ): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 401,
      type: error?.type ?? "unauthorized",
      message:
        error?.message ?? "You are not authorized to access this resource",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public forbiddenRequestError(
    error?: Partial<RequestErrorContext>,
  ): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 403,
      type: error?.type ?? "forbidden",
      message: error?.message ?? "You are not allowed to access this resource",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public badRequestError(error?: Partial<RequestErrorContext>): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 400,
      type: error?.type ?? "bad_request",
      message: error?.message ?? "The request is invalid or cannot be served",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public resourceNotFoundError(
    error?: Partial<RequestErrorContext>,
  ): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 404,
      type: error?.type ?? "resource_not_found",
      message: error?.message ?? "The requested resource is not found",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public internalServerError(
    error?: Partial<RequestErrorContext>,
  ): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 500,
      type: error?.type ?? "internal_server_error",
      message:
        error?.message ??
        "The server encountered an error while processing the request",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public serviceUnavailableError(
    error?: Partial<RequestErrorContext>,
  ): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 503,
      type: error?.type ?? "service_unavailable",
      message:
        error?.message ??
        "The service is currently unavailable. Please try again later.",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public validationError(error?: Partial<RequestErrorContext>): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 400,
      type: error?.type ?? "validation_error",
      message: error?.message ?? "The request failed validation",
      context: error?.context,
      stack: error?.stack,
    });
  }

  public AccountNotFoundError(
    error?: Partial<RequestErrorContext>,
  ): RequestError {
    return this.createError({
      logLevel: error?.logLevel,
      statusCode: error?.statusCode ?? 404,
      type: error?.type ?? "account_not_found_error",
      message: error?.message ?? "The requested account was not found",
      context: error?.context,
      stack: error?.stack,
    });
  }
}

const errors = new CustomErrors();

export default {
  ...new CustomErrors(),
};

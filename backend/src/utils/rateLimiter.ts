import { Request, RequestHandler } from "express";
import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

class RateLimiter {
  private readonly apiLimiter: RateLimitRequestHandler;
  private readonly authLimit: RateLimitRequestHandler;
  private readonly passwordLimiter: RateLimitRequestHandler;

  constructor() {
    this.apiLimiter = this.createRateLimiter(60 * 1000, 200); // 200 requests per minute
    this.authLimit = this.createRateLimiter(60 * 1000, 10); // 10 requests per minute
    this.passwordLimiter = this.createRateLimiter(60 * 60 * 1000, 5); // 5 requests per hour
  }

  private createRateLimiter(
    windowMs: number,
    max: number,
  ): RateLimitRequestHandler {
    return rateLimit({
      windowMs,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: req => req.realIP,
    });
  }

  /**
   * Middleware for general API requests rate limiting.
   *
   * @type {RequestHandler}
   * @property {number} maxRequests - Maximum allowed requests within the defined window
   */
  public apiLimiterMiddleware: RequestHandler = (req, res, next) => {
    // Request count: maxRequests
    this.apiLimiter(req, res, next);
  };

  /**
   * Middleware for authentication-related requests rate limiting.
   *
   * @type {RequestHandler}
   * @property {number} maxRequests - Maximum allowed requests within the defined window -
   */
  public authLimiterMiddleware: RequestHandler = (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      // Request count: maxRequests
      this.authLimit(req, res, next);
    } else {
      next();
    }
  };

  /**
   * Middleware for password-related requests rate limiting.
   *
   * @type {RequestHandler}
   * @property {number} maxRequests - Maximum allowed requests within the defined window.
   */
  public passwordLimiterMiddleware: RequestHandler = (req, res, next) => {
    // Request count: maxRequests
    this.passwordLimiter(req, res, next);
  };
}

export default new RateLimiter();

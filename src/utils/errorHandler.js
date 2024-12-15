class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Ensure the name of this error is 'ApiError'
    this.name = this.constructor.name;

    // Capture the stack trace (helps in debugging)
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request") {
    return new ApiError(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  static notFound(message = "Not Found") {
    return new ApiError(message, 404);
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(message, 500);
  }

  static tooManyRequests(message = "Too Many Requests") {
    return new ApiError(message, 429);
  }
}

module.exports = ApiError;

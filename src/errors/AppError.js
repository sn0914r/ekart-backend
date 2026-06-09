export class AppError extends Error {
  constructor(message, statusCode, errorCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
  }
}

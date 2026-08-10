export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: any[];
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors: any[] = []) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', errors: any[] = []) {
    super(message, 401, errors);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access', errors: any[] = []) {
    super(message, 403, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errors: any[] = []) {
    super(message, 404, errors);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', errors: any[] = []) {
    super(message, 409, errors);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', errors: any[] = []) {
    super(message, 500, errors);
  }
}

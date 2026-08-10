import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response {
  const errorMessage = err ? err.message || String(err) : 'Unknown error';
  console.error(`[Error] ${req.method} ${req.url}: ${errorMessage}`);

  // 1. Handled Custom Application Errors
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, formattedErrors);
  }

  // 3. Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[]) || [];
      return sendError(
        res,
        `Duplicate entry. A record with this ${fields.join(', ')} already exists.`,
        409,
        [{ fields, code: err.code }]
      );
    }

    if (err.code === 'P2025') {
      return sendError(res, 'Requested record not found in database', 404, [
        { code: err.code },
      ]);
    }

    return sendError(res, `Database error: ${err.message}`, 400, [
      { code: err.code },
    ]);
  }

  // 4. Unexpected / Unknown Server Errors
  const isProd = process.env.NODE_ENV === 'production';
  return sendError(
    res,
    isProd ? 'Internal server error' : err.message || 'An unexpected error occurred',
    500,
    isProd ? [] : [{ stack: err.stack }]
  );
}

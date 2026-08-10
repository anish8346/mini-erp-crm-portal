import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors: any[] = []
): Response<ApiResponse> {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

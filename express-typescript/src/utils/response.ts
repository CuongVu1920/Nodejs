import { Response } from "express";

export const successResponse = <T>(
  response: Response,
  data: T,
  message: string,
  statusCode: number = 200,
) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = <T>(
  response: Response,
  message: string,
  errors: T | null,
  statusCode: number = 400,
) => {
  return response.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

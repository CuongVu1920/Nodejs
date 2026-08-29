import { Response } from "express";

type SuccessResponse<T, A> = {
  success: boolean;
  data: T;
  message: string;
  meta?: A | null;
};

export const successResponse = <T, A>(
  response: Response,
  data: T,
  message: string,
  statusCode: number = 200,
  meta: A | null = null,
) => {
  const obj: SuccessResponse<T, A> = {
    success: true,
    message,
    data,
  };

  if (meta) {
    obj.meta = meta;
  }

  return response.status(statusCode).json(obj);
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

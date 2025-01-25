import { ErrorRequestHandler, Response } from 'express';
import { z } from 'zod';

import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../constants/http';

import AppError from '../utils/AppError';
import { clearAuthCookies, REFRESH_PATH } from '../utils/cookies';

const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));

  res.status(BAD_REQUEST).json({ errors });
};

const HandleAppError = (res: Response, error: AppError) => {
  res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (error instanceof z.ZodError) {
    return handleZodError(res, error);
  }

  if (error instanceof AppError) {
    return HandleAppError(res, error);
  }

  res.status(INTERNAL_SERVER_ERROR).send('Internal Server Error');
};

export default errorHandler;

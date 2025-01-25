import { z } from 'zod';

import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../constants/http';

import AppError from '../utils/AppError';
import { clearAuthCookies, REFRESH_PATH } from '../utils/cookies';

import {
  AppErrorHandler,
  GlobalErrorHandler,
  SyntaxErrorHandler,
  ZodErrorHandler,
} from '../@types/error';

const handleZodError: ZodErrorHandler = (res, error) => {
  const errors = error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }));

  res.status(BAD_REQUEST).json({ errors });
};

const HandleAppError: AppErrorHandler = (res, error) => {
  res.status(error.statusCode).json({
    message: error.message,
    errorCode: error.errorCode,
  });
};

const HandleSyntaxError: SyntaxErrorHandler = (res, error) => {
  res.status(BAD_REQUEST).json({
    message: 'Invalid JSON format, please check your request body.',
  });
};

const errorHandler: GlobalErrorHandler = (error, req, res, next) => {
  console.log(`Error occurred on PATH: ${req.path}`, error);

  if (req.path === REFRESH_PATH) {
    clearAuthCookies(res);
  }

  if (error instanceof SyntaxError) {
    return HandleSyntaxError(res, error);
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

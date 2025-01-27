import { z } from 'zod';
import { Response, NextFunction, ErrorRequestHandler } from 'express';

import AppError from '../../utils/AppError';

export type ErrorHandler<T> = (res: Response, error: T) => void;

export type ZodErrorHandler = ErrorHandler<z.ZodError>;
export type SyntaxErrorHandler = ErrorHandler<SyntaxError>;
export type AppErrorHandler = ErrorHandler<AppError>;

export type GlobalErrorHandler = ErrorRequestHandler;

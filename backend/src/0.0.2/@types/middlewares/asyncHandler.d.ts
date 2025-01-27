import { Request, Response, NextFunction } from 'express';

export type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export type AsyncHandler = (
  controller: AsyncController
) => (req: Request, res: Response, next: NextFunction) => Promise<void>;

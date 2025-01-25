import AppErrorCode from '../constants/appErrorCode';
import { HttpStatusCode } from '../constants/http';

class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public errorCode?: AppErrorCode
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

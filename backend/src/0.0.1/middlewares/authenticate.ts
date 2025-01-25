import { RequestHandler } from 'express';

import appAssert from '../utils/appAssert';
import { verifyToken } from '../utils/jwt';

import { UNAUTHORIZED } from '../constants/http';
import AppErrorCode from '../constants/appErrorCode';

const authenticate: RequestHandler = (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  appAssert(
    accessToken,
    UNAUTHORIZED,
    'Not authorized.',
    AppErrorCode.InvalidAccessToken
  );

  const { error, payload } = verifyToken(accessToken);
  appAssert(
    payload,
    UNAUTHORIZED,
    error === 'jwt expired' ? 'Session expired.' : 'Invalid access token.',
    AppErrorCode.InvalidAccessToken
  );

  req.userId = payload.userId;
  req.sessionId = payload.sessionId;
  next();
};

export default authenticate;

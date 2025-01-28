import { RequestHandler } from 'express';

import appAssert from '../utils/appAssert';
import { verifyToken } from '../utils/jwt';
import updateUserIp from '../utils/updateUserIp';

import { UNAUTHORIZED } from '../constants/http';
import AppErrorCode from '../constants/appErrorCode';

import asyncHandler from './asyncHandler';

import { ipSchema } from '../schemas/auth.schema';

import UserModel from '../models/user.models';

const authenticate: RequestHandler = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(
    accessToken,
    UNAUTHORIZED,
    'Authentication required.',
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

  const user = await UserModel.findById(req.userId);
  appAssert(
    user,
    UNAUTHORIZED,
    'Invalid access token.',
    AppErrorCode.InvalidAccessToken
  );

  const clientIp = (req.ip || req.headers['x-forwarded-for'] || '').toString();
  const ip = ipSchema.safeParse(clientIp);

  if (ip.success) {
    await updateUserIp(user, clientIp);
  }

  next();
});

export default authenticate;

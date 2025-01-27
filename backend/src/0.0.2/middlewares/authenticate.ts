import { RequestHandler } from 'express';

import appAssert from '../utils/appAssert';
import { verifyToken } from '../utils/jwt';

import { UNAUTHORIZED } from '../constants/http';
import AppErrorCode from '../constants/appErrorCode';
import UserModel from '../models/user.models';
import asyncHandler from './asyncHandler';

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

  const clientIp = req.ip || req.headers['x-forwarded-for'] || '';

  const updatedUser = await UserModel.findByIdAndUpdate(
    req.userId,
    {
      lastLoginIp: clientIp,
      $push: { ipHistory: clientIp },
    },
    { new: true }
  );

  appAssert(
    updatedUser,
    UNAUTHORIZED,
    'Failed to update user IP.',
    AppErrorCode.InvalidAccessToken
  );

  next();
});

export default authenticate;

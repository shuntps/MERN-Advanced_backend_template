import { NOT_FOUND, OK } from '../constants/http';

import appAssert from '../utils/appAssert';
import asyncHandler from '../middlewares/asyncHandler';

import UserModel from '../models/user.models';

export const getUserHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, 'User not found');
  return res.status(OK).json(user.omit());
});

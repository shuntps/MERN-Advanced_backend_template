import AuthProviderType from '../constants/authProviderType';
import VerificationCodeType from '../constants/verificationCodeType';
import { FRONTEND_URL } from '../constants/env';
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from '../constants/http';

import { sendMail } from '../utils/sendMail';
import appAssert from '../utils/appAssert';
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from '../utils/emailTemplates';
import {
  authVerificationCodeExpiresIn,
  fiveMinutesAgo,
  ONE_DAY_MS,
  passwordResetCodeExpiresIn,
  userSessionExpiresIn,
} from '../utils/date';
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from '../utils/jwt';

import UserModel from '../models/user.models';
import VerificationCodeModel from '../models/verificationCode.model';
import SessionModel from '../models/session.model';
import { hashValue } from '../utils/bcrypt';

export type RegisterParams = {
  name: string;
  email: string;
  password: string;
  userAgent?: string;
  ip: string;
};

export const register = async (data: RegisterParams) => {
  const existingUser = await UserModel.exists({ email: data.email });
  appAssert(!existingUser, CONFLICT, 'User already exists');

  let user = await UserModel.create({
    name: data.name,
    email: data.email,
    password: data.password,
    provider: AuthProviderType.Email,
    ipAddresses: [{ ip: data.ip }],
  });

  const userId = user._id;
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: authVerificationCodeExpiresIn(),
  });

  const url = `${FRONTEND_URL}/email/verify/${verificationCode._id}`;
  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });

  if (error) {
    console.log(error);
  }

  user.lastLogin = new Date();
  await user.save();

  const session = await SessionModel.create({
    userId,
    userAgent: data.userAgent,
    ipAdrresse: data.ip,
  });

  const sessionId = session._id;
  const refreshToken = signToken({ sessionId }, refreshTokenSignOptions);
  const accessToken = signToken({ userId, sessionId });

  return { user: user.omit(), accessToken, refreshToken };
};

export type LoginParams = {
  email: string;
  password: string;
  userAgent?: string;
  ip: string;
};

export const login = async ({
  email,
  password,
  userAgent,
  ip,
}: LoginParams) => {
  let user = await UserModel.findOne({ email });
  appAssert(user, UNAUTHORIZED, 'Invalid email or password.');

  const isPasswordValid = await user.comparePassword(password);
  appAssert(isPasswordValid, UNAUTHORIZED, 'Invalid email or password.');

  const provider = user.provider;
  appAssert(
    provider === AuthProviderType.Email,
    UNAUTHORIZED,
    'It looks like this email is already associated with another login method. Please sign in using the linked account to access your profile.'
  );

  user.ipAddresses = user.ipAddresses || [];
  const existingIp = user.ipAddresses.find((entry) => entry.ip === ip);
  if (existingIp) {
    existingIp.updatedAt = new Date();
  } else {
    user.ipAddresses.push({ ip, updatedAt: new Date() });
  }

  user.lastLogin = new Date();
  await user.save();

  const userId = user._id;
  const session = await SessionModel.create({
    userId,
    userAgent,
    ipAdrresse: ip,
  });

  const sessionId = session._id;
  const refreshToken = signToken({ sessionId }, refreshTokenSignOptions);
  const accessToken = signToken({ userId, sessionId });

  return { user: user.omit(), accessToken, refreshToken };
};

export const logout = async (accessToken: string) => {
  const { payload } = verifyToken(accessToken);
  appAssert(payload, UNAUTHORIZED, 'Invalid access token.');

  await SessionModel.findByIdAndDelete(payload.sessionId);
};

export const refreshAccessToken = async (refreshToken: string) => {
  const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
    secret: refreshTokenSignOptions.secret,
  });
  appAssert(payload, UNAUTHORIZED, 'Invalid refresh token.');

  const session = await SessionModel.findById(payload.sessionId);
  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    'Session expired.'
  );

  const sessionNeedsRefresh = session.expiresAt.getTime() - now <= ONE_DAY_MS;
  if (sessionNeedsRefresh) {
    session.expiresAt = userSessionExpiresIn();
    await session.save();
  }

  const newRefreshToken = sessionNeedsRefresh
    ? signToken(
        {
          sessionId: session._id,
        },
        refreshTokenSignOptions
      )
    : undefined;

  const accessToken = signToken({
    userId: session.userId,
    sessionId: session._id,
  });

  return { accessToken, newRefreshToken };
};

export const verifyEmail = async (code: string) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: code,
    type: VerificationCodeType.EmailVerification,
    expiresAt: { $gt: Date.now() },
  });
  appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code.');

  const updatedUser = await UserModel.findByIdAndUpdate(
    validCode.userId,
    { verified: true },
    { new: true }
  );
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, 'Failed to verify email.');

  await validCode.deleteOne();

  return { user: updatedUser.omit() };
};

export const sendPasswordReset = async (email: string) => {
  const user = await UserModel.findOne({ email });
  appAssert(user, NOT_FOUND, 'User not found.');

  const userId = user._id;

  const fiveMinAgo = fiveMinutesAgo();
  const count = await VerificationCodeModel.countDocuments({
    userId,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gt: fiveMinAgo },
  });
  appAssert(
    count <= 1,
    TOO_MANY_REQUESTS,
    'Too many requests, please try again later.'
  );

  const expiresAt = passwordResetCodeExpiresIn();
  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  const url = `${FRONTEND_URL}/password/reset?code=${
    verificationCode._id
  }&exp=${expiresAt.getTime()}`;

  const { data, error } = await sendMail({
    to: user.email,
    ...getPasswordResetTemplate(url),
  });
  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name} - ${error?.message}`
  );

  return { url, emailId: data.id };
};

export type ResetPasswordParams = {
  password: string;
  verificationCode: string;
};

export const resetPassword = async ({
  password,
  verificationCode,
}: ResetPasswordParams) => {
  const validCode = await VerificationCodeModel.findOne({
    _id: verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: new Date() },
  });
  appAssert(validCode, NOT_FOUND, 'Invalid or expired verification code.');

  const updatedUser = await UserModel.findByIdAndUpdate(validCode.userId, {
    password: await hashValue(password),
  });
  appAssert(updatedUser, INTERNAL_SERVER_ERROR, 'Failed to reset password.');

  await validCode.deleteOne();

  await SessionModel.deleteMany({ userId: updatedUser._id });

  return { user: updatedUser.omit() };
};

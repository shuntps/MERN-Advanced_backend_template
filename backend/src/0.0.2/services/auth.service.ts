import AuthProviderType from '../constants/authProviderType';
import VerificationCodeType from '../constants/verificationCodeType';
import AppErrorCode from '../constants/appErrorCode';
import { FRONTEND_URL, USER_IPS_RETENTION_LIMIT } from '../constants/env';
import {
  BAD_REQUEST,
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from '../constants/http';

import {
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
} from '../@types/services/auth';

import appAssert from '../utils/appAssert';
import {
  authVerificationCodeExpiresIn,
  fiveMinutesAgo,
  ONE_DAY_IN_MS,
  passwordResetCodeExpiresIn,
  userSessionExpiresIn,
} from '../utils/date';
import {
  RefreshTokenPayload,
  refreshTokenSignOptions,
  signToken,
  verifyToken,
} from '../utils/jwt';

import { sendMail } from '../mailers/sendMail';
import {
  passwordResetTemplate,
  verifyEmailTemplate,
} from '../mailers/templates/emailTemplates';

import UserModel from '../models/user.models';
import SessionModel from '../models/session.model';
import VerificationCodeModel from '../models/verificationCode.model';

export const register = async (registerData: RegisterDTO) => {
  const { name, email, password, ip } = registerData;

  const existingUser = await UserModel.findOne({ email });
  appAssert(
    !existingUser,
    CONFLICT,
    'User already exists with this email.',
    AppErrorCode.AuthEmailAlreadyExists
  );

  const user = await UserModel.create({
    name: name,
    email: email,
    password: password,
    lastIp: ip,
    ipHistory: [ip],
  });

  const userId = user._id;

  const expiresAt = authVerificationCodeExpiresIn();
  const verification = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt,
  });

  /*   const url = `${FRONTEND_URL}/confirm-account?code=${
    verification.code
  }&exp=${expiresAt.getTime()}`;

  const { error } = await sendMail({
    to: user.email,
    ...verifyEmailTemplate(url),
  });
  if (error) {
    console.log(error);
  } */

  return { user: user.omit() };
};

export const login = async (loginData: LoginDTO) => {
  const { email, password, userAgent, ip } = loginData;

  const user = await UserModel.findOne({ email });
  appAssert(
    user && user.provider === AuthProviderType.Email,
    UNAUTHORIZED,
    'Invalid credentials or incorrect login provider.',
    AppErrorCode.AuthInvalidCredentials
  );

  const isPasswordValid = await user.comparePassword(password);
  appAssert(
    isPasswordValid,
    UNAUTHORIZED,
    'Invalid credentials or incorrect login provider.',
    AppErrorCode.AuthInvalidCredentials
  );

  /*   appAssert(
    user.verified,
    UNAUTHORIZED,
    'Email verification is required before logging in, please check your email.',
    AppErrorCode.AuthEmailNotVerified
  ); */

  // TODO: Check if user enabled 2FA

  if (!user.ipHistory.includes(ip)) {
    await user.updateOne({
      $set: {
        lastIp: ip,
      },
      $push: {
        ipHistory: {
          $each: [ip],
          $slice: -USER_IPS_RETENTION_LIMIT,
        },
      },
    });
  }

  const userId = user._id;
  const session = await SessionModel.create({
    userId,
    userAgent,
    ip: ip,
  });

  const sessionId = session._id;
  const accessToken = signToken({ userId, sessionId });
  const refreshToken = signToken({ sessionId }, refreshTokenSignOptions);

  return { user: user.omit(), accessToken, refreshToken, mfaRequired: false };
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
  appAssert(
    payload,
    UNAUTHORIZED,
    'Session expired or invalid. Please log in again.',
    AppErrorCode.AuthSessionExpired
  );

  const session = await SessionModel.findById(payload.sessionId);

  const now = Date.now();
  appAssert(
    session && session.expiresAt.getTime() > now,
    UNAUTHORIZED,
    'Session expired or invalid. Please log in again.',
    AppErrorCode.AuthSessionExpired
  );

  const userId = session.userId;
  const sessionId = session._id;

  const sessionNeedRefresh = session.expiresAt.getTime() - now <= ONE_DAY_IN_MS;
  if (sessionNeedRefresh) {
    session.expiresAt = userSessionExpiresIn();
    await session.save();
  }

  const newRefreshToken = sessionNeedRefresh
    ? signToken({ sessionId }, refreshTokenSignOptions)
    : undefined;

  const accessToken = signToken({ userId, sessionId });

  return { accessToken, newRefreshToken };
};

export const verifyEmail = async (code: string) => {
  const validCode = await VerificationCodeModel.findOne({
    code,
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
  appAssert(user, NOT_FOUND, 'User not found.', AppErrorCode.AuthUserNotFound);

  const userId = user._id;

  const timeAgo = fiveMinutesAgo();
  const maxAttemps = 1;
  const count = await VerificationCodeModel.countDocuments({
    userId,
    type: VerificationCodeType.PasswordReset,
    createdAt: { $gt: timeAgo },
  });
  appAssert(
    count <= maxAttemps,
    TOO_MANY_REQUESTS,
    'Too many requests, please try again later.',
    AppErrorCode.AuthTooManyRequests
  );

  const expiresAt = passwordResetCodeExpiresIn();
  const verification = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.PasswordReset,
    expiresAt,
  });

  const url = `${FRONTEND_URL}/reset-password?code=${
    verification.code
  }&exp=${expiresAt.getTime()}`;

  const { data, error } = await sendMail({
    to: user.email,
    ...passwordResetTemplate(url),
  });
  appAssert(
    data?.id,
    INTERNAL_SERVER_ERROR,
    `${error?.name} - ${error?.message}`
  );

  return { url, emailId: data.id };
};

export const resetPassword = async ({
  oldPassword,
  password,
  verificationCode,
}: ResetPasswordDTO) => {
  const validCode = await VerificationCodeModel.findOne({
    code: verificationCode,
    type: VerificationCodeType.PasswordReset,
    expiresAt: { $gt: Date.now() },
  });
  appAssert(
    validCode,
    NOT_FOUND,
    'Invalid or expired verification code.',
    AppErrorCode.InvalidOrExpiredVerificationCode
  );

  const userId = validCode.userId;

  const user = await UserModel.findById(userId);
  appAssert(
    user,
    BAD_REQUEST,
    'Invalid or expired verification code.',
    AppErrorCode.InvalidOrExpiredVerificationCode
  );

  const latestCode = await VerificationCodeModel.findOne({
    userId,
    type: VerificationCodeType.PasswordReset,
  }).sort({ createdAt: -1 });
  appAssert(
    latestCode?.code === verificationCode,
    BAD_REQUEST,
    'Invalid or expired verification code.',
    AppErrorCode.InvalidOrExpiredVerificationCode
  );

  const isOldPasswordValid = await user.comparePassword(oldPassword);
  appAssert(
    isOldPasswordValid,
    BAD_REQUEST,
    'Invalid old password.',
    AppErrorCode.AuthInvalidCredentials
  );

  user.password = password;
  const updatedUser = await user.save();

  await VerificationCodeModel.deleteMany({
    userId,
    type: VerificationCodeType.PasswordReset,
  });

  await SessionModel.deleteMany({ userId: updatedUser._id });

  return { user: updatedUser.omit() };
};

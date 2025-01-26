import AuthProviderType from '../constants/authProviderType';
import VerificationCodeType from '../constants/verificationCodeType';
import AppErrorCode from '../constants/appErrorCode';
import { FRONTEND_URL } from '../constants/env';
import {
  CONFLICT,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  TOO_MANY_REQUESTS,
  UNAUTHORIZED,
} from '../constants/http';

import { LoginDTO, RegisterDTO } from '../@types/services/auth';

import { sendMail } from '../utils/sendMail';
import { hashValue } from '../utils/bcrypt';
import appAssert from '../utils/appAssert';
import {
  getPasswordResetTemplate,
  getVerifyEmailTemplate,
} from '../utils/emailTemplates';
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
    ipAddresses: [{ ip: ip }],
  });

  const userId = user._id;

  const verificationCode = await VerificationCodeModel.create({
    userId,
    type: VerificationCodeType.EmailVerification,
    expiresAt: authVerificationCodeExpiresIn(),
  });

  // Send verification email
  const url = `${FRONTEND_URL}/email/verify/${verificationCode._id}`;

  const { error } = await sendMail({
    to: user.email,
    ...getVerifyEmailTemplate(url),
  });
  if (error) {
    console.log(error);
  }

  return { user: user.omit() };
};

export const login = async (loginData: LoginDTO) => {
  const { email, password, userAgent, ip } = loginData;

  let user = await UserModel.findOne({ email });

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

  appAssert(
    user.verified,
    UNAUTHORIZED,
    'Email verification is required before logging in, please check your email.',
    AppErrorCode.AuthEmailNotVerified
  );

  // TODO: Check if user enabled 2FA

  const existingIp = user.ipAddresses.find((entry) => entry.ip === ip);

  if (existingIp) {
    existingIp.updatedAt = new Date();
  } else {
    user.ipAddresses.push({ ip, updatedAt: new Date() });
  }

  const userId = user._id;

  const session = await SessionModel.create({
    userId,
    userAgent,
    ipAdrresse: ip,
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
    'Session expired or invalid. Please log in again.'
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

  /*   const session = await SessionModel.create({
    userId,
    userAgent: userAgent,
    ipAdrresse: ip,
  }); */

  /*   const sessionId = session._id;
  const refreshToken = signToken({ sessionId }, refreshTokenSignOptions);
  const accessToken = signToken({ userId, sessionId }); */

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

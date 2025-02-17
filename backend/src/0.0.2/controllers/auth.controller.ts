import asyncHandler from '../middlewares/asyncHandler';
import {
  clearAuthCookies,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  setAuthCookies,
} from '../utils/cookies';
import appAssert from '../utils/appAssert';

import {
  login,
  logout,
  sendPasswordReset,
  refreshAccessToken,
  register,
  resetPassword,
  verifyEmail,
} from '../services/auth.service';

import { CREATED, OK, UNAUTHORIZED } from '../constants/http';
import AppErrorCode from '../constants/appErrorCode';

import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationEmailSchema,
} from '../schemas/auth.schema';

export const registerHandler = asyncHandler(async (req, res) => {
  const registerData = registerSchema.parse({
    ...req.body,
    ip: req.ip || req.headers['x-forwarded-for'] || '',
  });

  const { user } = await register(registerData);

  return res
    .status(CREATED)
    .json({ message: 'User created successfully.', user });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const loginData = loginSchema.parse({
    ...req.body,
    ip: req.ip || req.headers['x-forwarded-for'] || '',
    userAgent: req.headers['user-agent'],
  });

  const { accessToken, refreshToken, user } = await login(loginData);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: "Welcome back! You're now logged in.", user });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const accessToken = req.cookies.accessToken as string | undefined;
  appAssert(accessToken, UNAUTHORIZED, 'Unauthorized');

  await logout(accessToken);

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: 'Logout successful.' });
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  appAssert(
    refreshToken,
    UNAUTHORIZED,
    'Session expired or invalid. Please log in again.',
    AppErrorCode.AuthSessionExpired
  );

  const { accessToken, newRefreshToken } = await refreshAccessToken(
    refreshToken
  );

  if (newRefreshToken) {
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .json({ message: 'Your session has been successfully renewed.' });
});

export const verifyEmailHandler = asyncHandler(async (req, res) => {
  const { code } = verificationEmailSchema.parse(req.body);

  await verifyEmail(code);

  return res
    .status(OK)
    .json({ message: 'Your email has been successfully verified! ' });
});

export const sendPasswordResetHandler = asyncHandler(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  await sendPasswordReset(email);

  return res.status(OK).json({
    message: 'A password reset email has been sent to your inbox.',
  });
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);

  await resetPassword(request);

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: 'Your password has been successfully reset.' });
});

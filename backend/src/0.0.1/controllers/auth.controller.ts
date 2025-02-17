import asyncHandler from '../utils/asyncHandler';
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

import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationCodeSchema,
} from '../schemas/auth.schema';

export const registerHandler = asyncHandler(async (req, res) => {
  const request = registerSchema.parse({
    ...req.body,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  const { user, refreshToken, accessToken } = await register(request);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(CREATED)
    .json(user);
});

export const loginHandler = asyncHandler(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  const { refreshToken, accessToken } = await login(request);

  return setAuthCookies({ res, accessToken, refreshToken })
    .status(OK)
    .json({ message: 'Login successful.' });
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
  appAssert(refreshToken, UNAUTHORIZED, 'Unauthorized');

  const { accessToken, newRefreshToken } = await refreshAccessToken(
    refreshToken
  );

  if (newRefreshToken) {
    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());
  }

  return res
    .status(OK)
    .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .json({ message: 'Access token refreshed' });
});

export const verifyEmailHandler = asyncHandler(async (req, res) => {
  const verificationCode = verificationCodeSchema.parse(req.params.code);

  await verifyEmail(verificationCode);

  return res.status(OK).json({ message: 'Email was successfully verified.' });
});

export const sendPasswordResetHandler = asyncHandler(async (req, res) => {
  const email = emailSchema.parse(req.body.email);

  await sendPasswordReset(email);

  return res.status(OK).json({ message: 'Password reset email sent.' });
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const request = resetPasswordSchema.parse(req.body);

  await resetPassword(request);

  return clearAuthCookies(res)
    .status(OK)
    .json({ message: 'Password reset successful.' });
});

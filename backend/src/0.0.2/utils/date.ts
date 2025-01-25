import {
  AUTH_VERIFICATION_CODE_EXPIRES_IN,
  JWT_COOKIE_ACCESS_EXPIRES_IN,
  JWT_COOKIE_REFRESH_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  PASSWORD_RESET_CODE_EXPIRES_IN,
} from '../constants/env';

export const authVerificationCodeExpiresIn = () =>
  new Date(Date.now() + AUTH_VERIFICATION_CODE_EXPIRES_IN * 60 * 1000);

export const passwordResetCodeExpiresIn = () =>
  new Date(Date.now() + PASSWORD_RESET_CODE_EXPIRES_IN * 60 * 1000);

export const userSessionExpiresIn = () =>
  new Date(Date.now() + JWT_REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000);

export const accessCookieExpiresIn = () =>
  new Date(Date.now() + JWT_COOKIE_ACCESS_EXPIRES_IN * 60 * 1000);

export const refreshCookieExpiresIn = () =>
  new Date(Date.now() + JWT_COOKIE_REFRESH_EXPIRES_IN * 24 * 60 * 60 * 1000);

export const fiveMinutesAgo = () => new Date(Date.now() - 5 * 60 * 1000);

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

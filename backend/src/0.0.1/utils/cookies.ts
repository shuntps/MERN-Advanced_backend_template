import { CookieOptions, Response } from 'express';

import { NODE_ENV } from '../constants/env';

import { accessCookieExpiresIn, refreshCookieExpiresIn } from './date';

export const REFRESH_PATH = '/api/auth/refresh';

const defaults: CookieOptions = {
  sameSite: 'strict',
  httpOnly: true,
  secure: NODE_ENV !== 'development',
};

export const getAccessTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: accessCookieExpiresIn(),
});

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  ...defaults,
  expires: refreshCookieExpiresIn(),
  path: REFRESH_PATH,
});

type Params = {
  res: Response;
  refreshToken: string;
  accessToken: string;
};

export const setAuthCookies = ({ res, refreshToken, accessToken }: Params) =>
  res
    .cookie('accessToken', accessToken, getAccessTokenCookieOptions())
    .cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

export const clearAuthCookies = (res: Response) =>
  res
    .clearCookie('accessToken')
    .clearCookie('refreshToken', { path: REFRESH_PATH });

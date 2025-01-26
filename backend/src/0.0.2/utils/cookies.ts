import { CookieOptions, Response } from 'express';

import { BASE_PATH, NODE_ENV } from '../constants/env';

import { accessCookieExpiresIn, refreshCookieExpiresIn } from './date';

export const REFRESH_PATH = `${BASE_PATH}/auth/refresh`;

const defaults: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV !== 'development',
  sameSite: NODE_ENV !== 'development' ? 'none' : 'strict',
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

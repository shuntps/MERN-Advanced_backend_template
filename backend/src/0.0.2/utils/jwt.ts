import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';

import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_SECRET,
} from '../constants/env';

import { UserDocument } from '../@types/models/user';
import { SessionDocument } from '../@types/models/session';

export type RefreshTokenPayload = {
  sessionId: SessionDocument['_id'];
};

export type AccessTokenPayload = {
  userId: UserDocument['_id'];
  sessionId: SessionDocument['_id'];
};

type SignOptionsAndSecret = SignOptions & { secret: string };

const defaults: SignOptions = {
  audience: ['user'],
};

const accessTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: `${JWT_ACCESS_TOKEN_EXPIRES_IN}m`,
  secret: JWT_ACCESS_TOKEN_SECRET,
};

export const refreshTokenSignOptions: SignOptionsAndSecret = {
  expiresIn: `${JWT_REFRESH_TOKEN_EXPIRES_IN}d`,
  secret: JWT_REFRESH_TOKEN_SECRET,
};

export const signToken = (
  payload: AccessTokenPayload | RefreshTokenPayload,
  options?: SignOptionsAndSecret
) => {
  const { secret, ...signOptions } = options || accessTokenSignOptions;

  return jwt.sign(payload, secret, { ...defaults, ...signOptions });
};

export const verifyToken = <TPayload extends object = AccessTokenPayload>(
  token: string,
  options?: VerifyOptions & {
    secret?: string;
  }
) => {
  const { secret = JWT_ACCESS_TOKEN_SECRET, ...verifyOpts } = options || {};

  try {
    const payload = jwt.verify(token, secret, {
      ...defaults,
      ...verifyOpts,
    }) as TPayload;

    return {
      payload,
    };
  } catch (error: any) {
    return { error: error.message };
  }
};

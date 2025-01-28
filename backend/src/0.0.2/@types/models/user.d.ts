import { Document } from 'mongoose';

import AuthProviderType from '../../constants/authProviderType';

export interface UserPreferences {
  enable2FA: boolean;
  emailNotification: boolean;
  twoFactorSecret?: string;
}

export interface IpHistoryItem {
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  provider: AuthProviderType;
  lastIp: string;
  ipHistory: IpHistoryItem[];
  userPreferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;

  comparePassword: (val: string) => Promise<boolean>;
  omit(): Pick<
    UserDocument,
    | '_id'
    | 'name'
    | 'email'
    | 'verified'
    | 'provider'
    | 'createdAt'
    | 'updatedAt'
    | '__v'
  >;
}

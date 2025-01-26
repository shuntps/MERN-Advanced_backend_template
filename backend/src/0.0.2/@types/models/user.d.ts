import { Document } from 'mongoose';

import AuthProviderType from '../../constants/authProviderType';

export interface IpAddress {
  ip: string;
  createdAt?: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  enable2FA: boolean;
  emailNotification: boolean;
  twoFactorSecret?: string;
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  provider: AuthProviderType;
  ipAddresses: IpAddress[];
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

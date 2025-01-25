import mongoose from 'mongoose';

import { hashValue, compareValue } from '../utils/bcrypt';

import {
  IpAddress,
  UserDocument,
  UserPreferences,
} from '../@types/models/user';

const ipAddressSchema = new mongoose.Schema<IpAddress>(
  {
    ip: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userPreferencesSchema = new mongoose.Schema<UserPreferences>(
  {
    enable2FA: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    twoFactorSecret: { type: String, required: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    provider: { type: String, required: true },
    lastLogin: { type: Date, required: true, default: Date.now },
    ipAddresses: { type: [ipAddressSchema], required: true, default: [] },
    userPreferences: { type: userPreferencesSchema, default: {} },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await hashValue(this.password);
  }
});

userSchema.methods.comparePassword = function (val: string) {
  return compareValue(val, this.password);
};

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.ipAddresses;
    delete ret.userPreferences.twoFactorSecret;
    return ret;
  },
});

userSchema.methods.omit = function () {
  const user = this.toObject();
  delete user.password;
  delete user.ipAddresses;
  return user;
};

const UserModel = mongoose.model<UserDocument>('User', userSchema, 'users');

export default UserModel;

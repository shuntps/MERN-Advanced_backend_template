import mongoose from 'mongoose';

import AuthProviderType from '../constants/authProviderType';

import { hashValue, compareValue } from '../utils/bcrypt';

import { UserDocument, UserPreferences } from '../@types/models/user';

const userPreferencesSchema = new mongoose.Schema<UserPreferences>(
  {
    enable2FA: { type: Boolean, default: false },
    emailNotification: { type: Boolean, default: true },
    twoFactorSecret: { type: String },
  },
  { _id: false }
);

const ipHistorySchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    provider: { type: String, required: true, default: AuthProviderType.Email },
    lastIp: { type: String, default: '' },
    ipHistory: { type: [ipHistorySchema], default: [] },
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
    delete ret.lastIp;
    delete ret.ipHistory;
    delete ret.userPreferences.twoFactorSecret;
    return ret;
  },
});

userSchema.methods.omit = function () {
  const user = this.toObject();
  delete user.password;
  delete user.lastIp;
  delete user.ipHistory;
  delete user.userPreferences.twoFactorSecret;
  return user;
};

const UserModel = mongoose.model<UserDocument>('User', userSchema, 'users');

export default UserModel;

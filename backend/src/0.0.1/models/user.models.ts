import mongoose from 'mongoose';

import { hashValue, compareValue } from '../utils/bcrypt';

import AuthProviderType from '../constants/authProviderType';

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  provider: AuthProviderType;
  lastLogin: Date;
  ipAddresses: { ip: string; updatedAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
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

const ipAddressSchema = new mongoose.Schema(
  {
    ip: { type: String },
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
    provider: { type: String, required: true },
    lastLogin: { type: Date, required: true, default: Date.now },
    ipAddresses: { type: [ipAddressSchema], required: true, default: [] },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashValue(this.password);
  next();
});

userSchema.methods.comparePassword = function (val: string) {
  return compareValue(val, this.password);
};

userSchema.methods.omit = function () {
  const user = this.toObject();
  delete user.password;
  delete user.ipAddresses;
  return user;
};

const UserModel = mongoose.model<UserDocument>('User', userSchema, 'users');

export default UserModel;

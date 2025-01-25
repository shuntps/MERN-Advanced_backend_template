import { Document, Types } from 'mongoose';

export interface SessionDocument extends Document {
  userId: Types.ObjectId;
  userAgent?: string;
  ipAdrresse: string;
  createdAt: Date;
  expiresAt: Date;
}

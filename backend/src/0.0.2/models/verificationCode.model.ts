import mongoose from 'mongoose';

import { VerificationCodeDocument } from '../@types/models/verificationCode';

import { generateUniqueCode } from '../utils/uuid';

const verificationCodeSchema = new mongoose.Schema<VerificationCodeDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  code: { type: String, unique: true, default: generateUniqueCode() },
  type: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const VerificationCodeModel = mongoose.model<VerificationCodeDocument>(
  'VerificationCode',
  verificationCodeSchema,
  'verification_codes'
);

export default VerificationCodeModel;

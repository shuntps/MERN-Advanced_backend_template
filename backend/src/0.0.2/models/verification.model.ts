import mongoose from 'mongoose';

import { VerificationDocument } from '../@types/models/verification';

const verificationSchema = new mongoose.Schema<VerificationDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

const VerificationModel = mongoose.model<VerificationDocument>(
  'VerificationCode',
  verificationSchema,
  'verification_codes'
);

export default VerificationModel;

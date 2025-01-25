import VerificationCodeType from '../../constants/verificationType';

export interface VerificationDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: VerificationCodeType;
  expiresAt: Date;
  createdAt: Date;
}

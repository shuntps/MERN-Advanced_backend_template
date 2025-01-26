import VerificationCodeType from '../../constants/verificationCodeType';

export interface VerificationCodeDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  code: String;
  type: VerificationCodeType;
  expiresAt: Date;
  createdAt: Date;
}

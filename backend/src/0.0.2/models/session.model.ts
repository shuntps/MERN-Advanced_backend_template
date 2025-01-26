import mongoose from 'mongoose';

import { SessionDocument } from '../@types/models/session';

import { userSessionExpiresIn } from '../utils/date';

const sessionSchema = new mongoose.Schema<SessionDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true,
  },
  userAgent: { type: String },
  ipAdrresse: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, default: userSessionExpiresIn },
});

sessionSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.ipAdrresse;
    return ret;
  },
});

const SessionModel = mongoose.model<SessionDocument>(
  'Session',
  sessionSchema,
  'sessions'
);

export default SessionModel;

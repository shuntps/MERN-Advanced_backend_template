declare global {
  namespace Express {
    interface Request {
      userId: Types.ObjectId;
      sessionId: Types.ObjectId;
    }
  }
}
export {};

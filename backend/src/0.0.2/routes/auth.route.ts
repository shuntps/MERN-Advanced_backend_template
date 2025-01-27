import { Router } from 'express';

import {
  loginHandler,
  logoutHandler,
  sendPasswordResetHandler,
  refreshHandler,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from '../controllers/auth.controller';

const authRoutes = Router();

// prefix: /api/auth
authRoutes.post('/register', registerHandler);
authRoutes.post('/login', loginHandler);
authRoutes.get('/logout', logoutHandler);
authRoutes.get('/refresh', refreshHandler);
authRoutes.post('/email/verify', verifyEmailHandler);
authRoutes.post('/password/forgot', sendPasswordResetHandler);
authRoutes.post('/password/reset', resetPasswordHandler);

export default authRoutes;

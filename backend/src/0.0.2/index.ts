// import './automations/cleanUserIps';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectMongoDB from './config/database';

import errorHandler from './middlewares/errorHandler';
import authenticate from './middlewares/authenticate';

import { PORT, FRONTEND_URL, NODE_ENV, BASE_PATH } from './constants/env';

import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.routes';
import sessionRoutes from './routes/session.route';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(BASE_PATH + '/auth', authRoutes);

// Protected routes
app.use(BASE_PATH + '/user', authenticate, userRoutes);
app.use(BASE_PATH + '/sessions', authenticate, sessionRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${NODE_ENV} environment.`);
  await connectMongoDB();
});

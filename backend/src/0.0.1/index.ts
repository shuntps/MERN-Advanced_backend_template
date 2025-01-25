import 'dotenv/config';
import './automations/cleanUserIps';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectMongoDB from './config/database';

import errorHandler from './middlewares/errorHandler';
import authenticate from './middlewares/authenticate';

import { BACKEND_PORT, FRONTEND_URL, NODE_ENV } from './constants/env';
import { OK } from './constants/http';

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

app.get('/', (req, res) => {
  res.status(OK).json({ status: 'success', message: 'Healthy' });
});

app.use('/api/v0.0.1/auth', authRoutes);

// Protected routes
app.use('/api/v0.0.1/user', authenticate, userRoutes);
app.use('/api/v0.0.1/sessions', authenticate, sessionRoutes);

app.use(errorHandler);

app.listen(BACKEND_PORT, async () => {
  console.log(
    `Server is running on port ${BACKEND_PORT} in ${NODE_ENV} environment.`
  );
  await connectMongoDB();
});

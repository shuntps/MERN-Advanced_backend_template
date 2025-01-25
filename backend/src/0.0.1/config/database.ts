import mongoose from 'mongoose';

import { MONGODB_URI } from '../constants/env';

const connectMongoDB = async () => {
  console.log('Connecting to MongoDB...');

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB successfully connected at ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully.');
    });

    mongoose.connection.on('reconnectFailed', () => {
      console.error('MongoDB reconnection failed.');
    });
  } catch (error) {
    console.log('Could not connect to MongoDB.', error);
    process.exit(1);
  }
};

export default connectMongoDB;

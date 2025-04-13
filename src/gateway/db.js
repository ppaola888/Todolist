import dotenv from 'dotenv';
import mongoose from 'mongoose';
import config from '../../config/config.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();
//const db = process.env.MONGODB_URI; || mongodb://${config.db.host}:${config.db.port}/${config.db.name}

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      const memoryServer = await MongoMemoryServer.create();
      await mongoose.connect(memoryServer.getUri(), { dbName: 'todolist' });
      console.log('Connected to MongoDb in-memory');
    } else {
      console.log('Connection string: ', config.db.connectionString);
      await mongoose.connect(config.db.connectionString);
      console.log('Connected to Mongo Atlas');
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
};

export default connectDB;

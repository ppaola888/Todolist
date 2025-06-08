import mongoose from 'mongoose';
import { userStatus } from '../const/constant.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: String,
    salt: String,
    status: {
      type: String,
      default: userStatus.PENDING,
    },
    username: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      wrightConcern: {
        w: 1,
        wtimeout: 2000,
      },
    },
  }
);

userSchema.index({ username: 1 });

const user = mongoose.model('User', userSchema);

export default user;

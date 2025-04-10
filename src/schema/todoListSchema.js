import mongoose from 'mongoose';
import { status } from '../const/constant.js';

const todolistSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    dueDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: status.OPEN,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      writeConcern: {
        w: 1,
        wtimeout: 2000,
      },
    },
  }
);

const Activity = mongoose.model('Activity', todolistSchema);

export default Activity;

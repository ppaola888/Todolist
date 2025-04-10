import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    userId: String,
    registrationToken: String,
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

tokenSchema.index({ updated_at: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model('RegistrationToken', tokenSchema);

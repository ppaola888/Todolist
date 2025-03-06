import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: String,
    registrationToken: String,
  },
  {
    timestamps: {
      createdAt: "created_at",
      wrightConcern: {
        w: 1,
        wtimeout: 2000,
      },
    },
  }
);

tokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.model("RegistrationToken", tokenSchema);

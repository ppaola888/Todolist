import mongoose from "mongoose";
import config from "../../config/config.js"; // Import the configuration file

//const db = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(config.db.connectionString);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
};

export default connectDB;

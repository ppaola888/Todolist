import dotenv from "dotenv";
import config from "./config/config.js";
import express from "express";
import connectDB from "./src/gataway/db.js";
import setup from "./src/routes/activityRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

try {
  await connectDB();
  setup(app);
  app.listen(config.port, config.host, () => {
    console.log(`Server running on http://${config.host}:${config.port}`);
  });
} catch (error) {
  console.log("Server not started", error.message);
  process.exit();
}

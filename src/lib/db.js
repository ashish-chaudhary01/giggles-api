import mongoose from "mongoose";
import config from "../config/config.js";

async function connectDb() {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDb connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}

export default connectDb;

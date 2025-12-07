// src/lib/mongo.ts
import mongoose from "mongoose";
import { logger } from "./logger";

export async function connectMongo() {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.info("Mongo already connected");
      return;
    }

    if (!process.env.MONGO_URI) {
      logger.error("Mongo URL undefined in enviornment variables");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected successfully");
  } catch (err: unknown) {
    logger.error(`MongoDB connection failed ${err}`);
    process.exit(1);
  }
}

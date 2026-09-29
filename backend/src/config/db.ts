import mongoose from "mongoose";
import { Env } from "./env.config.js";
import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);

export const connectDB = async () => {
    try {
        await mongoose.connect(Env.DATABASE_URL);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1);
    }
};
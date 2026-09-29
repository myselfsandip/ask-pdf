import "dotenv/config";
import { getEnv } from "../utils/get-env.js";


const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:3000"),
  LOG_LEVEL: getEnv("LOG_LEVEL", "info"),
  REDIS_URL: getEnv("REDIS_URL", "redis://localhost:6379"),
  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),
  GEMINI_CHAT_MODEL: getEnv("GEMINI_CHAT_MODEL"),
  GEMINI_EMBEDDING_MODEL: getEnv("GEMINI_EMBEDDING_MODEL"),
  QDRANT_URL: getEnv("QDRANT_URL"),
  QDRANT_API_KEY: getEnv("QDRANT_API_KEY"),
  QDRANT_COLLECTION: getEnv("QDRANT_COLLECTION"),
  UPLOAD_DIR: getEnv("UPLOAD_DIR", "uploads"),
});

export const Env = envConfig();

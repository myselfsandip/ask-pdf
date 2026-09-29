import { Redis } from "ioredis";
import { Env } from "./env.config.js";

export const redisConnection = new Redis(Env.REDIS_URL, { maxRetriesPerRequest: null });

redisConnection.on('connect', () => console.log('Redis Connected'))
redisConnection.on('error', (err) => console.error('Redis error:', err))
// src/config/redisClient.ts
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_DEV,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect to Redis
const connectRedis = async () => {
  await redisClient.connect();
  console.log("Connected to Redis");
};

// Export both the Redis client and the connect function
export { redisClient, connectRedis };

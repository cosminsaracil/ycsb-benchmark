import { MongoClient } from "mongodb";
import Redis from "ioredis";

export const checkConnections = async (req, res) => {
  let mongoStatus = "stopped";
  let redisStatus = "stopped";

  // MongoDB
  try {
    const client = new MongoClient("mongodb://localhost:27017", {
      serverSelectionTimeoutMS: 1000,
    });
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    mongoStatus = "running";
    await client.close();
  } catch (e) {
    mongoStatus = "stopped";
  }

  // Redis
  try {
    const redis = new Redis({
      port: 6379,
      host: "localhost",
      connectTimeout: 1000,
      retryStrategy: null, // prevent retries
    });
    const pong = await redis.ping();
    if (pong === "PONG") {
      redisStatus = "running";
    }
    redis.disconnect();
  } catch (e) {
    redisStatus = "stopped";
  }

  console.log(`MongoDB: ${mongoStatus}`);
  console.log(`Redis: ${redisStatus}`);

  res.json({ mongo: mongoStatus, redis: redisStatus });
};

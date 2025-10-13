import { MongoClient } from "mongodb";
import Redis from "ioredis";

export const checkConnections = async (req, res) => {
  let mongoStatus = "stopped";
  let redisStatus = "stopped";

  // Test MongoDB
  try {
    const client = new MongoClient("mongodb://localhost:27017");
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    mongoStatus = "running";
    await client.close();
  } catch (e) {
    mongoStatus = "stopped";
  }

  // Test Redis
  try {
    const redis = new Redis(6379, "localhost");
    await redis.ping();
    redisStatus = "running";
    redis.disconnect();
  } catch (e) {
    redisStatus = "stopped";
  }

  res.json({ mongo: mongoStatus, redis: redisStatus });
};

import { MongoClient } from "mongodb";
import Redis from "ioredis";
import { Pool } from "pg";
import mysql from "mysql2/promise";

export const checkConnections = async (req, res) => {
  let mongoStatus = "stopped";
  let redisStatus = "stopped";
  let postgresStatus = "stopped";
  let mysqlStatus = "stopped";

  // MongoDB
  try {
    const client = new MongoClient("mongodb://localhost:27017", {
      serverSelectionTimeoutMS: 3000,
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

  // PostgreSQL
  try {
    const pool = new Pool({
      host: "localhost",
      port: 5432,
      user: "ycsb",
      password: "ycsb",
      database: "ycsb",
      connectionTimeoutMillis: 3000,
    });
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    await pool.end();
    postgresStatus = "running";
  } catch (e) {
    postgresStatus = "stopped";
  }

  // MySQL
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "ycsb",
      password: "ycsb",
      database: "ycsb",
      connectTimeout: 3000,
    });
    await connection.execute("SELECT 1");
    await connection.end();
    mysqlStatus = "running";
  } catch (e) {
    mysqlStatus = "stopped";
  }

  res.json({
    mongo: mongoStatus,
    redis: redisStatus,
    postgres: postgresStatus,
    mysql: mysqlStatus,
  });
};

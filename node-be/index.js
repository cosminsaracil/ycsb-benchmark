import express from "express";
import dotenv from "dotenv";

// env load
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Root route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello world" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

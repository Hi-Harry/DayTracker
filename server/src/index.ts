import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import statusRouter from "./routes/status.js";
import { connectToDatabase } from "./db.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/status", statusRouter);

// Initialize MySQL connection
connectToDatabase().catch(() => {});

app.get("/api/test-db", async (_req, res) => {
  try {
    const pool = await connectToDatabase();
    await pool.execute("SELECT 1");
    return res.json({ connected: true, result: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res
      .status(500)
      .json({ connected: false, error: "DB test failed", message });
  }
});

const port = Number(process.env.PORT);
app.listen(port, () => {
  // Server started successfully
});

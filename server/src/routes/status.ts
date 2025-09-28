import { Router } from "express";
import { z } from "zod";
import { connectToDatabase } from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/:userId", requireAuth, async (req, res) => {
  const userId = req.params.userId;
  const claims = (req as any).user as { userId: string };
  if (claims.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  try {
    const pool = await connectToDatabase();

    // Get ALL shared status data (not user-specific)
    const [rows] = await pool.execute(
      "SELECT data_key, status_value FROM status_data"
    );

    // Convert to the expected format
    const mergedData: Record<string, string> = {};
    if (Array.isArray(rows)) {
      rows.forEach((row: any) => {
        mergedData[row.data_key] = row.status_value;
      });
    }

    return res.json({ data: mergedData });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:userId", requireAuth, async (req, res) => {
  const userId = req.params.userId;
  const claims = (req as any).user as { userId: string };
  if (claims.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  const parse = z
    .object({ statusData: z.record(z.string()) })
    .safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });

  const { statusData } = parse.data;

  try {
    const pool = await connectToDatabase();
    const connection = await pool.getConnection();

    try {
      // Start a transaction
      await connection.beginTransaction();

      // Delete existing data for this user
      await connection.execute("DELETE FROM status_data WHERE user_id = ?", [
        userId,
      ]);

      // Insert new data
      for (const [dataKey, statusValue] of Object.entries(statusData)) {
        await connection.execute(
          "INSERT INTO status_data (user_id, data_key, status_value, updated_by) VALUES (?, ?, ?, ?)",
          [userId, dataKey, statusValue, userId]
        );
      }

      await connection.commit();
      return res.json({ success: true });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/public/all", async (_req, res) => {
  try {
    const pool = await connectToDatabase();

    // Get all status data from all users
    const [rows] = await pool.execute(
      "SELECT data_key, status_value FROM status_data"
    );

    // Convert to the expected format
    const mergedData: Record<string, string> = {};
    if (Array.isArray(rows)) {
      rows.forEach((row: any) => {
        mergedData[row.data_key] = row.status_value;
      });
    }

    return res.json({ data: mergedData });
  } catch (err) {
    // Fallback to empty data if there's an error
    return res.json({ data: {} });
  }
});

export default router;

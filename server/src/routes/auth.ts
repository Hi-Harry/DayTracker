import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../db.js";
import { signJwt } from "../auth.js";

const router = Router();

const email = z.string().email();
const password = z.string().min(8).max(128);
const name = z.string().min(1).max(100);

router.post("/signup", async (req, res) => {
  const parse = z.object({ email, password, name }).safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { email: e, password: p, name: n } = parse.data;

  try {
    const pool = await connectToDatabase();

    // Check if user already exists
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [e]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: "Email in use" });
    }

    const hash = await bcrypt.hash(p, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
      [e, hash, n]
    );

    const userId = (result as any).insertId.toString();
    const token = signJwt({ userId, email: e });
    return res.json({ userId, token });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const parse = z.object({ email, password }).safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { email: e, password: p } = parse.data;

  try {
    const pool = await connectToDatabase();

    const [users] = await pool.execute(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [e]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0] as any;
    const ok = await bcrypt.compare(p, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const userId = user.id.toString();
    const token = signJwt({ userId, email: e });
    return res.json({ userId, token });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

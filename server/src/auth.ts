import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface JwtUserClaims {
  userId: string;
  email: string;
}

export function signJwt(claims: JwtUserClaims): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign(claims, secret, { expiresIn: "7d", algorithm: "HS256" });
}

export function verifyJwt(token: string): JwtUserClaims {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.verify(token, secret) as JwtUserClaims;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header) return res.status(401).json({ error: "Authorization required" });
  const [, token] = header.split(" ");
  if (!token) return res.status(401).json({ error: "Authorization required" });
  try {
    const claims = verifyJwt(token);
    (req as any).user = claims;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET =
  process.env.JWT_SECRET || "super-secret-key";
const ACCESS_EXPIRES_IN =
  Number(process.env.JWT_EXPIRES_IN) || 3600; // seconds
const SALT_ROUNDS = 10;

export interface SessionPayload {
  id: string; // adminId
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for admin
 */
export function generateSessionToken(
  adminId: string
): string {
  const payload: JwtPayload = { id: adminId };
  const options: SignOptions = {
    expiresIn: ACCESS_EXPIRES_IN,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Hash token before storing in DB
 */
export async function hashToken(
  token: string
): Promise<string> {
  return bcrypt.hash(token, SALT_ROUNDS);
}

/**
 * Verify JWT token
 */
export function verifyToken(
  token: string
): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Compare JWT token with hashed token in DB
 */
export async function isTokenValid(
  token: string,
  hashedToken: string
): Promise<boolean> {
  return bcrypt.compare(token, hashedToken);
}

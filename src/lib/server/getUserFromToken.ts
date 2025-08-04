import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  name: string;
  email: string;
  role: string;
  userId: string;
}

export async function getUserFromServerToken(): Promise<JwtPayload | null> {
  const cookiesObject = await cookies(); // ✅ await the Promise
  const token = cookiesObject.get('sempoa')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    console.error("JWT decode failed:", err);
    return null;
  }
}
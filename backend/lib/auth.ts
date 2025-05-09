import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to get user ID from JWT token
export const getUserIdFromToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development') as { userId?: string, _id?: string };
    return decoded.userId || decoded._id || null;
  } catch (error) {
    return null;
  }
}; 
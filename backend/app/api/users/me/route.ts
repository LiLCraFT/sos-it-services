import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// Helper pour extraire l'ID utilisateur du token
const getUserIdFromToken = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development') as { userId?: string, _id?: string };
    return decoded.userId || decoded._id || null;
  } catch {
    return null;
  }
};

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error('Erreur /api/users/me:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 
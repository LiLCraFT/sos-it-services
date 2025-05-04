import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development';

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     description: Vérifie la validité d'un token JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *       401:
 *         description: Token invalide ou expiré
 *       500:
 *         description: Erreur serveur
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Récupérer le token de l'en-tête Authorization
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token non fourni' },
        { status: 401 }
      );
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    try {
      // Vérifier la validité du token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Récupérer les informations de l'utilisateur
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { user },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification du token' },
      { status: 500 }
    );
  }
} 
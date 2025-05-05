import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { hasAdminRights } from '@/lib/auth-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development';

/**
 * Middleware pour vérifier si l'utilisateur a des droits d'administration (admin ou fondateur)
 */
export async function checkAdminAccess(req: NextRequest) {
  try {
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
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
      
      // Vérifier si l'utilisateur a des droits d'administration
      if (!hasAdminRights(decoded.role)) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        );
      }
      
      // L'utilisateur a des droits d'administration, continuer
      return null;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Error checking admin access:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification des droits d\'accès' },
      { status: 500 }
    );
  }
} 
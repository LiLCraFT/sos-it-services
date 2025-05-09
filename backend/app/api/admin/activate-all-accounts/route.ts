import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { checkAdminAccess } from '@/app/middleware/check-admin';

export async function POST(req: NextRequest) {
  try {
    // Vérifier les droits d'administration
    const adminCheck = await checkAdminAccess(req);
    if (adminCheck) {
      return adminCheck;
    }

    await dbConnect();
    
    // Mettre à jour tous les utilisateurs
    const result = await User.updateMany(
      {},
      {
        $set: {
          isEmailVerified: true,
          isAdminVerified: true,
          emailVerificationToken: undefined,
          emailVerificationTokenExpires: undefined
        }
      }
    );
    
    return NextResponse.json(
      { 
        message: 'Tous les comptes ont été activés avec succès',
        modifiedCount: result.modifiedCount
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error activating all accounts:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'activation des comptes' },
      { status: 500 }
    );
  }
} 
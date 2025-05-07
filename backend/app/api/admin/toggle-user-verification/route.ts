import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
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
    
    const { userId, isEmailVerified, isAdminVerified } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }
    
    // Rechercher l'utilisateur
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Mettre à jour les statuts de vérification
    if (typeof isEmailVerified === 'boolean') {
      user.isEmailVerified = isEmailVerified;
      if (!isEmailVerified) {
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
      }
    }
    
    if (typeof isAdminVerified === 'boolean') {
      user.isAdminVerified = isAdminVerified;
    }
    
    await user.save();
    
    return NextResponse.json(
      { 
        message: 'Statut de vérification mis à jour avec succès',
        user: {
          _id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isAdminVerified: user.isAdminVerified
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating user verification status:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du statut de vérification' },
      { status: 500 }
    );
  }
} 
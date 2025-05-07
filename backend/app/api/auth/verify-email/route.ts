import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Récupérer le token depuis l'URL
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      );
    }
    
    // Rechercher l'utilisateur avec ce token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Token de vérification invalide ou expiré' },
        { status: 400 }
      );
    }
    
    // Mettre à jour l'utilisateur
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    await user.save();
    
    // Si c'est un freelancer, on ne change pas isAdminVerified
    // Sinon, le compte est complètement activé
    if (user.clientType !== 'Freelancer') {
      user.isAdminVerified = true;
      await user.save();
    }
    
    return NextResponse.json(
      { message: 'Email vérifié avec succès' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
} 
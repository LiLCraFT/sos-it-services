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
    
    const { userId } = await req.json();
    
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
    
    // Vérifier que c'est bien un freelancer
    if (user.clientType !== 'Freelancer') {
      return NextResponse.json(
        { error: 'Cet utilisateur n\'est pas un freelancer' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'email a été vérifié
    if (!user.isEmailVerified) {
      return NextResponse.json(
        { error: 'L\'email de l\'utilisateur n\'a pas été vérifié' },
        { status: 400 }
      );
    }
    
    // Approuver le compte
    user.isAdminVerified = true;
    await user.save();
    
    return NextResponse.json(
      { message: 'Compte freelancer approuvé avec succès' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error approving freelancer:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'approbation du compte freelancer' },
      { status: 500 }
    );
  }
} 
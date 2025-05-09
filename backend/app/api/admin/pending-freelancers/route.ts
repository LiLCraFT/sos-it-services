import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { checkAdminAccess } from '@/app/middleware/check-admin';

export async function GET(req: NextRequest) {
  try {
    // Vérifier les droits d'administration
    const adminCheck = await checkAdminAccess(req);
    if (adminCheck) {
      return adminCheck;
    }

    await dbConnect();
    
    // Rechercher les freelancers avec email vérifié mais pas encore approuvés
    const pendingFreelancers = await User.find({
      clientType: 'Freelancer',
      isEmailVerified: true,
      isAdminVerified: false
    }).select('-password -emailVerificationToken -emailVerificationTokenExpires');
    
    return NextResponse.json(
      { freelancers: pendingFreelancers },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching pending freelancers:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des freelancers en attente' },
      { status: 500 }
    );
  }
} 
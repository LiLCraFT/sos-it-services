import { NextRequest, NextResponse } from 'next/server';
import { hasAdminRights } from '@/lib/auth-utils';
import User from '@/models/User';
import { dbConnect } from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

// Helper function to get user ID and role from JWT token
const getUserFromToken = (req: NextRequest): { userId: string | null, role: string | null } => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { userId: null, role: null };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development') as { 
      userId: string,
      role: string
    };
    return { 
      userId: decoded.userId,
      role: decoded.role
    };
  } catch (error) {
    return { userId: null, role: null };
  }
};

// Get all freelancers (founder and freelancer_admin only)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { userId } = getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }
    
    // Vérifier si l'utilisateur est fondateur ou freelancer_admin
    const user = await User.findById(userId);
    if (!user || (user.role !== 'fondateur' && user.role !== 'freelancer_admin')) {
      return NextResponse.json({ error: 'Accès restreint aux fondateurs et freelancer_admin' }, { status: 403 });
    }
    
    // Récupérer tous les freelancers (y compris ceux qui ont le rôle freelancer_admin)
    const freelancers = await User.find({ 
      role: { $in: ['freelancer', 'freelancer_admin'] } 
    }).select('_id firstName lastName email phone city role profileImage createdAt isEmailVerified isAdminVerified emailVerificationToken');
      
    return NextResponse.json({ freelancers }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Mettre à jour le rôle d'un freelancer (ajouter/retirer le rôle admin)
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    
    const { userId } = getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }
    
    // Vérifier si l'utilisateur est fondateur
    const user = await User.findById(userId);
    if (!user || user.role !== 'fondateur') {
      return NextResponse.json({ error: 'Seul le fondateur peut modifier les rôles des freelancers' }, { status: 403 });
    }
    
    // Récupérer les données de la requête
    const data = await req.json();
    const { freelancerId, isAdmin } = data;
    
    if (!freelancerId) {
      return NextResponse.json({ error: 'ID du freelancer requis' }, { status: 400 });
    }
    
    // Vérifier que l'utilisateur à mettre à jour existe et est un freelancer ou un freelancer_admin
    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer non trouvé' }, { status: 404 });
    }
    
    if (freelancer.role !== 'freelancer' && freelancer.role !== 'freelancer_admin') {
      return NextResponse.json({ error: 'L\'utilisateur n\'est pas un freelancer' }, { status: 400 });
    }
    
    // Déterminer le nouveau rôle en fonction du rôle actuel et de isAdmin
    let newRole = 'freelancer';
    if (isAdmin) {
      newRole = 'freelancer_admin';
    } else {
      newRole = 'freelancer';
    }
    
    // Mettre à jour le freelancer
    const updatedFreelancer = await User.findByIdAndUpdate(
      freelancerId,
      { role: newRole },
      { new: true }
    ).select('_id firstName lastName email role');
    
    return NextResponse.json({ freelancer: updatedFreelancer }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Supprimer un freelancer (fondateur uniquement)
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    
    const { userId } = getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }
    
    // Vérifier si l'utilisateur est fondateur
    const user = await User.findById(userId);
    if (!user || user.role !== 'fondateur') {
      return NextResponse.json({ error: 'Accès restreint aux fondateurs' }, { status: 403 });
    }
    
    // Récupérer l'ID du freelancer à supprimer depuis les paramètres de requête
    const url = new URL(req.url);
    const freelancerId = url.searchParams.get('id');
    
    if (!freelancerId) {
      return NextResponse.json({ error: 'ID du freelancer requis' }, { status: 400 });
    }
    
    // Vérifier que l'utilisateur à supprimer existe et est un freelancer ou un freelancer_admin
    const freelancer = await User.findById(freelancerId);
    if (!freelancer) {
      return NextResponse.json({ error: 'Freelancer non trouvé' }, { status: 404 });
    }
    
    if (freelancer.role !== 'freelancer' && freelancer.role !== 'freelancer_admin') {
      return NextResponse.json({ error: 'L\'utilisateur n\'est pas un freelancer' }, { status: 400 });
    }
    
    // Supprimer le freelancer
    await User.findByIdAndDelete(freelancerId);
    
    return NextResponse.json({ message: 'Freelancer supprimé avec succès' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
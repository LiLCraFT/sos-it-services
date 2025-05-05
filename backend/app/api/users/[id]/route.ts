import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { hasAdminRights } from '@/lib/auth-utils';

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     description: Récupère un utilisateur par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */

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

// Get a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { userId, role } = getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // Users can only get their own info unless they're admin/founder/freelancer
    if (userId !== params.id) {
      const requester = await User.findById(userId);
      if (!requester || (!hasAdminRights(requester.role) && requester.role !== 'freelancer')) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    }
    
    const user = await User.findById(params.id).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     description: Met à jour un utilisateur par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               city:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */

// Update a user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { userId, role } = getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // Users can only update their own info unless they're admin/founder
    if (userId !== params.id) {
      const requester = await User.findById(userId);
      if (!requester || !hasAdminRights(requester.role)) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    }
    
    const data = await req.json();
    
    // Prevent role escalation
    if (data.role) {
      const requester = await User.findById(userId);
      if (!requester || !hasAdminRights(requester.role)) {
        delete data.role;
      }
    }
    
    // Do not allow password updates through this endpoint
    delete data.password;
    
    const user = await User.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     description: Supprime un utilisateur par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Utilisateur supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting user with id ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
} 
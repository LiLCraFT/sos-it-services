import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { hasAdminRights } from '@/lib/auth-utils';

/**
 * @swagger
 * /api/users:
 *   get:
 *     description: Récupère tous les utilisateurs
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
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

// Get users, filterable by role (for admins)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { userId, role } = getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }
    
    // Vérifier si l'utilisateur a les droits d'admin ou est un freelancer/fondateur
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }
    
    // Seulement les admin, fondateurs et freelancers peuvent filtrer les utilisateurs
    if (!hasAdminRights(user.role) && user.role !== 'freelancer') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Récupérer le filtre de rôle depuis la requête
    const url = new URL(req.url);
    const roleFilter = url.searchParams.get('role');
    
    let query = {};
    if (roleFilter) {
      // Si le filtre contient des virgules, on cherche les utilisateurs avec n'importe lequel des rôles
      const roles = roleFilter.split(',');
      query = { role: { $in: roles } };
    }
    
    // Ne retourner que les champs nécessaires
    const users = await User.find(query).select('_id firstName lastName email role clientType profileImage');
      
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     description: Crée un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - address
 *               - phone
 *               - birthDate
 *               - city
 *             properties:
 *               email:
 *                 type: string
 *               password:
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
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      address, 
      phone, 
      birthDate, 
      city, 
      role 
    } = await req.json();
    
    // Vérification des données requises
    if (!email || !password || !firstName || !lastName || !address || !phone || !birthDate || !city) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    
    // Vérification si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      );
    }
    
    // Création de l'utilisateur
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      address,
      phone,
      birthDate,
      city,
      role: role || 'user',
    });
    
    // On ne renvoie pas le mot de passe
    const sanitizedUser = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      phone: user.phone,
      birthDate: user.birthDate,
      city: user.city,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    return NextResponse.json(sanitizedUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
} 
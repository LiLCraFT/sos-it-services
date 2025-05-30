import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_development') as { userId?: string, _id?: string, role?: string };
    const userId = decoded.userId || decoded._id || null;
    const role = decoded.role || null;
    return { 
      userId,
      role
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
    const url = new URL(req.url);
    const roleFilter = url.searchParams.get('role');
    
    // Si on demande spécifiquement les membres de l'équipe (fondateur, freelancer, freelancer_admin)
    // ou uniquement les freelancers, on autorise l'accès public
    const isTeamRequest = roleFilter === 'fondateur,freelancer,freelancer_admin' || roleFilter === 'freelancer,freelancer_admin';
    
    if (!isTeamRequest) {
      // Pour les autres requêtes, on vérifie l'authentification
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
    }
    
    let query = {};
    if (roleFilter) {
      // Si le filtre contient des virgules, on cherche les utilisateurs avec n'importe lequel des rôles
      const roles = roleFilter.split(',');
      query = { role: { $in: roles } };
    }
    
    // Ne retourner que les champs nécessaires
    const users = await User.find(query).select('_id firstName lastName email role clientType profileImage isEmailVerified isAdminVerified emailVerificationToken city postalCode rating linkedin phone createdAt');
      
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
 *               - postalCode
 *               - role
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
 *               postalCode:
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
      postalCode,
      role,
      linkedin 
    } = await req.json();
    
    // Vérification des données requises
    if (!email || !password || !firstName || !lastName || !address || !phone || !birthDate || !city || !postalCode) {
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
      postalCode,
      role: role || 'user',
      linkedin: linkedin || '', // Initialiser le champ linkedin
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
      postalCode: user.postalCode,
      role: user.role,
      linkedin: user.linkedin, // Inclure le champ linkedin dans la réponse
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
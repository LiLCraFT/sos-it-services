import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

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
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Récupérer les paramètres de recherche
    const url = new URL(req.url);
    const roleParam = url.searchParams.get('role');
    
    // Construire le filtre en fonction des paramètres
    let filter: any = {};
    
    if (roleParam) {
      // Si plusieurs rôles sont spécifiés (séparés par des virgules)
      const roles = roleParam.split(',');
      if (roles.length > 1) {
        filter.role = { $in: roles };
      } else {
        filter.role = roleParam;
      }
    }
    
    const users = await User.find(filter).select('-password');
    
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
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
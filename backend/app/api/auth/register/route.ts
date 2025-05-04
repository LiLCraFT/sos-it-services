import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     description: Enregistre un nouvel utilisateur
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
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       400:
 *         description: Données invalides ou utilisateur déjà existant
 *       500:
 *         description: Erreur serveur
 */
export async function POST(req: NextRequest) {
  try {
    // Connecter à la base de données
    await dbConnect();
    
    // Récupérer les données du corps de la requête
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      address, 
      phone, 
      birthDate, 
      city 
    } = await req.json();
    
    console.log('Registration data received:', { 
      email, firstName, lastName, address, phone, birthDate, city 
    });
    
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
    
    // Création du document utilisateur (sans l'enregistrer encore)
    const userData = {
      email,
      password,
      firstName,
      lastName,
      address,
      phone,
      birthDate,
      city,
      role: 'user', // Par défaut, tous les nouveaux utilisateurs ont le rôle 'user'
    };
    
    console.log('Creating user with data:', {
      ...userData,
      password: '******' // Ne pas afficher le mot de passe en clair dans les logs
    });
    
    // Création de l'utilisateur
    const user = await User.create(userData);
    
    console.log('User created successfully:', user._id);
    
    // Génération du token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // On ne renvoie pas le mot de passe
    const userWithoutPassword = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
    
    return NextResponse.json(
      {
        user: userWithoutPassword,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'enregistrement' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { sendVerificationEmail, sendAdminVerificationEmail } from '@/lib/email-service';

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
 *               - clientType
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
 *               clientType:
 *                 type: string
 *                 enum: [Particulier, Professionnel, Freelancer]
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
 *                 message:
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
      companyName,
      address, 
      phone, 
      birthDate, 
      city,
      clientType
    } = await req.json();
    
    console.log('Registration data received:', { 
      email, firstName, lastName, companyName, address, phone, birthDate, city, clientType 
    });
    
    // Vérification des données requises
    if (!email || !password || !address || !phone || !city || !clientType) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    
    // Validation selon le type de client
    if (clientType === 'Professionnel') {
      if (!companyName) {
        return NextResponse.json(
          { error: 'Le nom de l\'entreprise est requis' },
          { status: 400 }
        );
      }
    } else {
      // Pour les particuliers et freelancers
      if (!firstName || !lastName) {
        return NextResponse.json(
          { error: 'Les champs prénom et nom sont requis' },
          { status: 400 }
        );
      }

      if (!birthDate) {
        return NextResponse.json(
          { error: 'La date de naissance est requise pour ce type de compte' },
          { status: 400 }
        );
      }
    }
    
    // Vérification du type de client
    if (!['Particulier', 'Professionnel', 'Freelancer'].includes(clientType)) {
      return NextResponse.json(
        { error: 'Type de client invalide' },
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
    
    // Génération du token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures
    
    // Création du document utilisateur
    const userData = {
      email,
      password,
      firstName,
      lastName,
      companyName: clientType === 'Professionnel' ? companyName : undefined,
      address,
      phone,
      birthDate: clientType === 'Professionnel' ? undefined : birthDate,
      city,
      clientType,
      subscriptionType: 'none',
      role: 'user',
      isEmailVerified: false,
      isAdminVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationTokenExpires,
    };
    
    console.log('Creating user with data:', {
      ...userData,
      password: '******' // Ne pas afficher le mot de passe en clair dans les logs
    });
    
    // Création de l'utilisateur
    const user = await User.create(userData);
    
    console.log('User created successfully:', user._id);
    
    // Envoi de l'email de vérification
    if (clientType === 'Freelancer') {
      await sendAdminVerificationEmail(email, verificationToken);
    } else {
      await sendVerificationEmail(email, verificationToken);
    }
    
    // On ne renvoie pas le mot de passe
    const userWithoutPassword = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      role: user.role,
      clientType: user.clientType,
      subscriptionType: user.subscriptionType,
      isEmailVerified: user.isEmailVerified,
      isAdminVerified: user.isAdminVerified,
    };
    
    return NextResponse.json(
      {
        user: userWithoutPassword,
        message: 'Un email de vérification a été envoyé à votre adresse email',
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
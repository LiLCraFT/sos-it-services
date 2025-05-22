import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  console.log('Google callback: Début du traitement');
  console.log('Google callback: Variables d\'environnement:', {
    clientId: process.env.GOOGLE_CLIENT_ID ? 'Défini' : 'Non défini',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Défini' : 'Non défini',
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    nextAuthUrl: process.env.NEXTAUTH_URL
  });

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  console.log('Google callback: Code reçu:', code ? 'Oui' : 'Non');

  if (!code) {
    console.error('Google callback: Code manquant');
    return NextResponse.json({ error: 'Code manquant' }, { status: 400 });
  }

  try {
    console.log('Google callback: Récupération des tokens...');
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    console.log('Google callback: Tokens reçus');

    console.log('Google callback: Récupération des infos utilisateur...');
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const userInfo = await userInfoResponse.json();
    console.log('Google callback: Infos utilisateur reçues:', { email: userInfo.email });

    // --- Synchronisation avec la base MongoDB ---
    console.log('Google callback: Connexion à la base de données...');
    await dbConnect();
    let user = await User.findOne({ email: userInfo.email });
    console.log('Google callback: Utilisateur existant:', user ? 'Oui' : 'Non');

    if (!user) {
      console.log('Google callback: Création d\'un nouvel utilisateur');
      user = await User.create({
        email: userInfo.email,
        firstName: userInfo.given_name || userInfo.name || '',
        lastName: userInfo.family_name || '',
        profileImage: '/api/default-image',
        role: 'user',
        clientType: 'Particulier',
        subscriptionType: 'none',
      });
      console.log('Google callback: Nouvel utilisateur créé:', user._id);
    } else {
      console.log('Google callback: Mise à jour de l\'utilisateur existant');
      user.firstName = userInfo.given_name || user.firstName;
      user.lastName = userInfo.family_name || user.lastName;
      await user.save();
    }

    // --- Génère un JWT avec toutes les infos utilisateur ---
    console.log('Google callback: Génération du token JWT');
    const appToken = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        phone: user.phone,
        birthDate: user.birthDate,
        city: user.city,
        role: user.role,
        profileImage: user.profileImage,
        subscriptionType: user.subscriptionType,
        clientType: user.clientType,
      },
      process.env.JWT_SECRET || 'fallback_secret_key_for_development',
      { expiresIn: '7d' }
    );

    // Utiliser NEXTAUTH_URL pour la redirection
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/mon-espace?token=${appToken}`;
    console.log('Google callback: Redirection finale vers:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Google callback: Erreur:', error);
    return NextResponse.json({ error: 'Erreur lors du callback Google' }, { status: 500 });
  }
} 
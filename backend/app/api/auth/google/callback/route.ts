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
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'Code manquant' }, { status: 400 });
  }

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const userInfo = await userInfoResponse.json();

    // --- Synchronisation avec la base MongoDB ---
    await dbConnect();
    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      user = await User.create({
        email: userInfo.email,
        firstName: userInfo.given_name || userInfo.name || '',
        lastName: userInfo.family_name || '',
        profileImage: userInfo.picture,
        role: 'user',
        clientType: 'Particulier',
        subscriptionType: 'none',
      });
    } else {
      user.firstName = userInfo.given_name || user.firstName;
      user.lastName = userInfo.family_name || user.lastName;
      user.profileImage = userInfo.picture || user.profileImage;
      await user.save();
    }

    // --- Génère un JWT avec toutes les infos utilisateur ---
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

    const redirectUrl = `http://localhost:3000/mon-espace?token=${appToken}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Erreur callback Google:', error);
    return NextResponse.json({ error: 'Erreur lors du callback Google' }, { status: 500 });
  }
} 
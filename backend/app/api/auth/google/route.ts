import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

// Endpoint POST /api/auth/google : génère l'URL Google OAuth pour le front Vite
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST() {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      return NextResponse.json(
        { error: 'Configuration Google OAuth incomplète' },
        { status: 500 }
      );
    }

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la génération de l\'URL Google' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Code d\'autorisation manquant' },
      { status: 400 }
    );
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

    // Ici, vous pouvez créer ou mettre à jour l'utilisateur dans votre base de données
    // et générer un JWT pour l'authentification

    return NextResponse.json({ success: true, user: userInfo });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'authentification' },
      { status: 500 }
    );
  }
} 
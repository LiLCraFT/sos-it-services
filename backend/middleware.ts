import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Liste des routes qui nécessitent une authentification
const protectedRoutes = [
  '/api/users',
  // Ajouter d'autres routes protégées ici
];

// Liste des routes publiques
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify',
  '/api-docs',
  '/swagger',
];

// Gestion des requêtes OPTIONS (preflight CORS)
function handleOptions(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  
  // Ajout des en-têtes CORS pour les requêtes preflight
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

// Middleware qui s'exécute pour toutes les requêtes
export async function middleware(request: NextRequest) {
  // Gestion des requêtes OPTIONS (preflight CORS)
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }
  
  const path = request.nextUrl.pathname;
  let response;
  
  // Vérifie si la route est publique
  if (publicRoutes.some(route => path.startsWith(route))) {
    response = NextResponse.next();
  }
  // Vérifie si la route est protégée
  else if (protectedRoutes.some(route => path.startsWith(route))) {
    const token = request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    try {
      // Vérifie le token JWT
      const secretKey = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback_secret_key_for_development'
      );
      
      await jwtVerify(token, secretKey);
      response = NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  } else {
    // Pour toutes les autres routes API
    response = NextResponse.next();
  }
  
  // Ajout des en-têtes CORS pour toutes les réponses
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 
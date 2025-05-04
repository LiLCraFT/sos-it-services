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
  '/api-docs',
  '/swagger',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Vérifie si la route est publique
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Vérifie si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    path.startsWith(route)
  );
  
  if (isProtectedRoute) {
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
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 
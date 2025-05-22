import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  // Chemin absolu du fichier de l'image
  const filePath = path.resolve('backend/public/images/default-profile.png');
  
  try {
    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      // Renvoyer une erreur 404
      return new NextResponse(null, { status: 404 });
    }

    // Lire le fichier en tant que Buffer
    const fileBuffer = fs.readFileSync(filePath);

    // Déterminer le type MIME
    const contentType = 'image/png';

    // Renvoyer le fichier avec les en-têtes appropriés
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    // Image transparente 1x1 pixel en cas d'erreur
    const TRANSPARENT_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    return new NextResponse(TRANSPARENT_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
} 
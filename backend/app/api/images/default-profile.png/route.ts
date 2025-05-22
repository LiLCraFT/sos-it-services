import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Chemin vers l'image par défaut
    const defaultProfilePath = path.join(process.cwd(), 'public', 'images', 'default-profile.png');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(defaultProfilePath)) {
      return NextResponse.json(
        { error: 'Image non trouvée' },
        { status: 404 }
      );
    }

    // Lire le fichier
    const imageBuffer = fs.readFileSync(defaultProfilePath);
    
    // Retourner l'image
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // Cache pendant 1 an
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    // Fallback vers une image transparente 1x1 pixel si le fichier n'existe pas
    const TRANSPARENT_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    return new NextResponse(TRANSPARENT_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
} 
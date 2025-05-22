import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  // Chemin absolu vers l'image par défaut avec correction de chemin selon l'environnement
  let imagePath;
  
  // Essayons plusieurs chemins possibles
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'images', 'default-profile.png'),
    path.join(process.cwd(), 'backend', 'public', 'images', 'default-profile.png'),
    path.join(process.cwd(), '..', 'public', 'images', 'default-profile.png')
  ];
  
  // Trouver le premier chemin qui existe
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      imagePath = p;
      break;
    }
  }
  
  // Si aucun chemin n'existe, utiliser un pixel transparent
  if (!imagePath) {
    const TRANSPARENT_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    return new NextResponse(TRANSPARENT_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  try {
    // Lire le fichier image
    const imageBuffer = fs.readFileSync(imagePath);
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    // En cas d'erreur, retourner un pixel transparent
    const TRANSPARENT_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    return new NextResponse(TRANSPARENT_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const imageName = pathSegments[pathSegments.length - 1];
    
    console.log('Request URL:', req.url);
    console.log('Path segments:', pathSegments);
    console.log('Image name requested:', imageName);
    
    // Chemin vers l'image par défaut
    const defaultProfilePath = path.join(process.cwd(), 'public', 'images', 'default-profile.png');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(defaultProfilePath)) {
      console.error('Image not found:', defaultProfilePath);
      return NextResponse.json(
        { error: 'Image not found' },
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
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const publicPath = params.path.join('/');
    console.log('Demande de fichier public:', publicPath);
    
    const fullPath = path.join(process.cwd(), 'public', publicPath);
    console.log('Chemin complet:', fullPath);

    // Vérifier si le fichier existe
    if (!fs.existsSync(fullPath)) {
      console.log('Fichier non trouvé:', fullPath);
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si c'est un fichier (pas un dossier)
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      console.log('Le chemin n\'est pas un fichier:', fullPath);
      return NextResponse.json(
        { error: 'Le chemin n\'est pas un fichier' },
        { status: 400 }
      );
    }

    // Lire le fichier
    const fileBuffer = fs.readFileSync(fullPath);
    console.log('Fichier lu avec succès, taille:', fileBuffer.length, 'bytes');
    
    // Déterminer le type MIME en fonction de l'extension
    const extension = path.extname(fullPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (extension === '.jpg' || extension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (extension === '.png') {
      contentType = 'image/png';
    } else if (extension === '.gif') {
      contentType = 'image/gif';
    } else if (extension === '.svg') {
      contentType = 'image/svg+xml';
    } else if (extension === '.css') {
      contentType = 'text/css';
    } else if (extension === '.js') {
      contentType = 'application/javascript';
    }

    console.log('Type de contenu déterminé:', contentType);

    // Retourner l'image avec les en-têtes appropriés
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache pendant 24 heures
        'Access-Control-Allow-Origin': '*',
      },
    });

    return response;
  } catch (error: any) {
    console.error('Erreur lors de la récupération du fichier:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du fichier' },
      { status: 500 }
    );
  }
} 
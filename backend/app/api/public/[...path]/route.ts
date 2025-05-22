import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const publicPath = params.path.join('/');
    
    const fullPath = path.join(process.cwd(), 'public', publicPath);

    // Vérifier si le fichier existe
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si c'est un fichier (pas un dossier)
    const stats = fs.statSync(fullPath);
    if (!stats.isFile()) {
      return NextResponse.json(
        { error: 'Le chemin n\'est pas un fichier' },
        { status: 400 }
      );
    }

    // Lire le fichier
    const fileBuffer = fs.readFileSync(fullPath);
    
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
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du fichier' },
      { status: 500 }
    );
  }
} 
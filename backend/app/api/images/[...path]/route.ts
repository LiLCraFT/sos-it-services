import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    
    // Obtenir le chemin du répertoire courant
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const basePath = path.join(__dirname, '..', '..', '..', '..');
    
    // Nettoyer le chemin pour éviter la duplication de 'images'
    let cleanPath = imagePath;
    if (cleanPath.startsWith('images/')) {
      cleanPath = cleanPath.substring(7); // Enlève 'images/'
    }
    
    // Essayer plusieurs chemins possibles
    const possiblePaths = [
      path.join(basePath, 'public', 'images', cleanPath),
      path.join(basePath, 'public', 'uploads', cleanPath)
    ];
    
    // Trouver le premier chemin qui existe
    let fullPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        fullPath = p;
        break;
      }
    }
    
    // Vérifier si le fichier existe
    if (!fullPath) {
      // Retourner l'image par défaut si l'image demandée n'existe pas
      const defaultImagePath = path.join(basePath, 'public', 'images', 'default-profile.png');
      if (fs.existsSync(defaultImagePath)) {
        const fileBuffer = fs.readFileSync(defaultImagePath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Source': 'Image-Server-Default',
          },
        });
      }
      
      return NextResponse.json(
        { error: 'Image non trouvée' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
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
    }

    // Retourner l'image avec les en-têtes appropriés
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache pendant 1 an et immutable
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'X-Source': 'Image-Server',
      },
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de l\'image' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
} 
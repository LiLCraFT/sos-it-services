import { NextRequest, NextResponse } from 'next/server';
import { stat, readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const filePath = url.searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'Paramètre path manquant' },
        { status: 400 }
      );
    }
    
    // Sanitize file path to prevent path traversal
    const sanitizedPath = filePath.replace(/\.\./g, '').replace(/^\/+/, '');
    
    // Essayer différents chemins au cas où
    const potentialPaths = [
      path.join(process.cwd(), 'public', sanitizedPath),
      path.join(process.cwd(), sanitizedPath),
      path.join(process.cwd(), 'public', sanitizedPath.startsWith('/') ? sanitizedPath.substring(1) : sanitizedPath)
    ];
    
    let foundPath = null;
    let fileBuffer = null;
    
    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        fileBuffer = await readFile(p);
        break;
      }
    }
    
    if (!foundPath) {
      // Afficher le contenu du dossier uploads/profiles pour débogage
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        files.forEach(file => console.log(`- ${file}`));
      } else {
        console.log('Le dossier uploads/profiles n\'existe pas');
      }
      
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }
    
    // Déterminer le type de contenu
    const ext = path.extname(foundPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch(ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png': 
        contentType = 'image/png';
        break;
      case '.gif': 
        contentType = 'image/gif';
        break;
      case '.svg': 
        contentType = 'image/svg+xml';
        break;
      case '.css': 
        contentType = 'text/css';
        break;
      case '.js': 
        contentType = 'application/javascript';
        break;
      case '.html': 
        contentType = 'text/html';
        break;
      case '.txt': 
        contentType = 'text/plain';
        break;
    }
    
    // Retourner le fichier
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache pendant 24 heures
        'Access-Control-Allow-Origin': '*', // CORS
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 
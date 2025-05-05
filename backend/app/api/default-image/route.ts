import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Le chemin vers l'image par défaut
const DEFAULT_IMAGE_PATH = path.join(process.cwd(), 'public', 'images', 'default-profile.png');

export async function GET(req: NextRequest) {
  console.log('-------- API default-image appelée --------');
  console.log('Répertoire de travail:', process.cwd());
  console.log('Chemin de l\'image par défaut:', DEFAULT_IMAGE_PATH);
  console.log('Le fichier existe-t-il?', fs.existsSync(DEFAULT_IMAGE_PATH));
  
  if (fs.existsSync(DEFAULT_IMAGE_PATH)) {
    console.log('Taille du fichier:', fs.statSync(DEFAULT_IMAGE_PATH).size, 'bytes');
  }
  
  // Liste tous les fichiers du répertoire parent
  const parentDir = path.dirname(DEFAULT_IMAGE_PATH);
  console.log('Contenu du répertoire', parentDir, ':');
  if (fs.existsSync(parentDir)) {
    fs.readdirSync(parentDir).forEach(file => {
      console.log(' -', file);
    });
  } else {
    console.log('Le répertoire parent n\'existe pas');
  }
  
  try {
    // Lire le fichier image par défaut
    const imageBuffer = fs.readFileSync(DEFAULT_IMAGE_PATH);
    console.log('Image lue avec succès, taille du buffer:', imageBuffer.length, 'bytes');
    
    // Retourner l'image par défaut
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000', // Cache pendant 1 an
        'Access-Control-Allow-Origin': '*',
        'X-Source': 'Default-Profile-Image', // Pour identifier la source lors du débogage
      },
    });
  } catch (error) {
    console.error('Erreur lors du chargement de l\'image par défaut:', error);
    
    // Essayons un autre chemin
    try {
      const alternativePath = path.join(process.cwd(), 'backend', 'public', 'images', 'default-profile.png');
      console.log('Tentative avec un chemin alternatif:', alternativePath);
      console.log('Ce fichier existe-t-il?', fs.existsSync(alternativePath));
      
      if (fs.existsSync(alternativePath)) {
        const imageBuffer = fs.readFileSync(alternativePath);
        console.log('Image alternative lue avec succès, taille du buffer:', imageBuffer.length, 'bytes');
        
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000',
            'Access-Control-Allow-Origin': '*',
            'X-Source': 'Alternative-Path',
          },
        });
      }
    } catch (altError) {
      console.error('Erreur avec le chemin alternatif:', altError);
    }
    
    // Fallback vers une image transparente 1x1 pixel si le fichier n'existe pas
    console.log('Retour vers l\'image de pixel transparent (fallback)');
    const TRANSPARENT_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    return new NextResponse(TRANSPARENT_PNG, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'X-Source': 'Transparent-Pixel-Fallback',
      },
    });
  }
} 
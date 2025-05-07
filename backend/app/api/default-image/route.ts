import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtenir le chemin de base du projet (sans le dossier backend en double)
const basePath = process.cwd().replace(/\\backend$/, '');

// Chemin vers l'image par défaut dans le dossier backend/public/images
const DEFAULT_IMAGE_PATH = path.join(basePath, 'backend', 'public', 'images', 'default-profile.png');

export async function GET(req: NextRequest) {
  try {
    console.log('-------- API default-image appelée --------');
    console.log('Répertoire courant:', process.cwd());
    console.log('Chemin de base du projet:', basePath);
    console.log('Chemin de l\'image par défaut:', DEFAULT_IMAGE_PATH);
    console.log('Le fichier existe:', fs.existsSync(DEFAULT_IMAGE_PATH));
    
    // Afficher le contenu du dossier
    const parentDir = path.dirname(DEFAULT_IMAGE_PATH);
    console.log('Contenu du dossier', parentDir, ':');
    if (fs.existsSync(parentDir)) {
      const files = fs.readdirSync(parentDir);
      console.log('Fichiers trouvés:', files);
    } else {
      console.log('Le dossier parent n\'existe pas');
    }
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(DEFAULT_IMAGE_PATH)) {
      console.error('Image par défaut non trouvée:', DEFAULT_IMAGE_PATH);
      throw new Error('Image par défaut non trouvée');
    }

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
        'X-Source': 'Default-Profile-Image',
      },
    });
  } catch (error) {
    console.error('Erreur lors du chargement de l\'image par défaut:', error);
    
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
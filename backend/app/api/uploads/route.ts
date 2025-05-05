import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getUserIdFromToken } from '@/lib/auth';

// Fonction pour assurer l'existence du dossier de uploads
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'uploads');
  try {
    await mkdir(uploadDir, { recursive: true });
    return uploadDir;
  } catch (error) {
    console.error('Erreur lors de la création du dossier uploads:', error);
    throw error;
  }
}

// Récupérer un fichier téléchargé
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const filePath = url.searchParams.get('path');
  
  if (!filePath) {
    return NextResponse.json({ error: 'Chemin de fichier non spécifié' }, { status: 400 });
  }
  
  // Sécurité: vérifier que le chemin est sous le dossier uploads
  const fullPath = path.join(process.cwd(), filePath);
  if (!fullPath.startsWith(path.join(process.cwd(), 'uploads'))) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  
  try {
    // Dans un environnement de production, on utiliserait une solution
    // comme next/server pour renvoyer le fichier
    
    // Pour une implémentation simple:
    // Redirection vers le chemin statique (si les uploads sont exposés comme fichiers statiques)
    return NextResponse.redirect(new URL(filePath, req.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Télécharger un fichier
export async function POST(req: NextRequest) {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }
    
    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 });
    }
    
    // Vérifier le type MIME
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Type de fichier non autorisé. Seuls les images, PDF, DOC, DOCX et TXT sont acceptés' 
      }, { status: 400 });
    }
    
    // Créer un nom de fichier unique
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = await ensureUploadDir();
    const filePath = path.join(uploadDir, fileName);
    
    // Lire le contenu du fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Écrire le fichier sur le disque
    await writeFile(filePath, buffer);
    
    // Construire le chemin relatif pour le stockage en base de données
    const relativePath = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      file: {
        filename: fileName,
        originalname: file.name,
        path: relativePath,
        mimetype: file.type,
        size: file.size
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors du téléchargement:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 
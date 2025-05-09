import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';
import fs from 'fs';

/**
 * @swagger
 * /api/users/{id}/profile-image:
 *   post:
 *     description: Upload a profile image for a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;
    
    console.log('Requête d\'upload d\'image reçue pour l\'utilisateur:', id);
    
    // Ensure user exists
    const user = await User.findById(id);
    if (!user) {
      console.log('Utilisateur non trouvé:', id);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      console.log('Aucun fichier fourni dans la requête');
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      console.log('Type de fichier invalide:', file.type);
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    console.log('Fichier image reçu:', file.name, file.type, file.size, 'bytes');
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Obtenir le chemin de base du projet (sans le dossier backend en double)
    const basePath = process.cwd().replace(/\\backend$/, '');
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(basePath, 'backend', 'public', 'uploads', 'profiles');
    await mkdir(uploadDir, { recursive: true });
    console.log('Dossier d\'upload:', uploadDir);
    
    // Liste les fichiers existants dans le dossier pour débogage
    console.log('Contenu actuel du dossier:');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => console.log(`- ${file}`));
    }
    
    // Generate a unique filename
    const filename = `${id}-${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, filename);
    console.log('Chemin du fichier:', filePath);
    
    // Save the file
    await writeFile(filePath, buffer);
    console.log('Fichier enregistré avec succès');
    
    // Update user profile image path - use relative path for storage
    const imageUrl = `/uploads/profiles/${filename}`;
    console.log('URL de l\'image enregistrée dans le profil:', imageUrl);
    
    // Vérifier si le fichier existe bien
    const fileExists = fs.existsSync(filePath);
    console.log('Vérification de l\'existence du fichier:', fileExists ? 'OK' : 'ÉCHEC');
    
    user.profileImage = imageUrl;
    await user.save();
    console.log('Profil utilisateur mis à jour');
    
    // Afficher les détails complets de l'utilisateur après mise à jour
    console.log('Utilisateur après mise à jour:', {
      id: user._id,
      email: user.email,
      profileImage: user.profileImage
    });
    
    return NextResponse.json({
      message: 'Image de profil téléchargée avec succès',
      profileImage: imageUrl
    });
  } catch (error: any) {
    console.error(`Error uploading profile image for user ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du téléchargement de l\'image de profil' },
      { status: 500 }
    );
  }
} 
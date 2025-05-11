import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import { writeFile, unlink } from 'fs/promises';
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
    
    // Utiliser le chemin absolu du projet
    const basePath = process.cwd();
    console.log('Chemin de base du projet:', basePath);
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(basePath, 'public', 'uploads', 'profiles');
    console.log('Tentative de création du dossier:', uploadDir);
    
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('Dossier créé ou déjà existant:', uploadDir);
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      throw new Error('Impossible de créer le dossier d\'upload');
    }
    
    // Supprimer l'ancienne photo de profil si elle existe et n'est pas l'image par défaut
    if (user.profileImage && user.profileImage !== '/images/default-profile.png') {
      const oldImagePath = path.join(basePath, 'public', user.profileImage);
      console.log('Tentative de suppression de l\'ancienne photo:', oldImagePath);
      
      try {
        if (fs.existsSync(oldImagePath)) {
          await unlink(oldImagePath);
          console.log('Ancienne photo de profil supprimée avec succès');
        } else {
          console.log('Ancienne photo non trouvée à l\'emplacement:', oldImagePath);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'ancienne photo:', error);
        // On continue même si la suppression échoue
      }
    }
    
    // Generate a unique filename
    const filename = `${id}-${Date.now()}${path.extname(file.name)}`;
    const filePath = path.join(uploadDir, filename);
    console.log('Chemin complet du nouveau fichier:', filePath);
    
    // Save the file
    try {
      await writeFile(filePath, buffer);
      console.log('Fichier enregistré avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du fichier:', error);
      throw new Error('Impossible d\'enregistrer le fichier');
    }
    
    // Update user profile image path - use relative path for storage
    const imageUrl = `/uploads/profiles/${filename}`;
    console.log('URL de l\'image enregistrée dans le profil:', imageUrl);
    
    // Vérifier si le fichier existe bien
    const fileExists = fs.existsSync(filePath);
    console.log('Vérification de l\'existence du fichier:', fileExists ? 'OK' : 'ÉCHEC');
    
    if (!fileExists) {
      throw new Error('Le fichier n\'a pas été correctement enregistré');
    }
    
    user.profileImage = imageUrl;
    await user.save();
    console.log('Profil utilisateur mis à jour');
    
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
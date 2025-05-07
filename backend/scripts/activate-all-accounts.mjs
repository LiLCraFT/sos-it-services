import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtenir le chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../.env') });

async function activateAllAccounts() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connecté à la base de données');

    // Mettre à jour tous les utilisateurs
    const result = await User.updateMany(
      {},
      {
        $set: {
          isEmailVerified: true,
          isAdminVerified: true,
          emailVerificationToken: null,
          emailVerificationTokenExpires: null
        }
      }
    );

    console.log(`Mise à jour réussie : ${result.modifiedCount} comptes activés`);
  } catch (error) {
    console.error('Erreur lors de l\'activation des comptes:', error);
  } finally {
    // Fermer la connexion à la base de données
    await mongoose.disconnect();
    console.log('Déconnecté de la base de données');
  }
}

// Exécuter le script
activateAllAccounts(); 
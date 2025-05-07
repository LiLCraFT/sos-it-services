import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

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
          emailVerificationToken: undefined,
          emailVerificationTokenExpires: undefined
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
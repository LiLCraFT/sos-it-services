// Script pour initialiser la base de données MongoDB avec des utilisateurs de test
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sos-it-services';

// Modèle d'utilisateur simplifié pour le script
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  address: String,
  phone: String,
  birthDate: Date,
  city: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', UserSchema);

async function initDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Vérifier si des utilisateurs existent déjà
    const count = await User.countDocuments();
    if (count > 0) {
      console.log(`${count} utilisateurs existent déjà dans la base de données. Suppression...`);
      await User.deleteMany({});
      console.log('Utilisateurs existants supprimés.');
    }

    // Créer des utilisateurs de test
    const users = [
      {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Admin',
        lastName: 'System',
        address: '123 Rue de l\'Administration',
        phone: '0123456789',
        birthDate: new Date('1990-01-01'),
        city: 'Paris',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user@example.com',
        password: await bcrypt.hash('user123', 10),
        firstName: 'Jean',
        lastName: 'Dupont',
        address: '456 Avenue des Utilisateurs',
        phone: '0987654321',
        birthDate: new Date('1995-05-15'),
        city: 'Lyon',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insérer les utilisateurs
    await User.insertMany(users);
    console.log(`${users.length} utilisateurs de test créés.`);
    console.log('Utilisateurs:');
    console.log('- admin@example.com / admin123 (Admin System - Administrateur)');
    console.log('- user@example.com / user123 (Jean Dupont - Utilisateur)');

    console.log('Base de données initialisée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.disconnect();
    console.log('Déconnexion de MongoDB');
  }
}

// Exécuter la fonction d'initialisation
initDB(); 
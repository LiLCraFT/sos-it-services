const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

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
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', UserSchema);

async function seedExperts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Vérifier si les utilisateurs existent déjà
    const emailsToCheck = [
      'fondateur@example.com', 
      'freelancer@example.com',
      'utilisateur@example.com'
    ];
    
    const existingUsers = await User.find({ email: { $in: emailsToCheck } });
    
    if (existingUsers.length > 0) {
      console.log(`${existingUsers.length} utilisateurs existent déjà. Suppression...`);
      await User.deleteMany({ email: { $in: emailsToCheck } });
      console.log('Utilisateurs existants supprimés.');
    }

    // Créer des utilisateurs de test
    const users = [
      {
        email: 'fondateur@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Pierre',
        lastName: 'Dubois',
        address: '123 Avenue des Entrepreneurs',
        phone: '0612345678',
        birthDate: new Date('1980-03-15'),
        city: 'Paris',
        role: 'fondateur',
        profileImage: '/images/default-profile.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'freelancer@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Sophie',
        lastName: 'Martin',
        address: '45 Rue des Développeurs',
        phone: '0687654321',
        birthDate: new Date('1992-07-21'),
        city: 'Lyon',
        role: 'freelancer',
        profileImage: '/images/default-profile.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'utilisateur@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Marc',
        lastName: 'Dupont',
        address: '78 Boulevard des Clients',
        phone: '0645678912',
        birthDate: new Date('1988-11-05'),
        city: 'Marseille',
        role: 'user',
        profileImage: '/images/default-profile.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insérer les utilisateurs
    const result = await User.insertMany(users);
    console.log(`${result.length} utilisateurs de test créés.`);
    console.log('Utilisateurs:');
    console.log('- fondateur@example.com / password123 (Pierre Dubois - Fondateur)');
    console.log('- freelancer@example.com / password123 (Sophie Martin - Freelancer)');
    console.log('- utilisateur@example.com / password123 (Marc Dupont - Utilisateur)');

    console.log('Base de données mise à jour avec succès!');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la base de données:', error);
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.disconnect();
    console.log('Déconnexion de MongoDB');
  }
}

// Exécuter la fonction
seedExperts(); 
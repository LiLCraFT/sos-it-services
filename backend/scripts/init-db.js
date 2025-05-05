// Script pour initialiser la base de données MongoDB avec des utilisateurs de test
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

/**
 * Configuration de la connexion MongoDB
 * Utilise l'URI défini dans .env.local ou une valeur par défaut
 */
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

/**
 * Structure pour les tickets (pour initialisation)
 */
const TicketSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  priority: String,
  category: String,
  userId: mongoose.Schema.Types.ObjectId,
  assignedToId: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date
});

const Ticket = mongoose.model('Ticket', TicketSchema);

/**
 * Fonction principale d'initialisation de la base de données
 */
async function initDB() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si des utilisateurs existent déjà
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`ℹ️ ${userCount} utilisateurs existent déjà dans la base de données. Suppression...`);
      await User.deleteMany({});
      console.log('✅ Utilisateurs existants supprimés.');
    }

    // Vérifier si des tickets existent déjà
    const ticketCount = await Ticket.countDocuments();
    if (ticketCount > 0) {
      console.log(`ℹ️ ${ticketCount} tickets existent déjà dans la base de données. Suppression...`);
      await Ticket.deleteMany({});
      console.log('✅ Tickets existants supprimés.');
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
        profileImage: '/profiles/admin.jpg',
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
        profileImage: '/profiles/user.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'fondateur@example.com',
        password: await bcrypt.hash('fondateur123', 10),
        firstName: 'Pierre',
        lastName: 'Martin',
        address: '789 Boulevard des Fondateurs',
        phone: '0678901234',
        birthDate: new Date('1985-03-20'),
        city: 'Marseille',
        role: 'fondateur',
        profileImage: '/profiles/founder.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'freelancer@example.com',
        password: await bcrypt.hash('freelancer123', 10),
        firstName: 'Sophie',
        lastName: 'Dubois',
        address: '101 Rue des Indépendants',
        phone: '0612345678',
        birthDate: new Date('1992-11-10'),
        city: 'Toulouse',
        role: 'freelancer',
        profileImage: '/profiles/freelancer.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insérer les utilisateurs
    const insertedUsers = await User.insertMany(users);
    console.log(`✅ ${users.length} utilisateurs de test créés.`);
    
    // Créer des tickets de test
    const tickets = [
      {
        title: "Problème de connexion au réseau",
        description: "Je n'arrive pas à me connecter au réseau wifi de l'entreprise",
        status: "ouvert",
        priority: "haute",
        category: "réseau",
        userId: insertedUsers[1]._id, // Assigné à l'utilisateur standard
        assignedToId: insertedUsers[3]._id, // Assigné au freelancer
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Mise à jour logiciel",
        description: "Besoin d'une mise à jour du logiciel comptable",
        status: "en cours",
        priority: "moyenne",
        category: "logiciel",
        userId: insertedUsers[1]._id, // Assigné à l'utilisateur standard
        assignedToId: insertedUsers[0]._id, // Assigné à l'admin
        createdAt: new Date(Date.now() - 86400000), // 1 jour plus tôt
        updatedAt: new Date()
      },
      {
        title: "Installation poste de travail",
        description: "Configuration d'un nouveau poste de travail pour un nouvel employé",
        status: "en attente",
        priority: "basse",
        category: "matériel",
        userId: insertedUsers[2]._id, // Assigné au fondateur
        createdAt: new Date(Date.now() - 172800000), // 2 jours plus tôt
        updatedAt: new Date()
      }
    ];

    // Insérer les tickets
    await Ticket.insertMany(tickets);
    console.log(`✅ ${tickets.length} tickets de test créés.`);

    // Afficher les informations des utilisateurs pour le test
    console.log('\n📋 Utilisateurs de test:');
    console.log('👤 Admin: admin@example.com / admin123 (Admin System - Administrateur)');
    console.log('👤 Client: user@example.com / user123 (Jean Dupont - Utilisateur)');
    console.log('👤 Fondateur: fondateur@example.com / fondateur123 (Pierre Martin - Fondateur)');
    console.log('👤 Freelancer: freelancer@example.com / freelancer123 (Sophie Dubois - Freelancer)');

    console.log('\n🎫 Tickets créés: 3 tickets de test');
    console.log('\n✅ Base de données initialisée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    // Fermer la connexion MongoDB
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

// Exécuter la fonction d'initialisation
initDB(); 
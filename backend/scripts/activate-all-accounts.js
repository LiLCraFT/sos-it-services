const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '../.env') });

async function activateAccounts(email = null) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sos-it-services';
  const client = new MongoClient(mongoUri);

  try {
    // Connexion à la base de données
    await client.connect();
    console.log('Connecté à la base de données');

    const db = client.db();
    
    // Préparer le filtre selon qu'on active un utilisateur spécifique ou tous les utilisateurs
    const filter = email ? { email } : {};
    
    // Mettre à jour les utilisateurs
    const result = await db.collection('users').updateMany(
      filter,
      {
        $set: {
          isEmailVerified: true,
          isAdminVerified: true,
          emailVerificationToken: null,
          emailVerificationTokenExpires: null
        }
      }
    );

    if (email) {
      if (result.modifiedCount > 0) {
        console.log(`Compte de ${email} activé avec succès`);
      } else {
        console.log(`Aucun compte trouvé avec l'email ${email}`);
      }
    } else {
      console.log(`Mise à jour réussie : ${result.modifiedCount} comptes activés`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'activation des comptes:', error);
  } finally {
    // Fermer la connexion à la base de données
    await client.close();
    console.log('Déconnecté de la base de données');
  }
}

// Récupérer l'email depuis les arguments de la ligne de commande
const email = process.argv[2];

// Exécuter le script
activateAccounts(email); 
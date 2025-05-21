// Script de migration pour ajouter le champ hasPaymentMethod à tous les utilisateurs
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sos-it-services';

async function migrate() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await mongoose.connection.collection('users').updateMany(
    { hasPaymentMethod: { $exists: false } },
    { $set: { hasPaymentMethod: false } }
  );
  console.log(`Migration terminée. Utilisateurs modifiés : ${result.modifiedCount}`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Erreur de migration :', err);
  process.exit(1);
}); 
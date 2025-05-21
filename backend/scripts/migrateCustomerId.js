// migrateStripeCustomerId.js
require('dotenv').config();
const mongoose = require('mongoose');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ta-base';

const userSchema = new mongoose.Schema({
  email: String,
  stripeCustomerId: String,
  // ... autres champs si besoin
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function migrate() {
  await mongoose.connect(MONGODB_URI);

  const users = await User.find({ stripeCustomerId: { $exists: false } });

  for (const user of users) {
    try {
      // Chercher un customer Stripe existant avec le même email
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      let customer;
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log(`Customer Stripe trouvé pour ${user.email}: ${customer.id}`);
      } else {
        // Sinon, créer un nouveau customer Stripe
        customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user._id.toString() }
        });
        console.log(`Nouveau customer Stripe créé pour ${user.email}: ${customer.id}`);
      }

      // Mettre à jour l'utilisateur avec le stripeCustomerId
      user.stripeCustomerId = customer.id;
      await user.save();
      console.log(`Utilisateur ${user.email} mis à jour avec stripeCustomerId: ${customer.id}`);
    } catch (err) {
      console.error(`Erreur pour ${user.email}:`, err);
    }
  }

  await mongoose.disconnect();
  console.log('Migration terminée !');
}

migrate();
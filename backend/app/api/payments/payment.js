const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');

// Récupérer toutes les méthodes de paiement d'un utilisateur
router.get('/methods', auth, async (req, res) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card',
    });

    const formattedMethods = paymentMethods.data.map(method => ({
      id: method.id,
      last4: method.card.last4,
      brand: method.card.brand,
      expMonth: method.card.exp_month,
      expYear: method.card.exp_year,
      isDefault: method.metadata.isDefault === 'true',
    }));

    res.json(formattedMethods);
  } catch (error) {
    console.error('Erreur lors de la récupération des méthodes de paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des méthodes de paiement' });
  }
});

// Ajouter une nouvelle méthode de paiement
router.post('/methods', auth, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;

    // Attacher la méthode de paiement au client Stripe
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: req.user.stripeCustomerId,
    });

    // Si c'est la première méthode de paiement, la définir comme méthode par défaut
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card',
    });

    if (paymentMethods.data.length === 1) {
      await stripe.customers.update(req.user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Ajouter le metadata pour indiquer que c'est la méthode par défaut
      await stripe.paymentMethods.update(paymentMethodId, {
        metadata: { isDefault: 'true' },
      });
    }

    res.json({ message: 'Méthode de paiement ajoutée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la méthode de paiement' });
  }
});

// Supprimer une méthode de paiement
router.delete('/methods/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si c'est la méthode par défaut
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    if (paymentMethod.metadata.isDefault === 'true') {
      return res.status(400).json({ message: 'Impossible de supprimer la méthode de paiement par défaut' });
    }

    // Détacher la méthode de paiement
    await stripe.paymentMethods.detach(id);

    res.json({ message: 'Méthode de paiement supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la méthode de paiement:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la méthode de paiement' });
  }
});

// Définir une méthode de paiement comme méthode par défaut
router.post('/methods/:id/default', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Mettre à jour le client Stripe
    await stripe.customers.update(req.user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: id,
      },
    });

    // Mettre à jour les metadata de toutes les méthodes de paiement
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card',
    });

    for (const method of paymentMethods.data) {
      await stripe.paymentMethods.update(method.id, {
        metadata: { isDefault: method.id === id ? 'true' : 'false' },
      });
    }

    res.json({ message: 'Méthode de paiement par défaut mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la méthode de paiement par défaut:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la méthode de paiement par défaut' });
  }
});

module.exports = router; 
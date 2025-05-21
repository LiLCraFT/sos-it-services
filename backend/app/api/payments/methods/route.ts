import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// Définir le type pour l'utilisateur avec stripeCustomerId
interface User {
  _id: string;
  email: string;
  stripeCustomerId?: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// Configuration de la route pour Next.js 13+
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Fonction pour vérifier le token JWT
async function verifyToken(request: Request): Promise<User | null> {
  try {
    const headersList = headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as User;
    return decoded;
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
}

// Fonction robuste pour récupérer ou créer le customer Stripe
async function getOrCreateStripeCustomer(user: User): Promise<string> {
  await dbConnect();

  // Si l'utilisateur a déjà un stripeCustomerId, vérifier qu'il existe dans Stripe
  if (user.stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (customer && !(customer as any).deleted) {
        return user.stripeCustomerId;
      }
    } catch (e) {
      // L'ID n'existe pas ou a été supprimé, on va en créer un nouveau
      console.warn('stripeCustomerId inexistant ou supprimé, création d\'un nouveau customer Stripe');
    }
  }

  // Créer un nouveau client Stripe
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: user._id }
  });

  console.log('Avant update, user._id =', user._id, 'customer.id =', customer.id);
  const userId = typeof user._id === 'string' ? new mongoose.Types.ObjectId(user._id) : user._id;
  const updateResult = await mongoose.connection.collection('users').updateOne(
    { _id: userId },
    { $set: { stripeCustomerId: customer.id } }
  );
  console.log('Résultat updateOne:', updateResult);
  if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
    console.warn('Aucun document mis à jour pour', userId, user.email);
  }
  const updatedUser = await mongoose.connection.collection('users').findOne({ _id: userId });
  console.log('User relu après update:', updatedUser);
  if (updatedUser && updatedUser.stripeCustomerId) {
    console.log('user reçu dans getOrCreateStripeCustomer:', user);
    return updatedUser.stripeCustomerId;
  }

  // Fallback
  return customer.id;
}

export async function POST(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Obtenir ou créer un client Stripe
    let stripeCustomerId = await getOrCreateStripeCustomer(user);

    // Relire l'utilisateur depuis la base pour garantir la propagation du champ
    const updatedUser = await mongoose.connection.collection('users').findOne({ _id: new mongoose.Types.ObjectId(user._id) });
    if (updatedUser && updatedUser.stripeCustomerId) {
      stripeCustomerId = updatedUser.stripeCustomerId;
      console.log('stripeCustomerId mis à jour pour', user.email, ':', stripeCustomerId);
    }

    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json({ message: 'ID de méthode de paiement requis' }, { status: 400 });
    }

    // Utilise stripeCustomerId pour toutes les opérations suivantes
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId,
    });

    // Si c'est la première méthode de paiement, la définir comme méthode par défaut
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    if (paymentMethods.data.length === 1) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Ajouter le metadata pour indiquer que c'est la méthode par défaut
      await stripe.paymentMethods.update(paymentMethodId, {
        metadata: { isDefault: 'true' },
      });
    }

    // PATCH: Mettre à jour le champ hasPaymentMethod dans la base utilisateur
    await mongoose.connection.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(user._id) },
      { $set: { hasPaymentMethod: paymentMethods.data.length > 0 } }
    );

    return NextResponse.json({
      message: 'Méthode de paiement ajoutée avec succès',
      stripeCustomerId
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
    return NextResponse.json(
      { message: 'Erreur lors de l\'ajout de la méthode de paiement' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // N'essaie plus jamais de créer un customer Stripe dans le GET
    const stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      return NextResponse.json([]);
    }

    // Récupérer les méthodes de paiement
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

    // Récupérer le customer Stripe pour connaître la méthode par défaut
    const customerRaw = await stripe.customers.retrieve(stripeCustomerId);
    let defaultPaymentMethodId = null;
    // Vérifier que ce n'est pas un DeletedCustomer
    if (customerRaw && typeof customerRaw === 'object' && 'invoice_settings' in customerRaw) {
      const customer = customerRaw as Stripe.Customer;
      if (
        customer.invoice_settings &&
        typeof customer.invoice_settings.default_payment_method === 'string'
      ) {
        defaultPaymentMethodId = customer.invoice_settings.default_payment_method;
      }
    }

    const formattedMethods = paymentMethods.data.map(method => {
      if (!method.card) {
        return null;
      }
      return {
        id: method.id,
        last4: method.card.last4,
        brand: method.card.brand,
        expMonth: method.card.exp_month,
        expYear: method.card.exp_year,
        isDefault: method.id === defaultPaymentMethodId,
      };
    }).filter(Boolean);

    return NextResponse.json(formattedMethods);
  } catch (error) {
    console.error('Erreur lors de la récupération des méthodes de paiement:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des méthodes de paiement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    const url = new URL(request.url);
    const methodId = url.searchParams.get('id');
    if (!methodId) {
      return NextResponse.json({ message: 'ID requis' }, { status: 400 });
    }
    const stripeCustomerId = user.stripeCustomerId;
    await stripe.paymentMethods.detach(methodId);

    // PATCH: Relister les cartes et mettre à jour hasPaymentMethod
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });
    await mongoose.connection.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(user._id) },
      { $set: { hasPaymentMethod: paymentMethods.data.length > 0 } }
    );

    return NextResponse.json({ message: 'Méthode supprimée' });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur suppression' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    const body = await request.json();
    const { methodId } = body;
    if (!methodId) {
      return NextResponse.json({ message: 'ID requis' }, { status: 400 });
    }
    const stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      return NextResponse.json({ message: 'stripeCustomerId manquant' }, { status: 400 });
    }
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: methodId }
    });
    return NextResponse.json({ message: 'Carte par défaut mise à jour' });
  } catch (error) {
    return NextResponse.json({ message: 'Erreur changement carte par défaut' }, { status: 500 });
  }
} 
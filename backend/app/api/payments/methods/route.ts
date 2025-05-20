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

// Fonction pour créer ou récupérer un client Stripe
async function getOrCreateStripeCustomer(user: User): Promise<string> {
  await dbConnect();
  
  // Si l'utilisateur a déjà un stripeCustomerId, le retourner
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Créer un nouveau client Stripe
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      userId: user._id
    }
  });

  // Mettre à jour l'utilisateur dans la base de données
  await mongoose.connection.collection('users').updateOne(
    { _id: new ObjectId(user._id) },
    { $set: { stripeCustomerId: customer.id } }
  );

  return customer.id;
}

export async function POST(request: Request) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Obtenir ou créer un client Stripe
    const stripeCustomerId = await getOrCreateStripeCustomer(user);

    const body = await request.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return NextResponse.json({ message: 'ID de méthode de paiement requis' }, { status: 400 });
    }

    // Attacher la méthode de paiement au client Stripe
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

    return NextResponse.json({ message: 'Méthode de paiement ajoutée avec succès' });
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

    // Obtenir ou créer un client Stripe
    const stripeCustomerId = await getOrCreateStripeCustomer(user);

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });

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
        isDefault: method.metadata?.isDefault === 'true',
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
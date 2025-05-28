import { NextResponse, NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import User, { IUser } from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

// Étendre le type de session utilisateur
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      hasPaymentMethod?: boolean;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
    }
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    // Adapter le Request en NextRequest pour getUserIdFromToken
    const nextReq = new NextRequest(request.url, { headers: request.headers });
    const userId = getUserIdFromToken(nextReq);
    if (!userId) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }
    const user = await User.findById(userId).lean<IUser>();
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionType } = body;

    if (!subscriptionType || !['none', 'solo', 'family'].includes(subscriptionType)) {
      return NextResponse.json({ message: 'Type d\'abonnement invalide' }, { status: 400 });
    }

    // Vérification Stripe réelle
    if (subscriptionType === 'solo' || subscriptionType === 'family') {
      if (!user.stripeCustomerId) {
        return NextResponse.json({ message: 'ID client Stripe manquant' }, { status: 400 });
      }
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      });
      if (!paymentMethods.data.length) {
        return NextResponse.json({ message: 'Méthode de paiement requise' }, { status: 400 });
      }
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Impossible de se connecter à la base de données');
    }

    // Si l'utilisateur a un abonnement Stripe actif, le mettre à jour
    const userStripeSubId = (user as any).stripeSubscriptionId as string | undefined;
    if (userStripeSubId) {
      const subscription = await stripe.subscriptions.retrieve(userStripeSubId);
      
      // Déterminer le prix en fonction du type d'abonnement
      let priceId;
      if (subscriptionType === 'solo') {
        priceId = process.env.STRIPE_SOLO_PRICE_ID;
      } else if (subscriptionType === 'family') {
        priceId = process.env.STRIPE_FAMILY_PRICE_ID;
      }

      if (subscriptionType === 'none') {
        // Annuler l'abonnement Stripe si il existe, ignorer l'erreur 404
        try {
          await stripe.subscriptions.cancel(userStripeSubId);
        } catch (err: any) {
          if (err?.raw?.type === 'invalid_request_error' && err?.raw?.code === 'resource_missing') {
            // L'abonnement n'existe déjà plus, on ignore l'erreur
          } else {
            throw err;
          }
        }
        // Mettre à jour l'utilisateur en base pour supprimer l'ID d'abonnement
        await db.collection('users').updateOne(
          { _id: new ObjectId(String(user._id)) },
          { $set: { subscriptionType: 'none' }, $unset: { stripeSubscriptionId: '' } }
        );
        return NextResponse.json({ message: 'Abonnement résilié, retour à la carte.' });
      } else if (priceId) {
        // Mettre à jour l'abonnement avec le nouveau prix
        await stripe.subscriptions.update(userStripeSubId, {
          items: [{
            id: subscription.items.data[0].id,
            price: priceId,
          }],
        });
      }
    } else if (subscriptionType !== 'none') {
      // Créer un nouvel abonnement
      const priceId = subscriptionType === 'solo' 
        ? process.env.STRIPE_SOLO_PRICE_ID 
        : process.env.STRIPE_FAMILY_PRICE_ID;

      if (!priceId) {
        return NextResponse.json({ message: 'Configuration des prix invalide' }, { status: 500 });
      }

      if (!user.stripeCustomerId) {
        return NextResponse.json({ message: 'ID client Stripe manquant' }, { status: 400 });
      }

      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
      });

      let clientSecret = undefined;
      if (
        subscription.latest_invoice &&
        typeof subscription.latest_invoice === 'object' &&
        'payment_intent' in subscription.latest_invoice &&
        subscription.latest_invoice.payment_intent &&
        typeof subscription.latest_invoice.payment_intent === 'object' &&
        'client_secret' in subscription.latest_invoice.payment_intent
      ) {
        clientSecret = subscription.latest_invoice.payment_intent.client_secret;
      }

      await db.collection('users').updateOne(
        { _id: new ObjectId(String(user._id)) },
        { 
          $set: { 
            stripeSubscriptionId: subscription.id,
            subscriptionType: subscriptionType
          }
        }
      );

      return NextResponse.json({ 
        subscriptionId: subscription.id,
        clientSecret
      });
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(String(user._id)) },
      { $set: { subscriptionType } }
    );

    return NextResponse.json({ message: 'Abonnement mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement d\'abonnement:', error);
    return NextResponse.json(
      { message: 'Erreur lors du changement d\'abonnement' },
      { status: 500 }
    );
  }
} 
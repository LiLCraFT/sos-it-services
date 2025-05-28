import { NextResponse, NextRequest } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

export async function GET(request: Request) {
  try {
    await dbConnect();
    const nextReq = new NextRequest(request.url, { headers: request.headers });
    const userId = getUserIdFromToken(nextReq);
    if (!userId) {
      return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
    }
    const user = await User.findById(userId).lean();
    const stripeSubscriptionId = (user as any)?.stripeSubscriptionId;
    if (!user || !stripeSubscriptionId) {
      return NextResponse.json({ status: 'none' });
    }
    try {
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      return NextResponse.json({ status: subscription.status });
    } catch (err: any) {
      // Si l'abonnement n'existe plus sur Stripe
      return NextResponse.json({ status: 'none' });
    }
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
} 
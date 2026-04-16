import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET environment variable' }, { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Update user's subscription tier
    if (session.metadata?.userId) {
      await prisma.user.update({
        where: { id: session.metadata.userId },
        data: {
          subscriptionTier: session.metadata.tier || 'PRO',
          stripeCustomerId: session.customer as string,
        },
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    await prisma.user.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        subscriptionTier: 'FREE',
      },
    });
  }

  return NextResponse.json({ received: true });
}

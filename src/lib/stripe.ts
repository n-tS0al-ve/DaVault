import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia', // Force exact type per Stripe's definition
  });

if (process.env.NODE_ENV !== 'production') globalForStripe.stripe = stripe;

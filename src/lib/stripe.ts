import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Stripe Price IDs for membership tiers
export const STRIPE_PRICES = {
  STARTER_MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
  STARTER_YEARLY: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  ELITE_MONTHLY: process.env.STRIPE_PRICE_ELITE_MONTHLY || 'price_elite_monthly',
  ELITE_YEARLY: process.env.STRIPE_PRICE_ELITE_YEARLY || 'price_elite_yearly',
  LIFETIME: process.env.STRIPE_PRICE_LIFETIME || 'price_lifetime',
} as const;

// Credit package Stripe Price IDs
export const CREDIT_STRIPE_PRICES = {
  STARTER_PACK: 'price_credits_5',
  VALUE_PACK: 'price_credits_15',
  PRO_PACK: 'price_credits_35',
  ULTIMATE_PACK: 'price_credits_100',
} as const;

export default stripe;

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe';
import { MembershipService } from '@/services/membership.service';
import { CreditService } from '@/services/credit.service';
import { ReferralService } from '@/services/referral.service';
import prisma from '@/lib/prisma';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // Subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        if (subscription.status === 'active') {
          await MembershipService.handleSubscriptionCreated(subscription);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        await prisma.membership.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: 'CANCELED',
            tier: 'FREE',
          },
        });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        // Check if this is a subscription renewal
        if (invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await MembershipService.handleSubscriptionRenewal(subscription);
        }

        // Record billing history
        const membership = await prisma.membership.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (membership) {
          await prisma.billingRecord.create({
            data: {
              membershipId: membership.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
              stripeInvoiceId: invoice.id,
              description: invoice.description || 'Subscription payment',
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        await prisma.membership.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: 'PAST_DUE',
          },
        });

        // Record failed payment
        const membership = await prisma.membership.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (membership) {
          await prisma.billingRecord.create({
            data: {
              membershipId: membership.id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: 'failed',
              stripeInvoiceId: invoice.id,
              description: 'Payment failed',
            },
          });

          // Notify user
          await prisma.notification.create({
            data: {
              userId: membership.userId,
              type: 'MEMBERSHIP_EXPIRING',
              title: 'Payment Failed',
              body: 'Your membership payment failed. Please update your payment method.',
              data: { invoiceId: invoice.id },
            },
          });
        }
        break;
      }

      // One-time payment events (credits, lifetime membership)
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Check metadata to determine what was purchased
        const metadata = session.metadata || {};

        if (metadata.packageId) {
          // Credit purchase
          await CreditService.handleCreditPurchase(
            metadata.userId,
            parseInt(metadata.credits),
            parseInt(metadata.bonusCredits || '0')
          );

          // Complete referral if applicable
          await ReferralService.completeReferral(metadata.userId);
        } else if (metadata.tier === 'LIFETIME') {
          // Lifetime membership purchase
          await MembershipService.handleLifetimePurchase(metadata.userId);

          // Complete referral if applicable
          await ReferralService.completeReferral(metadata.userId);
        }
        break;
      }

      // Handle refunds
      case 'charge.refunded': {
        const charge = event.data.object;
        console.log('Refund processed:', charge.id);
        // Handle refund logic if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

import { MembershipTier, MembershipStatus, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import stripe, { STRIPE_PRICES } from '@/lib/stripe';
import { TIER_FEATURES } from '@/types';

// Monthly credits by tier
const TIER_MONTHLY_CREDITS: Record<MembershipTier, number> = {
  FREE: 0,
  STARTER: 2,
  PRO: 5,
  ELITE: 15,
  LIFETIME: 20,
};

export class MembershipService {
  /**
   * Get or create membership for a user
   */
  static async getOrCreateMembership(userId: string) {
    let membership = await prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership) {
      membership = await prisma.membership.create({
        data: {
          userId,
          tier: 'FREE',
          status: 'ACTIVE',
          monthlyCreditsAllotted: 0,
        },
      });
    }

    return membership;
  }

  /**
   * Get membership with user details
   */
  static async getMembershipWithUser(userId: string) {
    return prisma.membership.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });
  }

  /**
   * Create Stripe checkout session for subscription
   */
  static async createCheckoutSession(
    userId: string,
    tier: MembershipTier,
    billingPeriod: 'monthly' | 'yearly' = 'monthly'
  ) {
    const membership = await this.getOrCreateMembership(userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Get or create Stripe customer
    let customerId = membership.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId },
      });
      customerId = customer.id;

      await prisma.membership.update({
        where: { userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Determine price ID
    const priceId = this.getPriceIdForTier(tier, billingPeriod);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: tier === 'LIFETIME' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/membership/plans`,
      metadata: {
        userId,
        tier,
        billingPeriod,
      },
    });

    return session;
  }

  /**
   * Get Stripe price ID for tier
   */
  private static getPriceIdForTier(
    tier: MembershipTier,
    billingPeriod: 'monthly' | 'yearly'
  ): string {
    const priceMap: Record<string, string> = {
      'STARTER_monthly': STRIPE_PRICES.STARTER_MONTHLY,
      'STARTER_yearly': STRIPE_PRICES.STARTER_YEARLY,
      'PRO_monthly': STRIPE_PRICES.PRO_MONTHLY,
      'PRO_yearly': STRIPE_PRICES.PRO_YEARLY,
      'ELITE_monthly': STRIPE_PRICES.ELITE_MONTHLY,
      'ELITE_yearly': STRIPE_PRICES.ELITE_YEARLY,
      'LIFETIME_monthly': STRIPE_PRICES.LIFETIME,
      'LIFETIME_yearly': STRIPE_PRICES.LIFETIME,
    };

    const key = `${tier}_${billingPeriod}`;
    return priceMap[key] || STRIPE_PRICES.STARTER_MONTHLY;
  }

  /**
   * Handle successful subscription from Stripe webhook
   */
  static async handleSubscriptionCreated(subscription: any) {
    const customerId = subscription.customer as string;

    const membership = await prisma.membership.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!membership) {
      console.error('Membership not found for customer:', customerId);
      return;
    }

    // Determine tier from price ID
    const priceId = subscription.items.data[0]?.price?.id;
    const tier = this.getTierFromPriceId(priceId);

    await prisma.membership.update({
      where: { id: membership.id },
      data: {
        tier,
        status: 'ACTIVE',
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        monthlyCreditsAllotted: TIER_MONTHLY_CREDITS[tier],
        monthlyCreditsUsed: 0,
        creditsResetDate: new Date(subscription.current_period_end * 1000),
      },
    });

    // Grant initial monthly credits
    await this.grantMonthlyCredits(membership.userId, tier);
  }

  /**
   * Handle lifetime purchase
   */
  static async handleLifetimePurchase(userId: string) {
    await prisma.membership.update({
      where: { userId },
      data: {
        tier: 'LIFETIME',
        status: 'ACTIVE',
        isLifetime: true,
        lifetimePurchaseDate: new Date(),
        monthlyCreditsAllotted: TIER_MONTHLY_CREDITS.LIFETIME,
        monthlyCreditsUsed: 0,
      },
    });

    await this.grantMonthlyCredits(userId, 'LIFETIME');
  }

  /**
   * Get tier from Stripe price ID
   */
  private static getTierFromPriceId(priceId: string): MembershipTier {
    const priceToTier: Record<string, MembershipTier> = {
      [STRIPE_PRICES.STARTER_MONTHLY]: 'STARTER',
      [STRIPE_PRICES.STARTER_YEARLY]: 'STARTER',
      [STRIPE_PRICES.PRO_MONTHLY]: 'PRO',
      [STRIPE_PRICES.PRO_YEARLY]: 'PRO',
      [STRIPE_PRICES.ELITE_MONTHLY]: 'ELITE',
      [STRIPE_PRICES.ELITE_YEARLY]: 'ELITE',
      [STRIPE_PRICES.LIFETIME]: 'LIFETIME',
    };

    return priceToTier[priceId] || 'FREE';
  }

  /**
   * Grant monthly credits to user
   */
  static async grantMonthlyCredits(userId: string, tier: MembershipTier) {
    const creditsToGrant = TIER_MONTHLY_CREDITS[tier];
    if (creditsToGrant <= 0) return;

    // Import credit service to avoid circular dependency
    const { CreditService } = await import('./credit.service');
    await CreditService.grantMembershipCredits(userId, creditsToGrant);
  }

  /**
   * Handle subscription renewal (for monthly credit reset)
   */
  static async handleSubscriptionRenewal(subscription: any) {
    const customerId = subscription.customer as string;

    const membership = await prisma.membership.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!membership) return;

    // Handle rollover credits
    const { CreditService } = await import('./credit.service');
    await CreditService.processMonthlyRollover(membership.userId);

    // Reset monthly credits
    await prisma.membership.update({
      where: { id: membership.id },
      data: {
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        monthlyCreditsUsed: 0,
        creditsResetDate: new Date(subscription.current_period_end * 1000),
      },
    });

    // Grant new monthly credits
    await this.grantMonthlyCredits(membership.userId, membership.tier);
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string, atPeriodEnd: boolean = true) {
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    if (membership.isLifetime) {
      throw new Error('Lifetime memberships cannot be cancelled');
    }

    await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: atPeriodEnd,
    });

    await prisma.membership.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: atPeriodEnd,
        status: atPeriodEnd ? 'ACTIVE' : 'CANCELED',
      },
    });
  }

  /**
   * Reactivate cancelled subscription
   */
  static async reactivateSubscription(userId: string) {
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await prisma.membership.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: false,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Upgrade/downgrade subscription
   */
  static async changeTier(
    userId: string,
    newTier: MembershipTier,
    billingPeriod: 'monthly' | 'yearly' = 'monthly'
  ) {
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership?.stripeSubscriptionId) {
      // No existing subscription, create new checkout
      return this.createCheckoutSession(userId, newTier, billingPeriod);
    }

    if (membership.isLifetime) {
      throw new Error('Lifetime memberships cannot be changed');
    }

    const subscription = await stripe.subscriptions.retrieve(
      membership.stripeSubscriptionId
    );

    const newPriceId = this.getPriceIdForTier(newTier, billingPeriod);

    // Update the subscription with the new price
    await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    await prisma.membership.update({
      where: { userId },
      data: {
        tier: newTier,
        stripePriceId: newPriceId,
        monthlyCreditsAllotted: TIER_MONTHLY_CREDITS[newTier],
      },
    });
  }

  /**
   * Check if user has access to a feature
   */
  static async hasFeatureAccess(
    userId: string,
    feature: string
  ): Promise<boolean> {
    const membership = await this.getOrCreateMembership(userId);

    const tierHierarchy: MembershipTier[] = [
      'FREE',
      'STARTER',
      'PRO',
      'ELITE',
      'LIFETIME',
    ];

    const featureRequirements: Record<string, MembershipTier> = {
      'video_library_full': 'STARTER',
      'community_forum_write': 'STARTER',
      'drill_library_basic': 'STARTER',
      'drill_library_advanced': 'PRO',
      'practice_plans': 'PRO',
      'coach_chat': 'PRO',
      'live_qa': 'PRO',
      'priority_reviews': 'ELITE',
      'monthly_video_call': 'ELITE',
      'joseph_mayo_content': 'ELITE',
      'early_access': 'ELITE',
      'vip_events': 'LIFETIME',
      'beta_access': 'LIFETIME',
    };

    const requiredTier = featureRequirements[feature];
    if (!requiredTier) return true; // Feature not restricted

    const userTierIndex = tierHierarchy.indexOf(membership.tier);
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

    return userTierIndex >= requiredTierIndex;
  }

  /**
   * Get billing history for user
   */
  static async getBillingHistory(userId: string, limit: number = 10) {
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership) return [];

    return prisma.billingRecord.findMany({
      where: { membershipId: membership.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Create customer portal session
   */
  static async createPortalSession(userId: string) {
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership?.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: membership.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/account/membership`,
    });

    return session;
  }
}

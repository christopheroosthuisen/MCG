import { CoachTier, PayoutStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';

// Coach tier configurations
export const COACH_TIER_CONFIG: Record<CoachTier, {
  name: string;
  priceMonthly: number;
  revenueSharePercent: number;
  features: string[];
  maxProducts: number;
  featuredSlots: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  analyticsAccess: 'basic' | 'advanced' | 'full';
}> = {
  STARTER: {
    name: 'Starter',
    priceMonthly: 0,
    revenueSharePercent: 60,
    features: [
      'Accept swing reviews',
      'Book 1-on-1 lessons',
      'Basic profile',
      'Standard support',
    ],
    maxProducts: 3,
    featuredSlots: false,
    prioritySupport: false,
    customBranding: false,
    analyticsAccess: 'basic',
  },
  PROFESSIONAL: {
    name: 'Professional',
    priceMonthly: 29,
    revenueSharePercent: 70,
    features: [
      'Everything in Starter',
      '70% revenue share',
      'Unlimited products',
      'Group lessons',
      'Community content',
      'Advanced analytics',
    ],
    maxProducts: -1, // unlimited
    featuredSlots: false,
    prioritySupport: false,
    customBranding: false,
    analyticsAccess: 'advanced',
  },
  ELITE: {
    name: 'Elite',
    priceMonthly: 79,
    revenueSharePercent: 80,
    features: [
      'Everything in Professional',
      '80% revenue share',
      'Featured coach rotation',
      'Priority support',
      'Custom branding',
      'Full analytics',
    ],
    maxProducts: -1,
    featuredSlots: true,
    prioritySupport: true,
    customBranding: true,
    analyticsAccess: 'full',
  },
  MASTER: {
    name: 'Master',
    priceMonthly: 199,
    revenueSharePercent: 85,
    features: [
      'Everything in Elite',
      '85% revenue share',
      'Permanent featured status',
      'Direct MCG partnership',
      'Revenue share on referrals',
      'Early access to features',
    ],
    maxProducts: -1,
    featuredSlots: true,
    prioritySupport: true,
    customBranding: true,
    analyticsAccess: 'full',
  },
};

export class CoachMonetizationService {
  // ============================================
  // COACH TIER MANAGEMENT
  // ============================================

  /**
   * Get or create coach subscription
   */
  static async getOrCreateSubscription(coachId: string) {
    let subscription = await prisma.coachSubscription.findUnique({
      where: { coachId },
    });

    if (!subscription) {
      subscription = await prisma.coachSubscription.create({
        data: {
          coachId,
          tier: 'STARTER',
          status: 'active',
        },
      });

      // Set initial revenue share based on tier
      await prisma.coach.update({
        where: { id: coachId },
        data: {
          revenueSharePercent: COACH_TIER_CONFIG.STARTER.revenueSharePercent,
        },
      });
    }

    return subscription;
  }

  /**
   * Create checkout session for coach tier upgrade
   */
  static async createTierCheckoutSession(coachId: string, tier: CoachTier) {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: { user: true, subscription: true },
    });

    if (!coach) {
      throw new Error('Coach not found');
    }

    if (tier === 'STARTER') {
      throw new Error('Cannot subscribe to free tier');
    }

    const tierConfig = COACH_TIER_CONFIG[tier];

    // Get or create Stripe customer
    let customerId = coach.subscription?.stripeSubscriptionId
      ? (await stripe.subscriptions.retrieve(coach.subscription.stripeSubscriptionId)).customer as string
      : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: coach.user.email,
        name: coach.displayName,
        metadata: {
          coachId: coach.id,
          userId: coach.userId,
          type: 'coach',
        },
      });
      customerId = customer.id;
    }

    const priceMap: Record<CoachTier, string> = {
      STARTER: '',
      PROFESSIONAL: process.env.STRIPE_PRICE_COACH_PRO!,
      ELITE: process.env.STRIPE_PRICE_COACH_ELITE!,
      MASTER: process.env.STRIPE_PRICE_COACH_MASTER!,
    };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceMap[tier],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/coach/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/coach/dashboard/subscription`,
      metadata: {
        coachId,
        tier,
      },
    });

    return session;
  }

  /**
   * Handle successful tier subscription
   */
  static async handleTierSubscription(subscription: any, tier: CoachTier) {
    const coachId = subscription.metadata?.coachId;
    if (!coachId) return;

    const tierConfig = COACH_TIER_CONFIG[tier];

    await prisma.coachSubscription.upsert({
      where: { coachId },
      create: {
        coachId,
        tier,
        status: 'active',
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price?.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        prioritySupport: tierConfig.prioritySupport,
        customBranding: tierConfig.customBranding,
      },
      update: {
        tier,
        status: 'active',
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price?.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        prioritySupport: tierConfig.prioritySupport,
        customBranding: tierConfig.customBranding,
      },
    });

    // Update coach revenue share
    await prisma.coach.update({
      where: { id: coachId },
      data: {
        revenueSharePercent: tierConfig.revenueSharePercent,
        isFeatured: tierConfig.featuredSlots,
      },
    });
  }

  /**
   * Cancel tier subscription
   */
  static async cancelTierSubscription(coachId: string) {
    const subscription = await prisma.coachSubscription.findUnique({
      where: { coachId },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription');
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.coachSubscription.update({
      where: { coachId },
      data: { cancelAtPeriodEnd: true },
    });
  }

  /**
   * Handle subscription ended - downgrade to starter
   */
  static async handleSubscriptionEnded(coachId: string) {
    await prisma.coachSubscription.update({
      where: { coachId },
      data: {
        tier: 'STARTER',
        status: 'active',
        stripeSubscriptionId: null,
        stripePriceId: null,
        prioritySupport: false,
        customBranding: false,
      },
    });

    await prisma.coach.update({
      where: { id: coachId },
      data: {
        revenueSharePercent: COACH_TIER_CONFIG.STARTER.revenueSharePercent,
        isFeatured: false,
      },
    });
  }

  // ============================================
  // EARNINGS & REVENUE TRACKING
  // ============================================

  /**
   * Record earnings for a coach
   */
  static async recordEarning(
    coachId: string,
    creditsEarned: number,
    referenceId: string,
    referenceType: 'review' | 'lesson' | 'group_lesson' | 'content' | 'product' | 'tip' | 'chat'
  ) {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) return;

    // Calculate amount based on revenue share
    const grossAmount = creditsEarned * 100; // $1 per credit
    const coachAmount = Math.floor((grossAmount * coach.revenueSharePercent) / 100);

    // Create earning record
    await prisma.coachEarning.create({
      data: {
        coachId,
        creditsEarned,
        amount: coachAmount,
        referenceId,
        referenceType,
        status: 'pending',
      },
    });

    // Update pending earnings
    await prisma.coach.update({
      where: { id: coachId },
      data: {
        pendingEarnings: { increment: coachAmount },
      },
    });

    // Handle referral revenue sharing
    await this.processReferralRevenue(coachId, coachAmount);

    return coachAmount;
  }

  /**
   * Process referral revenue sharing
   */
  private static async processReferralRevenue(coachId: string, amount: number) {
    // Find active referrals where this coach was referred
    const referral = await prisma.coachReferral.findFirst({
      where: {
        referredCoachId: coachId,
        status: 'active',
        expiresAt: { gt: new Date() },
      },
    });

    if (!referral) return;

    // Calculate referrer's share
    const referrerShare = Math.floor((amount * referral.revenueSharePercent) / 100);

    if (referrerShare <= 0) return;

    // Record earning for referrer
    await prisma.coachEarning.create({
      data: {
        coachId: referral.referrerCoachId,
        creditsEarned: 0,
        amount: referrerShare,
        referenceId: referral.id,
        referenceType: 'referral',
        status: 'pending',
      },
    });

    // Update referral total
    await prisma.coachReferral.update({
      where: { id: referral.id },
      data: {
        totalEarned: { increment: referrerShare },
      },
    });

    // Update referrer's pending earnings
    await prisma.coach.update({
      where: { id: referral.referrerCoachId },
      data: {
        pendingEarnings: { increment: referrerShare },
      },
    });
  }

  /**
   * Get earnings summary for a coach
   */
  static async getEarningsSummary(coachId: string) {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        subscription: true,
      },
    });

    if (!coach) {
      throw new Error('Coach not found');
    }

    // Get earnings breakdown
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      thisMonthEarnings,
      lastMonthEarnings,
      pendingPayouts,
      completedPayouts,
      earningsByType,
    ] = await Promise.all([
      prisma.coachEarning.aggregate({
        where: {
          coachId,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.coachEarning.aggregate({
        where: {
          coachId,
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.coachPayout.findMany({
        where: { coachId, status: 'PENDING' },
      }),
      prisma.coachPayout.findMany({
        where: { coachId, status: 'COMPLETED' },
        orderBy: { paidAt: 'desc' },
        take: 5,
      }),
      prisma.coachEarning.groupBy({
        by: ['referenceType'],
        where: {
          coachId,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      tier: coach.subscription?.tier || 'STARTER',
      revenueSharePercent: coach.revenueSharePercent,
      lifetimeEarnings: coach.lifetimeEarnings,
      pendingEarnings: coach.pendingEarnings,
      thisMonthEarnings: thisMonthEarnings._sum.amount || 0,
      lastMonthEarnings: lastMonthEarnings._sum.amount || 0,
      pendingPayouts,
      recentPayouts: completedPayouts,
      earningsBreakdown: earningsByType.reduce((acc, item) => {
        acc[item.referenceType] = item._sum.amount || 0;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // ============================================
  // PAYOUT SYSTEM
  // ============================================

  /**
   * Setup payout method (Stripe Connect)
   */
  static async setupStripeConnect(coachId: string) {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: { user: true },
    });

    if (!coach) {
      throw new Error('Coach not found');
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: coach.user.email,
      metadata: {
        coachId,
        userId: coach.userId,
      },
      capabilities: {
        transfers: { requested: true },
      },
    });

    // Save account info
    await prisma.coachPayoutMethod.upsert({
      where: { coachId },
      create: {
        coachId,
        type: 'stripe_connect',
        stripeAccountId: account.id,
        stripeAccountType: 'express',
        isVerified: false,
      },
      update: {
        stripeAccountId: account.id,
        stripeAccountType: 'express',
        isVerified: false,
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/coach/dashboard/payouts?refresh=true`,
      return_url: `${process.env.NEXTAUTH_URL}/coach/dashboard/payouts?success=true`,
      type: 'account_onboarding',
    });

    return accountLink;
  }

  /**
   * Verify Stripe Connect account status
   */
  static async verifyStripeAccount(coachId: string) {
    const payoutMethod = await prisma.coachPayoutMethod.findUnique({
      where: { coachId },
    });

    if (!payoutMethod?.stripeAccountId) {
      return { verified: false, reason: 'No account setup' };
    }

    const account = await stripe.accounts.retrieve(payoutMethod.stripeAccountId);

    const isVerified =
      account.charges_enabled && account.payouts_enabled && account.details_submitted;

    if (isVerified && !payoutMethod.isVerified) {
      await prisma.coachPayoutMethod.update({
        where: { coachId },
        data: { isVerified: true },
      });
    }

    return {
      verified: isVerified,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    };
  }

  /**
   * Create payout for coach
   */
  static async createPayout(coachId: string) {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: { payoutMethod: true },
    });

    if (!coach) {
      throw new Error('Coach not found');
    }

    if (!coach.payoutMethod?.isVerified) {
      throw new Error('Payout method not verified');
    }

    if (coach.pendingEarnings < 1000) { // Minimum $10 payout
      throw new Error('Minimum payout amount is $10');
    }

    // Get pending earnings by type
    const earningsByType = await prisma.coachEarning.groupBy({
      by: ['referenceType'],
      where: {
        coachId,
        status: 'pending',
      },
      _sum: { amount: true },
    });

    const breakdown = earningsByType.reduce((acc, item) => {
      acc[item.referenceType] = item._sum.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    // Calculate fees
    const grossAmount = coach.pendingEarnings;
    const processingFee = Math.ceil(grossAmount * 0.0025); // 0.25% processing
    const netAmount = grossAmount - processingFee;

    const now = new Date();
    const periodStart = coach.lastPayoutAt || coach.createdAt;

    // Create payout record
    const payout = await prisma.coachPayout.create({
      data: {
        coachId,
        amount: netAmount,
        status: 'PROCESSING',
        reviewEarnings: breakdown.review || 0,
        lessonEarnings: breakdown.lesson || 0,
        groupLessonEarnings: breakdown.group_lesson || 0,
        contentEarnings: breakdown.content || 0,
        productEarnings: breakdown.product || 0,
        tipEarnings: breakdown.tip || 0,
        referralEarnings: breakdown.referral || 0,
        chatEarnings: breakdown.chat || 0,
        processingFee,
        periodStart,
        periodEnd: now,
      },
    });

    try {
      // Transfer to connected account
      const transfer = await stripe.transfers.create({
        amount: netAmount,
        currency: 'usd',
        destination: coach.payoutMethod.stripeAccountId!,
        metadata: {
          payoutId: payout.id,
          coachId,
        },
      });

      // Update payout record
      await prisma.coachPayout.update({
        where: { id: payout.id },
        data: {
          status: 'COMPLETED',
          stripeTransferId: transfer.id,
          processedAt: new Date(),
          paidAt: new Date(),
        },
      });

      // Mark earnings as paid
      await prisma.coachEarning.updateMany({
        where: { coachId, status: 'pending' },
        data: { status: 'paid', paidAt: new Date() },
      });

      // Update coach
      await prisma.coach.update({
        where: { id: coachId },
        data: {
          pendingEarnings: 0,
          lifetimeEarnings: { increment: netAmount },
          lastPayoutAt: now,
        },
      });

      return payout;
    } catch (error: any) {
      // Mark payout as failed
      await prisma.coachPayout.update({
        where: { id: payout.id },
        data: {
          status: 'FAILED',
          failureReason: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Get payout history
   */
  static async getPayoutHistory(coachId: string, limit: number = 20) {
    return prisma.coachPayout.findMany({
      where: { coachId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

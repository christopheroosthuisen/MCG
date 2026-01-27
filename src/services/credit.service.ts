import { CreditTransactionType, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';
import { CREDIT_PACKAGES, CREDIT_COSTS } from '@/types';

export class CreditService {
  /**
   * Get or create credit balance for a user
   */
  static async getOrCreateBalance(userId: string) {
    let balance = await prisma.creditBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      balance = await prisma.creditBalance.create({
        data: {
          userId,
          purchasedCredits: 0,
          rolloverCredits: 0,
          bonusCredits: 0,
        },
      });
    }

    return balance;
  }

  /**
   * Get total available credits for a user
   */
  static async getTotalCredits(userId: string): Promise<number> {
    const balance = await this.getOrCreateBalance(userId);
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    // Calculate remaining membership credits
    const membershipCredits = membership
      ? membership.monthlyCreditsAllotted - membership.monthlyCreditsUsed
      : 0;

    // Check if rollover credits have expired
    let rolloverCredits = balance.rolloverCredits;
    if (balance.rolloverExpiresAt && new Date() > balance.rolloverExpiresAt) {
      rolloverCredits = 0;
    }

    return (
      balance.purchasedCredits +
      rolloverCredits +
      balance.bonusCredits +
      Math.max(0, membershipCredits)
    );
  }

  /**
   * Get detailed credit breakdown
   */
  static async getCreditBreakdown(userId: string) {
    const balance = await this.getOrCreateBalance(userId);
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    const membershipCredits = membership
      ? Math.max(0, membership.monthlyCreditsAllotted - membership.monthlyCreditsUsed)
      : 0;

    let rolloverCredits = balance.rolloverCredits;
    const rolloverExpired =
      balance.rolloverExpiresAt && new Date() > balance.rolloverExpiresAt;
    if (rolloverExpired) {
      rolloverCredits = 0;
    }

    return {
      total:
        balance.purchasedCredits +
        rolloverCredits +
        balance.bonusCredits +
        membershipCredits,
      breakdown: {
        purchased: balance.purchasedCredits,
        membership: membershipCredits,
        rollover: rolloverCredits,
        rolloverExpiresAt: rolloverExpired ? null : balance.rolloverExpiresAt,
        bonus: balance.bonusCredits,
      },
    };
  }

  /**
   * Create checkout session for credit purchase
   */
  static async createCreditPurchaseSession(userId: string, packageId: string) {
    const creditPackage = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!creditPackage) {
      throw new Error('Invalid credit package');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Get or create Stripe customer
    let membership = await prisma.membership.findUnique({
      where: { userId },
    });

    let customerId = membership?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId },
      });
      customerId = customer.id;

      if (membership) {
        await prisma.membership.update({
          where: { userId },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: creditPackage.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/credits`,
      metadata: {
        userId,
        packageId,
        credits: creditPackage.credits.toString(),
        bonusCredits: creditPackage.bonusCredits.toString(),
      },
    });

    return session;
  }

  /**
   * Handle successful credit purchase from webhook
   */
  static async handleCreditPurchase(
    userId: string,
    credits: number,
    bonusCredits: number = 0
  ) {
    const balance = await this.getOrCreateBalance(userId);

    // Add purchased credits
    await prisma.creditBalance.update({
      where: { userId },
      data: {
        purchasedCredits: balance.purchasedCredits + credits + bonusCredits,
      },
    });

    // Record transaction
    const newBalance = await this.getTotalCredits(userId);
    await this.recordTransaction(
      userId,
      'PURCHASE',
      credits + bonusCredits,
      newBalance,
      `Purchased ${credits} credits${bonusCredits > 0 ? ` (+${bonusCredits} bonus)` : ''}`
    );
  }

  /**
   * Grant monthly membership credits
   */
  static async grantMembershipCredits(userId: string, credits: number) {
    if (credits <= 0) return;

    // Membership credits are tracked on the membership record, not credit balance
    // This is just for transaction logging
    const newBalance = await this.getTotalCredits(userId);

    await this.recordTransaction(
      userId,
      'MEMBERSHIP_GRANT',
      credits,
      newBalance,
      `Monthly membership credits granted`
    );
  }

  /**
   * Process monthly rollover for membership credits
   */
  static async processMonthlyRollover(userId: string) {
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    if (!membership) return;

    const unusedCredits =
      membership.monthlyCreditsAllotted - membership.monthlyCreditsUsed;

    if (unusedCredits <= 0) return;

    const balance = await this.getOrCreateBalance(userId);

    // Expire old rollover credits if any
    if (balance.rolloverCredits > 0) {
      await this.recordTransaction(
        userId,
        'ROLLOVER_EXPIRED',
        -balance.rolloverCredits,
        await this.getTotalCredits(userId),
        'Previous rollover credits expired'
      );
    }

    // Set new rollover credits (expire in 1 month)
    const rolloverExpiresAt = new Date();
    rolloverExpiresAt.setMonth(rolloverExpiresAt.getMonth() + 1);

    await prisma.creditBalance.update({
      where: { userId },
      data: {
        rolloverCredits: unusedCredits,
        rolloverExpiresAt,
      },
    });

    await this.recordTransaction(
      userId,
      'ROLLOVER',
      unusedCredits,
      await this.getTotalCredits(userId),
      `${unusedCredits} unused credits rolled over`
    );
  }

  /**
   * Spend credits for a service
   */
  static async spendCredits(
    userId: string,
    amount: number,
    service: 'review' | 'lesson',
    referenceId: string,
    description: string
  ): Promise<boolean> {
    const totalCredits = await this.getTotalCredits(userId);

    if (totalCredits < amount) {
      return false;
    }

    // Deduct credits in priority order:
    // 1. Membership credits (use it or lose it)
    // 2. Rollover credits (expire soon)
    // 3. Bonus credits
    // 4. Purchased credits (never expire)

    let remaining = amount;
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });
    const balance = await this.getOrCreateBalance(userId);

    // 1. Use membership credits first
    if (membership) {
      const availableMembership =
        membership.monthlyCreditsAllotted - membership.monthlyCreditsUsed;
      const useFromMembership = Math.min(remaining, availableMembership);
      if (useFromMembership > 0) {
        await prisma.membership.update({
          where: { userId },
          data: {
            monthlyCreditsUsed: membership.monthlyCreditsUsed + useFromMembership,
          },
        });
        remaining -= useFromMembership;
      }
    }

    // 2. Use rollover credits
    if (remaining > 0 && balance.rolloverCredits > 0) {
      const rolloverValid =
        !balance.rolloverExpiresAt || new Date() <= balance.rolloverExpiresAt;
      if (rolloverValid) {
        const useFromRollover = Math.min(remaining, balance.rolloverCredits);
        await prisma.creditBalance.update({
          where: { userId },
          data: {
            rolloverCredits: balance.rolloverCredits - useFromRollover,
          },
        });
        remaining -= useFromRollover;
      }
    }

    // 3. Use bonus credits
    if (remaining > 0 && balance.bonusCredits > 0) {
      const useFromBonus = Math.min(remaining, balance.bonusCredits);
      await prisma.creditBalance.update({
        where: { userId },
        data: {
          bonusCredits: balance.bonusCredits - useFromBonus,
        },
      });
      remaining -= useFromBonus;
    }

    // 4. Use purchased credits
    if (remaining > 0 && balance.purchasedCredits > 0) {
      const useFromPurchased = Math.min(remaining, balance.purchasedCredits);
      await prisma.creditBalance.update({
        where: { userId },
        data: {
          purchasedCredits: balance.purchasedCredits - useFromPurchased,
        },
      });
      remaining -= useFromPurchased;
    }

    // Record transaction
    const newBalance = await this.getTotalCredits(userId);
    await this.recordTransaction(
      userId,
      service === 'review' ? 'SPENT_REVIEW' : 'SPENT_LESSON',
      -amount,
      newBalance,
      description,
      referenceId,
      service
    );

    return true;
  }

  /**
   * Refund credits for cancelled service
   */
  static async refundCredits(
    userId: string,
    amount: number,
    referenceId: string,
    description: string
  ) {
    const balance = await this.getOrCreateBalance(userId);

    // Refund as purchased credits (never expire)
    await prisma.creditBalance.update({
      where: { userId },
      data: {
        purchasedCredits: balance.purchasedCredits + amount,
      },
    });

    const newBalance = await this.getTotalCredits(userId);
    await this.recordTransaction(
      userId,
      'REFUND',
      amount,
      newBalance,
      description,
      referenceId,
      'refund'
    );
  }

  /**
   * Add bonus credits (promotions, referrals)
   */
  static async addBonusCredits(
    userId: string,
    amount: number,
    description: string
  ) {
    const balance = await this.getOrCreateBalance(userId);

    await prisma.creditBalance.update({
      where: { userId },
      data: {
        bonusCredits: balance.bonusCredits + amount,
      },
    });

    const newBalance = await this.getTotalCredits(userId);
    await this.recordTransaction(
      userId,
      'BONUS',
      amount,
      newBalance,
      description
    );
  }

  /**
   * Record credit transaction
   */
  private static async recordTransaction(
    userId: string,
    type: CreditTransactionType,
    amount: number,
    balanceAfter: number,
    description: string,
    referenceId?: string,
    referenceType?: string
  ) {
    await prisma.creditTransaction.create({
      data: {
        userId,
        type,
        amount,
        balanceAfter,
        description,
        referenceId,
        referenceType,
      },
    });
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    return prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get credit cost for a service
   */
  static getCreditCost(
    service: string
  ): { credits: number; description: string } | null {
    const cost = CREDIT_COSTS.find((c) => c.service === service);
    return cost ? { credits: cost.credits, description: cost.description } : null;
  }

  /**
   * Check if user can afford a service
   */
  static async canAfford(userId: string, service: string): Promise<boolean> {
    const cost = this.getCreditCost(service);
    if (!cost) return false;

    const totalCredits = await this.getTotalCredits(userId);
    return totalCredits >= cost.credits;
  }
}

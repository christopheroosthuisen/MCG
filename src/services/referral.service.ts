import prisma from '@/lib/prisma';
import { CreditService } from './credit.service';
import { v4 as uuidv4 } from 'uuid';

const REFERRAL_CREDITS = 2; // Credits awarded per successful referral

export class ReferralService {
  /**
   * Generate a unique referral code for a user
   */
  static generateReferralCode(userId: string): string {
    // Create a short code combining user ID hash and random string
    const hash = userId.substring(0, 4).toUpperCase();
    const random = uuidv4().substring(0, 4).toUpperCase();
    return `MCG-${hash}${random}`;
  }

  /**
   * Get user's referral code (or create one)
   */
  static async getUserReferralCode(userId: string): Promise<string> {
    // Check if user has made any referrals
    const existingReferral = await prisma.referral.findFirst({
      where: { referrerId: userId },
      select: { referralCode: true },
    });

    if (existingReferral) {
      return existingReferral.referralCode;
    }

    // Generate new code
    return this.generateReferralCode(userId);
  }

  /**
   * Apply a referral code during signup
   */
  static async applyReferralCode(
    newUserId: string,
    referralCode: string
  ): Promise<boolean> {
    // Check if this user was already referred
    const existingReferral = await prisma.referral.findUnique({
      where: { referredUserId: newUserId },
    });

    if (existingReferral) {
      return false; // Already has a referral
    }

    // Find the referrer by their code
    // The code contains a hash of the referrer's ID
    const referrerIdPrefix = referralCode.substring(4, 8).toLowerCase();

    const potentialReferrers = await prisma.user.findMany({
      where: {
        id: {
          startsWith: referrerIdPrefix,
        },
      },
    });

    // Verify the code matches
    let referrerId: string | null = null;
    for (const user of potentialReferrers) {
      const expectedCode = this.generateReferralCode(user.id);
      // Check if this user's generated code matches (we need to compare prefix)
      if (referralCode.startsWith(`MCG-${user.id.substring(0, 4).toUpperCase()}`)) {
        referrerId = user.id;
        break;
      }
    }

    // Alternative: Look for existing referrals with this code
    if (!referrerId) {
      const existingWithCode = await prisma.referral.findFirst({
        where: { referralCode },
        select: { referrerId: true },
      });
      referrerId = existingWithCode?.referrerId || null;
    }

    if (!referrerId || referrerId === newUserId) {
      return false; // Invalid code or self-referral
    }

    // Create the referral record (pending until user completes first purchase)
    await prisma.referral.create({
      data: {
        referrerId,
        referredUserId: newUserId,
        referralCode,
        status: 'pending',
      },
    });

    return true;
  }

  /**
   * Complete a referral (called when referred user makes first purchase)
   */
  static async completeReferral(referredUserId: string): Promise<void> {
    const referral = await prisma.referral.findUnique({
      where: { referredUserId },
    });

    if (!referral || referral.status !== 'pending') {
      return;
    }

    // Update referral status
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'completed',
        creditsAwarded: REFERRAL_CREDITS,
        completedAt: new Date(),
      },
    });

    // Award credits to referrer
    await CreditService.addBonusCredits(
      referral.referrerId,
      REFERRAL_CREDITS,
      'Referral bonus - new member joined'
    );

    // Also give the new user a bonus
    await CreditService.addBonusCredits(
      referredUserId,
      REFERRAL_CREDITS,
      'Welcome bonus - referred by a friend'
    );

    // Notify the referrer
    await prisma.notification.create({
      data: {
        userId: referral.referrerId,
        type: 'CREDITS_RECEIVED',
        title: 'Referral Bonus!',
        body: `You earned ${REFERRAL_CREDITS} credits! Your referral just made their first purchase.`,
        data: { credits: REFERRAL_CREDITS },
      },
    });
  }

  /**
   * Get referral statistics for a user
   */
  static async getReferralStats(userId: string) {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: {
          select: {
            name: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const completed = referrals.filter((r) => r.status === 'completed');
    const pending = referrals.filter((r) => r.status === 'pending');

    return {
      referralCode: await this.getUserReferralCode(userId),
      totalReferrals: referrals.length,
      completedReferrals: completed.length,
      pendingReferrals: pending.length,
      totalCreditsEarned: completed.reduce(
        (sum, r) => sum + r.creditsAwarded,
        0
      ),
      referrals: referrals.map((r) => ({
        id: r.id,
        status: r.status,
        creditsAwarded: r.creditsAwarded,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        referredUser: r.referredUser,
      })),
    };
  }

  /**
   * Get referral link for sharing
   */
  static async getReferralLink(userId: string): Promise<string> {
    const code = await this.getUserReferralCode(userId);
    return `${process.env.NEXTAUTH_URL}/signup?ref=${code}`;
  }
}

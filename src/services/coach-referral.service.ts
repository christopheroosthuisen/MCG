import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

const DEFAULT_REVENUE_SHARE_PERCENT = 5; // 5% of referred's revenue
const DEFAULT_REVENUE_SHARE_MONTHS = 12; // 12 months of revenue sharing

export class CoachReferralService {
  // ============================================
  // REFERRAL CODE GENERATION
  // ============================================

  /**
   * Generate unique referral code for a coach
   */
  static generateReferralCode(coachId: string, type: 'coach' | 'student'): string {
    const prefix = type === 'coach' ? 'MCG-C' : 'MCG-S';
    const hash = coachId.substring(0, 4).toUpperCase();
    const random = uuidv4().substring(0, 4).toUpperCase();
    return `${prefix}-${hash}${random}`;
  }

  /**
   * Get or create referral codes for a coach
   */
  static async getOrCreateReferralCodes(coachId: string) {
    // Check for existing referrals to get codes
    const existingCoachReferral = await prisma.coachReferral.findFirst({
      where: { referrerCoachId: coachId, referralType: 'coach' },
      select: { referralCode: true },
    });

    const existingStudentReferral = await prisma.coachReferral.findFirst({
      where: { referrerCoachId: coachId, referralType: 'student' },
      select: { referralCode: true },
    });

    return {
      coachReferralCode:
        existingCoachReferral?.referralCode ||
        this.generateReferralCode(coachId, 'coach'),
      studentReferralCode:
        existingStudentReferral?.referralCode ||
        this.generateReferralCode(coachId, 'student'),
    };
  }

  // ============================================
  // COACH-TO-COACH REFERRALS
  // ============================================

  /**
   * Apply coach referral code (when a new coach signs up)
   */
  static async applyCoachReferral(
    newCoachId: string,
    referralCode: string
  ): Promise<boolean> {
    // Check if already referred
    const existingReferral = await prisma.coachReferral.findUnique({
      where: { referredCoachId: newCoachId },
    });

    if (existingReferral) {
      return false; // Already has a referral
    }

    // Find the referrer by code pattern (MCG-C prefix)
    if (!referralCode.startsWith('MCG-C')) {
      return false; // Not a coach referral code
    }

    // Look for existing referrals with this code to find the referrer
    const referrerReferral = await prisma.coachReferral.findFirst({
      where: { referralCode, referralType: 'coach' },
      select: { referrerCoachId: true },
    });

    let referrerCoachId = referrerReferral?.referrerCoachId;

    // If no existing referral with this code, try to find by code hash
    if (!referrerCoachId) {
      const coachIdPrefix = referralCode.substring(6, 10).toLowerCase();
      const potentialCoach = await prisma.coach.findFirst({
        where: { id: { startsWith: coachIdPrefix } },
      });
      referrerCoachId = potentialCoach?.id;
    }

    if (!referrerCoachId || referrerCoachId === newCoachId) {
      return false; // Invalid code or self-referral
    }

    // Calculate expiration (revenue share duration)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + DEFAULT_REVENUE_SHARE_MONTHS);

    // Create referral record (pending until new coach makes first earnings)
    await prisma.coachReferral.create({
      data: {
        referrerCoachId,
        referredCoachId: newCoachId,
        referralCode,
        referralType: 'coach',
        revenueSharePercent: DEFAULT_REVENUE_SHARE_PERCENT,
        revenueShareMonths: DEFAULT_REVENUE_SHARE_MONTHS,
        status: 'pending',
        expiresAt,
      },
    });

    // Notify referrer
    const referrer = await prisma.coach.findUnique({
      where: { id: referrerCoachId },
    });

    if (referrer) {
      await prisma.notification.create({
        data: {
          userId: referrer.userId,
          type: 'SYSTEM',
          title: 'New Coach Referral!',
          body: 'A new coach signed up using your referral code. You\'ll earn 5% of their revenue for 12 months!',
          data: { referredCoachId: newCoachId },
        },
      });
    }

    return true;
  }

  /**
   * Activate coach referral (when referred coach makes first earnings)
   */
  static async activateCoachReferral(referredCoachId: string) {
    const referral = await prisma.coachReferral.findUnique({
      where: { referredCoachId },
    });

    if (!referral || referral.status !== 'pending') {
      return;
    }

    await prisma.coachReferral.update({
      where: { id: referral.id },
      data: {
        status: 'active',
        activatedAt: new Date(),
      },
    });
  }

  // ============================================
  // COACH-TO-STUDENT REFERRALS
  // ============================================

  /**
   * Apply student referral code (when a user signs up and makes first purchase)
   */
  static async applyStudentReferral(
    studentId: string,
    referralCode: string
  ): Promise<boolean> {
    // Check if already referred
    const existingReferral = await prisma.coachReferral.findUnique({
      where: { referredStudentId: studentId },
    });

    if (existingReferral) {
      return false;
    }

    // Verify it's a student referral code
    if (!referralCode.startsWith('MCG-S')) {
      return false;
    }

    // Find the referrer
    const referrerReferral = await prisma.coachReferral.findFirst({
      where: { referralCode, referralType: 'student' },
      select: { referrerCoachId: true },
    });

    let referrerCoachId = referrerReferral?.referrerCoachId;

    if (!referrerCoachId) {
      const coachIdPrefix = referralCode.substring(6, 10).toLowerCase();
      const potentialCoach = await prisma.coach.findFirst({
        where: { id: { startsWith: coachIdPrefix } },
      });
      referrerCoachId = potentialCoach?.id;
    }

    if (!referrerCoachId) {
      return false;
    }

    // Check the student isn't the coach themselves
    const coach = await prisma.coach.findUnique({
      where: { id: referrerCoachId },
    });
    if (coach?.userId === studentId) {
      return false;
    }

    // Create referral - one-time bonus for student referrals
    await prisma.coachReferral.create({
      data: {
        referrerCoachId,
        referredStudentId: studentId,
        referralCode,
        referralType: 'student',
        revenueSharePercent: 0, // No ongoing revenue share for student referrals
        revenueShareMonths: 0,
        status: 'completed', // Immediately completed
        activatedAt: new Date(),
      },
    });

    // Award bonus credits to coach (5 credits for referring a paying student)
    const { CreditService } = await import('./credit.service');
    const coachUser = await prisma.coach.findUnique({
      where: { id: referrerCoachId },
      select: { userId: true },
    });

    if (coachUser) {
      await CreditService.addBonusCredits(
        coachUser.userId,
        5,
        'Student referral bonus'
      );

      // Notify coach
      await prisma.notification.create({
        data: {
          userId: coachUser.userId,
          type: 'CREDITS_RECEIVED',
          title: 'Referral Bonus!',
          body: 'A student you referred made their first purchase. You earned 5 bonus credits!',
          data: { studentId, credits: 5 },
        },
      });
    }

    return true;
  }

  // ============================================
  // REFERRAL STATISTICS
  // ============================================

  /**
   * Get referral stats for a coach
   */
  static async getReferralStats(coachId: string) {
    const referrals = await prisma.coachReferral.findMany({
      where: { referrerCoachId: coachId },
    });

    const coachReferrals = referrals.filter((r) => r.referralType === 'coach');
    const studentReferrals = referrals.filter((r) => r.referralType === 'student');

    const activeCoachReferrals = coachReferrals.filter(
      (r) => r.status === 'active' && r.expiresAt && r.expiresAt > new Date()
    );

    const totalEarnings = referrals.reduce((sum, r) => sum + r.totalEarned, 0);

    // Get referral codes
    const codes = await this.getOrCreateReferralCodes(coachId);

    return {
      referralCodes: codes,
      coachReferrals: {
        total: coachReferrals.length,
        active: activeCoachReferrals.length,
        pending: coachReferrals.filter((r) => r.status === 'pending').length,
        totalEarned: coachReferrals.reduce((sum, r) => sum + r.totalEarned, 0),
      },
      studentReferrals: {
        total: studentReferrals.length,
        bonusCreditsEarned: studentReferrals.length * 5, // 5 credits per student
      },
      totalEarnings,
      // Active referrals with details
      activeReferrals: activeCoachReferrals.map((r) => ({
        id: r.id,
        type: r.referralType,
        revenueSharePercent: r.revenueSharePercent,
        totalEarned: r.totalEarned,
        activatedAt: r.activatedAt,
        expiresAt: r.expiresAt,
      })),
    };
  }

  /**
   * Get referral links for sharing
   */
  static async getReferralLinks(coachId: string) {
    const codes = await this.getOrCreateReferralCodes(coachId);
    const baseUrl = process.env.NEXTAUTH_URL;

    return {
      coachReferralLink: `${baseUrl}/coach/apply?ref=${codes.coachReferralCode}`,
      studentReferralLink: `${baseUrl}/signup?ref=${codes.studentReferralCode}`,
      coachReferralCode: codes.coachReferralCode,
      studentReferralCode: codes.studentReferralCode,
    };
  }

  /**
   * Check and expire old referrals
   */
  static async processExpiredReferrals() {
    const now = new Date();

    const expiredReferrals = await prisma.coachReferral.findMany({
      where: {
        status: 'active',
        expiresAt: { lte: now },
      },
    });

    for (const referral of expiredReferrals) {
      await prisma.coachReferral.update({
        where: { id: referral.id },
        data: { status: 'expired' },
      });

      // Notify referrer
      const coach = await prisma.coach.findUnique({
        where: { id: referral.referrerCoachId },
      });

      if (coach) {
        await prisma.notification.create({
          data: {
            userId: coach.userId,
            type: 'SYSTEM',
            title: 'Referral Period Ended',
            body: `Your referral revenue share period has ended. Total earned: $${(referral.totalEarned / 100).toFixed(2)}`,
            data: { referralId: referral.id, totalEarned: referral.totalEarned },
          },
        });
      }
    }

    return expiredReferrals.length;
  }

  /**
   * Get leaderboard of top referrers
   */
  static async getReferralLeaderboard(limit: number = 10) {
    const referrals = await prisma.coachReferral.groupBy({
      by: ['referrerCoachId'],
      _sum: { totalEarned: true },
      _count: { id: true },
      orderBy: { _sum: { totalEarned: 'desc' } },
      take: limit,
    });

    const coachIds = referrals.map((r) => r.referrerCoachId);
    const coaches = await prisma.coach.findMany({
      where: { id: { in: coachIds } },
      select: {
        id: true,
        displayName: true,
        profileImage: true,
      },
    });

    const coachMap = coaches.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {} as Record<string, any>);

    return referrals.map((r, index) => ({
      rank: index + 1,
      coach: coachMap[r.referrerCoachId],
      totalReferrals: r._count.id,
      totalEarned: r._sum.totalEarned || 0,
    }));
  }
}

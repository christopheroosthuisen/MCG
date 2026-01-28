import { CertificationLevel } from '@prisma/client';
import prisma from '@/lib/prisma';
import { CreditService } from './credit.service';

export class CertificationService {
  // ============================================
  // CERTIFICATION MANAGEMENT (ADMIN)
  // ============================================

  /**
   * Create a new certification program
   */
  static async createCertification(data: {
    name: string;
    slug: string;
    level: CertificationLevel;
    description: string;
    requirements: string[];
    priceCredits: number;
    passingScore?: number;
    validityMonths?: number;
    badgeImageUrl?: string;
  }) {
    return prisma.certification.create({
      data: {
        name: data.name,
        slug: data.slug,
        level: data.level,
        description: data.description,
        requirements: data.requirements,
        priceCredits: data.priceCredits,
        passingScore: data.passingScore || 80,
        validityMonths: data.validityMonths,
        badgeImageUrl: data.badgeImageUrl,
      },
    });
  }

  /**
   * Update certification
   */
  static async updateCertification(
    certificationId: string,
    data: Partial<{
      name: string;
      description: string;
      requirements: string[];
      priceCredits: number;
      passingScore: number;
      validityMonths: number;
      badgeImageUrl: string;
      isActive: boolean;
    }>
  ) {
    return prisma.certification.update({
      where: { id: certificationId },
      data,
    });
  }

  // ============================================
  // CERTIFICATION DISCOVERY
  // ============================================

  /**
   * Get all available certifications
   */
  static async getAvailableCertifications(coachId?: string) {
    const certifications = await prisma.certification.findMany({
      where: { isActive: true },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    });

    if (!coachId) {
      return certifications;
    }

    // Get coach's earned certifications
    const earned = await prisma.coachCertification.findMany({
      where: { coachId },
      select: { certificationId: true, expiresAt: true },
    });

    const earnedMap = earned.reduce((acc, e) => {
      acc[e.certificationId] = e.expiresAt;
      return acc;
    }, {} as Record<string, Date | null>);

    // Get in-progress attempts
    const attempts = await prisma.certificationAttempt.findMany({
      where: {
        coachId,
        passed: false,
        reviewedAt: null,
      },
      select: { certificationId: true },
    });

    const pendingSet = new Set(attempts.map((a) => a.certificationId));

    return certifications.map((cert) => ({
      ...cert,
      status: earnedMap[cert.id]
        ? earnedMap[cert.id] && earnedMap[cert.id]! < new Date()
          ? 'expired'
          : 'earned'
        : pendingSet.has(cert.id)
        ? 'pending'
        : 'available',
      expiresAt: earnedMap[cert.id],
    }));
  }

  /**
   * Get certification details
   */
  static async getCertificationDetails(certificationIdOrSlug: string) {
    return prisma.certification.findFirst({
      where: {
        OR: [{ id: certificationIdOrSlug }, { slug: certificationIdOrSlug }],
        isActive: true,
      },
    });
  }

  /**
   * Get certification by level
   */
  static async getCertificationsByLevel(level: CertificationLevel) {
    return prisma.certification.findMany({
      where: { level, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ============================================
  // CERTIFICATION ATTEMPTS
  // ============================================

  /**
   * Submit certification attempt
   */
  static async submitAttempt(
    coachId: string,
    certificationId: string,
    submissionUrl: string
  ) {
    const certification = await prisma.certification.findUnique({
      where: { id: certificationId },
    });

    if (!certification || !certification.isActive) {
      throw new Error('Certification not found or inactive');
    }

    // Check if already earned and not expired
    const existing = await prisma.coachCertification.findUnique({
      where: { coachId_certificationId: { coachId, certificationId } },
    });

    if (existing && (!existing.expiresAt || existing.expiresAt > new Date())) {
      throw new Error('You already have this certification');
    }

    // Check for pending attempt
    const pendingAttempt = await prisma.certificationAttempt.findFirst({
      where: {
        coachId,
        certificationId,
        reviewedAt: null,
      },
    });

    if (pendingAttempt) {
      throw new Error('You have a pending attempt awaiting review');
    }

    // Check credits
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: { user: true },
    });

    if (!coach) {
      throw new Error('Coach not found');
    }

    const canAfford = await CreditService.hasEnoughCredits(
      coach.userId,
      certification.priceCredits
    );

    if (!canAfford) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await CreditService.spendCredits(
      coach.userId,
      certification.priceCredits,
      'certification',
      certificationId,
      `Certification attempt: ${certification.name}`
    );

    // Create attempt
    const attempt = await prisma.certificationAttempt.create({
      data: {
        certificationId,
        coachId,
        submissionUrl,
        creditsPaid: certification.priceCredits,
      },
    });

    // Notify admins
    // In production, you'd have an admin notification system

    return attempt;
  }

  /**
   * Review certification attempt (Admin action)
   */
  static async reviewAttempt(
    attemptId: string,
    reviewerId: string,
    score: number,
    notes?: string
  ) {
    const attempt = await prisma.certificationAttempt.findUnique({
      where: { id: attemptId },
      include: { certification: true },
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    if (attempt.reviewedAt) {
      throw new Error('Attempt already reviewed');
    }

    const passed = score >= attempt.certification.passingScore;

    // Update attempt
    await prisma.certificationAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        passed,
        reviewNotes: notes,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
      },
    });

    if (passed) {
      // Award certification
      const expiresAt = attempt.certification.validityMonths
        ? new Date(
            Date.now() + attempt.certification.validityMonths * 30 * 24 * 60 * 60 * 1000
          )
        : null;

      await prisma.coachCertification.upsert({
        where: {
          coachId_certificationId: {
            coachId: attempt.coachId,
            certificationId: attempt.certificationId,
          },
        },
        create: {
          coachId: attempt.coachId,
          certificationId: attempt.certificationId,
          earnedAt: new Date(),
          expiresAt,
        },
        update: {
          earnedAt: new Date(),
          expiresAt,
        },
      });

      // Add certification to coach profile
      const coach = await prisma.coach.findUnique({
        where: { id: attempt.coachId },
      });

      if (coach && !coach.certifications.includes(attempt.certification.name)) {
        await prisma.coach.update({
          where: { id: attempt.coachId },
          data: {
            certifications: [...coach.certifications, attempt.certification.name],
          },
        });
      }
    }

    // Notify coach
    const coach = await prisma.coach.findUnique({
      where: { id: attempt.coachId },
    });

    if (coach) {
      await prisma.notification.create({
        data: {
          userId: coach.userId,
          type: 'SYSTEM',
          title: passed ? 'Certification Earned!' : 'Certification Result',
          body: passed
            ? `Congratulations! You've earned the ${attempt.certification.name} certification!`
            : `Your ${attempt.certification.name} certification attempt scored ${score}%. Required: ${attempt.certification.passingScore}%`,
          data: {
            certificationId: attempt.certificationId,
            passed,
            score,
          },
        },
      });
    }

    return { passed, score };
  }

  /**
   * Get coach's certification attempts
   */
  static async getCoachAttempts(coachId: string) {
    return prisma.certificationAttempt.findMany({
      where: { coachId },
      include: {
        certification: {
          select: {
            name: true,
            level: true,
            passingScore: true,
            badgeImageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // COACH CERTIFICATIONS
  // ============================================

  /**
   * Get coach's earned certifications
   */
  static async getCoachCertifications(coachId: string) {
    return prisma.coachCertification.findMany({
      where: { coachId },
      include: {
        certification: true,
      },
      orderBy: { earnedAt: 'desc' },
    });
  }

  /**
   * Toggle certification display on profile
   */
  static async toggleCertificationDisplay(
    coachId: string,
    certificationId: string,
    display: boolean
  ) {
    return prisma.coachCertification.update({
      where: { coachId_certificationId: { coachId, certificationId } },
      data: { isDisplayed: display },
    });
  }

  /**
   * Check for expiring certifications and send reminders
   */
  static async checkExpiringCertifications() {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const expiring = await prisma.coachCertification.findMany({
      where: {
        expiresAt: {
          lte: thirtyDaysFromNow,
          gt: new Date(),
        },
      },
      include: {
        certification: true,
      },
    });

    for (const cert of expiring) {
      const coach = await prisma.coach.findUnique({
        where: { id: cert.coachId },
      });

      if (coach) {
        const daysUntilExpiry = Math.ceil(
          (cert.expiresAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
        );

        await prisma.notification.create({
          data: {
            userId: coach.userId,
            type: 'SYSTEM',
            title: 'Certification Expiring Soon',
            body: `Your ${cert.certification.name} certification expires in ${daysUntilExpiry} days. Renew now to maintain your credentials.`,
            data: {
              certificationId: cert.certificationId,
              expiresAt: cert.expiresAt,
            },
          },
        });
      }
    }

    return expiring.length;
  }

  /**
   * Get coaches with specific certification
   */
  static async getCoachesWithCertification(certificationId: string) {
    const certifiedCoaches = await prisma.coachCertification.findMany({
      where: {
        certificationId,
        isDisplayed: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        certification: {
          select: { name: true, level: true, badgeImageUrl: true },
        },
      },
    });

    const coachIds = certifiedCoaches.map((c) => c.coachId);

    return prisma.coach.findMany({
      where: {
        id: { in: coachIds },
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
      orderBy: { averageRating: 'desc' },
    });
  }
}

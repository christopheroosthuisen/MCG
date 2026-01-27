import {
  ReviewStatus,
  ReviewType,
  LessonStatus,
  LessonType,
  CoachStatus,
} from '@prisma/client';
import prisma from '@/lib/prisma';
import { CreditService } from './credit.service';
import { CREDIT_COSTS } from '@/types';

export class CoachingService {
  // ============================================
  // COACH MANAGEMENT
  // ============================================

  /**
   * Get all active coaches
   */
  static async getActiveCoaches(options?: {
    specialty?: string;
    sortBy?: 'rating' | 'reviews' | 'responseTime';
    limit?: number;
    offset?: number;
  }) {
    const { specialty, sortBy = 'rating', limit = 20, offset = 0 } = options || {};

    const orderBy: any = {
      rating: { averageRating: 'desc' },
      reviews: { totalReviews: 'desc' },
      responseTime: { responseTimeHours: 'asc' },
    }[sortBy];

    return prisma.coach.findMany({
      where: {
        status: 'ACTIVE',
        ...(specialty && {
          specialties: { has: specialty },
        }),
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get coach profile by ID
   */
  static async getCoachProfile(coachId: string) {
    return prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        availability: true,
      },
    });
  }

  /**
   * Get coach by user ID
   */
  static async getCoachByUserId(userId: string) {
    return prisma.coach.findUnique({
      where: { userId },
      include: {
        availability: true,
      },
    });
  }

  /**
   * Create coach profile (MCG Alumni application)
   */
  static async createCoachProfile(
    userId: string,
    data: {
      displayName: string;
      bio?: string;
      certifications: string[];
      specialties: string[];
      yearsExperience: number;
      timezone?: string;
    }
  ) {
    return prisma.coach.create({
      data: {
        userId,
        status: 'PENDING_APPROVAL',
        displayName: data.displayName,
        bio: data.bio,
        certifications: data.certifications,
        specialties: data.specialties,
        yearsExperience: data.yearsExperience,
        timezone: data.timezone || 'America/New_York',
      },
    });
  }

  /**
   * Update coach profile
   */
  static async updateCoachProfile(
    coachId: string,
    data: Partial<{
      displayName: string;
      bio: string;
      profileImage: string;
      coverImage: string;
      certifications: string[];
      specialties: string[];
      yearsExperience: number;
      timezone: string;
    }>
  ) {
    return prisma.coach.update({
      where: { id: coachId },
      data,
    });
  }

  /**
   * Set coach availability
   */
  static async setCoachAvailability(
    coachId: string,
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>
  ) {
    // Delete existing availability
    await prisma.coachAvailability.deleteMany({
      where: { coachId },
    });

    // Create new availability
    await prisma.coachAvailability.createMany({
      data: availability.map((slot) => ({
        coachId,
        ...slot,
      })),
    });
  }

  /**
   * Get available booking slots for a coach
   */
  static async getAvailableSlots(
    coachId: string,
    startDate: Date,
    endDate: Date,
    lessonDuration: number = 30
  ) {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      include: { availability: true },
    });

    if (!coach) return [];

    // Get existing lessons in the date range
    const existingLessons = await prisma.lesson.findMany({
      where: {
        coachId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
    });

    const slots: Array<{ start: Date; end: Date }> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      const dayAvailability = coach.availability.filter(
        (a) => a.dayOfWeek === dayOfWeek && a.isAvailable
      );

      for (const avail of dayAvailability) {
        const [startHour, startMin] = avail.startTime.split(':').map(Number);
        const [endHour, endMin] = avail.endTime.split(':').map(Number);

        const slotStart = new Date(current);
        slotStart.setHours(startHour, startMin, 0, 0);

        const dayEnd = new Date(current);
        dayEnd.setHours(endHour, endMin, 0, 0);

        while (slotStart.getTime() + lessonDuration * 60000 <= dayEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + lessonDuration * 60000);

          // Check if slot conflicts with existing lessons
          const hasConflict = existingLessons.some((lesson) => {
            const lessonEnd = new Date(
              lesson.scheduledAt.getTime() + lesson.duration * 60000
            );
            return (
              slotStart < lessonEnd && slotEnd > lesson.scheduledAt
            );
          });

          if (!hasConflict && slotStart > new Date()) {
            slots.push({ start: new Date(slotStart), end: slotEnd });
          }

          slotStart.setMinutes(slotStart.getMinutes() + 30); // 30-min increments
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  // ============================================
  // SWING REVIEWS
  // ============================================

  /**
   * Submit a swing review request
   */
  static async submitSwingReview(
    studentId: string,
    data: {
      videoUrl: string;
      videoThumbnail?: string;
      videoDuration?: number;
      clubUsed?: string;
      shotType?: string;
      additionalNotes?: string;
      reviewType: ReviewType;
      preferredCoachId?: string;
    }
  ) {
    // Get credit cost for review type
    const creditCostMap: Record<ReviewType, string> = {
      STANDARD: 'STANDARD_REVIEW',
      PRIORITY: 'PRIORITY_REVIEW',
      DETAILED: 'DETAILED_REVIEW',
      JOSEPH_MAYO: 'JOSEPH_MAYO_REVIEW',
    };

    const costService = creditCostMap[data.reviewType];
    const cost = CreditService.getCreditCost(costService);

    if (!cost) {
      throw new Error('Invalid review type');
    }

    // Check if user can afford
    const canAfford = await CreditService.canAfford(studentId, costService);
    if (!canAfford) {
      throw new Error('Insufficient credits');
    }

    // Determine due date based on review type
    const dueAt = new Date();
    switch (data.reviewType) {
      case 'PRIORITY':
        dueAt.setHours(dueAt.getHours() + 48);
        break;
      case 'JOSEPH_MAYO':
        dueAt.setDate(dueAt.getDate() + 14);
        break;
      default:
        dueAt.setDate(dueAt.getDate() + 7);
    }

    // Assign coach (if Joseph Mayo review, find his profile)
    let coachId = data.preferredCoachId;
    if (data.reviewType === 'JOSEPH_MAYO') {
      const josephMayo = await prisma.coach.findFirst({
        where: { isJosephMayo: true },
      });
      coachId = josephMayo?.id;
    }

    // Create review
    const review = await prisma.swingReview.create({
      data: {
        studentId,
        coachId,
        type: data.reviewType,
        status: 'SUBMITTED',
        creditsCost: cost.credits,
        videoUrl: data.videoUrl,
        videoThumbnail: data.videoThumbnail,
        videoDuration: data.videoDuration,
        clubUsed: data.clubUsed,
        shotType: data.shotType,
        additionalNotes: data.additionalNotes,
        dueAt,
      },
    });

    // Deduct credits
    await CreditService.spendCredits(
      studentId,
      cost.credits,
      'review',
      review.id,
      `${data.reviewType} swing review`
    );

    // Create notification for coach
    if (coachId) {
      const coach = await prisma.coach.findUnique({
        where: { id: coachId },
      });
      if (coach) {
        await prisma.notification.create({
          data: {
            userId: coach.userId,
            type: 'REVIEW_SUBMITTED',
            title: 'New Swing Review',
            body: `You have a new ${data.reviewType.toLowerCase()} swing review to complete`,
            data: { reviewId: review.id },
          },
        });
      }
    }

    return review;
  }

  /**
   * Get pending reviews for a coach
   */
  static async getPendingReviews(coachId: string) {
    return prisma.swingReview.findMany({
      where: {
        coachId,
        status: {
          in: ['SUBMITTED', 'IN_REVIEW'],
        },
      },
      include: {
        student: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: [
        { type: 'desc' }, // Priority first
        { dueAt: 'asc' },
      ],
    });
  }

  /**
   * Get reviews for a student
   */
  static async getStudentReviews(
    studentId: string,
    status?: ReviewStatus,
    limit: number = 20
  ) {
    return prisma.swingReview.findMany({
      where: {
        studentId,
        ...(status && { status }),
      },
      include: {
        coach: {
          select: {
            displayName: true,
            profileImage: true,
            isJosephMayo: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Complete a swing review (coach action)
   */
  static async completeSwingReview(
    reviewId: string,
    coachId: string,
    data: {
      reviewVideoUrl?: string;
      reviewNotes: string;
      drillsRecommended: string[];
    }
  ) {
    const review = await prisma.swingReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.coachId !== coachId) {
      throw new Error('Not authorized to complete this review');
    }

    // Update review
    const updatedReview = await prisma.swingReview.update({
      where: { id: reviewId },
      data: {
        status: 'COMPLETED',
        reviewVideoUrl: data.reviewVideoUrl,
        reviewNotes: data.reviewNotes,
        drillsRecommended: data.drillsRecommended,
        completedAt: new Date(),
      },
    });

    // Update coach stats
    await prisma.coach.update({
      where: { id: coachId },
      data: {
        totalReviews: { increment: 1 },
      },
    });

    // Record coach earning
    await prisma.coachEarning.create({
      data: {
        coachId,
        creditsEarned: review.creditsCost,
        amount: review.creditsCost * 100, // $1 per credit
        referenceId: reviewId,
        referenceType: 'review',
        status: 'pending',
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: review.studentId,
        type: 'REVIEW_COMPLETED',
        title: 'Swing Review Complete',
        body: 'Your swing review is ready to view',
        data: { reviewId },
      },
    });

    return updatedReview;
  }

  /**
   * Rate a completed review
   */
  static async rateReview(
    reviewId: string,
    studentId: string,
    rating: number,
    feedback?: string
  ) {
    const review = await prisma.swingReview.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.studentId !== studentId) {
      throw new Error('Not authorized to rate this review');
    }

    if (review.status !== 'COMPLETED') {
      throw new Error('Can only rate completed reviews');
    }

    // Update review rating
    await prisma.swingReview.update({
      where: { id: reviewId },
      data: {
        studentRating: rating,
        studentFeedback: feedback,
      },
    });

    // Update coach average rating
    if (review.coachId) {
      const allReviews = await prisma.swingReview.findMany({
        where: {
          coachId: review.coachId,
          studentRating: { not: null },
        },
        select: { studentRating: true },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + (r.studentRating || 0), 0) /
        allReviews.length;

      await prisma.coach.update({
        where: { id: review.coachId },
        data: { averageRating: avgRating },
      });
    }
  }

  // ============================================
  // LESSONS
  // ============================================

  /**
   * Book a lesson
   */
  static async bookLesson(
    studentId: string,
    data: {
      coachId: string;
      lessonType: LessonType;
      scheduledAt: Date;
      timezone: string;
      studentGoals?: string;
    }
  ) {
    // Determine credit cost
    const costService =
      data.lessonType === 'VIDEO_CALL_30' ? 'LESSON_30_MIN' : 'LESSON_60_MIN';
    const cost = CreditService.getCreditCost(costService);

    if (!cost) {
      throw new Error('Invalid lesson type');
    }

    // Check credits
    const canAfford = await CreditService.canAfford(studentId, costService);
    if (!canAfford) {
      throw new Error('Insufficient credits');
    }

    // Verify slot is available
    const duration = data.lessonType === 'VIDEO_CALL_30' ? 30 : 60;
    const endTime = new Date(data.scheduledAt.getTime() + duration * 60000);

    const conflictingLesson = await prisma.lesson.findFirst({
      where: {
        coachId: data.coachId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { lt: endTime },
        AND: {
          scheduledAt: {
            gte: new Date(data.scheduledAt.getTime() - duration * 60000),
          },
        },
      },
    });

    if (conflictingLesson) {
      throw new Error('This time slot is no longer available');
    }

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        studentId,
        coachId: data.coachId,
        type: data.lessonType,
        status: 'SCHEDULED',
        creditsCost: cost.credits,
        scheduledAt: data.scheduledAt,
        duration,
        timezone: data.timezone,
        studentGoals: data.studentGoals,
      },
    });

    // Deduct credits
    await CreditService.spendCredits(
      studentId,
      cost.credits,
      'lesson',
      lesson.id,
      `${duration}-minute lesson`
    );

    // Notify coach
    const coach = await prisma.coach.findUnique({
      where: { id: data.coachId },
    });
    if (coach) {
      await prisma.notification.create({
        data: {
          userId: coach.userId,
          type: 'LESSON_BOOKED',
          title: 'New Lesson Booked',
          body: `You have a new ${duration}-minute lesson scheduled`,
          data: { lessonId: lesson.id },
        },
      });
    }

    return lesson;
  }

  /**
   * Get upcoming lessons for a user (as student or coach)
   */
  static async getUpcomingLessons(userId: string, role: 'student' | 'coach') {
    const coach = role === 'coach'
      ? await prisma.coach.findUnique({ where: { userId } })
      : null;

    return prisma.lesson.findMany({
      where: {
        ...(role === 'student'
          ? { studentId: userId }
          : { coachId: coach?.id }),
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() },
      },
      include: {
        student: {
          select: { name: true, image: true },
        },
        coach: {
          select: { displayName: true, profileImage: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  /**
   * Cancel a lesson
   */
  static async cancelLesson(lessonId: string, userId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { coach: true },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check authorization
    const isStudent = lesson.studentId === userId;
    const isCoach = lesson.coach?.userId === userId;

    if (!isStudent && !isCoach) {
      throw new Error('Not authorized to cancel this lesson');
    }

    // Check cancellation policy (24 hours before)
    const hoursUntilLesson =
      (lesson.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilLesson < 24 && isStudent) {
      throw new Error(
        'Lessons must be cancelled at least 24 hours in advance'
      );
    }

    // Update lesson status
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { status: 'CANCELLED' },
    });

    // Refund credits to student
    await CreditService.refundCredits(
      lesson.studentId,
      lesson.creditsCost,
      lessonId,
      'Lesson cancelled - credits refunded'
    );

    // Notify the other party
    const notifyUserId = isStudent ? lesson.coach?.userId : lesson.studentId;
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: 'LESSON_BOOKED', // Reusing type for simplicity
          title: 'Lesson Cancelled',
          body: `A lesson scheduled for ${lesson.scheduledAt.toLocaleDateString()} has been cancelled`,
          data: { lessonId },
        },
      });
    }
  }

  /**
   * Complete a lesson
   */
  static async completeLesson(
    lessonId: string,
    coachId: string,
    notes?: string
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || lesson.coachId !== coachId) {
      throw new Error('Not authorized');
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: 'COMPLETED',
        coachNotes: notes,
      },
    });

    // Update coach stats
    await prisma.coach.update({
      where: { id: coachId },
      data: {
        totalLessons: { increment: 1 },
      },
    });

    // Record earning
    await prisma.coachEarning.create({
      data: {
        coachId,
        creditsEarned: lesson.creditsCost,
        amount: lesson.creditsCost * 100,
        referenceId: lessonId,
        referenceType: 'lesson',
        status: 'pending',
      },
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: lesson.studentId,
        type: 'LESSON_COMPLETED',
        title: 'Lesson Complete',
        body: 'Your lesson has been completed. Please leave a rating!',
        data: { lessonId },
      },
    });
  }

  /**
   * Rate a lesson
   */
  static async rateLesson(
    lessonId: string,
    studentId: string,
    rating: number,
    feedback?: string
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || lesson.studentId !== studentId) {
      throw new Error('Not authorized');
    }

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        studentRating: rating,
        studentFeedback: feedback,
      },
    });

    // Update coach average rating
    const allLessons = await prisma.lesson.findMany({
      where: {
        coachId: lesson.coachId,
        studentRating: { not: null },
      },
      select: { studentRating: true },
    });

    const allReviews = await prisma.swingReview.findMany({
      where: {
        coachId: lesson.coachId,
        studentRating: { not: null },
      },
      select: { studentRating: true },
    });

    const allRatings = [
      ...allLessons.map((l) => l.studentRating!),
      ...allReviews.map((r) => r.studentRating!),
    ];

    const avgRating =
      allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

    await prisma.coach.update({
      where: { id: lesson.coachId },
      data: { averageRating: avgRating },
    });
  }
}

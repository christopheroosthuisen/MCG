import prisma from '@/lib/prisma';
import { CreditService } from './credit.service';
import { CoachMonetizationService } from './coach-monetization.service';

export class GroupLessonsService {
  // ============================================
  // LESSON MANAGEMENT (COACH)
  // ============================================

  /**
   * Create a group lesson
   */
  static async createGroupLesson(
    coachId: string,
    data: {
      title: string;
      description?: string;
      scheduledAt: Date;
      duration: number;
      timezone: string;
      maxParticipants?: number;
      minParticipants?: number;
      priceCredits: number;
      earlyBirdCredits?: number;
      earlyBirdUntil?: Date;
      isRecorded?: boolean;
    }
  ) {
    // Verify coach can create group lessons (Professional+ tier)
    const subscription = await prisma.coachSubscription.findUnique({
      where: { coachId },
    });

    if (!subscription || subscription.tier === 'STARTER') {
      throw new Error('Professional tier or higher required for group lessons');
    }

    // Validate scheduling
    if (data.scheduledAt <= new Date()) {
      throw new Error('Group lesson must be scheduled in the future');
    }

    // Check for conflicting lessons
    const endTime = new Date(data.scheduledAt.getTime() + data.duration * 60000);
    const conflict = await prisma.groupLesson.findFirst({
      where: {
        coachId,
        status: { in: ['scheduled', 'live'] },
        scheduledAt: { lt: endTime },
        AND: {
          scheduledAt: {
            gte: new Date(data.scheduledAt.getTime() - data.duration * 60000),
          },
        },
      },
    });

    if (conflict) {
      throw new Error('You have a conflicting group lesson at this time');
    }

    return prisma.groupLesson.create({
      data: {
        coachId,
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        timezone: data.timezone,
        maxParticipants: data.maxParticipants || 10,
        minParticipants: data.minParticipants || 2,
        priceCredits: data.priceCredits,
        earlyBirdCredits: data.earlyBirdCredits,
        earlyBirdUntil: data.earlyBirdUntil,
        isRecorded: data.isRecorded ?? true,
        status: 'scheduled',
      },
    });
  }

  /**
   * Update group lesson
   */
  static async updateGroupLesson(
    lessonId: string,
    coachId: string,
    data: Partial<{
      title: string;
      description: string;
      scheduledAt: Date;
      duration: number;
      maxParticipants: number;
      minParticipants: number;
      priceCredits: number;
      earlyBirdCredits: number;
      earlyBirdUntil: Date;
    }>
  ) {
    const lesson = await prisma.groupLesson.findUnique({
      where: { id: lessonId },
      include: { _count: { select: { participants: true } } },
    });

    if (!lesson || lesson.coachId !== coachId) {
      throw new Error('Lesson not found or not authorized');
    }

    if (lesson.status !== 'scheduled') {
      throw new Error('Cannot update lesson that is not scheduled');
    }

    // Cannot reduce max participants below current count
    if (
      data.maxParticipants &&
      data.maxParticipants < lesson._count.participants
    ) {
      throw new Error('Cannot reduce capacity below current participant count');
    }

    return prisma.groupLesson.update({
      where: { id: lessonId },
      data,
    });
  }

  /**
   * Cancel group lesson
   */
  static async cancelGroupLesson(lessonId: string, coachId: string) {
    const lesson = await prisma.groupLesson.findUnique({
      where: { id: lessonId },
      include: { participants: true },
    });

    if (!lesson || lesson.coachId !== coachId) {
      throw new Error('Lesson not found or not authorized');
    }

    if (lesson.status !== 'scheduled') {
      throw new Error('Can only cancel scheduled lessons');
    }

    // Refund all participants
    for (const participant of lesson.participants) {
      await CreditService.refundCredits(
        participant.userId,
        participant.creditsPaid,
        lessonId,
        `Group lesson cancelled: ${lesson.title}`
      );

      // Notify participant
      await prisma.notification.create({
        data: {
          userId: participant.userId,
          type: 'SYSTEM',
          title: 'Group Lesson Cancelled',
          body: `The group lesson "${lesson.title}" has been cancelled. Your ${participant.creditsPaid} credits have been refunded.`,
          data: { lessonId, creditsRefunded: participant.creditsPaid },
        },
      });
    }

    // Update lesson status
    await prisma.groupLesson.update({
      where: { id: lessonId },
      data: { status: 'cancelled' },
    });

    return { refundedCount: lesson.participants.length };
  }

  /**
   * Start group lesson (go live)
   */
  static async startLesson(lessonId: string, coachId: string, roomUrl: string) {
    const lesson = await prisma.groupLesson.findUnique({
      where: { id: lessonId },
      include: { participants: true },
    });

    if (!lesson || lesson.coachId !== coachId) {
      throw new Error('Lesson not found or not authorized');
    }

    if (lesson.status !== 'scheduled') {
      throw new Error('Lesson is not in scheduled status');
    }

    // Check minimum participants
    if (lesson.participants.length < lesson.minParticipants) {
      throw new Error(
        `Minimum ${lesson.minParticipants} participants required. Current: ${lesson.participants.length}`
      );
    }

    // Update lesson
    await prisma.groupLesson.update({
      where: { id: lessonId },
      data: {
        status: 'live',
        roomUrl,
        roomName: `mcg-group-${lessonId}`,
      },
    });

    // Notify participants
    for (const participant of lesson.participants) {
      await prisma.notification.create({
        data: {
          userId: participant.userId,
          type: 'LESSON_REMINDER',
          title: 'Group Lesson Starting Now!',
          body: `"${lesson.title}" is starting. Click to join!`,
          data: { lessonId, roomUrl },
        },
      });
    }

    return { roomUrl };
  }

  /**
   * Complete group lesson
   */
  static async completeLesson(
    lessonId: string,
    coachId: string,
    recordingUrl?: string
  ) {
    const lesson = await prisma.groupLesson.findUnique({
      where: { id: lessonId },
      include: { participants: true },
    });

    if (!lesson || lesson.coachId !== coachId) {
      throw new Error('Lesson not found or not authorized');
    }

    if (lesson.status !== 'live') {
      throw new Error('Lesson must be live to complete');
    }

    // Update lesson
    await prisma.groupLesson.update({
      where: { id: lessonId },
      data: {
        status: 'completed',
        recordingUrl,
      },
    });

    // Mark attended participants
    await prisma.groupLessonParticipant.updateMany({
      where: { groupLessonId: lessonId },
      data: { attended: true },
    });

    // Calculate total earnings
    const totalCredits = lesson.participants.reduce(
      (sum, p) => sum + p.creditsPaid,
      0
    );

    // Record coach earnings
    await CoachMonetizationService.recordEarning(
      coachId,
      totalCredits,
      lessonId,
      'group_lesson'
    );

    // Update coach stats
    await prisma.coach.update({
      where: { id: coachId },
      data: { totalGroupLessons: { increment: 1 } },
    });

    // Notify participants with recording if available
    for (const participant of lesson.participants) {
      await prisma.notification.create({
        data: {
          userId: participant.userId,
          type: 'LESSON_COMPLETED',
          title: 'Group Lesson Completed',
          body: recordingUrl
            ? `"${lesson.title}" recording is now available.`
            : `Thank you for attending "${lesson.title}"!`,
          data: { lessonId, recordingUrl },
        },
      });
    }

    return { participantCount: lesson.participants.length, totalCredits };
  }

  // ============================================
  // PARTICIPANT MANAGEMENT
  // ============================================

  /**
   * Join group lesson
   */
  static async joinLesson(lessonId: string, userId: string) {
    const lesson = await prisma.groupLesson.findUnique({
      where: { id: lessonId },
      include: { _count: { select: { participants: true } } },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (lesson.status !== 'scheduled') {
      throw new Error('Cannot join - lesson is not accepting registrations');
    }

    if (lesson._count.participants >= lesson.maxParticipants) {
      throw new Error('Lesson is full');
    }

    // Check if already registered
    const existing = await prisma.groupLessonParticipant.findUnique({
      where: { groupLessonId_userId: { groupLessonId: lessonId, userId } },
    });

    if (existing) {
      throw new Error('Already registered for this lesson');
    }

    // Determine price (early bird or regular)
    const now = new Date();
    const price =
      lesson.earlyBirdCredits &&
      lesson.earlyBirdUntil &&
      now < lesson.earlyBirdUntil
        ? lesson.earlyBirdCredits
        : lesson.priceCredits;

    // Check credits
    const canAfford = await CreditService.hasEnoughCredits(userId, price);
    if (!canAfford) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await CreditService.spendCredits(
      userId,
      price,
      'group_lesson',
      lessonId,
      `Group lesson: ${lesson.title}`
    );

    // Add participant
    await prisma.groupLessonParticipant.create({
      data: {
        groupLessonId: lessonId,
        userId,
        creditsPaid: price,
      },
    });

    // Notify coach
    const coach = await prisma.coach.findUnique({
      where: { id: lesson.coachId },
    });

    if (coach) {
      const participantCount = lesson._count.participants + 1;
      await prisma.notification.create({
        data: {
          userId: coach.userId,
          type: 'SYSTEM',
          title: 'New Registration',
          body: `Someone joined "${lesson.title}" (${participantCount}/${lesson.maxParticipants})`,
          data: { lessonId, participantCount },
        },
      });
    }

    return {
      joined: true,
      creditsPaid: price,
      isEarlyBird: price === lesson.earlyBirdCredits,
    };
  }

  /**
   * Leave group lesson
   */
  static async leaveLesson(lessonId: string, userId: string) {
    const lesson = await prisma.groupLesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (lesson.status !== 'scheduled') {
      throw new Error('Cannot leave - lesson is no longer scheduled');
    }

    const participant = await prisma.groupLessonParticipant.findUnique({
      where: { groupLessonId_userId: { groupLessonId: lessonId, userId } },
    });

    if (!participant) {
      throw new Error('Not registered for this lesson');
    }

    // Check cancellation policy (24 hours before)
    const hoursUntilLesson =
      (lesson.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilLesson < 24) {
      throw new Error('Cannot cancel within 24 hours of lesson start');
    }

    // Remove participant
    await prisma.groupLessonParticipant.delete({
      where: { id: participant.id },
    });

    // Refund credits
    await CreditService.refundCredits(
      userId,
      participant.creditsPaid,
      lessonId,
      `Left group lesson: ${lesson.title}`
    );

    return { left: true, creditsRefunded: participant.creditsPaid };
  }

  // ============================================
  // DISCOVERY
  // ============================================

  /**
   * Get upcoming group lessons
   */
  static async getUpcomingLessons(options?: {
    coachId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { coachId, limit = 20, offset = 0 } = options || {};

    return prisma.groupLesson.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: { gt: new Date() },
        ...(coachId && { coachId }),
      },
      include: {
        coach: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            averageRating: true,
            isJosephMayo: true,
          },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get lesson details
   */
  static async getLessonDetails(lessonId: string, userId?: string) {
    const lesson = await prisma.groupLesson.findUnique({
      where: { id: lessonId },
      include: {
        coach: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            bio: true,
            averageRating: true,
            totalLessons: true,
            totalGroupLessons: true,
            isJosephMayo: true,
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    let isRegistered = false;
    let registration = null;

    if (userId) {
      const participant = await prisma.groupLessonParticipant.findUnique({
        where: { groupLessonId_userId: { groupLessonId: lessonId, userId } },
      });
      isRegistered = !!participant;
      registration = participant;
    }

    // Calculate current price
    const now = new Date();
    const isEarlyBird =
      lesson.earlyBirdCredits &&
      lesson.earlyBirdUntil &&
      now < lesson.earlyBirdUntil;
    const currentPrice = isEarlyBird
      ? lesson.earlyBirdCredits!
      : lesson.priceCredits;

    return {
      ...lesson,
      isRegistered,
      registration,
      currentPrice,
      isEarlyBird,
      spotsRemaining: lesson.maxParticipants - lesson._count.participants,
    };
  }

  /**
   * Get user's registered group lessons
   */
  static async getUserLessons(userId: string, status?: 'upcoming' | 'past') {
    const registrations = await prisma.groupLessonParticipant.findMany({
      where: { userId },
      include: {
        groupLesson: {
          include: {
            coach: {
              select: {
                id: true,
                displayName: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        groupLesson: { scheduledAt: status === 'past' ? 'desc' : 'asc' },
      },
    });

    const now = new Date();

    return registrations.filter((r) => {
      const isUpcoming = r.groupLesson.scheduledAt > now;
      if (status === 'upcoming') return isUpcoming;
      if (status === 'past') return !isUpcoming;
      return true;
    });
  }

  /**
   * Get coach's group lessons
   */
  static async getCoachLessons(
    coachId: string,
    options?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const { status, limit = 20, offset = 0 } = options || {};

    return prisma.groupLesson.findMany({
      where: {
        coachId,
        ...(status && { status }),
      },
      include: {
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Rate a completed group lesson
   */
  static async rateLesson(
    lessonId: string,
    userId: string,
    rating: number,
    feedback?: string
  ) {
    const participant = await prisma.groupLessonParticipant.findUnique({
      where: { groupLessonId_userId: { groupLessonId: lessonId, userId } },
      include: { groupLesson: true },
    });

    if (!participant) {
      throw new Error('Not registered for this lesson');
    }

    if (participant.groupLesson.status !== 'completed') {
      throw new Error('Can only rate completed lessons');
    }

    if (!participant.attended) {
      throw new Error('Only attended participants can rate');
    }

    await prisma.groupLessonParticipant.update({
      where: { id: participant.id },
      data: { rating, feedback },
    });

    // Update coach average rating
    const allRatings = await prisma.groupLessonParticipant.findMany({
      where: {
        groupLesson: { coachId: participant.groupLesson.coachId },
        rating: { not: null },
      },
      select: { rating: true },
    });

    if (allRatings.length > 0) {
      const avgRating =
        allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) /
        allRatings.length;

      // This would be combined with lesson and review ratings in practice
      // For now, just log it
      console.log(`Group lesson average rating for coach: ${avgRating}`);
    }

    return { rated: true };
  }
}

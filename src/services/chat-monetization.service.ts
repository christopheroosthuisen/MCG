import { ChatSessionType, MembershipTier } from '@prisma/client';
import prisma from '@/lib/prisma';
import { CreditService } from './credit.service';
import { CoachMonetizationService } from './coach-monetization.service';

// Chat access rules by membership tier
const CHAT_ACCESS_BY_TIER: Record<
  MembershipTier,
  { hasAccess: boolean; freeMessages: number; type: ChatSessionType }
> = {
  FREE: { hasAccess: false, freeMessages: 0, type: 'CREDIT_BASED' },
  STARTER: { hasAccess: false, freeMessages: 0, type: 'CREDIT_BASED' },
  PRO: { hasAccess: true, freeMessages: 5, type: 'FREE_TIER' },
  ELITE: { hasAccess: true, freeMessages: -1, type: 'UNLIMITED' }, // -1 = unlimited
  LIFETIME: { hasAccess: true, freeMessages: -1, type: 'UNLIMITED' },
};

export class ChatMonetizationService {
  // ============================================
  // CHAT SESSION MANAGEMENT
  // ============================================

  /**
   * Get or create chat session for a conversation
   */
  static async getOrCreateSession(
    conversationId: string,
    studentId: string,
    coachId: string
  ) {
    let session = await prisma.chatSession.findUnique({
      where: { conversationId },
    });

    if (!session) {
      // Get student's membership tier
      const membership = await prisma.membership.findUnique({
        where: { userId: studentId },
      });

      const tier = membership?.tier || 'FREE';
      const chatAccess = CHAT_ACCESS_BY_TIER[tier];

      // Get coach's chat pricing
      const coach = await prisma.coach.findUnique({
        where: { id: coachId },
        select: { chatCreditsPerMessage: true },
      });

      session = await prisma.chatSession.create({
        data: {
          conversationId,
          studentId,
          coachId,
          type: chatAccess.type,
          creditsPerMessage: coach?.chatCreditsPerMessage || 1,
          freeMessagesLimit: chatAccess.freeMessages,
        },
      });
    }

    return session;
  }

  /**
   * Check if user can send a message
   */
  static async canSendMessage(
    conversationId: string,
    userId: string
  ): Promise<{ canSend: boolean; reason?: string; creditsCost?: number }> {
    const session = await prisma.chatSession.findUnique({
      where: { conversationId },
    });

    if (!session) {
      return { canSend: false, reason: 'Chat session not found' };
    }

    // Check if user is coach (coaches always free)
    const coach = await prisma.coach.findUnique({
      where: { id: session.coachId },
    });

    if (coach?.userId === userId) {
      return { canSend: true, creditsCost: 0 };
    }

    // Check if user is the student
    if (session.studentId !== userId) {
      return { canSend: false, reason: 'Not part of this conversation' };
    }

    // Check session type
    if (session.type === 'UNLIMITED') {
      return { canSend: true, creditsCost: 0 };
    }

    if (session.type === 'FREE_TIER') {
      if (
        session.freeMessagesLimit === -1 ||
        session.freeMessagesUsed < session.freeMessagesLimit
      ) {
        return { canSend: true, creditsCost: 0 };
      }
      // Free messages exhausted, switch to credit-based
    }

    // Credit-based - check if user has credits
    const hasCredits = await CreditService.hasEnoughCredits(
      userId,
      session.creditsPerMessage
    );

    if (!hasCredits) {
      return {
        canSend: false,
        reason: 'Insufficient credits',
        creditsCost: session.creditsPerMessage,
      };
    }

    return { canSend: true, creditsCost: session.creditsPerMessage };
  }

  /**
   * Process message send (deduct credits if needed)
   */
  static async processMessageSend(
    conversationId: string,
    userId: string,
    messageId: string
  ) {
    const session = await prisma.chatSession.findUnique({
      where: { conversationId },
    });

    if (!session) {
      throw new Error('Chat session not found');
    }

    // Check if coach
    const coach = await prisma.coach.findUnique({
      where: { id: session.coachId },
    });

    if (coach?.userId === userId) {
      // Coach message - no charge, but update session activity
      await prisma.chatSession.update({
        where: { conversationId },
        data: {
          messageCount: { increment: 1 },
          lastActivity: new Date(),
        },
      });
      return { charged: false };
    }

    // Student message
    let creditsCost = 0;

    if (session.type === 'FREE_TIER') {
      if (
        session.freeMessagesLimit !== -1 &&
        session.freeMessagesUsed >= session.freeMessagesLimit
      ) {
        // Exceeded free messages - charge credits
        creditsCost = session.creditsPerMessage;
      } else {
        // Use free message
        await prisma.chatSession.update({
          where: { conversationId },
          data: {
            freeMessagesUsed: { increment: 1 },
            messageCount: { increment: 1 },
            lastActivity: new Date(),
          },
        });
        return { charged: false, freeMessageUsed: true };
      }
    } else if (session.type === 'CREDIT_BASED') {
      creditsCost = session.creditsPerMessage;
    }
    // UNLIMITED type = no charge

    if (creditsCost > 0) {
      // Deduct credits
      await CreditService.spendCredits(
        userId,
        creditsCost,
        'chat',
        messageId,
        'Coach chat message'
      );

      // Update session
      await prisma.chatSession.update({
        where: { conversationId },
        data: {
          totalCreditsSpent: { increment: creditsCost },
          messageCount: { increment: 1 },
          lastActivity: new Date(),
        },
      });

      // Record coach earnings
      await CoachMonetizationService.recordEarning(
        session.coachId,
        creditsCost,
        messageId,
        'chat'
      );

      return { charged: true, creditsCost };
    }

    // Unlimited - no charge
    await prisma.chatSession.update({
      where: { conversationId },
      data: {
        messageCount: { increment: 1 },
        lastActivity: new Date(),
      },
    });

    return { charged: false };
  }

  /**
   * Get chat session status
   */
  static async getSessionStatus(conversationId: string, userId: string) {
    const session = await prisma.chatSession.findUnique({
      where: { conversationId },
    });

    if (!session) {
      return null;
    }

    const isCoach = (
      await prisma.coach.findUnique({
        where: { id: session.coachId },
        select: { userId: true },
      })
    )?.userId === userId;

    return {
      type: session.type,
      creditsPerMessage: session.creditsPerMessage,
      totalCreditsSpent: session.totalCreditsSpent,
      messageCount: session.messageCount,
      isCoach,
      // Only relevant for students
      ...(session.type === 'FREE_TIER' && !isCoach
        ? {
            freeMessagesUsed: session.freeMessagesUsed,
            freeMessagesRemaining:
              session.freeMessagesLimit === -1
                ? 'unlimited'
                : Math.max(0, session.freeMessagesLimit - session.freeMessagesUsed),
          }
        : {}),
    };
  }

  /**
   * Upgrade chat session (when user upgrades membership)
   */
  static async upgradeSession(studentId: string, newTier: MembershipTier) {
    const chatAccess = CHAT_ACCESS_BY_TIER[newTier];

    // Find all sessions for this student
    const sessions = await prisma.chatSession.findMany({
      where: { studentId },
    });

    // Update all sessions
    for (const session of sessions) {
      await prisma.chatSession.update({
        where: { id: session.id },
        data: {
          type: chatAccess.type,
          freeMessagesLimit: chatAccess.freeMessages,
          // Reset free messages used if upgrading to a tier with more free messages
          ...(chatAccess.freeMessages > session.freeMessagesLimit && {
            freeMessagesUsed: 0,
          }),
        },
      });
    }
  }

  /**
   * Get coach's chat statistics
   */
  static async getCoachChatStats(coachId: string) {
    const sessions = await prisma.chatSession.findMany({
      where: { coachId },
    });

    const totalMessages = sessions.reduce((sum, s) => sum + s.messageCount, 0);
    const totalEarnings = sessions.reduce((sum, s) => sum + s.totalCreditsSpent, 0);
    const activeConversations = sessions.filter(
      (s) => s.lastActivity > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalConversations: sessions.length,
      activeConversations,
      totalMessages,
      totalCreditsEarned: totalEarnings,
      averageMessagesPerConversation:
        sessions.length > 0 ? Math.round(totalMessages / sessions.length) : 0,
    };
  }

  /**
   * Check membership tier for chat access
   */
  static async checkChatAccess(userId: string): Promise<{
    hasAccess: boolean;
    tier: MembershipTier;
    freeMessages: number;
    requiresCredits: boolean;
  }> {
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    const tier = membership?.tier || 'FREE';
    const access = CHAT_ACCESS_BY_TIER[tier];

    return {
      hasAccess: access.hasAccess,
      tier,
      freeMessages: access.freeMessages,
      requiresCredits: access.type === 'CREDIT_BASED',
    };
  }
}

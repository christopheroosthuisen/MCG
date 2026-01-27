import prisma from '@/lib/prisma';

export class MessagingService {
  /**
   * Get or create a conversation between two users
   */
  static async getOrCreateConversation(userId1: string, userId2: string) {
    // Sort IDs to ensure consistent lookup
    const participantIds = [userId1, userId2].sort();

    // Look for existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        participantIds: {
          equals: participantIds,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds,
        },
        include: {
          messages: true,
        },
      });
    }

    return conversation;
  }

  /**
   * Get all conversations for a user
   */
  static async getUserConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    // Get participant details
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participantIds.find((id) => id !== userId);
        const otherUser = otherUserId
          ? await prisma.user.findUnique({
              where: { id: otherUserId },
              select: {
                id: true,
                name: true,
                image: true,
                coachProfile: {
                  select: {
                    displayName: true,
                    profileImage: true,
                    isJosephMayo: true,
                  },
                },
              },
            })
          : null;

        // Count unread messages
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        });

        return {
          ...conv,
          otherUser,
          unreadCount,
        };
      })
    );

    return enrichedConversations;
  }

  /**
   * Get messages in a conversation
   */
  static async getConversationMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    before?: string
  ) {
    // Verify user is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation?.participantIds.includes(userId)) {
      throw new Error('Not authorized to view this conversation');
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(before && {
          createdAt: {
            lt: new Date(before),
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return messages.reverse(); // Return in chronological order
  }

  /**
   * Send a message
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    attachment?: {
      url: string;
      type: string;
    }
  ) {
    // Verify sender is part of conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation?.participantIds.includes(senderId)) {
      throw new Error('Not authorized to send message in this conversation');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
      },
    });

    // Create notification for recipient
    const recipientId = conversation.participantIds.find(
      (id) => id !== senderId
    );
    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'NEW_MESSAGE',
          title: 'New Message',
          body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          data: { conversationId, messageId: message.id },
        },
      });
    }

    return message;
  }

  /**
   * Start a conversation with a coach
   */
  static async startCoachConversation(
    studentId: string,
    coachId: string,
    initialMessage: string
  ) {
    // Get coach's user ID
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      throw new Error('Coach not found');
    }

    // Check if student has access to coaching chat (Pro tier or above)
    const membership = await prisma.membership.findUnique({
      where: { userId: studentId },
    });

    const hasAccess = membership &&
      ['PRO', 'ELITE', 'LIFETIME'].includes(membership.tier);

    if (!hasAccess) {
      throw new Error(
        'Upgrade to Pro or higher to access coach messaging'
      );
    }

    // Get or create conversation
    const conversation = await this.getOrCreateConversation(
      studentId,
      coach.userId
    );

    // Send initial message if provided
    if (initialMessage) {
      await this.sendMessage(conversation.id, studentId, initialMessage);
    }

    return conversation;
  }

  /**
   * Get unread message count for a user
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      select: { id: true },
    });

    const count = await prisma.message.count({
      where: {
        conversationId: {
          in: conversations.map((c) => c.id),
        },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Mark all messages in a conversation as read
   */
  static async markConversationRead(conversationId: string, userId: string) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Delete a conversation (soft delete - just for the user)
   * Note: In a real implementation, you'd want a join table
   * to track which users have "deleted" the conversation
   */
  static async deleteConversation(conversationId: string, userId: string) {
    // For now, just verify access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation?.participantIds.includes(userId)) {
      throw new Error('Not authorized');
    }

    // In a real implementation, you'd mark this as deleted for the user
    // For now, we'll leave the conversation intact
    return { success: true };
  }
}

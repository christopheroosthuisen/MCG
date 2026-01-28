import {
  CommunityContentType,
  ContentVisibility,
  MembershipTier,
} from '@prisma/client';
import prisma from '@/lib/prisma';
import { CreditService } from './credit.service';
import { CoachMonetizationService } from './coach-monetization.service';

export class CommunityContentService {
  // ============================================
  // CONTENT CREATION
  // ============================================

  /**
   * Create community content from a completed review (Cameo-style)
   */
  static async createFromReview(
    reviewId: string,
    coachId: string,
    data: {
      title: string;
      description?: string;
      visibility: ContentVisibility;
      requiredTier?: MembershipTier;
      priceCredits?: number;
      tags?: string[];
    }
  ) {
    const review = await prisma.swingReview.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.coachId !== coachId) {
      throw new Error('Review not found or not authorized');
    }

    if (review.status !== 'COMPLETED') {
      throw new Error('Can only share completed reviews');
    }

    if (!review.allowPublicShare) {
      throw new Error('Student has not consented to public sharing');
    }

    // Create community content
    const content = await prisma.communityContent.create({
      data: {
        coachId,
        type: 'PUBLIC_REVIEW',
        visibility: data.visibility,
        requiredTier: data.requiredTier,
        title: data.title,
        description: data.description,
        videoUrl: review.reviewVideoUrl || review.videoUrl,
        thumbnailUrl: review.videoThumbnail,
        duration: review.videoDuration,
        originalReviewId: reviewId,
        studentConsent: true,
        priceCredits: data.priceCredits,
        isPurchasable: !!data.priceCredits && data.priceCredits > 0,
        tags: data.tags || [],
        publishedAt: new Date(),
      },
    });

    return content;
  }

  /**
   * Create original content (tip, drill, analysis, Q&A)
   */
  static async createContent(
    coachId: string,
    data: {
      type: CommunityContentType;
      title: string;
      description?: string;
      videoUrl: string;
      thumbnailUrl?: string;
      duration?: number;
      visibility: ContentVisibility;
      requiredTier?: MembershipTier;
      priceCredits?: number;
      tags?: string[];
      publishNow?: boolean;
    }
  ) {
    // Verify coach can create content (Professional+ tier)
    const subscription = await prisma.coachSubscription.findUnique({
      where: { coachId },
    });

    if (!subscription || subscription.tier === 'STARTER') {
      throw new Error('Professional tier or higher required to create content');
    }

    const content = await prisma.communityContent.create({
      data: {
        coachId,
        type: data.type,
        visibility: data.visibility,
        requiredTier: data.requiredTier,
        title: data.title,
        description: data.description,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        duration: data.duration,
        priceCredits: data.priceCredits,
        isPurchasable: !!data.priceCredits && data.priceCredits > 0,
        tags: data.tags || [],
        publishedAt: data.publishNow ? new Date() : null,
      },
    });

    return content;
  }

  /**
   * Update content
   */
  static async updateContent(
    contentId: string,
    coachId: string,
    data: Partial<{
      title: string;
      description: string;
      visibility: ContentVisibility;
      requiredTier: MembershipTier;
      priceCredits: number;
      tags: string[];
    }>
  ) {
    const content = await prisma.communityContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.coachId !== coachId) {
      throw new Error('Content not found or not authorized');
    }

    return prisma.communityContent.update({
      where: { id: contentId },
      data: {
        ...data,
        isPurchasable: data.priceCredits ? data.priceCredits > 0 : content.isPurchasable,
      },
    });
  }

  /**
   * Publish/unpublish content
   */
  static async setPublishStatus(contentId: string, coachId: string, publish: boolean) {
    const content = await prisma.communityContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.coachId !== coachId) {
      throw new Error('Content not found or not authorized');
    }

    return prisma.communityContent.update({
      where: { id: contentId },
      data: {
        publishedAt: publish ? new Date() : null,
      },
    });
  }

  /**
   * Delete content
   */
  static async deleteContent(contentId: string, coachId: string) {
    const content = await prisma.communityContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.coachId !== coachId) {
      throw new Error('Content not found or not authorized');
    }

    await prisma.communityContent.delete({
      where: { id: contentId },
    });
  }

  // ============================================
  // CONTENT DISCOVERY
  // ============================================

  /**
   * Get feed of community content
   */
  static async getFeed(
    userId: string,
    options?: {
      type?: CommunityContentType;
      coachId?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    }
  ) {
    const { type, coachId, tags, limit = 20, offset = 0 } = options || {};

    // Get user's membership tier
    const membership = await prisma.membership.findUnique({
      where: { userId },
    });

    const userTier = membership?.tier || 'FREE';

    // Determine visible tiers
    const tierHierarchy: MembershipTier[] = ['FREE', 'STARTER', 'PRO', 'ELITE', 'LIFETIME'];
    const userTierIndex = tierHierarchy.indexOf(userTier);
    const visibleTiers = tierHierarchy.slice(0, userTierIndex + 1);

    // Get user's purchases
    const purchases = await prisma.contentPurchase.findMany({
      where: { userId },
      select: { contentId: true },
    });
    const purchasedIds = purchases.map((p) => p.contentId);

    // Build query
    const content = await prisma.communityContent.findMany({
      where: {
        publishedAt: { not: null },
        ...(type && { type }),
        ...(coachId && { coachId }),
        ...(tags?.length && { tags: { hasSome: tags } }),
        OR: [
          { visibility: 'PUBLIC' },
          { visibility: 'MEMBERS_ONLY', NOT: { requiredTier: null } },
          {
            visibility: 'TIER_RESTRICTED',
            requiredTier: { in: visibleTiers },
          },
          {
            visibility: 'PURCHASERS_ONLY',
            id: { in: purchasedIds },
          },
        ],
      },
      include: {
        coach: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            isJosephMayo: true,
            averageRating: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            purchases: true,
          },
        },
      },
      orderBy: [
        { isFeartured: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    // Mark which content user has access to
    return content.map((item) => ({
      ...item,
      hasAccess: this.checkAccess(item, userTier, purchasedIds),
      hasPurchased: purchasedIds.includes(item.id),
    }));
  }

  /**
   * Check if user has access to content
   */
  private static checkAccess(
    content: any,
    userTier: MembershipTier,
    purchasedIds: string[]
  ): boolean {
    if (content.visibility === 'PUBLIC') return true;

    if (content.visibility === 'MEMBERS_ONLY') {
      return userTier !== 'FREE';
    }

    if (content.visibility === 'TIER_RESTRICTED') {
      const tierHierarchy: MembershipTier[] = ['FREE', 'STARTER', 'PRO', 'ELITE', 'LIFETIME'];
      const userIndex = tierHierarchy.indexOf(userTier);
      const requiredIndex = tierHierarchy.indexOf(content.requiredTier);
      return userIndex >= requiredIndex;
    }

    if (content.visibility === 'PURCHASERS_ONLY') {
      return purchasedIds.includes(content.id);
    }

    return false;
  }

  /**
   * Get single content item
   */
  static async getContent(contentId: string, userId?: string) {
    const content = await prisma.communityContent.findUnique({
      where: { id: contentId },
      include: {
        coach: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            bio: true,
            isJosephMayo: true,
            averageRating: true,
            totalReviews: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            purchases: true,
          },
        },
      },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // Increment view count
    await prisma.communityContent.update({
      where: { id: contentId },
      data: { viewCount: { increment: 1 } },
    });

    // Update coach analytics
    await this.updateCoachContentViews(content.coachId);

    // Check user access
    let hasAccess = content.visibility === 'PUBLIC';
    let hasPurchased = false;
    let hasLiked = false;

    if (userId) {
      const [membership, purchase, like] = await Promise.all([
        prisma.membership.findUnique({ where: { userId } }),
        prisma.contentPurchase.findUnique({
          where: { contentId_userId: { contentId, userId } },
        }),
        prisma.contentLike.findUnique({
          where: { contentId_userId: { contentId, userId } },
        }),
      ]);

      hasPurchased = !!purchase;
      hasLiked = !!like;

      const userTier = membership?.tier || 'FREE';
      hasAccess = this.checkAccess(
        content,
        userTier,
        hasPurchased ? [contentId] : []
      );
    }

    return {
      ...content,
      hasAccess,
      hasPurchased,
      hasLiked,
    };
  }

  /**
   * Update coach content view analytics
   */
  private static async updateCoachContentViews(coachId: string) {
    await prisma.coach.update({
      where: { id: coachId },
      data: { totalContentViews: { increment: 1 } },
    });
  }

  /**
   * Get coach's content
   */
  static async getCoachContent(
    coachId: string,
    options?: {
      published?: boolean;
      limit?: number;
      offset?: number;
    }
  ) {
    const { published, limit = 20, offset = 0 } = options || {};

    return prisma.communityContent.findMany({
      where: {
        coachId,
        ...(published !== undefined && {
          publishedAt: published ? { not: null } : null,
        }),
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  // ============================================
  // PURCHASES
  // ============================================

  /**
   * Purchase content
   */
  static async purchaseContent(contentId: string, userId: string) {
    const content = await prisma.communityContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    if (!content.isPurchasable || !content.priceCredits) {
      throw new Error('Content is not for sale');
    }

    // Check if already purchased
    const existing = await prisma.contentPurchase.findUnique({
      where: { contentId_userId: { contentId, userId } },
    });

    if (existing) {
      throw new Error('Already purchased');
    }

    // Check credits
    const canAfford = await CreditService.hasEnoughCredits(userId, content.priceCredits);
    if (!canAfford) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await CreditService.spendCredits(
      userId,
      content.priceCredits,
      'content',
      contentId,
      `Purchased: ${content.title}`
    );

    // Create purchase record
    await prisma.contentPurchase.create({
      data: {
        contentId,
        userId,
        creditsPaid: content.priceCredits,
      },
    });

    // Update content earnings
    await prisma.communityContent.update({
      where: { id: contentId },
      data: {
        totalEarnings: { increment: content.priceCredits * 100 },
      },
    });

    // Record coach earnings
    await CoachMonetizationService.recordEarning(
      content.coachId,
      content.priceCredits,
      contentId,
      'content'
    );

    return { success: true };
  }

  // ============================================
  // ENGAGEMENT
  // ============================================

  /**
   * Like content
   */
  static async likeContent(contentId: string, userId: string) {
    const existing = await prisma.contentLike.findUnique({
      where: { contentId_userId: { contentId, userId } },
    });

    if (existing) {
      // Unlike
      await prisma.contentLike.delete({
        where: { id: existing.id },
      });

      await prisma.communityContent.update({
        where: { id: contentId },
        data: { likeCount: { decrement: 1 } },
      });

      return { liked: false };
    }

    // Like
    await prisma.contentLike.create({
      data: { contentId, userId },
    });

    await prisma.communityContent.update({
      where: { id: contentId },
      data: { likeCount: { increment: 1 } },
    });

    return { liked: true };
  }

  /**
   * Add comment
   */
  static async addComment(
    contentId: string,
    userId: string,
    text: string,
    parentId?: string
  ) {
    const content = await prisma.communityContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // Check if user is the coach (for marking coach replies)
    const coach = await prisma.coach.findUnique({
      where: { userId },
    });
    const isCoachReply = coach?.id === content.coachId;

    const comment = await prisma.contentComment.create({
      data: {
        contentId,
        userId,
        text,
        parentId,
        isCoachReply,
      },
    });

    await prisma.communityContent.update({
      where: { id: contentId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }

  /**
   * Get comments for content
   */
  static async getComments(
    contentId: string,
    options?: { limit?: number; offset?: number }
  ) {
    const { limit = 50, offset = 0 } = options || {};

    return prisma.contentComment.findMany({
      where: {
        contentId,
        parentId: null, // Top-level comments only
      },
      include: {
        // Get replies
        // Note: This is simplified - in production, use recursive queries or multiple fetches
      },
      orderBy: [
        { isCoachReply: 'desc' }, // Coach replies first
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });
  }

  // ============================================
  // TIPPING
  // ============================================

  /**
   * Tip content creator
   */
  static async tipContent(
    contentId: string,
    userId: string,
    creditAmount: number,
    message?: string,
    isAnonymous: boolean = false
  ) {
    const content = await prisma.communityContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new Error('Content not found');
    }

    // Check credits
    const canAfford = await CreditService.hasEnoughCredits(userId, creditAmount);
    if (!canAfford) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await CreditService.spendCredits(
      userId,
      creditAmount,
      'tip',
      contentId,
      `Tip for: ${content.title}`
    );

    // Create tip record
    await prisma.contentTip.create({
      data: {
        contentId,
        tipperId: userId,
        coachId: content.coachId,
        creditAmount,
        message,
        isAnonymous,
      },
    });

    // Update content earnings
    await prisma.communityContent.update({
      where: { id: contentId },
      data: {
        totalEarnings: { increment: creditAmount * 100 },
      },
    });

    // Record coach earnings
    await CoachMonetizationService.recordEarning(
      content.coachId,
      creditAmount,
      contentId,
      'tip'
    );

    // Notify coach
    if (!isAnonymous) {
      const tipper = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      await prisma.notification.create({
        data: {
          userId: (await prisma.coach.findUnique({
            where: { id: content.coachId },
            select: { userId: true },
          }))!.userId,
          type: 'CREDITS_RECEIVED',
          title: 'You received a tip!',
          body: `${tipper?.name || 'Someone'} tipped you ${creditAmount} credits${message ? `: "${message}"` : ''}`,
          data: { contentId, creditAmount },
        },
      });
    }

    return { success: true };
  }

  /**
   * Tip coach directly
   */
  static async tipCoach(
    coachId: string,
    userId: string,
    creditAmount: number,
    message?: string,
    isAnonymous: boolean = false,
    context?: string,
    referenceId?: string
  ) {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      throw new Error('Coach not found');
    }

    // Check credits
    const canAfford = await CreditService.hasEnoughCredits(userId, creditAmount);
    if (!canAfford) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await CreditService.spendCredits(
      userId,
      creditAmount,
      'tip',
      coachId,
      `Tip for coach: ${coach.displayName}`
    );

    // Create tip record
    await prisma.coachTip.create({
      data: {
        coachId,
        tipperId: userId,
        creditAmount,
        message,
        isAnonymous,
        context,
        referenceId,
      },
    });

    // Record coach earnings
    await CoachMonetizationService.recordEarning(
      coachId,
      creditAmount,
      `tip-${Date.now()}`,
      'tip'
    );

    // Notify coach
    await prisma.notification.create({
      data: {
        userId: coach.userId,
        type: 'CREDITS_RECEIVED',
        title: 'You received a tip!',
        body: isAnonymous
          ? `Someone tipped you ${creditAmount} credits!`
          : `You received a ${creditAmount} credit tip${message ? `: "${message}"` : ''}`,
        data: { creditAmount, context },
      },
    });

    return { success: true };
  }

  // ============================================
  // STUDENT CONSENT
  // ============================================

  /**
   * Request consent from student to share review
   */
  static async requestShareConsent(reviewId: string, coachId: string) {
    const review = await prisma.swingReview.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.coachId !== coachId) {
      throw new Error('Review not found or not authorized');
    }

    if (review.status !== 'COMPLETED') {
      throw new Error('Review must be completed first');
    }

    // Notify student
    await prisma.notification.create({
      data: {
        userId: review.studentId,
        type: 'SYSTEM',
        title: 'Share your swing review?',
        body: 'Your coach would like to share your swing review with the community. This helps other golfers learn!',
        data: { reviewId, action: 'consent_request' },
      },
    });

    return { requested: true };
  }

  /**
   * Grant consent to share review
   */
  static async grantShareConsent(reviewId: string, studentId: string) {
    const review = await prisma.swingReview.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.studentId !== studentId) {
      throw new Error('Review not found or not authorized');
    }

    await prisma.swingReview.update({
      where: { id: reviewId },
      data: {
        allowPublicShare: true,
        publicShareConsent: new Date(),
      },
    });

    // Notify coach
    if (review.coachId) {
      const coach = await prisma.coach.findUnique({
        where: { id: review.coachId },
      });

      if (coach) {
        await prisma.notification.create({
          data: {
            userId: coach.userId,
            type: 'SYSTEM',
            title: 'Consent granted!',
            body: 'A student has allowed you to share their swing review with the community.',
            data: { reviewId },
          },
        });
      }
    }

    return { granted: true };
  }

  /**
   * Revoke consent to share review
   */
  static async revokeShareConsent(reviewId: string, studentId: string) {
    const review = await prisma.swingReview.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.studentId !== studentId) {
      throw new Error('Review not found or not authorized');
    }

    // Update review
    await prisma.swingReview.update({
      where: { id: reviewId },
      data: {
        allowPublicShare: false,
      },
    });

    // Unpublish any community content from this review
    await prisma.communityContent.updateMany({
      where: { originalReviewId: reviewId },
      data: { publishedAt: null },
    });

    return { revoked: true };
  }
}

import { ProductType } from '@prisma/client';
import prisma from '@/lib/prisma';
import { CreditService } from './credit.service';
import { CoachMonetizationService } from './coach-monetization.service';

export class MarketplaceService {
  // ============================================
  // PRODUCT MANAGEMENT (COACH)
  // ============================================

  /**
   * Create a product
   */
  static async createProduct(
    coachId: string,
    data: {
      type: ProductType;
      name: string;
      slug: string;
      description: string;
      shortDescription?: string;
      priceCredits: number;
      coverImageUrl?: string;
      previewVideoUrl?: string;
      contentUrls: string[];
      downloadable?: boolean;
    }
  ) {
    // Check product limit based on tier
    const subscription = await prisma.coachSubscription.findUnique({
      where: { coachId },
    });

    const tier = subscription?.tier || 'STARTER';
    const maxProducts = tier === 'STARTER' ? 3 : -1; // -1 = unlimited

    if (maxProducts > 0) {
      const productCount = await prisma.coachProduct.count({
        where: { coachId },
      });

      if (productCount >= maxProducts) {
        throw new Error(
          `Maximum ${maxProducts} products allowed on ${tier} tier. Upgrade to create more.`
        );
      }
    }

    // Check for duplicate slug
    const existingSlug = await prisma.coachProduct.findUnique({
      where: { coachId_slug: { coachId, slug: data.slug } },
    });

    if (existingSlug) {
      throw new Error('A product with this slug already exists');
    }

    return prisma.coachProduct.create({
      data: {
        coachId,
        type: data.type,
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        priceCredits: data.priceCredits,
        coverImageUrl: data.coverImageUrl,
        previewVideoUrl: data.previewVideoUrl,
        contentUrls: data.contentUrls,
        downloadable: data.downloadable || false,
        isPublished: false,
      },
    });
  }

  /**
   * Update product
   */
  static async updateProduct(
    productId: string,
    coachId: string,
    data: Partial<{
      name: string;
      description: string;
      shortDescription: string;
      priceCredits: number;
      originalPrice: number;
      isOnSale: boolean;
      coverImageUrl: string;
      previewVideoUrl: string;
      contentUrls: string[];
      downloadable: boolean;
    }>
  ) {
    const product = await prisma.coachProduct.findUnique({
      where: { id: productId },
    });

    if (!product || product.coachId !== coachId) {
      throw new Error('Product not found or not authorized');
    }

    return prisma.coachProduct.update({
      where: { id: productId },
      data,
    });
  }

  /**
   * Publish/unpublish product
   */
  static async setPublishStatus(
    productId: string,
    coachId: string,
    publish: boolean
  ) {
    const product = await prisma.coachProduct.findUnique({
      where: { id: productId },
    });

    if (!product || product.coachId !== coachId) {
      throw new Error('Product not found or not authorized');
    }

    // Validate before publishing
    if (publish) {
      if (!product.coverImageUrl) {
        throw new Error('Product must have a cover image');
      }
      if (product.contentUrls.length === 0) {
        throw new Error('Product must have content');
      }
    }

    return prisma.coachProduct.update({
      where: { id: productId },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });
  }

  /**
   * Delete product
   */
  static async deleteProduct(productId: string, coachId: string) {
    const product = await prisma.coachProduct.findUnique({
      where: { id: productId },
      include: { _count: { select: { purchases: true } } },
    });

    if (!product || product.coachId !== coachId) {
      throw new Error('Product not found or not authorized');
    }

    if (product._count.purchases > 0) {
      // Soft delete - unpublish instead
      await prisma.coachProduct.update({
        where: { id: productId },
        data: { isPublished: false },
      });
      throw new Error(
        'Product has purchases and cannot be deleted. It has been unpublished instead.'
      );
    }

    await prisma.coachProduct.delete({
      where: { id: productId },
    });
  }

  // ============================================
  // PRODUCT DISCOVERY
  // ============================================

  /**
   * Get marketplace products
   */
  static async getProducts(options?: {
    type?: ProductType;
    coachId?: string;
    featured?: boolean;
    onSale?: boolean;
    minRating?: number;
    sortBy?: 'newest' | 'popular' | 'rating' | 'price';
    limit?: number;
    offset?: number;
  }) {
    const {
      type,
      coachId,
      featured,
      onSale,
      minRating,
      sortBy = 'newest',
      limit = 20,
      offset = 0,
    } = options || {};

    const orderBy: any = {
      newest: { publishedAt: 'desc' },
      popular: { purchaseCount: 'desc' },
      rating: { averageRating: 'desc' },
      price: { priceCredits: 'asc' },
    }[sortBy];

    return prisma.coachProduct.findMany({
      where: {
        isPublished: true,
        ...(type && { type }),
        ...(coachId && { coachId }),
        ...(featured && { isFeatured: true }),
        ...(onSale && { isOnSale: true }),
        ...(minRating && { averageRating: { gte: minRating } }),
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
          select: { reviews: true },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get product details
   */
  static async getProductDetails(
    productIdOrSlug: string,
    coachId?: string,
    userId?: string
  ) {
    const product = await prisma.coachProduct.findFirst({
      where: {
        OR: [
          { id: productIdOrSlug },
          coachId
            ? { slug: productIdOrSlug, coachId }
            : { slug: productIdOrSlug },
        ],
        isPublished: true,
      },
      include: {
        coach: {
          select: {
            id: true,
            displayName: true,
            profileImage: true,
            bio: true,
            averageRating: true,
            totalReviews: true,
            isJosephMayo: true,
          },
        },
        reviews: {
          where: { isVerified: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    let hasPurchased = false;
    if (userId) {
      const purchase = await prisma.productPurchase.findUnique({
        where: { productId_userId: { productId: product.id, userId } },
      });
      hasPurchased = !!purchase;
    }

    // Calculate effective price
    const effectivePrice = product.isOnSale && product.originalPrice
      ? product.priceCredits
      : product.priceCredits;
    const discount = product.isOnSale && product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.priceCredits) / product.originalPrice) * 100
        )
      : 0;

    return {
      ...product,
      hasPurchased,
      effectivePrice,
      discount,
      // Only include content URLs if purchased
      contentUrls: hasPurchased ? product.contentUrls : [],
    };
  }

  /**
   * Get coach's products
   */
  static async getCoachProducts(
    coachId: string,
    options?: {
      published?: boolean;
      limit?: number;
      offset?: number;
    }
  ) {
    const { published, limit = 20, offset = 0 } = options || {};

    return prisma.coachProduct.findMany({
      where: {
        coachId,
        ...(published !== undefined && { isPublished: published }),
      },
      include: {
        _count: {
          select: { purchases: true, reviews: true },
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
   * Purchase product
   */
  static async purchaseProduct(productId: string, userId: string) {
    const product = await prisma.coachProduct.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isPublished) {
      throw new Error('Product not found');
    }

    // Check if already purchased
    const existing = await prisma.productPurchase.findUnique({
      where: { productId_userId: { productId, userId } },
    });

    if (existing) {
      throw new Error('Already purchased');
    }

    // Check credits
    const canAfford = await CreditService.hasEnoughCredits(
      userId,
      product.priceCredits
    );
    if (!canAfford) {
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    await CreditService.spendCredits(
      userId,
      product.priceCredits,
      'product',
      productId,
      `Purchased: ${product.name}`
    );

    // Create purchase record
    await prisma.productPurchase.create({
      data: {
        productId,
        userId,
        creditsPaid: product.priceCredits,
      },
    });

    // Update product stats
    await prisma.coachProduct.update({
      where: { id: productId },
      data: {
        purchaseCount: { increment: 1 },
        totalRevenue: { increment: product.priceCredits * 100 },
      },
    });

    // Record coach earnings
    await CoachMonetizationService.recordEarning(
      product.coachId,
      product.priceCredits,
      productId,
      'product'
    );

    return {
      success: true,
      contentUrls: product.contentUrls,
      downloadable: product.downloadable,
    };
  }

  /**
   * Get user's purchased products
   */
  static async getUserPurchases(userId: string) {
    const purchases = await prisma.productPurchase.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            coach: {
              select: {
                displayName: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    return purchases.map((p) => ({
      ...p,
      product: {
        ...p.product,
        // Include content URLs for purchased products
      },
    }));
  }

  // ============================================
  // REVIEWS
  // ============================================

  /**
   * Add product review
   */
  static async addReview(
    productId: string,
    userId: string,
    rating: number,
    title?: string,
    content?: string
  ) {
    // Verify purchase
    const purchase = await prisma.productPurchase.findUnique({
      where: { productId_userId: { productId, userId } },
    });

    if (!purchase) {
      throw new Error('Must purchase product to review');
    }

    // Check for existing review
    const existing = await prisma.productReview.findUnique({
      where: { productId_userId: { productId, userId } },
    });

    if (existing) {
      // Update existing review
      return prisma.productReview.update({
        where: { id: existing.id },
        data: { rating, title, content },
      });
    }

    // Create review
    const review = await prisma.productReview.create({
      data: {
        productId,
        userId,
        rating,
        title,
        content,
        isVerified: true,
      },
    });

    // Update product stats
    const allReviews = await prisma.productReview.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.coachProduct.update({
      where: { id: productId },
      data: {
        averageRating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    return review;
  }

  /**
   * Get product reviews
   */
  static async getProductReviews(
    productId: string,
    options?: { limit?: number; offset?: number }
  ) {
    const { limit = 20, offset = 0 } = options || {};

    return prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Get product analytics for coach
   */
  static async getProductAnalytics(coachId: string) {
    const products = await prisma.coachProduct.findMany({
      where: { coachId },
      include: {
        _count: {
          select: { purchases: true, reviews: true },
        },
      },
    });

    const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalPurchases = products.reduce((sum, p) => sum + p.purchaseCount, 0);
    const avgRating =
      products.filter((p) => p.averageRating > 0).length > 0
        ? products.reduce((sum, p) => sum + p.averageRating, 0) /
          products.filter((p) => p.averageRating > 0).length
        : 0;

    // Get recent sales
    const recentSales = await prisma.productPurchase.findMany({
      where: {
        product: { coachId },
      },
      include: {
        product: {
          select: { name: true, priceCredits: true },
        },
      },
      orderBy: { purchasedAt: 'desc' },
      take: 10,
    });

    // Get top products
    const topProducts = [...products]
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return {
      totalProducts: products.length,
      publishedProducts: products.filter((p) => p.isPublished).length,
      totalRevenue,
      totalPurchases,
      averageRating: avgRating,
      recentSales,
      topProducts,
    };
  }
}

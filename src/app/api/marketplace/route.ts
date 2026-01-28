import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MarketplaceService } from '@/services';
import prisma from '@/lib/prisma';

// GET /api/marketplace - Get marketplace products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as any;
    const coachId = searchParams.get('coachId') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const onSale = searchParams.get('onSale') === 'true';
    const minRating = searchParams.get('minRating')
      ? parseFloat(searchParams.get('minRating')!)
      : undefined;
    const sortBy = (searchParams.get('sortBy') as any) || 'newest';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const products = await MarketplaceService.getProducts({
      type,
      coachId,
      featured: featured || undefined,
      onSale: onSale || undefined,
      minRating,
      sortBy,
      limit,
      offset,
    });

    return NextResponse.json({ products, hasMore: products.length === limit });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/marketplace - Create product (coach only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const coach = await prisma.coach.findUnique({ where: { userId } });

    if (!coach) {
      return NextResponse.json({ error: 'Coach profile required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      type,
      name,
      slug,
      description,
      shortDescription,
      priceCredits,
      coverImageUrl,
      previewVideoUrl,
      contentUrls,
      downloadable,
    } = body;

    const product = await MarketplaceService.createProduct(coach.id, {
      type,
      name,
      slug,
      description,
      shortDescription,
      priceCredits,
      coverImageUrl,
      previewVideoUrl,
      contentUrls,
      downloadable,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

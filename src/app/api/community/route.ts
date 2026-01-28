import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CommunityContentService } from '@/services';
import prisma from '@/lib/prisma';

// GET /api/community - Get community content feed
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = session?.user ? (session.user as any).id : undefined;

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as any;
    const coachId = searchParams.get('coachId') || undefined;
    const tags = searchParams.get('tags')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const content = await CommunityContentService.getFeed(userId || '', {
      type,
      coachId,
      tags,
      limit,
      offset,
    });

    return NextResponse.json({ content, hasMore: content.length === limit });
  } catch (error: any) {
    console.error('Error fetching community content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/community - Create community content
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
    const { type, title, description, videoUrl, thumbnailUrl, duration, visibility, requiredTier, priceCredits, tags, publishNow } = body;

    const content = await CommunityContentService.createContent(coach.id, {
      type,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      visibility,
      requiredTier,
      priceCredits,
      tags,
      publishNow,
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error: any) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

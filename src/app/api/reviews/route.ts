import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachingService } from '@/services/coaching.service';
import { ReviewType } from '@prisma/client';

// GET /api/reviews - Get user's swing reviews
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    const reviews = await CoachingService.getStudentReviews(
      userId,
      status as any,
      limit
    );

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a new swing review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const {
      videoUrl,
      videoThumbnail,
      videoDuration,
      clubUsed,
      shotType,
      additionalNotes,
      reviewType,
      preferredCoachId,
    } = body;

    if (!videoUrl || !reviewType) {
      return NextResponse.json(
        { error: 'Video URL and review type are required' },
        { status: 400 }
      );
    }

    if (!Object.values(ReviewType).includes(reviewType)) {
      return NextResponse.json(
        { error: 'Invalid review type' },
        { status: 400 }
      );
    }

    const review = await CoachingService.submitSwingReview(userId, {
      videoUrl,
      videoThumbnail,
      videoDuration,
      clubUsed,
      shotType,
      additionalNotes,
      reviewType,
      preferredCoachId,
    });

    return NextResponse.json({
      review,
      message: 'Swing review submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

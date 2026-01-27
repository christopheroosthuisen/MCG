import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachingService } from '@/services/coaching.service';
import prisma from '@/lib/prisma';

// POST /api/reviews/[reviewId]/complete - Complete a review (coach action)
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Get coach profile for this user
    const coach = await CoachingService.getCoachByUserId(userId);

    if (!coach) {
      return NextResponse.json(
        { error: 'Not authorized - coach profile required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reviewVideoUrl, reviewNotes, drillsRecommended } = body;

    if (!reviewNotes) {
      return NextResponse.json(
        { error: 'Review notes are required' },
        { status: 400 }
      );
    }

    const review = await CoachingService.completeSwingReview(
      params.reviewId,
      coach.id,
      {
        reviewVideoUrl,
        reviewNotes,
        drillsRecommended: drillsRecommended || [],
      }
    );

    return NextResponse.json({
      review,
      message: 'Review completed successfully',
    });
  } catch (error: any) {
    console.error('Error completing review:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

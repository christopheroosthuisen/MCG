import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachingService } from '@/services/coaching.service';

// POST /api/reviews/[reviewId]/rate - Rate a completed review
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
    const body = await request.json();
    const { rating, feedback } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await CoachingService.rateReview(
      params.reviewId,
      userId,
      rating,
      feedback
    );

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (error: any) {
    console.error('Error rating review:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachingService } from '@/services/coaching.service';

// POST /api/lessons/[lessonId]/cancel - Cancel a lesson
export async function POST(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
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

    await CoachingService.cancelLesson(params.lessonId, userId);

    return NextResponse.json({
      success: true,
      message: 'Lesson cancelled. Credits have been refunded.',
    });
  } catch (error: any) {
    console.error('Error cancelling lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

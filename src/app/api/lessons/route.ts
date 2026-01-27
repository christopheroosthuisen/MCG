import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachingService } from '@/services/coaching.service';
import { LessonType } from '@prisma/client';

// GET /api/lessons - Get user's lessons
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
    const role = (searchParams.get('role') as 'student' | 'coach') || 'student';

    const lessons = await CoachingService.getUpcomingLessons(userId, role);

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/lessons - Book a new lesson
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

    const { coachId, lessonType, scheduledAt, timezone, studentGoals } = body;

    if (!coachId || !lessonType || !scheduledAt || !timezone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Object.values(LessonType).includes(lessonType)) {
      return NextResponse.json(
        { error: 'Invalid lesson type' },
        { status: 400 }
      );
    }

    const lesson = await CoachingService.bookLesson(userId, {
      coachId,
      lessonType,
      scheduledAt: new Date(scheduledAt),
      timezone,
      studentGoals,
    });

    return NextResponse.json({
      lesson,
      message: 'Lesson booked successfully',
    });
  } catch (error: any) {
    console.error('Error booking lesson:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

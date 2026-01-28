import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GroupLessonsService } from '@/services';
import prisma from '@/lib/prisma';

// GET /api/group-lessons - Get upcoming group lessons
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const coachId = searchParams.get('coachId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const lessons = await GroupLessonsService.getUpcomingLessons({
      coachId,
      limit,
      offset,
    });

    return NextResponse.json({ lessons, hasMore: lessons.length === limit });
  } catch (error: any) {
    console.error('Error fetching group lessons:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/group-lessons - Create group lesson (coach only)
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
      title,
      description,
      scheduledAt,
      duration,
      timezone,
      maxParticipants,
      minParticipants,
      priceCredits,
      earlyBirdCredits,
      earlyBirdUntil,
      isRecorded,
    } = body;

    const lesson = await GroupLessonsService.createGroupLesson(coach.id, {
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      duration,
      timezone,
      maxParticipants,
      minParticipants,
      priceCredits,
      earlyBirdCredits,
      earlyBirdUntil: earlyBirdUntil ? new Date(earlyBirdUntil) : undefined,
      isRecorded,
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error: any) {
    console.error('Error creating group lesson:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { CoachingService } from '@/services/coaching.service';

// GET /api/coaches/[coachId] - Get coach profile
export async function GET(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const coach = await CoachingService.getCoachProfile(params.coachId);

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ coach });
  } catch (error) {
    console.error('Error fetching coach:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

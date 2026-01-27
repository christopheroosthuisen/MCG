import { NextRequest, NextResponse } from 'next/server';
import { CoachingService } from '@/services/coaching.service';

// GET /api/coaches/[coachId]/availability - Get available booking slots
export async function GET(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = new Date(searchParams.get('startDate') || Date.now());
    const endDate = new Date(
      searchParams.get('endDate') ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks
    );
    const duration = parseInt(searchParams.get('duration') || '30');

    const slots = await CoachingService.getAvailableSlots(
      params.coachId,
      startDate,
      endDate,
      duration
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

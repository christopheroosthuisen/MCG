import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachingService } from '@/services/coaching.service';

// GET /api/coaches - Get list of active coaches
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const specialty = searchParams.get('specialty') || undefined;
    const sortBy = (searchParams.get('sortBy') as 'rating' | 'reviews' | 'responseTime') || 'rating';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const coaches = await CoachingService.getActiveCoaches({
      specialty,
      sortBy,
      limit,
      offset,
    });

    return NextResponse.json({
      coaches,
      hasMore: coaches.length === limit,
    });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/coaches - Apply to become a coach
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
      displayName,
      bio,
      certifications,
      specialties,
      yearsExperience,
      timezone,
    } = body;

    if (!displayName || !certifications || !specialties) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const coach = await CoachingService.createCoachProfile(userId, {
      displayName,
      bio,
      certifications,
      specialties,
      yearsExperience: yearsExperience || 0,
      timezone,
    });

    return NextResponse.json({
      coach,
      message: 'Application submitted. Pending approval.',
    });
  } catch (error: any) {
    console.error('Error creating coach profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachMonetizationService } from '@/services';
import prisma from '@/lib/prisma';

// GET /api/coach/earnings - Get earnings summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const coach = await prisma.coach.findUnique({ where: { userId } });

    if (!coach) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const earnings = await CoachMonetizationService.getEarningsSummary(coach.id);

    return NextResponse.json(earnings);
  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

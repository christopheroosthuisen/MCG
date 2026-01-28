import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachMonetizationService } from '@/services';
import prisma from '@/lib/prisma';

// GET /api/coach/payouts - Get payout history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const coach = await prisma.coach.findUnique({
      where: { userId },
      include: { payoutMethod: true },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const payouts = await CoachMonetizationService.getPayoutHistory(coach.id);

    return NextResponse.json({
      payouts,
      payoutMethod: coach.payoutMethod,
      pendingEarnings: coach.pendingEarnings,
      lifetimeEarnings: coach.lifetimeEarnings,
    });
  } catch (error: any) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/coach/payouts - Request payout
export async function POST(request: NextRequest) {
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

    const payout = await CoachMonetizationService.createPayout(coach.id);

    return NextResponse.json(payout, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

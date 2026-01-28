import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachReferralService } from '@/services';
import prisma from '@/lib/prisma';

// GET /api/coach/referrals - Get referral stats and links
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

    const [stats, links] = await Promise.all([
      CoachReferralService.getReferralStats(coach.id),
      CoachReferralService.getReferralLinks(coach.id),
    ]);

    return NextResponse.json({ ...stats, ...links });
  } catch (error: any) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/coach/referrals - Apply referral code (for new coaches)
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

    const body = await request.json();
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json({ error: 'referralCode is required' }, { status: 400 });
    }

    const applied = await CoachReferralService.applyCoachReferral(coach.id, referralCode);

    if (!applied) {
      return NextResponse.json(
        { error: 'Invalid referral code or already referred' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: 'Referral applied successfully' });
  } catch (error: any) {
    console.error('Error applying referral:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

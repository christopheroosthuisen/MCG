import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ReferralService } from '@/services/referral.service';

// GET /api/referrals - Get user's referral stats
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

    const stats = await ReferralService.getReferralStats(userId);
    const referralLink = await ReferralService.getReferralLink(userId);

    return NextResponse.json({
      ...stats,
      referralLink,
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/referrals - Apply a referral code
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
    const { referralCode } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const success = await ReferralService.applyReferralCode(userId, referralCode);

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid or already used referral code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Referral code applied! You\'ll both receive bonus credits on your first purchase.',
    });
  } catch (error: any) {
    console.error('Error applying referral code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

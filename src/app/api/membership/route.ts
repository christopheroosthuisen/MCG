import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MembershipService } from '@/services/membership.service';
import { MembershipTier } from '@prisma/client';
import { TIER_FEATURES } from '@/types';

// GET /api/membership - Get current user's membership
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
    const membership = await MembershipService.getMembershipWithUser(userId);

    if (!membership) {
      // Return free tier for new users
      return NextResponse.json({
        tier: 'FREE',
        status: 'ACTIVE',
        features: TIER_FEATURES.FREE,
      });
    }

    return NextResponse.json({
      ...membership,
      features: TIER_FEATURES[membership.tier],
    });
  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/membership - Create checkout session for subscription
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
    const { tier, billingPeriod = 'monthly' } = body;

    if (!tier || !Object.values(MembershipTier).includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }

    const checkoutSession = await MembershipService.createCheckoutSession(
      userId,
      tier as MembershipTier,
      billingPeriod
    );

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

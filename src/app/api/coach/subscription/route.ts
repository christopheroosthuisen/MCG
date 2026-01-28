import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CoachMonetizationService, COACH_TIER_CONFIG } from '@/services';
import prisma from '@/lib/prisma';

// GET /api/coach/subscription - Get coach subscription status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const coach = await prisma.coach.findUnique({
      where: { userId },
      include: { subscription: true },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 404 });
    }

    const subscription = await CoachMonetizationService.getOrCreateSubscription(coach.id);
    const tierConfig = COACH_TIER_CONFIG[subscription.tier];

    return NextResponse.json({
      subscription,
      tierConfig,
      allTiers: Object.entries(COACH_TIER_CONFIG).map(([key, config]) => ({
        tier: key,
        ...config,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching coach subscription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/coach/subscription - Upgrade coach tier
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
    const { tier } = body;

    if (!tier || !COACH_TIER_CONFIG[tier as keyof typeof COACH_TIER_CONFIG]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const checkoutSession = await CoachMonetizationService.createTierCheckoutSession(
      coach.id,
      tier
    );

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/coach/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
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

    await CoachMonetizationService.cancelTierSubscription(coach.id);

    return NextResponse.json({ success: true, message: 'Subscription will be cancelled at period end' });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

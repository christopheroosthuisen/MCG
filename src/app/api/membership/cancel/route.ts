import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MembershipService } from '@/services/membership.service';

// POST /api/membership/cancel - Cancel subscription
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
    const { atPeriodEnd = true } = body;

    await MembershipService.cancelSubscription(userId, atPeriodEnd);

    return NextResponse.json({
      success: true,
      message: atPeriodEnd
        ? 'Subscription will be cancelled at the end of the billing period'
        : 'Subscription cancelled immediately',
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

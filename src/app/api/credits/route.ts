import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CreditService } from '@/services/credit.service';
import { CREDIT_PACKAGES } from '@/types';

// GET /api/credits - Get current user's credit balance
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
    const breakdown = await CreditService.getCreditBreakdown(userId);

    return NextResponse.json({
      ...breakdown,
      packages: CREDIT_PACKAGES,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/credits - Purchase credits
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
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID required' },
        { status: 400 }
      );
    }

    const checkoutSession = await CreditService.createCreditPurchaseSession(
      userId,
      packageId
    );

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error: any) {
    console.error('Error creating credit checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

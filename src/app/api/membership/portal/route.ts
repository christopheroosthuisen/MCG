import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MembershipService } from '@/services/membership.service';

// POST /api/membership/portal - Create Stripe billing portal session
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

    const portalSession = await MembershipService.createPortalSession(userId);

    return NextResponse.json({
      portalUrl: portalSession.url,
    });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

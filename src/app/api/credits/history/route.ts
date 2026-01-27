import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CreditService } from '@/services/credit.service';

// GET /api/credits/history - Get credit transaction history
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
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const transactions = await CreditService.getTransactionHistory(
      userId,
      limit,
      offset
    );

    return NextResponse.json({
      transactions,
      hasMore: transactions.length === limit,
    });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

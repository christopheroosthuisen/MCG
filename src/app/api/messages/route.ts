import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MessagingService } from '@/services/messaging.service';

// GET /api/messages - Get user's conversations
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

    const conversations = await MessagingService.getUserConversations(userId);

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Start a new conversation with a coach
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
    const { coachId, message } = body;

    if (!coachId) {
      return NextResponse.json(
        { error: 'Coach ID is required' },
        { status: 400 }
      );
    }

    const conversation = await MessagingService.startCoachConversation(
      userId,
      coachId,
      message || ''
    );

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

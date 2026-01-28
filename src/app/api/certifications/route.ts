import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CertificationService } from '@/services';
import prisma from '@/lib/prisma';

// GET /api/certifications - Get available certifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = session?.user ? (session.user as any).id : undefined;

    let coachId: string | undefined;
    if (userId) {
      const coach = await prisma.coach.findUnique({ where: { userId } });
      coachId = coach?.id;
    }

    const certifications = await CertificationService.getAvailableCertifications(coachId);

    return NextResponse.json({ certifications });
  } catch (error: any) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/certifications - Submit certification attempt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const coach = await prisma.coach.findUnique({ where: { userId } });

    if (!coach) {
      return NextResponse.json({ error: 'Coach profile required' }, { status: 403 });
    }

    const body = await request.json();
    const { certificationId, submissionUrl } = body;

    if (!certificationId || !submissionUrl) {
      return NextResponse.json(
        { error: 'certificationId and submissionUrl are required' },
        { status: 400 }
      );
    }

    const attempt = await CertificationService.submitAttempt(
      coach.id,
      certificationId,
      submissionUrl
    );

    return NextResponse.json(attempt, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting certification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

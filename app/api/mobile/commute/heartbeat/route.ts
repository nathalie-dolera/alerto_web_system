import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Called by the mobile app when commute monitoring starts and as a heartbeat every 60s while active.
// POST body: { userId: string, active: boolean }
export async function POST(request: NextRequest) {
  try {
    const { userId, active } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: active !== false,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Commute heartbeat error:', error);
    return NextResponse.json({ error: 'Failed to update commute status' }, { status: 500 });
  }
}

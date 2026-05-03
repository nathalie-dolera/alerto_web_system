import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || 'AU';
}

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { anomalyCount: { gt: 0 } },
          { safetyStatus: 'Suspicious' },
          { safetyStatus: 'SOS-Triggered' },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { sosTriggeredAt: 'desc' },
        { suspiciousAt: 'desc' },
        { date: 'desc' },
      ],
      take: 100,
    });

    const alarms = trips.map((trip) => {
      const userName = trip.user?.name || trip.user?.email || 'Alerto User';
      const timeSource = trip.sosTriggeredAt || trip.suspiciousAt || trip.date;
      const status = trip.safetyStatus === 'SOS-Triggered' ? 'Triggered' : 'Pending';

      return {
        id: `AL-${trip.id.slice(-6).toUpperCase()}`,
        tripId: trip.id,
        initials: initialsFromName(userName),
        name: userName,
        location: trip.destinationName,
        triggers: trip.anomalyTriggers,
        time: new Date(timeSource).toLocaleString('en-PH', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        status,
        avatarBg: status === 'Triggered' ? 'bg-red-950' : 'bg-orange-950',
        avatarText: status === 'Triggered' ? 'text-red-300' : 'text-orange-300',
      };
    });

    return NextResponse.json({ alarms });
  } catch (error) {
    console.error('Admin alarms fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch alarms' }, { status: 500 });
  }
}

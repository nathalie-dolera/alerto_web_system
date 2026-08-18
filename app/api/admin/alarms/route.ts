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

const TRIGGER_LABELS: Record<string, string> = {
  IDLE_TIME: 'Idle Time Exceeded',
  OFF_ROUTE: 'Route Deviation',
  MOVEMENT_LOSS: 'Movement Signal Lost',
  congestion: 'Congestion Zone Alert',
  hazard: 'Road Hazard Alert',
  flood: 'Flood Risk Alert',
  accident: 'Traffic Incident Alert',
  SNORING: 'Hazard Alert',
  snoring: 'Hazard Alert',
};

function formatTrigger(raw: string): string {
  return TRIGGER_LABELS[raw] || TRIGGER_LABELS[raw.toLowerCase()] || raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { anomalyCount: { gt: 0 } },
          { alertsTriggeredCount: { gt: 0 } },
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

    const alarms = trips.map((trip, index) => {
      const userName = trip.user?.name || trip.user?.email || 'Alerto User';
      const timeSource = trip.sosTriggeredAt || trip.suspiciousAt || trip.date;

      let status: string;
      if (trip.safetyStatus === 'SOS-Triggered') {
        status = 'Triggered';
      } else if (trip.safetyStatus === 'Suspicious') {
        status = 'Pending';
      } else if (trip.durationMs === 0) {
        status = 'Pending';
      } else {
        status = 'Resolved';
      }

      let rawTriggers = (trip.anomalyTriggers && trip.anomalyTriggers.length > 0)
        ? trip.anomalyTriggers
        : (trip.unsafeZonesEncountered && trip.unsafeZonesEncountered.length > 0)
        ? trip.unsafeZonesEncountered
        : trip.alertsTriggeredCount > 0
        ? ['Commute Alert']
        : [];

      return {
        id: `AL-2026${index + 1}`,
        tripId: trip.id,
        initials: initialsFromName(userName),
        name: userName,
        location: trip.destinationName,
        triggers: rawTriggers.map(formatTrigger),
        rawTime: new Date(timeSource).toISOString(),
        time: new Date(timeSource).toLocaleString('en-PH', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        status,
        avatarBg: status === 'Triggered' ? 'bg-red-950' : status === 'Pending' ? 'bg-orange-950' : 'bg-slate-800',
        avatarText: status === 'Triggered' ? 'text-red-300' : status === 'Pending' ? 'text-orange-300' : 'text-slate-400',
      };
    });

    return NextResponse.json({ alarms });
  } catch (error) {
    console.error('Admin alarms fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch alarms' }, { status: 500 });
  }
}

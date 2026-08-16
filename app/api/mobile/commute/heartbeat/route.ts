import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Called by the mobile app when commute monitoring starts and as a heartbeat every 10s while active.
export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      active, 
      safetyStatus, 
      lat, 
      lng, 
      anomalyTriggers, 
      tripStartTime 
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Always update user status and online status
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: active !== false,
        lastActive: new Date(),
      },
    });

    // If tracking is active and we have an active alarm/alert status (Suspicious or SOS-Triggered)
    if (active !== false && (safetyStatus === 'Suspicious' || safetyStatus === 'SOS-Triggered')) {
      const parsedLat = lat ? parseFloat(lat) : null;
      const parsedLng = lng ? parseFloat(lng) : null;

      let existingTrip = null;

      if (tripStartTime) {
        const tripDate = new Date(tripStartTime);
        const startRange = new Date(tripDate.getTime() - 10000);
        const endRange = new Date(tripDate.getTime() + 10000);

        existingTrip = await prisma.trip.findFirst({
          where: {
            userId,
            date: {
              gte: startRange,
              lte: endRange,
            },
          },
        });
      }

      if (existingTrip) {
        // Update existing trip with real-time status and telemetry
        await prisma.trip.update({
          where: { id: existingTrip.id },
          data: {
            safetyStatus: safetyStatus,
            lastKnownLat: parsedLat,
            lastKnownLng: parsedLng,
            anomalyCount: anomalyTriggers ? anomalyTriggers.length : undefined,
            anomalyTriggers: anomalyTriggers || undefined,
            suspiciousAt: safetyStatus === 'Suspicious' && !existingTrip.suspiciousAt ? new Date() : undefined,
            sosTriggeredAt: safetyStatus === 'SOS-Triggered' && !existingTrip.sosTriggeredAt ? new Date() : undefined,
          },
        });
      } else {
        // Create active/in-progress trip record
        await prisma.trip.create({
          data: {
            destinationName: 'Active Commute Monitor',
            durationMs: 0,
            alertsTriggeredCount: anomalyTriggers ? anomalyTriggers.length : 0,
            safetyStatus: safetyStatus,
            anomalyCount: anomalyTriggers ? anomalyTriggers.length : 0,
            anomalyTriggers: anomalyTriggers || [],
            suspiciousAt: safetyStatus === 'Suspicious' ? new Date() : null,
            sosTriggeredAt: safetyStatus === 'SOS-Triggered' ? new Date() : null,
            lastKnownLat: parsedLat,
            lastKnownLng: parsedLng,
            userId: userId,
            date: tripStartTime ? new Date(tripStartTime) : new Date(),
          },
        });
      }

      // If this is an SOS alarm, create a UserAlert record to trigger admin alerts
      if (safetyStatus === 'SOS-Triggered') {
        const recentAlert = await prisma.userAlert.findFirst({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes rate-limit
            },
          },
        });

        if (!recentAlert) {
          await prisma.userAlert.create({
            data: {
              description: `SOS Alert: ${anomalyTriggers && anomalyTriggers.length > 0 ? anomalyTriggers.join(', ') : 'Emergency Triggered'}`,
              lat: parsedLat || 0,
              lng: parsedLng || 0,
              userId: userId,
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Commute heartbeat error:', error);
    return NextResponse.json({ error: 'Failed to update commute status' }, { status: 500 });
  }
}

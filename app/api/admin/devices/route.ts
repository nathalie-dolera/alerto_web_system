import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const usersWithDevices = await prisma.user.findMany({
      where: {
        deviceId: { not: null }
      },
      select: {
        id: true,
        email: true,
        name: true,
        deviceId: true,
        isOnline: true,
        lastActive: true,
      }
    });

    let activeNodes = 0;

    const STALE_THRESHOLD_MS = 30 * 1000; // 30 seconds — mobile app heartbeats every 10s

    const devices = usersWithDevices.map(user => {
      // Determine online status for display only — do NOT write to DB from a GET endpoint
      let isActuallyOnline = user.isOnline;
      if (user.isOnline && user.lastActive) {
        const timeSinceActive = Date.now() - new Date(user.lastActive).getTime();
        if (timeSinceActive > STALE_THRESHOLD_MS) {
          isActuallyOnline = false;
        }
      } else if (user.isOnline && !user.lastActive) {
        isActuallyOnline = false;
      }

      const status = isActuallyOnline ? 'Connected' : 'Offline';
      if (isActuallyOnline) activeNodes++;

      let lastPing = 'Never';
      if (user.lastActive) {
        const diffMs = Date.now() - new Date(user.lastActive).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) lastPing = 'Just now';
        else if (diffMins < 60) lastPing = `${diffMins} mins ago`;
        else if (diffMins < 1440) lastPing = `${Math.floor(diffMins / 60)} hours ago`;
        else lastPing = `${Math.floor(diffMins / 1440)} days ago`;
      }

      return {
        id: user.id,
        account: user.email,
        deviceId: user.deviceId,
        lastPing,
        status
      };
    });

    return NextResponse.json({
      devices,
      stats: {
        totalDevices: devices.length,
        activeNodes,
      }
    });
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}

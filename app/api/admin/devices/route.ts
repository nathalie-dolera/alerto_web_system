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
        isDeviceConnected: true,
        lastActive: true,
      }
    });

    let activeNodes = 0;

    const devices = usersWithDevices.map(user => {
      // Use the dedicated bluetooth connection flag
      const isActuallyOnline = user.isDeviceConnected || false;

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

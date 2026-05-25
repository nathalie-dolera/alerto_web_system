import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const usersWithDevices = await prisma.user.findMany({
      where: {
        deviceId: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        deviceId: true,
        lastActive: true,
        batteryLevel: true,
        isOnline: true
      }
    });

    let activeNodes = 0;
    let lowBattery = 0;

    const devices = usersWithDevices.map(user => {
      let status = "Offline";
      let batColor = "bg-slate-600";
      const battery = user.batteryLevel ?? 0;

      if (user.isOnline) {
        status = "Connected";
        activeNodes++;
      } else if (battery <= 20) {
        status = "Low Power";
      }

      if (battery > 50) {
        batColor = "bg-emerald-400";
      } else if (battery > 20) {
        batColor = "bg-orange-400";
      } else {
        batColor = "bg-rose-500";
        lowBattery++;
      }

      // calculate relative time
      let lastPing = "Unknown";
      if (user.lastActive) {
        const diffMs = Date.now() - new Date(user.lastActive).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) lastPing = "Just now";
        else if (diffMins < 60) lastPing = `${diffMins} mins ago`;
        else if (diffMins < 1440) lastPing = `${Math.floor(diffMins / 60)} hours ago`;
        else lastPing = `${Math.floor(diffMins / 1440)} days ago`;
      }

      return {
        id: user.id,
        account: user.email,
        deviceId: user.deviceId,
        lastPing,
        battery,
        batColor,
        status
      };
    });

    return NextResponse.json({
      devices,
      stats: {
        totalDevices: devices.length,
        activeNodes,
        lowBattery
      }
    });
  } catch (error) {
    console.error("Failed to fetch devices:", error);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}

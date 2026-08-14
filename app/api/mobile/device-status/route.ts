import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, deviceId, connected } = await req.json();

    if (!email || !deviceId) {
      return NextResponse.json({ error: "email and deviceId are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.deviceId === null && connected) {
      await prisma.user.update({
        where: { email },
        data: {
          deviceId,
          isOnline: true,
          lastActive: new Date(),
        },
      });
    } else if (connected) {
      await prisma.user.update({
        where: { email },
        data: {
          deviceId,
          isOnline: true,
          lastActive: new Date(),
        },
      });
    } else {
      await prisma.user.update({
        where: { email },
        data: {
          isOnline: false,
          lastActive: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update device status:", error);
    return NextResponse.json({ error: "Failed to update device status" }, { status: 500 });
  }
}

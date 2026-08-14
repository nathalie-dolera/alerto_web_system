import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        deviceId: null,
        isOnline: false,
        lastActive: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete device:", error);
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { userId, isOnline } = await req.json();

    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to toggle device connection:", error);
    return NextResponse.json({ error: "Failed to toggle connection" }, { status: 500 });
  }
}

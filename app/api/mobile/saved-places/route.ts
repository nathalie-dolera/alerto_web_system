import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// fetch saved places
export async function GET() {
  try {
    const places = await prisma.savedPlace.findMany({
      orderBy: { createdAt: 'desc' }, 
    });
    
    return NextResponse.json(places, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch saved places' }, { status: 500 });
  }
}

// save new place
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, lat, lng, distance, intensity, duration, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const newPlace = await prisma.savedPlace.create({
      data: {
        name,
        lat,
        lng,
        distance,
        intensity,
        duration,
        userId, 
      },
    });

    return NextResponse.json(newPlace, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save place' }, { status: 500 });
  }
}
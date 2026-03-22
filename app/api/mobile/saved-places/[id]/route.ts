import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// get the specific place through id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const place = await prisma.savedPlace.findUnique({
      where: { id },
    });

    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    return NextResponse.json(place, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch place' }, { status: 500 });
  }
}

// edit place
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    
    const { name, lat, lng, distance, intensity, duration } = body;

    const updatedPlace = await prisma.savedPlace.update({
      where: { id },
      data: {
        name,
        lat,
        lng,
        distance,
        intensity,
        duration,
      },
    });

    return NextResponse.json(updatedPlace, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update place' }, { status: 500 });
  }
}

// delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    await prisma.savedPlace.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 }); 
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete place' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const trips = await prisma.trip.findMany({
      where: { userId },
      orderBy: { date: 'desc' }, 
    });
    
    return NextResponse.json(trips, { status: 200 });
  } catch (error) {
    console.error('Trip FETCH Error:', error);
    return NextResponse.json({ error: 'Failed to fetch trip history' }, { status: 500 });
  }
}

//save a new completed trip
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
        destinationName, 
        durationMs, 
        alertsTriggeredCount, 
        responseTimes, 
        unsafeZonesEncountered, 
        userId,
        date,
        driverName,
        plateNumber,
        bookingType,
        screenshotUrl 
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const newTrip = await prisma.trip.create({
      data: {
        destinationName,
        durationMs,
        alertsTriggeredCount,
        responseTimes,
        unsafeZonesEncountered,
        userId,
        driverName,
        plateNumber,
        bookingType,
        screenshotUrl,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(newTrip, { status: 201 });
  } catch (error) {
    console.error('Trip SAVE Error:', error);
    return NextResponse.json({ error: 'Failed to save trip' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
      const userId = request.nextUrl.searchParams.get('userId');
      const tripId = request.nextUrl.searchParams.get('tripId');
  
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
  
      if (tripId) {
          await prisma.trip.delete({
              where: { id: tripId, userId }
          });
      } else {
          await prisma.trip.deleteMany({
            where: { userId },
          });
      }
      
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error('Trip DELETE Error:', error);
      return NextResponse.json({ error: 'Failed to delete trip history' }, { status: 500 });
    }
  }

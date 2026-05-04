import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activeHazards = await prisma.activeHazard.findMany();
    const permanentHazards = await prisma.permanentHazard.findMany();
    const userAlerts = await prisma.userAlert.findMany();

    const normalize = (
      items: Array<{
        id: string;
        type?: string | null;
        description?: string | null;
        lat: number;
        lng: number;
        severity?: string | null;
        createdAt: Date;
      }>,
      category: string
    ) =>
      items.map(item => ({
        id: item.id,
        category,
        type: item.type || item.description || 'unknown',
        lat: item.lat,
        lng: item.lng,
        severity: item.severity || 'medium',
        createdAt: item.createdAt,
      }));

    const data = [
      ...normalize(activeHazards, 'ACTIVE'),
      ...normalize(permanentHazards, 'PERMANENT'),
      ...normalize(userAlerts, 'USER_ALERT'),
    ];

    return NextResponse.json(data, {
      status: 200 
    });
  } catch (error) {
    console.error('Error fetching hazards:', error);
    return NextResponse.json({
      error: 'Failed to fetch hazards' 
    }, {
      status: 500 
    });
  }
}

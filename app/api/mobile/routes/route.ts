import { fetchTomTomRoute } from '@/lib/tomtom';
import { NextRequest, NextResponse } from 'next/server';

function inferSeverity(delaySeconds: number, magnitudeOfDelay?: number) {
  const magnitude = Number(magnitudeOfDelay || 0);
  if (delaySeconds >= 240 || magnitude >= 3) {
    return 'heavy' as const;
  }
  if (delaySeconds >= 90 || magnitude >= 1) {
    return 'moderate' as const;
  }
  return 'low' as const;
}

export async function GET(request: NextRequest) {
  const fromLat = Number(request.nextUrl.searchParams.get('fromLat'));
  const fromLng = Number(request.nextUrl.searchParams.get('fromLng'));
  const toLat = Number(request.nextUrl.searchParams.get('toLat'));
  const toLng = Number(request.nextUrl.searchParams.get('toLng'));

  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) {
    return NextResponse.json({ error: 'Valid route coordinates are required' }, { status: 400 });
  }

  try {
    const route = await fetchTomTomRoute(fromLat, fromLng, toLat, toLng);
    if (!route) {
      return NextResponse.json({ error: 'Unable to calculate route' }, { status: 502 });
    }

    const trafficSegments = route.trafficSections.map((section, index) => {
      const startIndex = Math.max(0, section.startPointIndex);
      const endIndex = Math.min(route.points.length - 1, section.endPointIndex);
      const points = route.points.slice(startIndex, endIndex + 1);

      return {
        id: `traffic-${index}-${startIndex}-${endIndex}`,
        points,
        delaySeconds: section.delayInSeconds,
        lengthMeters: 0,
        severity: inferSeverity(section.delayInSeconds, section.magnitudeOfDelay),
      };
    }).filter(segment => segment.points.length >= 2);

    return NextResponse.json({
      points: route.points,
      distanceMeters: route.distanceMeters,
      travelTimeSeconds: route.travelTimeSeconds,
      trafficDelaySeconds: route.trafficDelaySeconds,
      trafficLengthMeters: route.trafficLengthMeters,
      trafficSegments,
    });
  } catch (error) {
    console.error('Mobile routes error:', error);
    return NextResponse.json({ error: 'Failed to fetch route plan' }, { status: 500 });
  }
}

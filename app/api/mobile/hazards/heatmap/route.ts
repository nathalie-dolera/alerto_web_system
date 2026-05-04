import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildRiskHeatmap } from '@/lib/heatmap';

const DEFAULT_LOOKBACK_DAYS = 30;
const DEFAULT_CLUSTER_SIZE_METERS = 180;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lookbackDays = Number(searchParams.get('days') ?? DEFAULT_LOOKBACK_DAYS);
    const days = Number.isFinite(lookbackDays) && lookbackDays > 0 ? lookbackDays : DEFAULT_LOOKBACK_DAYS;
    const north = Number(searchParams.get('north'));
    const south = Number(searchParams.get('south'));
    const east = Number(searchParams.get('east'));
    const west = Number(searchParams.get('west'));
    const clusterSizeMeters = Number(searchParams.get('clusterSizeMeters') ?? DEFAULT_CLUSTER_SIZE_METERS);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const hasBounds =
      [north, south, east, west].every(Number.isFinite) &&
      north >= south &&
      east >= west;

    const geoFilter = hasBounds
      ? {
        lat: {
          gte: south,
          lte: north,
        },
        lng: {
          gte: west,
          lte: east,
        },
      }
      : {};

    const [history, userAlerts] = await Promise.all([
      prisma.hazardHistory.findMany({
        where: {
          observedAt: {
            gte: since,
          },
          ...geoFilter,
        },
        orderBy: {
          observedAt: 'desc',
        },
      }),
      prisma.userAlert.findMany({
        where: {
          createdAt: {
            gte: since,
          },
          ...geoFilter,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const heatmapPoints = buildRiskHeatmap([
      ...history.map((item) => ({
        id: item.id,
        lat: item.lat,
        lng: item.lng,
        severity: item.severity,
        source: item.source,
      })),
      ...userAlerts.map((item) => ({
        id: item.id,
        lat: item.lat,
        lng: item.lng,
        severity: 'HIGH',
        source: 'USER_ALERT',
      })),
    ], {
      clusterSizeMeters:
        Number.isFinite(clusterSizeMeters) && clusterSizeMeters > 0
          ? clusterSizeMeters
          : DEFAULT_CLUSTER_SIZE_METERS,
    });

    return NextResponse.json(heatmapPoints, {
      status: 200 
    });
  } catch (error) {
    console.error('Error generating risk heatmap:', error);
    return NextResponse.json({
      error: 'Failed to generate risk heatmap' 
    }, {
      status: 500 
    });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchTomTomIncidents } from '@/lib/tomtom';
import { fetchAIProcessedIncidents } from '@/lib/gemini';
import { buildHazardSignature } from '@/lib/heatmap';

export async function POST() {
  try {
    // fetch data
    const [tomtomIncidents, aiIncidents] = await Promise.all([
      fetchTomTomIncidents(),
      fetchAIProcessedIncidents(),
    ]);

    const newRecords = [];
    const historyRecords = [];

    for (const item of tomtomIncidents) {
      const record = {
        type: item.type,
        description: 'Auto-synced from TomTom Traffic API',
        lat: item.lat,
        lng: item.lng,
        severity: item.severity,
      };

      newRecords.push(record);
      historyRecords.push({
        ...record,
        source: 'TOMTOM',
        signature: buildHazardSignature({ ...record, source: 'TOMTOM' }),
        observedAt: new Date(),
      });
    }

    for (const item of aiIncidents) {
      //might detect  floods or other things, we put them all in ActiveHazard.
      const record = {
        type: item.type,
        description: `AI Extracted: ${item.description}`,
        lat: item.lat,
        lng: item.lng,
        severity: item.severity,
      };

      newRecords.push(record);
      historyRecords.push({
        ...record,
        source: 'AI_REPORT',
        signature: buildHazardSignature({ ...record, source: 'AI_REPORT' }),
        observedAt: new Date(),
      });
    }

    if (newRecords.length > 0) {
      const recentCutoff = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const recentHistory = await prisma.hazardHistory.findMany({
        where: {
          observedAt: {
            gte: recentCutoff,
          },
        },
        select: {
          signature: true,
        },
      });

      const existingSignatures = new Set(
        recentHistory
          .map((record) => record.signature)
          .filter((signature): signature is string => Boolean(signature))
      );

      const newHistoryRecords = historyRecords.filter(
        (record) => !existingSignatures.has(record.signature)
      );

      await prisma.activeHazard.deleteMany({});
      await prisma.activeHazard.createMany({
        data: newRecords,
      });

      if (newHistoryRecords.length > 0) {
        await prisma.hazardHistory.createMany({
          data: newHistoryRecords,
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: `Synced ${newRecords.length} live hazards and stored ${newHistoryRecords.length} historical records.`,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ success: true, message: 'No hazards fetched. Make sure API keys are set in .env.' }, { status: 200 });
    }

  } catch (error) {
    console.error('Error in sync-hazards:', error);
    return NextResponse.json({ error: 'Failed to synchronize hazards' }, { status: 500 });
  }
}

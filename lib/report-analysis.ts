import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

export type ReportTab = 'System Overview' | 'User Activity' | 'Alarm History' | 'Device Metrics';
export type TimeRange = 'today' | '7d' | '30d';

export type ReportAnalysis = {
  compilation: string;
  recommendation: string;
  generatedBy: 'gemini' | 'fallback';
  model: string;
  analyzedAt: string;
};

type TripSummary = {
  id: string;
  date: Date;
  destinationName: string;
  durationMs: number;
  alertsTriggeredCount: number;
  responseTimes: number[];
  safetyStatus: string;
  anomalyCount: number;
  anomalyTriggers: string[];
  routeRecognitionStatus: string;
};

const REPORT_TABS: ReportTab[] = [
  'System Overview',
  'User Activity',
  'Alarm History',
  'Device Metrics',
];

const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';
const FALLBACK_GEMINI_MODELS = [
  DEFAULT_GEMINI_MODEL,
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

function isReportTab(value: string | null): value is ReportTab {
  return Boolean(value && REPORT_TABS.includes(value as ReportTab));
}

export function parseReportTab(value: string | null): ReportTab {
  return isReportTab(value) ? value : 'System Overview';
}

export function parseTimeRange(value: string | null): TimeRange {
  if (value === 'today' || value === '24h' || value === '1d') return 'today';
  if (value === '7d' || value === 'week') return '7d';
  return '30d';
}

function getStartDateForRange(range: TimeRange) {
  const date = new Date();
  if (range === 'today') {
    date.setHours(0, 0, 0, 0); // start of today
  } else if (range === '7d') {
    date.setDate(date.getDate() - 7);
    date.setHours(0, 0, 0, 0);
  } else {
    date.setDate(date.getDate() - 30);
    date.setHours(0, 0, 0, 0);
  }
  return date;
}

function getAverageResponseTime(trips: TripSummary[]) {
  const responseTimes = trips.flatMap((trip) => trip.responseTimes ?? []);
  if (responseTimes.length === 0) return 0;
  const total = responseTimes.reduce((sum, time) => sum + time, 0);
  return Math.round(total / responseTimes.length);
}

function getTopTrigger(trips: TripSummary[]) {
  const counts = new Map<string, number>();

  const normalizeTrigger = (raw: string) => {
    if (!raw) return 'Commute Anomaly';
    const upper = raw.toUpperCase();
    if (upper.includes('SOS') || upper.includes('THEFT')) return 'Anti-Theft';
    if (upper.includes('IDLE')) return 'Idle Time';
    if (upper.includes('OFF_ROUTE') || upper.includes('ROUTE')) return 'Route Dev.';
    if (upper.includes('SNORING')) return 'Hazard';
    if (upper.includes('DROWS')) return 'Drowsiness';
    if (upper.includes('HAZARD')) return 'Hazard';
    return raw.replace(/_/g, ' ');
  };

  for (const trip of trips) {
    for (const trigger of trip.anomalyTriggers) {
      const clean = normalizeTrigger(trigger);
      counts.set(clean, (counts.get(clean) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([trigger, count]) => ({ trigger, count }))
    .slice(0, 5);
}

function buildFallbackAnalysis(tab: ReportTab, snapshot: Record<string, unknown>, model: string | null, range: TimeRange): ReportAnalysis {
  const generatedBase = {
    generatedBy: 'fallback' as const,
    model: model || 'local-fallback',
    analyzedAt: new Date().toISOString(),
  };

  const periodPhrase = range === 'today' ? 'today' : range === '7d' ? 'the last 7 days' : 'the last 30 days';

  switch (tab) {
    case 'User Activity': {
      const breakdown = (snapshot.commuteTimesBreakdown as { morning: number; noon: number; evening: number }) || { morning: 0, noon: 0, evening: 0 };
      const peakPeriod = (snapshot.peakCommutePeriod as string) || 'Morning';
      return {
        ...generatedBase,
        compilation: `AI-generated insight for ${periodPhrase}: Peak Commute Time is during the ${peakPeriod} (Morning: ${breakdown.morning}, Afternoon: ${breakdown.noon}, Evening: ${breakdown.evening} trips). Commuter habits show concentrated activity in this window.`,
        recommendation: `Allocate additional safety monitoring resources during the ${peakPeriod} peak commute period and ensure user locations are updated before trips begin.`,
      };
    }
    case 'Alarm History':
      return {
        ...generatedBase,
        compilation: `Alarm analysis for ${periodPhrase} reviewed recent trips and found ${(snapshot.anomalyTripsCount as number) ?? 0} trips with anomaly signals.`,
        recommendation: 'Prioritize trips with repeated anomaly triggers or anti-theft alarms for immediate admin follow-up.',
      };
    case 'Device Metrics': {
      const sessionsCount = range === 'today' ? snapshot.deviceSessionsCountToday : range === '7d' ? snapshot.deviceSessionsCount7d : snapshot.deviceSessionsCount30d;
      const timestamp = new Date().toLocaleString();
      return {
        ...generatedBase,
        compilation: `Device metrics for ${periodPhrase} show ${(snapshot.totalDevices as number) ?? 0} registered hardware devices with ${(sessionsCount as number) ?? 0} connection sessions recorded across ${(snapshot.tripsCount as number) ?? 0} trips. Data as of ${timestamp}.`,
        recommendation: 'Ensure commuters keep Bluetooth tags charged and connected for continuous monitoring during commutes.',
      };
    }
    default:
      return {
        ...generatedBase,
        compilation: `System data compiled for ${periodPhrase} shows ${(snapshot.tripsCount as number) ?? 0} trips and ${(snapshot.alertsCount as number) ?? 0} user alerts.`,
        recommendation: 'Keep tracking commute volume and alert distribution to optimize transit safety coverage.',
      };
  }
}

async function buildReportSnapshot(tab: ReportTab, range: TimeRange = '30d') {
  const since = getStartDateForRange(range);
  const periodLabel = range === 'today' ? 'today (24 hours)' : range === '7d' ? 'last 7 days' : 'last 30 days';

  const [
    registeredUsersCount,
    activeUsersCount,
    connectedDevicesCount,
    totalDevices,
    lowBatteryUsersCount,
    tripsCount,
    alertsCount,
    activeHazardsCount,
    hazardHistoryCount,
    recentTrips,
    usersWithDevices,
    sosAlertsCount,
    maintenanceAlertsCount,
    deviceConnectionsCountToday,
    deviceConnectionsCount7d,
    deviceConnectionsCount30d,
    totalDurationMsAllTrips,
  ] = await Promise.all([
    (async () => { try { return await prisma.user.count(); } catch (e) { console.error('Error counting registered users', e); return 0; } })(),
    (async () => { try { return await prisma.user.count({ where: { isOnline: true } }); } catch (e) { console.error('Error counting active users', e); return 0; } })(),
    (async () => { try { return await prisma.user.count({ where: { isOnline: true, deviceId: { not: null } } }); } catch (e) { console.error('Error counting connected devices', e); return 0; } })(),
    (async () => { try { return await prisma.user.count({ where: { deviceId: { not: null } } }); } catch (e) { console.error('Error counting total devices', e); return 0; } })(),
    (async () => { try { return await prisma.user.count({ where: { batteryLevel: { lte: 20 } } }); } catch (e) { console.error('Error counting low battery users', e); return 0; } })(),
    (async () => { try { return await prisma.trip.count({ where: { date: { gte: since } } }); } catch (e) { console.error('Error counting trips', e); return 0; } })(),
    (async () => { try { return await prisma.userAlert.count({ where: { createdAt: { gte: since } } }); } catch (e) { console.error('Error counting alerts', e); return 0; } })(),
    (async () => { try { return await prisma.activeHazard.count(); } catch (e) { console.error('Error counting active hazards', e); return 0; } })(),
    (async () => { try { return await prisma.hazardHistory.count({ where: { observedAt: { gte: since } } }); } catch (e) { console.error('Error counting hazard history', e); return 0; } })(),
    (async () => { try { return await prisma.trip.findMany({
          where: { date: { gte: since } },
          select: {
            id: true,
            userId: true,
            date: true,
            destinationName: true,
            durationMs: true,
            alertsTriggeredCount: true,
            responseTimes: true,
            safetyStatus: true,
            anomalyCount: true,
            anomalyTriggers: true,
            routeRecognitionStatus: true,
          },
          orderBy: { date: 'desc' },
          take: 50,
        }); } catch (e) { console.error('Error fetching recent trips', e); return []; } })(),
    (async () => { try { return await prisma.user.findMany({
          where: { deviceId: { not: null } },
          select: {
            id: true,
            email: true,
            name: true,
            deviceId: true,
            isOnline: true,
            lastActive: true,
          },
          orderBy: { createdAt: 'desc' },
        }); } catch (e) { console.error('Error fetching users with devices', e); return []; } })(),
    (async () => { try { return 0; } catch (e) { return 0; } })(),
    (async () => { try { return 0; } catch (e) { return 0; } })(),
    // Placeholder — real session counts are computed after usersWithDevices is resolved
    (async () => 0)(),
    (async () => 0)(),
    (async () => 0)(),
    (async () => { try { const res = await prisma.trip.aggregate({ _sum: { durationMs: true }, where: { date: { gte: since } } }); return res._sum.durationMs || 0; } catch (e) { console.error('Error getting duration sum', e); return 0; } })(),
  ]);

  const anomalyTrips = (recentTrips as TripSummary[]).filter(
    (trip) => trip.anomalyCount > 0 || trip.safetyStatus === 'Suspicious' || trip.safetyStatus === 'SOS-Triggered'
  );

  // Calculate average commute / trip duration across the period
  const totalDurationMs = (recentTrips as any[]).reduce((sum, t) => sum + (t.durationMs || 0), 0);
  const avgTripDurationMinutes = (recentTrips as any[]).length > 0
    ? Math.round(((totalDurationMs / (recentTrips as any[]).length) / 60000) * 10) / 10
    : 0;

  // Distinct commuters who took trips in this period
  const activeCommutersCount = new Set((recentTrips as any[]).map((t) => t.userId)).size;

  // Compute per-device connection sessions (trip counts) for each time range
  const deviceUserIds = ((usersWithDevices || []) as any[]).map((u: any) => u.id as string);
  let actualSessionsToday = 0;
  let actualSessions7d = 0;
  let actualSessions30d = 0;

  if (deviceUserIds.length > 0) {
    try {
      const [sToday, s7d, s30d] = await Promise.all([
        prisma.trip.count({ where: { userId: { in: deviceUserIds }, date: { gte: getStartDateForRange('today') } } }),
        prisma.trip.count({ where: { userId: { in: deviceUserIds }, date: { gte: getStartDateForRange('7d') } } }),
        prisma.trip.count({ where: { userId: { in: deviceUserIds }, date: { gte: getStartDateForRange('30d') } } }),
      ]);
      actualSessionsToday = sToday;
      actualSessions7d = s7d;
      actualSessions30d = s30d;
    } catch (e) {
      console.error('Error counting device sessions', e);
    }
  }

  // Active connected devices in this period — query DB directly for accuracy
  let connectedDevicesInPeriod = 0;
  if (deviceUserIds.length > 0) {
    try {
      const devicesWithTrips = await prisma.trip.groupBy({
        by: ['userId'],
        where: {
          userId: { in: deviceUserIds },
          date: { gte: since },
        },
      });
      connectedDevicesInPeriod = devicesWithTrips.length;
    } catch (e) {
      // Fallback: if any device user has sessions in this period, count from sessions
      const sessionsInRange = range === 'today' ? actualSessionsToday : range === '7d' ? actualSessions7d : actualSessions30d;
      connectedDevicesInPeriod = sessionsInRange > 0 ? Math.min(deviceUserIds.length, sessionsInRange) : 0;
    }
  }

  // Build devicesList with per-device session counts
  const devicesListPromises = ((usersWithDevices || []) as any[]).map(async (u: any) => {
    const isConnected = Boolean(
      u.isOnline &&
      u.lastActive &&
      (Date.now() - new Date(u.lastActive).getTime() <= 5 * 60 * 1000)
    );
    let connectionCount = 0;
    try {
      connectionCount = await prisma.trip.count({
        where: { userId: u.id, date: { gte: since } },
      });
    } catch (e) {
      console.error('Error counting trips for user', u.id, e);
    }
    return {
      id: u.id,
      account: u.email,
      deviceId: u.deviceId,
      status: isConnected ? 'Connected' : 'Offline',
      connectionCount,
    };
  });
  const devicesList = await Promise.all(devicesListPromises);

  // Categorize trip start times to identify Peak Commute Times
  let morningTripsCount = 0; // 5:00 AM – 11:59 AM
  let noonTripsCount = 0;    // 12:00 PM – 5:59 PM (Afternoon)
  let eveningTripsCount = 0; // 6:00 PM – 4:59 AM

  for (const trip of recentTrips as any[]) {
    if (!trip.date) continue;
    const hours = new Date(trip.date).getHours();
    if (hours >= 5 && hours < 12) {
      morningTripsCount++;
    } else if (hours >= 12 && hours < 18) {
      noonTripsCount++;
    } else {
      eveningTripsCount++;
    }
  }

  let peakCommutePeriod = 'Evening';
  let maxCount = eveningTripsCount;
  if (morningTripsCount > maxCount) {
    peakCommutePeriod = 'Morning';
    maxCount = morningTripsCount;
  }
  if (noonTripsCount > maxCount) {
    peakCommutePeriod = 'Afternoon';
  }

  // Compute per-type average response times for bar chart
  const routeDevTrips = (recentTrips as TripSummary[]).filter(t => t.anomalyTriggers.some(a => a.toUpperCase().includes('ROUTE') || a.toUpperCase().includes('OFF_ROUTE')));
  const antiTheftTrips = (recentTrips as TripSummary[]).filter(t => t.anomalyTriggers.some(a => a.toUpperCase().includes('SOS') || a.toUpperCase().includes('THEFT')));
  const drowsinessTrips = (recentTrips as TripSummary[]).filter(t => t.anomalyTriggers.some(a => a.toUpperCase().includes('DROWS')));

  return {
    tab,
    range,
    period: periodLabel,
    registeredUsersCount,
    activeUsersCount,
    activeCommutersCount,
    avgTripDurationMinutes,
    totalMonitoredHours: ((totalDurationMsAllTrips as number) / (1000 * 60 * 60)) || 0,
    commuteTimesBreakdown: { morning: morningTripsCount, noon: noonTripsCount, evening: eveningTripsCount },
    peakCommutePeriod,
    avgResponseByType: {
      routeDev: getAverageResponseTime(routeDevTrips),
      antiTheft: getAverageResponseTime(antiTheftTrips),
      drowsiness: getAverageResponseTime(drowsinessTrips),
      overall: getAverageResponseTime(recentTrips as TripSummary[]),
    },
    connectedDevicesCount: connectedDevicesInPeriod,
    totalDevices,
    lowBatteryUsersCount,
    tripsCount,
    tripsLast30Days: tripsCount,
    alertsCount,
    alertsLast30Days: alertsCount,
    sosAlertsCount,
    maintenanceAlertsCount,
    activeHazardsCount,
    hazardHistoryCount,
    anomalyTripsCount: anomalyTrips.length,
    averageResponseTimeMs: getAverageResponseTime(recentTrips as TripSummary[]),
    topAnomalyTriggers: getTopTrigger(recentTrips as TripSummary[]),
    devicesList,
    deviceSessionsCountToday: actualSessionsToday,
    deviceSessionsCount7d: actualSessions7d,
    deviceSessionsCount30d: actualSessions30d,
    recentTrips: (recentTrips as any[]).slice(0, 50).map((trip, idx) => ({
      id: `TRP-${new Date(trip.date).getFullYear()}${String(idx + 1).padStart(1, '0')}`,
      date: trip.date.toISOString(),
      destinationName: trip.destinationName,
      durationMinutes: Math.round(trip.durationMs / 60000),
      alertsTriggeredCount: trip.alertsTriggeredCount,
      safetyStatus: trip.safetyStatus,
      anomalyCount: trip.anomalyCount,
      anomalyTriggers: trip.anomalyTriggers,
      routeRecognitionStatus: trip.routeRecognitionStatus,
    })),
  };
}

function extractJson(text: string) {
  const cleanText = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  return cleanText.match(/\{[\s\S]*\}/)?.[0] ?? cleanText;
}

function isValidAnalysis(value: unknown): value is Pick<ReportAnalysis, 'compilation' | 'recommendation'> {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Record<string, unknown>;
  return typeof maybe.compilation === 'string' && typeof maybe.recommendation === 'string';
}

export async function generateReportAnalysis(tab: ReportTab, range: TimeRange = '30d'): Promise<{ analysis: ReportAnalysis, snapshot: any }> {
  const snapshot = await buildReportSnapshot(tab, range);
  const preferredModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_GEMINI_MODELS.filter((model) => model !== preferredModel),
  ];

  if (!apiKey) {
    return { analysis: buildFallbackAnalysis(tab, snapshot, null, range), snapshot };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are the analytics assistant for Alerto, a commute safety monitoring system.
Analyze the JSON snapshot for the "${tab}" report tab covering "${snapshot.period}".
Produce concise admin-facing insights based on the observed data in this timeframe.
${tab === 'User Activity' ? '\nFor User Activity: You MUST identify and mention the "Peak Commute Times" by checking the commuteTimesBreakdown field (morning/noon/evening trip counts). State which period has the highest count and provide an insight about commuter habits. Also reference user actions like updating saved locations if relevant.' : ''}

Return only valid JSON with exactly these keys:
- "compilation": 1 sentence summarizing the most important observed data for this period${tab === 'User Activity' ? ' — must include the Peak Commute Time period (Morning, Noon, or Evening) and trip distribution' : ''}.
- "recommendation": 1 sentence with a practical next action.

Do not invent metrics that are not present in the snapshot. Keep both sentences under 40 words each.

Snapshot:
${JSON.stringify(snapshot).slice(0, 12000)}
`;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      const text = (response as { text?: string }).text;
      if (!text) continue;
      const parsed = JSON.parse(extractJson(text)) as unknown;
      if (!isValidAnalysis(parsed)) continue;
      return {
        analysis: {
          compilation: (parsed as any).compilation.trim(),
          recommendation: (parsed as any).recommendation.trim(),
          generatedBy: 'gemini',
          model,
          analyzedAt: new Date().toISOString(),
        },
        snapshot,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Gemini report analysis failed with ${model}; trying next model if available.`, message);
      continue;
    }
  }

  return { analysis: buildFallbackAnalysis(tab, snapshot, preferredModel, range), snapshot };
}


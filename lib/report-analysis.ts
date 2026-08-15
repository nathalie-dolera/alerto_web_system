import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

export type ReportTab = 'System Overview' | 'User Activity' | 'Alarm History' | 'Device Metrics';

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

function startOfLast30Days() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  date.setHours(0, 0, 0, 0);
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

  for (const trip of trips) {
    for (const trigger of trip.anomalyTriggers) {
      counts.set(trigger, (counts.get(trigger) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([trigger, count]) => ({ trigger, count }))
    .slice(0, 5);
}

function buildFallbackAnalysis(tab: ReportTab, snapshot: Record<string, unknown>, model: string): ReportAnalysis {
  const generatedBase = {
    generatedBy: 'fallback' as const,
    model,
    analyzedAt: new Date().toISOString(),
  };

  switch (tab) {
    case 'User Activity':
      return {
        ...generatedBase,
        compilation: `Recent user activity was compiled from live account and trip records. The current snapshot shows ${(snapshot.activeUsersCount as number) ?? 0} active users out of ${(snapshot.registeredUsersCount as number) ?? 0} registered users.`,
        recommendation: 'Monitor peak trip creation periods and send safety reminders before commute-heavy windows when active users increase.',
      };
    case 'Alarm History':
      return {
        ...generatedBase,
        compilation: `Alarm analysis reviewed recent trips and found ${(snapshot.anomalyTripsCount as number) ?? 0} trips with anomaly or SOS signals in the last 30 days.`,
        recommendation: 'Prioritize trips with repeated anomaly triggers, SOS status, or slow response times for admin follow-up.',
      };
    case 'Device Metrics':
      return {
        ...generatedBase,
        compilation: `Device metrics show ${(snapshot.totalDevices as number) ?? 0} registered devices, with ${(snapshot.connectedDevicesCount as number) ?? 0} currently connected.`,
        recommendation: 'Ensure users maintain active Bluetooth bag tag connection during commutes to keep real-time tracking responsive.',
      };
    default:
      return {
        ...generatedBase,
        compilation: `System data was compiled from users, trips, alerts, and hazard history for the last 30 days. The snapshot includes ${(snapshot.tripsLast30Days as number) ?? 0} trips and ${(snapshot.alertsLast30Days as number) ?? 0} user alerts.`,
        recommendation: 'Keep monitoring trip growth, alert volume, and active hazard updates to catch capacity or safety changes early.',
      };
  }
}

async function buildReportSnapshot(tab: ReportTab) {
  const since = startOfLast30Days();

  const [
    registeredUsersCount,
    activeUsersCount,
    connectedDevicesCount,
    totalDevices,
    lowBatteryUsersCount,
    tripsLast30Days,
    alertsLast30Days,
    activeHazardsCount,
    hazardHistoryLast30Days,
    recentTrips,
    usersWithDevices,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isOnline: true } }),
    prisma.user.count({ where: { isOnline: true, deviceId: { not: null } } }),
    prisma.user.count({ where: { deviceId: { not: null } } }),
    prisma.user.count({ where: { batteryLevel: { lte: 20 } } }),
    prisma.trip.count({ where: { date: { gte: since } } }),
    prisma.userAlert.count({ where: { createdAt: { gte: since } } }),
    prisma.activeHazard.count(),
    prisma.hazardHistory.count({ where: { observedAt: { gte: since } } }),
    prisma.trip.findMany({
      where: { date: { gte: since } },
      select: {
        id: true,
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
    }),
    prisma.user.findMany({
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
    }),
  ]);

  const anomalyTrips = recentTrips.filter(
    (trip) => trip.anomalyCount > 0 || trip.safetyStatus === 'Suspicious' || trip.safetyStatus === 'SOS-Triggered'
  );

  const devicesList = (usersWithDevices || []).map((u) => {
    const isConnected = Boolean(
      u.isOnline &&
      u.lastActive &&
      (Date.now() - new Date(u.lastActive).getTime() <= 5 * 60 * 1000)
    );
    return {
      id: u.id,
      account: u.email,
      deviceId: u.deviceId,
      status: isConnected ? 'Connected' : 'Offline',
    };
  });

  return {
    tab,
    period: 'last 30 days',
    registeredUsersCount,
    activeUsersCount,
    connectedDevicesCount,
    totalDevices,
    lowBatteryUsersCount,
    tripsLast30Days,
    alertsLast30Days,
    activeHazardsCount,
    hazardHistoryLast30Days,
    anomalyTripsCount: anomalyTrips.length,
    averageResponseTimeMs: getAverageResponseTime(recentTrips),
    topAnomalyTriggers: getTopTrigger(recentTrips),
    devicesList,
    recentTrips: recentTrips.slice(0, 50).map((trip, idx) => ({
      id: `${new Date(trip.date).getFullYear()}${idx + 1}`,
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

export async function generateReportAnalysis(tab: ReportTab): Promise<{ analysis: ReportAnalysis, snapshot: any }> {
  const snapshot = await buildReportSnapshot(tab);
  const preferredModel = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_GEMINI_MODELS.filter((model) => model !== preferredModel),
  ];

  if (!apiKey) {
    return { analysis: buildFallbackAnalysis(tab, snapshot, preferredModel), snapshot };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are the analytics assistant for Alerto, a commute safety monitoring system.
Analyze the JSON snapshot for the "${tab}" report tab and produce concise admin-facing insights.

Return only valid JSON with exactly these keys:
- "compilation": 1 sentence summarizing the most important observed data.
- "recommendation": 1 sentence with a practical next action.

Do not invent metrics that are not present in the snapshot. Keep both sentences under 35 words each.

Snapshot:
${JSON.stringify(snapshot).slice(0, 12000)}
`;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        ...(model.includes('2.5')
          ? {
              config: {
                thinkingConfig: {
                  thinkingBudget: 0,
                },
              },
            }
          : {}),
      });

      const text = (response as { text?: string })?.text;
      if (!text) continue;

      const parsed = JSON.parse(extractJson(text)) as unknown;
      if (!isValidAnalysis(parsed)) continue;

      return {
        analysis: {
          compilation: parsed.compilation.trim(),
          recommendation: parsed.recommendation.trim(),
          generatedBy: 'gemini',
          model,
          analyzedAt: new Date().toISOString(),
        },
        snapshot
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Gemini report analysis failed with ${model}; trying next model if available.`, message);

      if (
        message.includes('429') ||
        message.includes('503') ||
        message.toLowerCase().includes('quota') ||
        message.toLowerCase().includes('overloaded') ||
        message.toLowerCase().includes('not found')
      ) {
        continue;
      }

      continue;
    }
  }

  return { analysis: buildFallbackAnalysis(tab, snapshot, preferredModel), snapshot };
}

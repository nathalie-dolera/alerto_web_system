type HistoryLikePoint = {
  id: string;
  lat: number;
  lng: number;
  severity?: string | null;
  source?: string | null;
};

type HeatmapCluster = {
  id: string;
  lat: number;
  lng: number;
  incidentCount: number;
  weight: number;
  source: string;
  sources: Record<string, number>;
};

type ClusterBucket = {
  latTotal: number;
  lngTotal: number;
  incidentCount: number;
  weight: number;
  sourceCounts: Record<string, number>;
};

type HeatmapBuildOptions = {
  clusterSizeMeters?: number;
};

const METERS_PER_DEGREE_LAT = 111320;
const DEFAULT_CLUSTER_SIZE_METERS = 180;
const SOURCE_WEIGHTS: Record<string, number> = {
  TOMTOM: 1,
  AI_REPORT: 1,
  USER_ALERT: 0.5,
  UNKNOWN: 1,
};

function roundCoordinate(value: number, precision = 4) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function severityWeight(severity?: string | null) {
  switch ((severity || '').toUpperCase()) {
    case 'HIGH':
    case 'SEVERE':
    case 'CRITICAL':
      return 1.5;
    case 'MEDIUM':
    case 'MODERATE':
      return 1.25;
    case 'LOW':
    default:
      return 1;
  }
}

function getSourceWeight(source?: string | null) {
  return SOURCE_WEIGHTS[(source || 'UNKNOWN').toUpperCase()] ?? 1;
}

function getCellKey(lat: number, lng: number, clusterSizeMeters: number) {
  const latCell = clusterSizeMeters / METERS_PER_DEGREE_LAT;
  const lngCell = clusterSizeMeters / (METERS_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180));
  const safeLngCell = Number.isFinite(lngCell) && lngCell > 0 ? lngCell : latCell;

  return `${Math.floor(lat / latCell)}:${Math.floor(lng / safeLngCell)}`;
}

export function buildHazardSignature(point: {
  type?: string | null;
  lat: number;
  lng: number;
  source?: string | null;
}) {
  return [
    point.source || 'UNKNOWN',
    (point.type || 'unknown').toLowerCase(),
    roundCoordinate(point.lat, 4),
    roundCoordinate(point.lng, 4),
  ].join(':');
}

export function buildRiskHeatmap(
  points: HistoryLikePoint[],
  options: HeatmapBuildOptions = {}
): HeatmapCluster[] {
  const clusterSizeMeters = options.clusterSizeMeters ?? DEFAULT_CLUSTER_SIZE_METERS;
  const buckets = new Map<string, ClusterBucket>();

  for (const point of points) {
    const bucketKey = getCellKey(point.lat, point.lng, clusterSizeMeters);
    const bucket = buckets.get(bucketKey) ?? {
      latTotal: 0,
      lngTotal: 0,
      incidentCount: 0,
      weight: 0,
      sourceCounts: {},
    };

    const sourceKey = (point.source || 'UNKNOWN').toUpperCase();
    const pointWeight = getSourceWeight(sourceKey) * severityWeight(point.severity);

    bucket.latTotal += point.lat;
    bucket.lngTotal += point.lng;
    bucket.incidentCount += 1;
    bucket.weight += pointWeight;
    bucket.sourceCounts[sourceKey] = (bucket.sourceCounts[sourceKey] || 0) + 1;

    buckets.set(bucketKey, bucket);
  }

  return Array.from(buckets.entries())
    .map(([id, bucket]) => {
      const dominantSource =
        Object.entries(bucket.sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNKNOWN';

      return {
        id,
        lat: bucket.latTotal / bucket.incidentCount,
        lng: bucket.lngTotal / bucket.incidentCount,
        incidentCount: bucket.incidentCount,
        weight: Number(bucket.weight.toFixed(2)),
        source: dominantSource,
        sources: bucket.sourceCounts,
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

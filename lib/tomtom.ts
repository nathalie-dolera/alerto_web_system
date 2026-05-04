import { env } from 'process';

export interface TomTomIncident {
  id: string;
  type: string;
  lat: number;
  lng: number;
  severity: string;
}

export interface TomTomRoutePoint {
  lat: number;
  lng: number;
}

export interface TomTomTrafficSection {
  startPointIndex: number;
  endPointIndex: number;
  delayInSeconds: number;
  effectiveSpeedInKmh?: number;
  magnitudeOfDelay?: number;
}

export interface TomTomRoutePlan {
  points: TomTomRoutePoint[];
  distanceMeters: number;
  travelTimeSeconds: number;
  trafficDelaySeconds: number;
  trafficLengthMeters: number;
  trafficSections: TomTomTrafficSection[];
}

export async function fetchTomTomIncidents(): Promise<TomTomIncident[]> {
  const apiKey = env.TOMTOM_API_KEY;
  if (!apiKey) {
    console.warn('TomTom API key is missing. Skipping TomTom data collection.');
    return [];
  }

  const bboxes = [
    '120.20,16.20,120.90,16.90', // Ilocos / Baguio
    '120.20,15.30,120.90,16.00', // Pangasinan / Tarlac
    '120.40,14.80,121.10,15.40', // Pampanga / Bulacan
    '120.80,14.30,121.20,14.80', // Metro Manila (NCR)
    '120.80,13.80,121.50,14.30', // Cavite / Laguna / Batangas
    '123.00,13.20,123.80,13.80', // Bicol (Naga/Legazpi)
    '122.40,10.50,123.10,11.00', // Iloilo / Bacolod
    '123.70,10.00,124.20,10.60', // Metro Cebu
    '124.80,10.80,125.20,11.30', // Leyte / Tacloban
    '124.40,8.30,124.90,8.70',   // Cagayan de Oro
    '125.30,6.90,125.80,7.40',   // Metro Davao
    '121.90,6.80,122.30,7.20',   // Zamboanga City
    '124.90,5.90,125.30,6.30',   // General Santos
    '118.50,9.50,119.20,10.00',  // Palawan (Puerto Princesa)
    '121.00,13.00,121.50,13.50', // Mindoro (Calapan)
    '121.50,17.50,122.00,18.00', // Cagayan North
    '121.50,16.50,122.00,17.00', // Isabela / Nueva Vizcaya
    '121.50,15.50,122.00,16.00', // Aurora / Quezon North
    '121.50,13.80,122.20,14.30', // Quezon South / Lucena
    '123.80,12.50,124.30,13.00', // Sorsogon / Masbate
    '124.50,11.50,125.00,12.00', // Samar / Catbalogan
    '123.80,9.50,124.30,10.00',  // Bohol (Tagbilaran)
    '123.00,9.00,123.50,9.50',   // Negros Oriental (Dumaguete)
    '125.30,8.70,125.80,9.20',   // Agusan del Norte (Butuan)
    '125.30,9.50,125.80,10.00',  // Surigao
    '124.00,7.00,124.50,7.50',   // Cotabato
    '123.00,8.20,123.50,8.70',   // Zamboanga del Norte (Dipolog)
  ];

  const allIncidents: TomTomIncident[] = [];
  
  try {
    for (const bbox of bboxes) {
      const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${apiKey}&bbox=${bbox}&language=en-GB&timeValidityFilter=present`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`TomTom API responded with status ${response.status} for bbox ${bbox}`);
        continue;
      }
      const data = await response.json();
      const incidentsList = data.incidents || [];

      for (const incident of incidentsList) {
        const coords = incident.geometry.coordinates;
        const pt = Array.isArray(coords[0]) ? coords[0] : coords;

        const mag = Math.abs(incident.properties.magnitudeOfDelay || 0);
        const severity = mag > 3 ? 'high' : mag > 1 ? 'medium' : 'low';

        let typeStr = 'congestion';
        if (incident.properties.iconCategory === 1) typeStr = 'accident';
        else if (incident.properties.iconCategory === 0) typeStr = 'unknown';
        else if (incident.properties.iconCategory === 8) typeStr = 'road_closure';

        allIncidents.push({
          id: `${pt[1]}-${pt[0]}`,
          type: typeStr,
          lat: pt[1],
          lng: pt[0],
          severity,
        });
      }
    }
    const uniqueIncidents = Array.from(new Map(allIncidents.map(item => [item.id, item])).values());

    return uniqueIncidents;
  } catch (error) {
    console.error('Error fetching TomTom data across Philippines:', error);
    return [];
  }
}

export async function fetchTomTomRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<TomTomRoutePlan | null> {
  const apiKey = env.TOMTOM_API_KEY;
  if (!apiKey) {
    console.warn('TomTom API key is missing. Skipping TomTom route request.');
    return null;
  }

  try {
    const url = new URL(
      `https://api.tomtom.com/routing/1/calculateRoute/${fromLat},${fromLng}:${toLat},${toLng}/json`
    );
    url.searchParams.set('key', apiKey);
    url.searchParams.set('traffic', 'true');
    url.searchParams.set('travelMode', 'car');
    url.searchParams.set('routeType', 'fastest');
    url.searchParams.set('computeTravelTimeFor', 'all');
    url.searchParams.append('sectionType', 'traffic');

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn(`TomTom route API responded with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const route = data?.routes?.[0];
    const leg = route?.legs?.[0];
    const summary = route?.summary;
    const rawPoints = leg?.points;

    if (!route || !summary || !Array.isArray(rawPoints) || rawPoints.length === 0) {
      return null;
    }

    return {
      points: rawPoints.map((point: { latitude: number;
        longitude: number }) => ({
        lat: point.latitude,
        lng: point.longitude,
      })),
      distanceMeters: Number(summary.lengthInMeters || 0),
      travelTimeSeconds: Number(summary.travelTimeInSeconds || 0),
      trafficDelaySeconds: Number(summary.trafficDelayInSeconds || 0),
      trafficLengthMeters: Number(summary.trafficLengthInMeters || 0),
      trafficSections: Array.isArray(leg.sections)
        ? leg.sections
          .filter((section: { sectionType?: string }) => section.sectionType === 'TRAFFIC')
          .map(
            (section: {
              startPointIndex: number;
              endPointIndex: number;
              delayInSeconds?: number;
              effectiveSpeedInKmh?: number;
              magnitudeOfDelay?: number;
            }) => ({
              startPointIndex: section.startPointIndex,
              endPointIndex: section.endPointIndex,
              delayInSeconds: Number(section.delayInSeconds || 0),
              effectiveSpeedInKmh: section.effectiveSpeedInKmh,
              magnitudeOfDelay: section.magnitudeOfDelay,
            })
          )
        : [],
    };
  } catch (error) {
    console.error('Error fetching TomTom route:', error);
    return null;
  }
}

import { env } from 'process';
import { GoogleGenAI } from '@google/genai';
import { XMLParser } from 'fast-xml-parser';

export interface AIIncident {
  id: string;
  type: string;
  description: string;
  lat: number;
  lng: number;
  severity: string;
}

const RSS_FEEDS = [
  'https://news.abs-cbn.com/feed', 
  'https://data.gmanews.tv/gno/rss/news/feed.xml', 
  'https://www.inquirer.net/fullfeed' 
];

async function fetchAllRSSDescriptions(): Promise<string> {
  const parser = new XMLParser();
  let combinedNews = '';

  for (const url of RSS_FEEDS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url.replace('http:', 'https:'), { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) continue;
      
      const xmlData = await response.text();
      const parsed = parser.parse(xmlData);

      const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
      const itemsArray = Array.isArray(items) ? items : [items];

      //limit at latest 10 items per feed to avoid huge payloads
      for (const item of itemsArray.slice(0, 10)) {
        const title = item.title || '';
        const description = item.description || item.summary || '';
        
        const cleanDesc = String(description).replace(/<[^>]*>?/gm, '');
        combinedNews += `[${url.includes('abs-cbn') ? 'ABS-CBN' : url.includes('gmanews') ? 'GMA' : 'Inquirer'}] ${title}: ${cleanDesc}\n`;
      }
    } catch (err) {
      console.warn(`Failed to fetch or parse RSS from ${url}:`, err);
    }
  }
  return combinedNews;
}

export async function fetchAIProcessedIncidents(): Promise<AIIncident[]> {
  const geminiApiKey = env.GEMINI_API_KEY;
  const tomtomApiKey = env.TOMTOM_API_KEY;

  if (!geminiApiKey || !tomtomApiKey) {
    console.warn('Gemini or TomTom API key is missing. Skipping AI data collection.');
    return [];
  }

  try {
    const rawNewsText = await fetchAllRSSDescriptions();
    if (!rawNewsText) {
      console.warn('No news data fetched from RSS feeds.');
      return [];
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const prompt = `
    Analyze the following recent news and traffic advisories from the Philippines.
    Identify any active traffic incidents, accidents, hazards, road closures, or floods.
    Extract the incidents into a JSON array of objects.
    Each object must have exactly these keys:
    - "type": (e.g., "accident", "congestion", "flood", "road_closure")
    - "description": A short summary of the incident based on the news
    - "severity": "high", "medium", or "low"
    - "location": A detailed text description of the location (e.g., "Aguinaldo Highway near St. Dominic, Bacoor", "Commonwealth Avenue, Quezon City"). Must be descriptive enough for a geocoder.

    Only return valid JSON, no markdown blocks. Do not invent incidents that are not in the text.

    News:
    ${rawNewsText.substring(0, 15000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = (response as { text?: string })?.text;
    if (!text) return [];

    let rawText = text.trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.warn('Failed to parse AI JSON output:', err);
      return [];
    }

    if (!Array.isArray(parsed)) {
      console.warn('AI returned JSON that is not an array');
      return [];
    }

    const incidents: AIIncident[] = [];

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!item || !item.location) continue;

      //geocode using TomTom 
      const query = encodeURIComponent(`${item.location}, Philippines`);
      const geocodeUrl = `https://api.tomtom.com/search/2/geocode/${query}.json?key=${tomtomApiKey}&limit=1&countrySet=PH`;

      try {
        const geoResponse = await fetch(geocodeUrl);
        if (!geoResponse.ok) {
          console.warn('TomTom geocode non-ok response for', item.location);
          continue;
        }
        const geoData = await geoResponse.json();

        if (geoData.results && geoData.results.length > 0) {
          const position = geoData.results[0].position;
          if (position && typeof position.lat === 'number' && typeof position.lon === 'number') {
            incidents.push({
              id: `ai-${Date.now()}-${i}`,
              type: item.type || 'unknown',
              description: item.description || '',
              severity: item.severity || 'medium',
              lat: position.lat,
              lng: position.lon, 
            });
          }
        }
      } catch (err) {
        console.warn('Geocoding failed for:', item.location, err);
      }
    }

    return incidents;

  } catch (error) {
    console.error('Error in Gemini/TomTom pipeline:', error);
    return [];
  }
}
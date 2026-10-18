/**
 * Real nearby health facilities from OpenStreetMap (Overpass API — free, no key).
 * Runs in the patient's browser; her location is sent only to the Overpass
 * server as a search point and is never stored by Arogyama.
 */

export interface Place {
  id: string;
  name: string;
  kind: 'hospital' | 'clinic' | 'doctors' | 'counselling' | 'health';
  mentalHealth: boolean;
  lat: number;
  lon: number;
  distanceKm: number;
  phone?: string;
  address?: string;
}

const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('unsupported'));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  });
}

export async function findNearby(lat: number, lon: number, radiusM = 8000): Promise<Place[]> {
  const q = `[out:json][timeout:20];
(
  nwr(around:${radiusM},${lat},${lon})["amenity"~"^(hospital|clinic|doctors)$"];
  nwr(around:${radiusM},${lat},${lon})["healthcare"~"^(hospital|clinic|doctor|centre|psychotherapist|counselling)$"];
  nwr(around:${radiusM},${lat},${lon})["healthcare:speciality"~"psychiatry|gynaecology|obstetrics"];
);
out center tags 80;`;
  let lastErr: unknown;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: q }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as {
        elements: { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[];
      };
      const seen = new Set<string>();
      const places: Place[] = [];
      for (const el of json.elements) {
        const tags = el.tags ?? {};
        const name = tags['name:en'] || tags.name;
        const plat = el.lat ?? el.center?.lat;
        const plon = el.lon ?? el.center?.lon;
        if (!name || plat === undefined || plon === undefined) continue;
        const key = `${name}|${plat.toFixed(3)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const spec = `${tags['healthcare:speciality'] ?? ''} ${tags.healthcare ?? ''} ${name}`.toLowerCase();
        const mental = /psychiat|psycholog|mental|counsel|manas/.test(spec);
        const amenity = tags.amenity ?? tags.healthcare ?? 'health';
        places.push({
          id: `${el.type}/${el.id}`,
          name,
          kind: mental ? 'counselling' : amenity === 'hospital' ? 'hospital' : amenity === 'clinic' || amenity === 'centre' ? 'clinic' : amenity === 'doctors' || amenity === 'doctor' ? 'doctors' : 'health',
          mentalHealth: mental,
          lat: plat,
          lon: plon,
          distanceKm: haversine(lat, lon, plat, plon),
          phone: tags.phone || tags['contact:phone'],
          address: [tags['addr:street'], tags['addr:city'] || tags['addr:district']].filter(Boolean).join(', ') || undefined,
        });
      }
      return places.sort((a, b) => Number(b.mentalHealth) - Number(a.mentalHealth) || a.distanceKm - b.distanceKm).slice(0, 25);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('lookup failed');
}

export function mapsLink(p: { lat: number; lon: number; name?: string }): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name ? `${p.name}` : `${p.lat},${p.lon}`)}&query_place_id=&center=${p.lat},${p.lon}`;
}

export function mapsSearchLink(query: string, lat?: number, lon?: number): string {
  const q = lat !== undefined && lon !== undefined ? `${query} near ${lat.toFixed(4)},${lon.toFixed(4)}` : `${query} near me`;
  return `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
}

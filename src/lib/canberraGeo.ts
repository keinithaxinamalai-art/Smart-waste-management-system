import type { Bin } from '../types';

export interface LatLng {
  lat: number;
  lng: number;
}

/** Hume Resource Management Centre — collection depot for the demo run. */
export const HUME_DEPOT: LatLng & { name: string } = {
  name: 'Hume Collection Depot',
  lat: -35.3865,
  lng: 149.1655,
};

const SUBURB_CENTROIDS: Record<string, LatLng> = {
  'Canberra City': { lat: -35.2813, lng: 149.1292 },
  Belconnen: { lat: -35.2386, lng: 149.0658 },
  Gungahlin: { lat: -35.185, lng: 149.133 },
  Woden: { lat: -35.3443, lng: 149.0876 },
  Tuggeranong: { lat: -35.415, lng: 149.068 },
  Dickson: { lat: -35.2504, lng: 149.1372 },
  Kingston: { lat: -35.3152, lng: 149.1465 },
  Manuka: { lat: -35.3208, lng: 149.1344 },
};

export function resolveBinCoords(bin: Pick<Bin, 'lat' | 'lng' | 'suburb'>): LatLng {
  if (typeof bin.lat === 'number' && typeof bin.lng === 'number') {
    return { lat: bin.lat, lng: bin.lng };
  }
  return SUBURB_CENTROIDS[bin.suburb] ?? { lat: -35.2809, lng: 149.13 };
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatDurationMin(minutes: number): string {
  const m = Math.max(1, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h} h` : `${h} h ${rem} min`;
}

export interface DrivingRoute {
  path: LatLng[];
  distanceKm: number;
  durationMin: number;
  source: 'osrm' | 'straight-line';
}

function straightLineFallback(points: LatLng[]): DrivingRoute {
  let distanceKm = 0;
  for (let i = 0; i < points.length - 1; i++) {
    distanceKm += haversineKm(points[i], points[i + 1]);
  }
  return {
    path: points,
    distanceKm,
    durationMin: (distanceKm / 35) * 60 + Math.max(0, points.length - 2) * 4,
    source: 'straight-line',
  };
}

/**
 * Road geometry from the public OSRM demo server.
 * Stop order is decided by our priority list; OSRM only traces streets between those stops.
 */
export async function fetchDrivingRoute(points: LatLng[]): Promise<DrivingRoute> {
  if (points.length < 2) {
    return { path: points, distanceKm: 0, durationMin: 0, source: 'straight-line' };
  }

  const coordStr = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return straightLineFallback(points);
    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{
        distance: number;
        duration: number;
        geometry?: { coordinates?: [number, number][] };
      }>;
    };
    const route = data.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (data.code !== 'Ok' || !route || !coords?.length) {
      return straightLineFallback(points);
    }
    return {
      path: coords.map(([lng, lat]) => ({ lat, lng })),
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60 + Math.max(0, points.length - 2) * 3,
      source: 'osrm',
    };
  } catch {
    return straightLineFallback(points);
  }
}

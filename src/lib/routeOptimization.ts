/**
 * src/lib/routeOptimization.ts — Nearest-neighbour route optimisation
 *
 * Calculates the most efficient collection order for a driver given their
 * current location and a set of smart bins. Uses the Haversine formula for
 * geographic distance calculations.
 *
 * Algorithm:
 * 1. Filter bins to only those requiring collection (fillLevel >= 80).
 * 2. From the driver's current position, select the nearest eligible bin.
 * 3. From each selected stop, select the nearest remaining eligible bin.
 * 4. Repeat until all eligible bins are sequenced.
 *
 * Critical bins (fillLevel >= 90) receive a priority bonus that can override
 * pure distance when two candidates are within a close threshold.
 */

import type { Bin } from '../types';

export interface DriverLocation {
  lat: number;
  lng: number;
}

export interface RouteStop {
  bin: Bin;
  /** Straight-line distance from previous stop (or driver) in km */
  distanceFromPrevKm: number;
  /** Stop index (1-based) */
  stopNumber: number;
}

export interface OptimizedRoute {
  stops: RouteStop[];
  /** Total straight-line route distance in km */
  totalDistanceKm: number;
  /** Driver location used as route origin */
  origin: DriverLocation;
}

/**
 * Haversine formula — returns the great-circle distance between two
 * geographic coordinates in kilometres.
 */
export function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const aVal =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

/**
 * Determine whether a bin needs collection.
 * Mirrors the frontend threshold: fillLevel >= 80 → Collection Required or Critical.
 */
function needsCollection(bin: Bin): boolean {
  return bin.fillLevel >= 80;
}

/**
 * Returns true if the bin has valid geographic coordinates.
 */
function hasValidCoords(bin: Bin): boolean {
  return (
    typeof bin.lat === 'number' &&
    typeof bin.lng === 'number' &&
    !Number.isNaN(bin.lat) &&
    !Number.isNaN(bin.lng)
  );
}

/**
 * Effective distance for selection purposes.
 * Critical bins (fillLevel >= 90) receive a virtual distance reduction of 20%
 * so they are preferred over equally-close non-critical bins without completely
 * overriding the geographic ordering.
 */
function effectiveDistance(dist: number, bin: Bin): number {
  return bin.fillLevel >= 90 ? dist * 0.8 : dist;
}

/**
 * Optimise the collection route using a nearest-neighbour greedy algorithm.
 *
 * @param driverLocation - Current driver position (lat/lng)
 * @param bins           - All bins in the system
 * @returns              - Ordered route stops and total distance
 */
export function optimizeCollectionRoute(
  driverLocation: DriverLocation,
  bins: Bin[]
): OptimizedRoute {
  // 1. Filter to only bins that need collection and have valid coordinates
  const eligible = bins.filter((b) => needsCollection(b) && hasValidCoords(b));

  if (eligible.length === 0) {
    return { stops: [], totalDistanceKm: 0, origin: driverLocation };
  }

  const stops: RouteStop[] = [];
  const remaining = [...eligible];
  let currentPos: { lat: number; lng: number } = driverLocation;
  let totalDistance = 0;
  let stopNumber = 1;

  // 2. Greedy nearest-neighbour selection
  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestEffective = Infinity;
    let bestActual = 0;

    for (let i = 0; i < remaining.length; i++) {
      const bin = remaining[i];
      // lat/lng guaranteed by hasValidCoords filter
      const dist = haversineDistance(currentPos, { lat: bin.lat!, lng: bin.lng! });
      const eff = effectiveDistance(dist, bin);
      if (eff < bestEffective) {
        bestEffective = eff;
        bestActual = dist;
        bestIndex = i;
      }
    }

    const selected = remaining.splice(bestIndex, 1)[0];
    totalDistance += bestActual;

    stops.push({
      bin: selected,
      distanceFromPrevKm: bestActual,
      stopNumber,
    });

    currentPos = { lat: selected.lat!, lng: selected.lng! };
    stopNumber++;
  }

  return {
    stops,
    totalDistanceKm: totalDistance,
    origin: driverLocation,
  };
}

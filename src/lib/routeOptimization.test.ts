/**
 * src/lib/routeOptimization.test.ts — Tests for the route optimization utility
 */

import { describe, it, expect } from 'vitest';
import {
  haversineDistance,
  optimizeCollectionRoute,
  type DriverLocation,
} from './routeOptimization';
import type { Bin } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Create a minimal bin for testing */
function makeBin(overrides: Partial<Bin> & { id: string; fillLevel: number }): Bin {
  return {
    id: overrides.id,
    location: overrides.location ?? 'Test Location',
    suburb: overrides.suburb ?? 'Test Suburb',
    fillLevel: overrides.fillLevel,
    wasteType: overrides.wasteType ?? 'General',
    status: overrides.status ?? 'Normal',
    sensorStatus: overrides.sensorStatus ?? 'Online',
    lastCollected: overrides.lastCollected ?? '2026-01-01T00:00:00Z',
    collectionPriority: overrides.collectionPriority ?? 'Low',
    priorityScore: overrides.priorityScore ?? 0,
    lat: overrides.lat,
    lng: overrides.lng,
  };
}

const CANBERRA_CIVIC: DriverLocation = { lat: -35.2809, lng: 149.13 };

// ─── Haversine distance tests ────────────────────────────────────────────────

describe('haversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    const dist = haversineDistance(CANBERRA_CIVIC, CANBERRA_CIVIC);
    expect(dist).toBeCloseTo(0, 5);
  });

  it('returns a positive distance for different coordinates', () => {
    const gungahlin = { lat: -35.185, lng: 149.133 };
    const dist = haversineDistance(CANBERRA_CIVIC, gungahlin);
    expect(dist).toBeGreaterThan(0);
  });

  it('returns approximately correct distance (Civic → Gungahlin ~10.6 km straight-line)', () => {
    // Civic (-35.2809, 149.13) → Gungahlin (-35.185, 149.133) ≈ 10.6 km
    const gungahlin = { lat: -35.185, lng: 149.133 };
    const dist = haversineDistance(CANBERRA_CIVIC, gungahlin);
    expect(dist).toBeGreaterThan(9);
    expect(dist).toBeLessThan(13);
  });

  it('is symmetric (A→B equals B→A)', () => {
    const woden = { lat: -35.352, lng: 149.083 };
    const d1 = haversineDistance(CANBERRA_CIVIC, woden);
    const d2 = haversineDistance(woden, CANBERRA_CIVIC);
    expect(d1).toBeCloseTo(d2, 8);
  });
});

// ─── optimizeCollectionRoute tests ──────────────────────────────────────────

describe('optimizeCollectionRoute', () => {
  it('returns empty route when no bins are given', () => {
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, []);
    expect(result.stops).toHaveLength(0);
    expect(result.totalDistanceKm).toBe(0);
  });

  it('returns empty route when no bins need collection (fillLevel < 80)', () => {
    const bins = [
      makeBin({ id: 'A', fillLevel: 42, lat: -35.238, lng: 149.064 }),
      makeBin({ id: 'B', fillLevel: 70, lat: -35.415, lng: 149.068 }),
    ];
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    expect(result.stops).toHaveLength(0);
  });

  it('excludes bins below 80% fill from the route', () => {
    const bins = [
      makeBin({ id: 'LOW', fillLevel: 79, lat: -35.238, lng: 149.064 }),
      makeBin({ id: 'HIGH', fillLevel: 85, lat: -35.281, lng: 149.13 }),
    ];
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    expect(result.stops).toHaveLength(1);
    expect(result.stops[0].bin.id).toBe('HIGH');
  });

  it('includes bins at exactly 80% fill', () => {
    const bins = [makeBin({ id: 'EXACT', fillLevel: 80, lat: -35.281, lng: 149.13 })];
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    expect(result.stops).toHaveLength(1);
  });

  it('selects the nearest eligible bin as the first stop (relative to driver)', () => {
    // Driver is at Civic (-35.2809, 149.13)
    // Near bin: CIV-016 at -35.281, 149.13 (≈0.0km away)
    // Far bin: GUN-015 at -35.185, 149.133 (≈10.6 km away)
    const bins = [
      makeBin({ id: 'FAR', fillLevel: 95, lat: -35.185, lng: 149.133 }),
      makeBin({ id: 'NEAR', fillLevel: 80, lat: -35.281, lng: 149.13 }),
    ];
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    expect(result.stops[0].bin.id).toBe('NEAR');
  });

  it('routes subsequent stops from the previous stop location', () => {
    // Driver at Civic, 3 bins spread across Canberra
    const bins = [
      makeBin({ id: 'BELCONNEN', fillLevel: 84, lat: -35.238, lng: 149.064 }),  // ~5.5km from Civic
      makeBin({ id: 'CIVIC', fillLevel: 80, lat: -35.281, lng: 149.13 }),       // ~0km from Civic
      makeBin({ id: 'TUGGERANONG', fillLevel: 92, lat: -35.415, lng: 149.068 }), // ~15km from Civic
    ];
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    // CIVIC should be first (nearest to driver)
    expect(result.stops[0].bin.id).toBe('CIVIC');
    expect(result.stops).toHaveLength(3);
  });

  it('does not crash with bins missing coordinates', () => {
    const bins = [
      makeBin({ id: 'NO_COORD', fillLevel: 90, lat: undefined, lng: undefined }),
      makeBin({ id: 'HAS_COORD', fillLevel: 85, lat: -35.281, lng: 149.13 }),
    ];
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    // Only the bin with valid coords should appear
    expect(result.stops).toHaveLength(1);
    expect(result.stops[0].bin.id).toBe('HAS_COORD');
  });

  it('stop numbers are sequential starting from 1', () => {
    const bins = [
      makeBin({ id: 'A', fillLevel: 90, lat: -35.281, lng: 149.13 }),
      makeBin({ id: 'B', fillLevel: 85, lat: -35.238, lng: 149.064 }),
    ];
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    result.stops.forEach((stop, i) => {
      expect(stop.stopNumber).toBe(i + 1);
    });
  });

  it('totalDistanceKm is the sum of all leg distances', () => {
    const bins = [
      makeBin({ id: 'A', fillLevel: 90, lat: -35.281, lng: 149.13 }),
      makeBin({ id: 'B', fillLevel: 85, lat: -35.238, lng: 149.064 }),
    ];
    const result = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    const legSum = result.stops.reduce((s, stop) => s + stop.distanceFromPrevKm, 0);
    expect(result.totalDistanceKm).toBeCloseTo(legSum, 6);
  });

  it('is deterministic — returns same order on repeated calls', () => {
    const bins = [
      makeBin({ id: 'WDN-104', fillLevel: 92, lat: -35.352, lng: 149.083 }),
      makeBin({ id: 'BEL-022', fillLevel: 84, lat: -35.238, lng: 149.064 }),
      makeBin({ id: 'CIV-016', fillLevel: 80, lat: -35.281, lng: 149.13 }),
      makeBin({ id: 'GUN-015', fillLevel: 95, lat: -35.185, lng: 149.133 }),
    ];
    const r1 = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    const r2 = optimizeCollectionRoute(CANBERRA_CIVIC, bins);
    expect(r1.stops.map((s) => s.bin.id)).toEqual(r2.stops.map((s) => s.bin.id));
  });
});

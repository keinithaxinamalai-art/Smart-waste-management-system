import { describe, expect, it } from 'vitest';
import { formatDistanceKm, formatDurationMin, haversineKm } from './canberraGeo';

describe('canberraGeo helpers', () => {
  it('measures Civic to Woden as a short Canberra hop', () => {
    const km = haversineKm({ lat: -35.281, lng: 149.13 }, { lat: -35.345, lng: 149.086 });
    expect(km).toBeGreaterThan(5);
    expect(km).toBeLessThan(15);
  });

  it('formats distance and duration for the demo labels', () => {
    expect(formatDistanceKm(0.4)).toBe('400 m');
    expect(formatDistanceKm(12.34)).toBe('12.3 km');
    expect(formatDurationMin(18)).toBe('18 min');
    expect(formatDurationMin(75)).toBe('1 h 15 min');
  });
});

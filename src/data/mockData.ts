export const weeklyTrendData = [
  { day: 'Mon', collections: 18, volume: 2.1 },
  { day: 'Tue', collections: 22, volume: 2.4 },
  { day: 'Wed', collections: 19, volume: 2.0 },
  { day: 'Thu', collections: 24, volume: 2.8 },
  { day: 'Fri', collections: 21, volume: 2.3 },
  { day: 'Sat', collections: 12, volume: 1.2 },
  { day: 'Sun', collections: 8, volume: 0.9 },
];

export interface CompositionSlice {
  name: string;
  value: number;
  color: string;
}

/**
 * src/services/api.ts — Frontend API service
 *
 * Centralised HTTP client for the SmartWaste backend.
 * When the backend is unavailable, functions reject gracefully so the
 * caller can fall back to localStorage state.
 *
 * Base URL is controlled via VITE_API_URL environment variable,
 * defaulting to http://localhost:3001 for local development.
 */

import type { Bin, CollectionRecord } from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

async function safeFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${input}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Check whether the backend is reachable */
export async function checkHealth(): Promise<boolean> {
  try {
    await safeFetch<{ status: string }>('/api/health');
    return true;
  } catch {
    return false;
  }
}

/** Fetch all bins from the backend (returns camelCase Bin objects) */
export async function fetchBins(): Promise<Bin[]> {
  return safeFetch<Bin[]>('/api/bins');
}

/** Fetch a single bin by ID */
export async function fetchBin(id: string): Promise<Bin> {
  return safeFetch<Bin>(`/api/bins/${id}`);
}

/** Partially update a bin (e.g. fillLevel, sensorStatus) */
export async function patchBin(id: string, data: Partial<Pick<Bin, 'fillLevel' | 'sensorStatus'>>): Promise<Bin> {
  return safeFetch<Bin>(`/api/bins/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Mark a bin as collected — resets fill to 5%, resolves linked reports/collections */
export async function collectBin(id: string): Promise<{ success: boolean; bin: Bin }> {
  return safeFetch<{ success: boolean; bin: Bin }>(`/api/bins/${id}/collect`, {
    method: 'POST',
  });
}

/** Fetch all collection records */
export async function fetchCollections(): Promise<CollectionRecord[]> {
  return safeFetch<CollectionRecord[]>('/api/collections');
}

/** Assign pending collection routes to a driver */
export async function assignCollectionRoute(driver?: string): Promise<{ success: boolean; updated: number }> {
  return safeFetch<{ success: boolean; updated: number }>('/api/routes/assign', {
    method: 'POST',
    body: JSON.stringify({ driver }),
  });
}

/** Reset backend demo data when the database is active. */
export async function resetBackendDemoData(): Promise<void> {
  await safeFetch<{ success: boolean }>('/api/reset', { method: 'POST' });
}

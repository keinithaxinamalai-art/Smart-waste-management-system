/**
 * src/services/api.ts — Frontend API service
 *
 * Centralised HTTP client for the SmartWaste backend.
 * When the backend is unavailable, functions reject gracefully so the
 * caller can fall back to localStorage state.
 *
 * Base URL is controlled via VITE_API_URL environment variable,
 * defaulting to http://localhost:3001 only when the site itself runs on localhost.
 */

import type { Bin, CollectionRecord } from '../types';

const REQUEST_TIMEOUT_MS = 1500;

function isLocalHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/**
 * Public hosts (e.g. GitHub Pages) must never call http://localhost:3001 —
 * Chrome's local network access checks block or prompt for those requests.
 */
function resolveBaseUrl(): string | null {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return isLocalHost() ? 'http://localhost:3001' : null;
}

const BASE_URL = resolveBaseUrl();

export function isApiConfigured(): boolean {
  return BASE_URL !== null;
}

async function safeFetch<T>(input: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) throw new Error('API not configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${input}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text) as { error?: string };
      throw new Error(parsed.error || text);
    } catch (err) {
      if (err instanceof SyntaxError) throw new Error(text || `API ${res.status}`);
      throw err;
    }
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

/** Fetch all public waste reports */
export async function fetchReports(): Promise<PublicReport[]> {
  return safeFetch<PublicReport[]>('/api/reports');
}

/** Save a newly submitted public report */
export async function createReport(report: PublicReport): Promise<PublicReport> {
  return safeFetch<PublicReport>('/api/reports', {
    method: 'POST',
    body: JSON.stringify(report),
  });
}

/** Update a public report's status */
export async function patchReportStatus(id: string, status: ReportStatus): Promise<PublicReport> {
  return safeFetch<PublicReport>(`/api/reports/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/** Fetch all maintenance tickets */
export async function fetchTickets(): Promise<MaintenanceTicket[]> {
  return safeFetch<MaintenanceTicket[]>('/api/tickets');
}

/** Update a maintenance ticket's status */
export async function patchTicketStatus(id: string, status: TicketStatus): Promise<MaintenanceTicket> {
  return safeFetch<MaintenanceTicket>(`/api/tickets/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/** Reset backend demo data when the database is active. */
export async function resetBackendDemoData(): Promise<void> {
  await safeFetch<{ success: boolean }>('/api/reset', { method: 'POST' });
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'staff' | 'citizen';
  suburb?: string;
  createdAt?: string;
}

export async function loginAgainstDatabase(
  email: string,
  password: string
): Promise<StoredUser> {
  return safeFetch<StoredUser>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerCitizenAccount(input: {
  name: string;
  email: string;
  password: string;
  suburb?: string;
}): Promise<StoredUser> {
  return safeFetch<StoredUser>('/api/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

import type { PublicReport } from '../types';
import { generateReportId, normalizeReportStatus } from '../utils/binUtils';

const STORAGE_KEY = 'smart-waste-public-reports';

const seedReports: PublicReport[] = [
  {
    id: 'WST-2026-1001',
    issue: 'overflow',
    issueLabel: 'Overflowing Bin',
    location: 'London Cct near Civic Square',
    suburb: 'Canberra City',
    description: 'Bin overflowing onto footpath since yesterday.',
    urgency: 'High',
    binId: 'CIV-016',
    reporterName: 'Alex M.',
    status: 'Submitted',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    photoAttached: false,
  },
];

export function loadReports(): PublicReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReports));
      return [...seedReports];
    }
    const parsed: PublicReport[] = JSON.parse(raw);
    return parsed.map((r) => ({
      ...r,
      status: normalizeReportStatus(r.status),
    }));
  } catch {
    return [...seedReports];
  }
}

export function saveReports(reports: PublicReport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function addReport(
  report: Omit<PublicReport, 'id' | 'status' | 'createdAt'>
): PublicReport {
  const reports = loadReports();
  const newReport: PublicReport = {
    ...report,
    id: generateReportId(),
    status: 'Submitted',
    createdAt: new Date().toISOString(),
  };
  reports.unshift(newReport);
  saveReports(reports);
  return newReport;
}

export function updateReportStatus(id: string, status: PublicReport['status']): void {
  const normalized = normalizeReportStatus(status);
  const reports = loadReports().map((r) => (r.id === id ? { ...r, status: normalized } : r));
  saveReports(reports);
}

export function countNewReports(): number {
  return loadReports().filter((r) => r.status === 'Submitted').length;
}

import type { PublicReport } from '../types';

const STORAGE_KEY = 'smart-waste-public-reports';

const seedReports: PublicReport[] = [
  {
    id: 'PR-1001',
    issue: 'full_bin',
    location: 'London Cct near Civic Square',
    suburb: 'Civic',
    description: 'Bin overflowing onto footpath since yesterday.',
    urgency: 'High',
    binId: 'CIV-016',
    reporterName: 'Alex M.',
    status: 'new',
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
    return JSON.parse(raw) as PublicReport[];
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
    id: `PR-${Date.now().toString(36).toUpperCase()}`,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  reports.unshift(newReport);
  saveReports(reports);
  return newReport;
}

export function updateReportStatus(id: string, status: PublicReport['status']): void {
  const reports = loadReports().map((r) => (r.id === id ? { ...r, status } : r));
  saveReports(reports);
}

export function countNewReports(): number {
  return loadReports().filter((r) => r.status === 'new').length;
}

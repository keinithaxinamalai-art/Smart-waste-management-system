import type {
  Bin,
  CollectionRecord,
  PublicReport,
} from '../types';
import { calculateCollectionPriority, getBinStatus } from '../utils/binUtils';

const BINS_STORAGE_KEY = 'swm_bins_v1';
const REPORTS_STORAGE_KEY = 'swm_reports_v1';
const COLLECTIONS_STORAGE_KEY = 'swm_collections_v1';

export const CANBERRA_SUBURBS = [
  'Canberra City',
  'Belconnen',
  'Gungahlin',
  'Woden',
  'Tuggeranong',
  'Dickson',
  'Kingston',
  'Manuka',
] as const;

export const INITIAL_BINS: Bin[] = [
  {
    id: 'WDN-104',
    location: 'Weston Creek — Park St',
    suburb: 'Woden',
    fillLevel: 92,
    wasteType: 'General',
    status: getBinStatus(92),
    sensorStatus: 'Online',
    lastCollected: '2026-08-21T14:30:00Z',
    collectionPriority: 'Critical',
    priorityScore: 88,
    lat: -35.352,
    lng: 149.083,
  },
  {
    id: 'BEL-022',
    location: 'Belconnen — Cohen St Bus Interchange',
    suburb: 'Belconnen',
    fillLevel: 84,
    wasteType: 'Recyclable',
    status: getBinStatus(84),
    sensorStatus: 'Online',
    lastCollected: '2026-08-22T06:00:00Z',
    collectionPriority: 'High',
    priorityScore: 72,
    lat: -35.238,
    lng: 149.064,
  },
  {
    id: 'CIV-016',
    location: 'Canberra City — London Cct near Civic Sq',
    suburb: 'Canberra City',
    fillLevel: 80,
    wasteType: 'General',
    status: getBinStatus(80),
    sensorStatus: 'Online',
    lastCollected: '2026-08-22T08:15:00Z',
    collectionPriority: 'High',
    priorityScore: 68,
    lat: -35.281,
    lng: 149.13,
  },
  {
    id: 'TUG-009',
    location: 'Tuggeranong — Anketell St Mall',
    suburb: 'Tuggeranong',
    fillLevel: 42,
    wasteType: 'Organic',
    status: getBinStatus(42),
    sensorStatus: 'Online',
    lastCollected: '2026-08-22T11:00:00Z',
    collectionPriority: 'Low',
    priorityScore: 21,
    lat: -35.415,
    lng: 149.068,
  },
  {
    id: 'GUN-015',
    location: 'Gungahlin — Hibberson St Light Rail',
    suburb: 'Gungahlin',
    fillLevel: 95,
    wasteType: 'General',
    status: getBinStatus(95),
    sensorStatus: 'Fault',
    lastCollected: '2026-08-20T18:00:00Z',
    collectionPriority: 'Critical',
    priorityScore: 94,
    lat: -35.185,
    lng: 149.133,
  },
  {
    id: 'MAN-031',
    location: 'Manuka — Furneaux St Shops',
    suburb: 'Manuka',
    fillLevel: 56,
    wasteType: 'Recyclable',
    status: getBinStatus(56),
    sensorStatus: 'Online',
    lastCollected: '2026-08-22T09:30:00Z',
    collectionPriority: 'Medium',
    priorityScore: 48,
    lat: -35.321,
    lng: 149.134,
  },
  {
    id: 'WOD-007',
    location: 'Woden — Bowes St Plaza',
    suburb: 'Woden',
    fillLevel: 71,
    wasteType: 'General',
    status: getBinStatus(71),
    sensorStatus: 'Online',
    lastCollected: '2026-08-22T07:45:00Z',
    collectionPriority: 'Medium',
    priorityScore: 55,
    lat: -35.345,
    lng: 149.086,
  },
  {
    id: 'DIC-008',
    location: 'Dickson — Woolley St Dining Strip',
    suburb: 'Dickson',
    fillLevel: 88,
    wasteType: 'Organic',
    status: getBinStatus(88),
    sensorStatus: 'Online',
    lastCollected: '2026-08-21T20:00:00Z',
    collectionPriority: 'High',
    priorityScore: 78,
    lat: -35.25,
    lng: 149.137,
  },
  {
    id: 'KNG-019',
    location: 'Kingston — Foreshore Promenade',
    suburb: 'Kingston',
    fillLevel: 34,
    wasteType: 'General',
    status: getBinStatus(34),
    sensorStatus: 'Online',
    lastCollected: '2026-08-22T10:00:00Z',
    collectionPriority: 'Low',
    priorityScore: 17,
    lat: -35.315,
    lng: 149.146,
  },
];

export const INITIAL_REPORTS: PublicReport[] = [
  {
    id: 'PR-1001',
    issue: 'overflow',
    issueLabel: 'Overflowing Bin',
    location: 'London Cct near Civic Square',
    suburb: 'Canberra City',
    description: 'Public litter bin overflowing onto pedestrian footpath.',
    urgency: 'High',
    wasteType: 'General',
    binId: 'CIV-016',
    reporterName: 'Alex Mercer',
    reporterEmail: 'alex.m@canberra.example.au',
    photoAttached: true,
    status: 'Submitted',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    lat: -35.281,
    lng: 149.13,
  },
  {
    id: 'PR-1002',
    issue: 'damaged',
    issueLabel: 'Damaged Bin',
    location: 'Cohen St Interchange Stop A',
    suburb: 'Belconnen',
    description: 'Side latch broken and lid missing.',
    urgency: 'Medium',
    wasteType: 'Recyclable',
    binId: 'BEL-022',
    reporterName: 'Samantha Lee',
    reporterEmail: 'sam.lee@belconnen.example.au',
    photoAttached: false,
    status: 'Under Review',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    lat: -35.238,
    lng: 149.064,
  },
  {
    id: 'PR-1003',
    issue: 'hazardous',
    issueLabel: 'Hazardous Waste',
    location: 'Hibberson St Light Rail Station',
    suburb: 'Gungahlin',
    description: 'Chemical containers left next to general waste bin.',
    urgency: 'Critical',
    wasteType: 'Hazardous',
    binId: 'GUN-015',
    reporterName: 'David K.',
    photoAttached: true,
    status: 'Scheduled',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lat: -35.185,
    lng: 149.133,
  },
];

export const INITIAL_COLLECTIONS: CollectionRecord[] = [
  {
    id: 'COL-801',
    binId: 'WDN-104',
    suburb: 'Woden',
    location: 'Weston Creek — Park St',
    scheduledDate: '2026-08-22T20:00:00Z',
    status: 'Pending',
    priority: 'Critical',
    assignedTo: 'Route Driver 1 (ACT-TRK-04)',
  },
  {
    id: 'COL-802',
    binId: 'GUN-015',
    suburb: 'Gungahlin',
    location: 'Gungahlin — Hibberson St Light Rail',
    scheduledDate: '2026-08-22T20:30:00Z',
    status: 'Pending',
    priority: 'Critical',
    assignedTo: 'Route Driver 1 (ACT-TRK-04)',
  },
  {
    id: 'COL-803',
    binId: 'DIC-008',
    suburb: 'Dickson',
    location: 'Dickson — Woolley St Dining Strip',
    scheduledDate: '2026-08-22T21:00:00Z',
    status: 'Pending',
    priority: 'High',
    assignedTo: 'Route Driver 2 (ACT-TRK-02)',
  },
];

export function getStoredBins(): Bin[] {
  try {
    const raw = localStorage.getItem(BINS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BINS_STORAGE_KEY, JSON.stringify(INITIAL_BINS));
      return INITIAL_BINS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BINS;
  }
}

export function saveStoredBins(bins: Bin[]): void {
  localStorage.setItem(BINS_STORAGE_KEY, JSON.stringify(bins));
}

export function getStoredReports(): PublicReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REPORTS;
  }
}

export function saveStoredReports(reports: PublicReport[]): void {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export function getStoredCollections(): CollectionRecord[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(INITIAL_COLLECTIONS));
      return INITIAL_COLLECTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COLLECTIONS;
  }
}

export function saveStoredCollections(collections: CollectionRecord[]): void {
  localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
}

/**
 * Executes a completed collection for a smart bin:
 * 1. Resets bin fill level to 5% (Normal status).
 * 2. Updates lastCollected timestamp.
 * 3. Re-calculates collection priority.
 * 4. Updates associated pending collection records to 'Completed'.
 * 5. Updates associated citizen waste reports for this bin to 'Resolved'.
 */
export function executeBinCollection(binId: string): {
  updatedBins: Bin[];
  updatedReports: PublicReport[];
  updatedCollections: CollectionRecord[];
} {
  const bins = getStoredBins();
  const reports = getStoredReports();
  const collections = getStoredCollections();
  const now = new Date().toISOString();

  const targetBin = bins.find((b) => b.id === binId);

  const updatedBins = bins.map((bin) => {
    if (bin.id !== binId) return bin;
    const newFill = 5;
    const newStatus = getBinStatus(newFill);
    const { priority, score } = calculateCollectionPriority(newFill, 'Low', 0);
    return {
      ...bin,
      fillLevel: newFill,
      status: newStatus,
      lastCollected: now,
      collectionPriority: priority,
      priorityScore: score,
    };
  });

  const updatedCollections = collections.map((col) => {
    if (col.binId === binId && col.status !== 'Completed') {
      return { ...col, status: 'Completed' as const, completedAt: now };
    }
    return col;
  });

  const updatedReports = reports.map((rep) => {
    if (
      (rep.binId === binId || (targetBin && rep.location.includes(targetBin.suburb))) &&
      rep.status !== 'Resolved'
    ) {
      return { ...rep, status: 'Resolved' as const };
    }
    return rep;
  });

  saveStoredBins(updatedBins);
  saveStoredReports(updatedReports);
  saveStoredCollections(updatedCollections);

  return { updatedBins, updatedReports, updatedCollections };
}

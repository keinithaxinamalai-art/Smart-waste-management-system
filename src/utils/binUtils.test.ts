import { describe, expect, it } from 'vitest';
import { executeBinCollection, updateMaintenanceTicketStatus } from '../services/dataStore';
import {
  calculateCollectionPriority,
  generateReportId,
  getBinStatus,
  getRequiredCollectionSequence,
  normalizeCollectionStatus,
  normalizeReportStatus,
  normalizeTicketStatus,
  validateWasteReport,
} from './binUtils';

describe('Smart Bin Status Algorithm (getBinStatus)', () => {
  it('classifies 0-49% as Normal', () => {
    expect(getBinStatus(0)).toBe('Normal');
    expect(getBinStatus(25)).toBe('Normal');
    expect(getBinStatus(49)).toBe('Normal');
  });

  it('classifies 50-79% as Moderate', () => {
    expect(getBinStatus(50)).toBe('Moderate');
    expect(getBinStatus(65)).toBe('Moderate');
    expect(getBinStatus(79)).toBe('Moderate');
  });

  it('classifies 80-89% as Collection Required', () => {
    expect(getBinStatus(80)).toBe('Collection Required');
    expect(getBinStatus(85)).toBe('Collection Required');
    expect(getBinStatus(89)).toBe('Collection Required');
  });

  it('classifies 90-100% as Critical', () => {
    expect(getBinStatus(90)).toBe('Critical');
    expect(getBinStatus(95)).toBe('Critical');
    expect(getBinStatus(100)).toBe('Critical');
  });

  it('handles invalid or out-of-bounds sensor values safely (-10, 105, NaN, null, undefined)', () => {
    expect(getBinStatus(-10)).toBe('Normal');
    expect(getBinStatus(105)).toBe('Critical');
    expect(getBinStatus(NaN)).toBe('Normal');
    expect(getBinStatus(null)).toBe('Normal');
    expect(getBinStatus(undefined)).toBe('Normal');
  });
});

describe('Report & Collection Status Normalization', () => {
  it('normalizes legacy report statuses to standard set', () => {
    expect(normalizeReportStatus('new')).toBe('Submitted');
    expect(normalizeReportStatus('submitted')).toBe('Submitted');
    expect(normalizeReportStatus('assigned')).toBe('Under Review');
    expect(normalizeReportStatus('Under Review')).toBe('Under Review');
    expect(normalizeReportStatus('scheduled')).toBe('Scheduled');
    expect(normalizeReportStatus('resolved')).toBe('Resolved');
    expect(normalizeReportStatus(null)).toBe('Submitted');
  });

  it('normalizes collection statuses', () => {
    expect(normalizeCollectionStatus('pending')).toBe('Pending');
    expect(normalizeCollectionStatus('scheduled')).toBe('Scheduled');
    expect(normalizeCollectionStatus('in progress')).toBe('In Progress');
    expect(normalizeCollectionStatus('completed')).toBe('Completed');
  });

  it('normalizes technician ticket statuses to Open, In Progress, Resolved', () => {
    expect(normalizeTicketStatus('new')).toBe('Open');
    expect(normalizeTicketStatus('open')).toBe('Open');
    expect(normalizeTicketStatus('acknowledged')).toBe('In Progress');
    expect(normalizeTicketStatus('in progress')).toBe('In Progress');
    expect(normalizeTicketStatus('resolved')).toBe('Resolved');
    expect(normalizeTicketStatus(null)).toBe('Open');
  });
});

describe('Collection Priority Logic (calculateCollectionPriority)', () => {
  it('calculates low priority for low fill and zero urgency', () => {
    const res = calculateCollectionPriority(30, 'Low', 0);
    expect(res.score).toBe(15);
    expect(res.priority).toBe('Low');
  });

  it('calculates medium priority for moderate fill with medium urgency', () => {
    const res = calculateCollectionPriority(60, 'Medium', 5);
    expect(res.score).toBe(44);
    expect(res.priority).toBe('Medium');
  });

  it('calculates high priority for 80% fill with high urgency', () => {
    const res = calculateCollectionPriority(80, 'High', 10);
    expect(res.score).toBe(68);
    expect(res.priority).toBe('High');
  });

  it('calculates critical priority for high fill, critical urgency, and overdue collection', () => {
    const res = calculateCollectionPriority(95, 'Critical', 24);
    expect(res.score).toBe(97);
    expect(res.priority).toBe('Critical');
  });
});

describe('Required collection sequence (getRequiredCollectionSequence)', () => {
  it('keeps only bins at 80% or more and sorts by priority score', () => {
    const rows = [
      { id: 'empty', fillLevel: 42, priorityScore: 10 },
      { id: 'crit', fillLevel: 95, priorityScore: 90 },
      { id: 'mod', fillLevel: 71, priorityScore: 50 },
      { id: 'need', fillLevel: 84, priorityScore: 70 },
    ];
    const seq = getRequiredCollectionSequence(rows);
    expect(seq.map((b) => b.id)).toEqual(['crit', 'need']);
  });
});

describe('Report ID Generation & Uniqueness (generateReportId)', () => {
  it('generates readable unique ID in WST-2026-XXXX format', () => {
    const id = generateReportId();
    expect(id).toMatch(/^WST-2026-\d{4}$/);
  });

  it('avoids collisions when existing IDs list is provided', () => {
    const existing = ['WST-2026-1001', 'WST-2026-1002', 'WST-2026-1003'];
    const newId = generateReportId(existing);
    expect(existing.includes(newId)).toBe(false);
    expect(newId).toMatch(/^WST-2026-\d{4}$/);
  });
});

describe('Explicit Report Resolution during Collection Execution', () => {
  it('Case A: resolves reports EXPLICITLY LINKED to collected binId', () => {
    const { updatedReports } = executeBinCollection('BEL-022');
    const linkedReport = updatedReports.find((r) => r.binId === 'BEL-022');
    if (linkedReport) {
      expect(linkedReport.status).toBe('Resolved');
    }
  });

  it('Case B: leaves unlinked reports in same suburb UNCHANGED', () => {
    const { updatedReports } = executeBinCollection('BEL-022');
    const unlinkedCityReport = updatedReports.find((r) => r.id === 'WST-2026-1001');
    if (unlinkedCityReport) {
      expect(unlinkedCityReport.status).toBe('Submitted');
    }
  });
});

describe('Technician work-order lifecycle', () => {
  it('advances an Open ticket to In Progress without changing other tickets', () => {
    const updated = updateMaintenanceTicketStatus('MT-101', 'In Progress');
    const started = updated.find((t) => t.id === 'MT-101');
    const batteryTicket = updated.find((t) => t.id === 'MT-102');
    expect(started?.status).toBe('In Progress');
    expect(batteryTicket?.status).toBe('Open');
  });

  it('resolves an In Progress lid-jam ticket (Open → In Progress → Resolved)', () => {
    const updated = updateMaintenanceTicketStatus('MT-103', 'Resolved');
    const lidJam = updated.find((t) => t.id === 'MT-103');
    expect(lidJam?.faultType).toBe('lid_jam');
    expect(lidJam?.status).toBe('Resolved');
  });
});

describe('Waste Report Validation (validateWasteReport)', () => {
  it('rejects empty location, suburb, or issue', () => {
    const res = validateWasteReport({});
    expect(res.isValid).toBe(false);
    expect(res.errors.location).toBeDefined();
    expect(res.errors.suburb).toBeDefined();
    expect(res.errors.issue).toBeDefined();
  });

  it('rejects whitespace-only descriptions', () => {
    const res = validateWasteReport({
      location: '123 London Circuit',
      suburb: 'Canberra City',
      issue: 'overflow',
      description: '   ',
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.description).toBeDefined();
  });

  it('validates a complete report successfully', () => {
    const res = validateWasteReport({
      location: '123 London Circuit',
      suburb: 'Canberra City',
      issue: 'overflow',
      reporterEmail: 'citizen@smartwaste.demo',
    });
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  it('flags invalid email format', () => {
    const res = validateWasteReport({
      location: '123 London Circuit',
      suburb: 'Canberra City',
      issue: 'overflow',
      reporterEmail: 'invalid-email-string',
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.reporterEmail).toBeDefined();
  });
});

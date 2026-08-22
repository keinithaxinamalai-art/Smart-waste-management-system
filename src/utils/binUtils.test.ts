import { describe, expect, it } from 'vitest';
import {
  calculateCollectionPriority,
  getBinStatus,
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

  it('handles invalid or out-of-bounds sensor values safely', () => {
    expect(getBinStatus(-10)).toBe('Normal');
    expect(getBinStatus(150)).toBe('Critical');
    expect(getBinStatus(NaN)).toBe('Normal');
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
    // fill: 30 + urgency: 10 + overdue: 4 = 44
    expect(res.score).toBe(44);
    expect(res.priority).toBe('Medium');
  });

  it('calculates high priority for 80% fill with high urgency', () => {
    const res = calculateCollectionPriority(80, 'High', 10);
    // fill: 40 + urgency: 20 + overdue: 8 = 68
    expect(res.score).toBe(68);
    expect(res.priority).toBe('High');
  });

  it('calculates critical priority for high fill, critical urgency, and overdue collection', () => {
    const res = calculateCollectionPriority(95, 'Critical', 24);
    // fill: 47.5 + urgency: 30 + overdue: 19.2 = 96.7 -> 97
    expect(res.score).toBe(97);
    expect(res.priority).toBe('Critical');
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

  it('validates a complete report successfully', () => {
    const res = validateWasteReport({
      location: '123 London Circuit',
      suburb: 'Canberra City',
      issue: 'overflow',
      reporterEmail: 'citizen@canberra.act.gov.au',
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

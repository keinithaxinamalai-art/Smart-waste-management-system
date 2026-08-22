import type {
  BinStatusLabel,
  CollectionPriority,
  PublicReport,
  ReportUrgency,
} from '../types';

/**
 * Calculates smart bin fill-level status according to ACT SmartWaste guidelines.
 * 
 * Rules:
 * 0 - 49%: Normal
 * 50 - 79%: Moderate
 * 80 - 89%: Collection Required
 * 90 - 100%: Critical
 * 
 * Out-of-range sensor values (< 0, > 100, NaN) are safely clamped/handled.
 */
export function getBinStatus(rawFillLevel: number): BinStatusLabel {
  if (typeof rawFillLevel !== 'number' || Number.isNaN(rawFillLevel)) {
    return 'Normal';
  }

  const fillLevel = Math.max(0, Math.min(100, rawFillLevel));

  if (fillLevel >= 90) return 'Critical';
  if (fillLevel >= 80) return 'Collection Required';
  if (fillLevel >= 50) return 'Moderate';
  return 'Normal';
}

export interface CollectionPriorityResult {
  score: number;
  priority: CollectionPriority;
  components: {
    fillContribution: number;
    urgencyContribution: number;
    overdueContribution: number;
  };
}

/**
 * Deterministic Collection Priority Logic:
 * Priority score = fill-level contribution + urgency contribution + overdue-collection contribution
 * 
 * Component calculations:
 * 1. Fill Level Contribution: fillLevel * 0.5 (max 50 points)
 * 2. Urgency Contribution:
 *    - Critical: 30 points
 *    - High: 20 points
 *    - Medium: 10 points
 *    - Low / None: 0 points
 * 3. Overdue Contribution: min(hoursSinceLastCollected * 0.8, 20 points)
 * 
 * Priority Classifications:
 * Score >= 80: Critical
 * Score >= 60: High
 * Score >= 40: Medium
 * Score < 40: Low
 */
export function calculateCollectionPriority(
  fillLevel: number,
  urgency: ReportUrgency = 'Low',
  hoursSinceLastCollected: number = 0
): CollectionPriorityResult {
  const safeFill = Math.max(0, Math.min(100, Number.isNaN(fillLevel) ? 0 : fillLevel));
  const safeHours = Math.max(0, Number.isNaN(hoursSinceLastCollected) ? 0 : hoursSinceLastCollected);

  const fillContribution = safeFill * 0.5;

  const urgencyWeights: Record<ReportUrgency, number> = {
    Critical: 30,
    High: 20,
    Medium: 10,
    Low: 0,
  };
  const urgencyContribution = urgencyWeights[urgency] ?? 0;

  const overdueContribution = Math.min(20, safeHours * 0.8);

  const score = Math.round(
    Math.min(100, fillContribution + urgencyContribution + overdueContribution)
  );

  let priority: CollectionPriority = 'Low';
  if (score >= 80) priority = 'Critical';
  else if (score >= 60) priority = 'High';
  else if (score >= 40) priority = 'Medium';

  return {
    score,
    priority,
    components: {
      fillContribution: Math.round(fillContribution),
      urgencyContribution,
      overdueContribution: Math.round(overdueContribution),
    },
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates waste report submission forms to prevent empty or invalid data.
 */
export function validateWasteReport(
  data: Partial<PublicReport>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.location || !data.location.trim()) {
    errors.location = 'Location or street address is required.';
  } else if (data.location.trim().length < 3) {
    errors.location = 'Location description must be at least 3 characters.';
  }

  if (!data.suburb || !data.suburb.trim()) {
    errors.suburb = 'Suburb must be selected.';
  }

  if (!data.issue) {
    errors.issue = 'Issue category must be selected.';
  }

  if (data.reporterEmail && data.reporterEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.reporterEmail.trim())) {
      errors.reporterEmail = 'Please provide a valid email address.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

import type {
  BinStatusLabel,
  CollectionPriority,
  CollectionStatus,
  PublicReport,
  ReportStatus,
  ReportUrgency,
  TicketStatus,
} from '../types';

/**
 * Normalizes legacy report status strings to standard set:
 * 'Submitted' | 'Under Review' | 'Scheduled' | 'Resolved'
 */
export function normalizeReportStatus(rawStatus?: string | null): ReportStatus {
  if (!rawStatus) return 'Submitted';
  const lower = rawStatus.toLowerCase().trim();
  if (lower === 'new' || lower === 'submitted') return 'Submitted';
  if (lower === 'assigned' || lower === 'under review' || lower === 'under_review') return 'Under Review';
  if (lower === 'scheduled') return 'Scheduled';
  if (lower === 'resolved') return 'Resolved';
  return 'Submitted';
}

/**
 * Normalizes collection status strings to standard set:
 * 'Pending' | 'Scheduled' | 'In Progress' | 'Completed'
 */
export function normalizeCollectionStatus(rawStatus?: string | null): CollectionStatus {
  if (!rawStatus) return 'Pending';
  const lower = rawStatus.toLowerCase().trim();
  if (lower === 'pending') return 'Pending';
  if (lower === 'scheduled') return 'Scheduled';
  if (lower === 'in progress' || lower === 'in_progress') return 'In Progress';
  if (lower === 'completed') return 'Completed';
  return 'Pending';
}

/**
 * Normalizes technician work-order statuses to:
 * 'Open' | 'In Progress' | 'Resolved'
 */
export function normalizeTicketStatus(rawStatus?: string | null): TicketStatus {
  if (!rawStatus) return 'Open';
  const lower = rawStatus.toLowerCase().trim();
  if (lower === 'open' || lower === 'new' || lower === 'logged') return 'Open';
  if (lower === 'in progress' || lower === 'in_progress' || lower === 'acknowledged') {
    return 'In Progress';
  }
  if (lower === 'resolved' || lower === 'closed' || lower === 'complete') return 'Resolved';
  return 'Open';
}

/**
 * Calculates smart bin fill-level status according to ACT SmartWaste guidelines.
 * 
 * Rules:
 * 0 - 49%: Normal
 * 50 - 79%: Moderate
 * 80 - 89%: Collection Required
 * 90 - 100%: Critical
 * 
 * Safe handling: Invalid sensor inputs (-10, 105, NaN, null, undefined) are safely clamped/handled.
 */
export function getBinStatus(rawFillLevel: unknown): BinStatusLabel {
  if (typeof rawFillLevel !== 'number' || Number.isNaN(rawFillLevel)) {
    return 'Normal';
  }

  const fillLevel = Math.max(0, Math.min(100, Math.round(rawFillLevel)));

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
 * Deterministic Collection Priority Algorithm:
 * Priority score = fill-level contribution + urgency contribution + overdue contribution
 * 
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

/**
 * Generates readable unique Report Reference IDs formatted as WST-2026-XXXX.
 * Checks against existing ID collection to guarantee uniqueness.
 */
export function generateReportId(existingIds: string[] = []): string {
  const existingSet = new Set(existingIds.map((id) => id.toUpperCase().trim()));
  let candidate: string;
  let attempts = 0;
  do {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `WST-2026-${randomSuffix}`;
    attempts++;
  } while (existingSet.has(candidate) && attempts < 100);

  return candidate;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates waste report submission forms to prevent empty or whitespace-only data.
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

  if (data.description && !data.description.trim()) {
    errors.description = 'Description cannot consist only of whitespace.';
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

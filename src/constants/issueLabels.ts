import type { ReportIssue } from '../types';

export const ISSUE_LABELS: Record<ReportIssue, string> = {
  overflow: 'Overflowing Bin',
  illegal_dumping: 'Illegal Dumping',
  damaged: 'Damaged Bin',
  missed_collection: 'Missed Collection',
  hazardous: 'Hazardous Waste',
  general: 'General Waste Issue',
};

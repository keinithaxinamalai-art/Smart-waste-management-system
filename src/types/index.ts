export type UserRole = 'citizen' | 'staff' | 'admin' | 'manager' | 'driver' | null;

export type ReportIssue =
  | 'overflow'
  | 'illegal_dumping'
  | 'damaged'
  | 'missed_collection'
  | 'hazardous'
  | 'general'
  | 'full_bin'
  | 'other';

export type ReportUrgency = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Scheduled'
  | 'Resolved'
  | 'new'
  | 'assigned'
  | 'resolved';

export type WasteType = 'General' | 'Recyclable' | 'Organic' | 'Hazardous';

export type BinStatusLabel = 'Normal' | 'Moderate' | 'Collection Required' | 'Critical';

export type SensorStatus = 'Online' | 'Warning' | 'Fault' | 'Offline';

export type CollectionPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Bin {
  id: string;
  location: string;
  suburb: string;
  fillLevel: number;
  wasteType: WasteType;
  status: BinStatusLabel;
  sensorStatus: SensorStatus;
  lastCollected: string;
  collectionPriority: CollectionPriority;
  priorityScore: number;
  lat?: number;
  lng?: number;
}

export interface PublicReport {
  id: string;
  issue: ReportIssue;
  issueLabel?: string;
  location: string;
  suburb: string;
  description: string;
  urgency: ReportUrgency;
  wasteType?: WasteType;
  binId?: string;
  reporterName?: string;
  reporterEmail?: string;
  photoAttached: boolean;
  status: ReportStatus;
  createdAt: string;
  lat?: number;
  lng?: number;
}

export interface CollectionRecord {
  id: string;
  binId: string;
  suburb: string;
  location: string;
  scheduledDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: CollectionPriority;
  assignedTo: string;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'staff' | 'admin';
}

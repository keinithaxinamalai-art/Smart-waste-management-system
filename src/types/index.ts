export type UserRole = 'admin' | 'staff' | 'citizen' | null;

export const ROLE_LABELS: Record<NonNullable<UserRole>, string> = {
  admin: 'Administrator',
  staff: 'Collection Staff',
  citizen: 'Citizen',
};

export type ReportIssue =
  | 'overflow'
  | 'illegal_dumping'
  | 'damaged'
  | 'missed_collection'
  | 'hazardous'
  | 'general';

export type ReportUrgency = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportStatus = 'Submitted' | 'Under Review' | 'Scheduled' | 'Resolved';

export type CollectionStatus = 'Pending' | 'Scheduled' | 'In Progress' | 'Completed';

export type WasteType = 'General' | 'Recyclable' | 'Organic' | 'Hazardous';

export type BinStatusLabel = 'Normal' | 'Moderate' | 'Collection Required' | 'Critical';

export type SensorStatus = 'Online' | 'Warning' | 'Fault' | 'Offline';

export type CollectionPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

export type FaultType = 'sensor_error' | 'low_battery' | 'lid_jam' | 'offline';

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
  status: CollectionStatus;
  priority: CollectionPriority;
  assignedTo: string;
  completedAt?: string;
}

export interface MaintenanceTicket {
  id: string;
  binId: string;
  location: string;
  suburb: string;
  faultType: FaultType;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'citizen';
}

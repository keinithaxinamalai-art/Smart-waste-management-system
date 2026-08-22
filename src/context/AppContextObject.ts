import { createContext } from 'react';
import type { Bin, CollectionRecord, PublicReport, ReportStatus, UserRole } from '../types';

export interface AppContextValue {
  role: UserRole;
  userName: string;
  userEmail: string;
  bins: Bin[];
  reports: PublicReport[];
  collections: CollectionRecord[];
  newReportCount: number;
  criticalBinCount: number;
  binsNeedingCollectionCount: number;
  login: (role: UserRole, name?: string, email?: string) => void;
  logout: () => void;
  submitPublicReport: (
    data: Omit<PublicReport, 'id' | 'status' | 'createdAt'>
  ) => PublicReport;
  setReportStatus: (id: string, status: ReportStatus) => void;
  triggerCollection: (binId: string) => void;
  resetAllDemoData: () => void;
  refreshData: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

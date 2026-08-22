import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppContext } from './AppContextObject';
import {
  executeBinCollection,
  getStoredBins,
  getStoredCollections,
  getStoredReports,
  saveStoredBins,
  saveStoredReports,
} from '../services/dataStore';
import type { Bin, CollectionPriority, CollectionRecord, PublicReport, ReportStatus, UserRole } from '../types';

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
}





function resolveInitialRole(): UserRole {
  const savedRole = sessionStorage.getItem('swm_user_role') as UserRole;
  if (savedRole) return savedRole;
  return 'admin';
}

function resolveInitialName(): string {
  return sessionStorage.getItem('swm_user_name') || 'TCCS Operations Manager';
}

function resolveInitialEmail(): string {
  return sessionStorage.getItem('swm_user_email') || 'admin@canberra.act.gov.au';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(resolveInitialRole);
  const [userName, setUserName] = useState<string>(resolveInitialName);
  const [userEmail, setUserEmail] = useState<string>(resolveInitialEmail);

  const [bins, setBins] = useState<Bin[]>(() => getStoredBins());
  const [reports, setReports] = useState<PublicReport[]>(() => getStoredReports());
  const [collections, setCollections] = useState<CollectionRecord[]>(() =>
    getStoredCollections()
  );

  const refreshData = useCallback(() => {
    setBins(getStoredBins());
    setReports(getStoredReports());
    setCollections(getStoredCollections());
  }, []);

  useEffect(() => {
    if (role) {
      sessionStorage.setItem('swm_user_role', role);
      sessionStorage.setItem('swm_user_name', userName);
      sessionStorage.setItem('swm_user_email', userEmail);
    } else {
      sessionStorage.removeItem('swm_user_role');
      sessionStorage.removeItem('swm_user_name');
      sessionStorage.removeItem('swm_user_email');
    }
  }, [role, userName, userEmail]);

  const login = useCallback(
    (r: UserRole, name?: string, email?: string) => {
      if (!r) return;

      let normalizedRole: UserRole = r;
      if (r === 'manager') normalizedRole = 'admin';
      if (r === 'driver') normalizedRole = 'staff';

      let defaultName = name;
      let defaultEmail = email;

      if (!defaultName) {
        if (normalizedRole === 'admin') defaultName = 'TCCS Operations Manager';
        else if (normalizedRole === 'staff') defaultName = 'Route Driver 1';
        else defaultName = 'Citizen User';
      }

      if (!defaultEmail) {
        if (normalizedRole === 'admin') defaultEmail = 'admin@canberra.act.gov.au';
        else if (normalizedRole === 'staff') defaultEmail = 'staff@canberra.act.gov.au';
        else defaultEmail = 'citizen@canberra.act.gov.au';
      }

      setRole(normalizedRole);
      setUserName(defaultName);
      setUserEmail(defaultEmail);
    },
    []
  );

  const logout = useCallback(() => {
    setRole(null);
    setUserName('');
    setUserEmail('');
    sessionStorage.clear();
  }, []);

  const submitPublicReport = useCallback(
    (data: Omit<PublicReport, 'id' | 'status' | 'createdAt'>) => {
      const currentReports = getStoredReports();
      const refId = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReport: PublicReport = {
        ...data,
        id: refId,
        status: 'Submitted',
        createdAt: new Date().toISOString(),
      };
      const updated = [newReport, ...currentReports];
      saveStoredReports(updated);
      setReports(updated);

      if (data.binId) {
        const currentBins = getStoredBins();
        const updatedBins = currentBins.map((b) => {
          if (b.id === data.binId) {
            const nextScore = Math.min(100, b.priorityScore + 15);
            const nextPriority: CollectionPriority = nextScore >= 80 ? 'Critical' : 'High';
            return {
              ...b,
              priorityScore: nextScore,
              collectionPriority: nextPriority,
            };
          }
          return b;
        });
        saveStoredBins(updatedBins);
        setBins(updatedBins);
      }

      return newReport;
    },
    []
  );

  const setReportStatus = useCallback((id: string, status: ReportStatus) => {
    const current = getStoredReports();
    const updated = current.map((r) => (r.id === id ? { ...r, status } : r));
    saveStoredReports(updated);
    setReports(updated);
  }, []);

  const triggerCollection = useCallback((binId: string) => {
    const { updatedBins, updatedReports, updatedCollections } =
      executeBinCollection(binId);
    setBins(updatedBins);
    setReports(updatedReports);
    setCollections(updatedCollections);
  }, []);

  const newReportCount = useMemo(
    () => reports.filter((r) => r.status === 'Submitted' || r.status === 'new').length,
    [reports]
  );

  const criticalBinCount = useMemo(
    () => bins.filter((b) => b.fillLevel >= 90 || b.status === 'Critical').length,
    [bins]
  );

  const binsNeedingCollectionCount = useMemo(
    () => bins.filter((b) => b.fillLevel >= 80).length,
    [bins]
  );

  const value = useMemo(
    () => ({
      role,
      userName,
      userEmail,
      bins,
      reports,
      collections,
      newReportCount,
      criticalBinCount,
      binsNeedingCollectionCount,
      login,
      logout,
      submitPublicReport,
      setReportStatus,
      triggerCollection,
      refreshData,
    }),
    [
      role,
      userName,
      userEmail,
      bins,
      reports,
      collections,
      newReportCount,
      criticalBinCount,
      binsNeedingCollectionCount,
      login,
      logout,
      submitPublicReport,
      setReportStatus,
      triggerCollection,
      refreshData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

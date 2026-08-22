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
  resetDemoData,
  saveStoredBins,
  saveStoredReports,
} from '../services/dataStore';
import type { Bin, CollectionPriority, CollectionRecord, PublicReport, ReportStatus, UserRole } from '../types';
import { generateReportId, normalizeReportStatus } from '../utils/binUtils';

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = sessionStorage.getItem('swm_user_role') as UserRole;
    if (savedRole === 'admin' || savedRole === 'staff' || savedRole === 'citizen') {
      return savedRole;
    }
    return null; // Unauthenticated by default
  });

  const [userName, setUserName] = useState<string>(() => {
    return sessionStorage.getItem('swm_user_name') || '';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return sessionStorage.getItem('swm_user_email') || '';
  });

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

      let defaultName = name;
      let defaultEmail = email;

      if (!defaultName) {
        if (r === 'admin') defaultName = 'TCCS Operations Manager';
        else if (r === 'staff') defaultName = 'Collection Staff Driver 1';
        else defaultName = 'Canberra Citizen Resident';
      }

      if (!defaultEmail) {
        if (r === 'admin') defaultEmail = 'admin@smartwaste.demo';
        else if (r === 'staff') defaultEmail = 'staff@smartwaste.demo';
        else defaultEmail = 'citizen@smartwaste.demo';
      }

      setRole(r);
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
      const refId = generateReportId();
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
    const normalized = normalizeReportStatus(status);
    const updated = current.map((r) => (r.id === id ? { ...r, status: normalized } : r));
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

  const resetAllDemoData = useCallback(() => {
    const fresh = resetDemoData();
    setBins(fresh.bins);
    setReports(fresh.reports);
    setCollections(fresh.collections);
  }, []);

  const newReportCount = useMemo(
    () => reports.filter((r) => r.status === 'Submitted').length,
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
      resetAllDemoData,
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
      resetAllDemoData,
      refreshData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

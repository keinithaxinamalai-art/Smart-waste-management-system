import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppContext } from './AppContextObject';
import {
  assignCollectionRoute,
  executeBinCollection,
  getStoredBins,
  getStoredCollections,
  getStoredReports,
  getStoredTickets,
  resetDemoData,
  saveStoredBins,
  saveStoredCollections,
  saveStoredReports,
  saveStoredTickets,
  updateMaintenanceTicketStatus,
} from '../services/dataStore';
import {
  fetchBins,
  fetchCollections,
  fetchReports,
  fetchTickets,
  checkHealth,
  collectBin as apiBinCollect,
  assignCollectionRoute as apiAssignCollectionRoute,
  createReport as apiCreateReport,
  patchReportStatus as apiPatchReportStatus,
  patchTicketStatus as apiPatchTicketStatus,
  resetBackendDemoData,
  registerCitizenAccount,
} from '../services/api';
import type { Bin, CollectionPriority, CollectionRecord, MaintenanceTicket, PublicReport, ReportStatus, TicketStatus, UserRole } from '../types';
import { generateReportId, normalizeReportStatus } from '../utils/binUtils';
import { registerResident as createResidentAccount } from '../lib/residentAccounts';

/** Live backend poll interval — 4 seconds */
const BACKEND_POLL_INTERVAL_MS = 4000;

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = sessionStorage.getItem('swm_user_role') as UserRole;
    if (savedRole === 'admin' || savedRole === 'staff' || savedRole === 'citizen') {
      return savedRole;
    }
    return null;
  });

  const [userName, setUserName] = useState<string>(() => {
    return sessionStorage.getItem('swm_user_name') || '';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return sessionStorage.getItem('swm_user_email') || '';
  });

  const [userSuburb, setUserSuburb] = useState<string>(() => {
    return sessionStorage.getItem('swm_user_suburb') || '';
  });

  const [bins, setBins] = useState<Bin[]>(() => getStoredBins());
  const [reports, setReports] = useState<PublicReport[]>(() => getStoredReports());
  const [collections, setCollections] = useState<CollectionRecord[]>(() =>
    getStoredCollections()
  );
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => getStoredTickets());
  const [backendAvailable, setBackendAvailable] = useState(false);

  const refreshData = useCallback(() => {
    setBins(getStoredBins());
    setReports(getStoredReports());
    setCollections(getStoredCollections());
    setTickets(getStoredTickets());
  }, []);

  // ── Backend sync ──────────────────────────────────────────────────────────
  // When the SQLite backend is running, it is the source of truth: load every
  // table on connect and poll every 4 seconds (MQTT telemetry, other sessions).
  // Falls back to localStorage silently if the backend is unavailable.
  const syncFromBackend = useCallback(async () => {
    const [apiBins, apiReports, apiCollections, apiTickets] = await Promise.allSettled([
      fetchBins(),
      fetchReports(),
      fetchCollections(),
      fetchTickets(),
    ]);
    if (apiBins.status === 'fulfilled' && apiBins.value.length > 0) {
      setBins(apiBins.value);
      saveStoredBins(apiBins.value);
    }
    if (apiReports.status === 'fulfilled') {
      const normalized = apiReports.value.map((r) => ({
        ...r,
        status: normalizeReportStatus(r.status),
      }));
      setReports(normalized);
      saveStoredReports(normalized);
    }
    if (apiCollections.status === 'fulfilled') {
      setCollections(apiCollections.value);
      saveStoredCollections(apiCollections.value);
    }
    if (apiTickets.status === 'fulfilled') {
      setTickets(apiTickets.value);
      saveStoredTickets(apiTickets.value);
    }
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const startPolling = async () => {
      const healthy = await checkHealth();
      if (cancelled) return;
      setBackendAvailable(healthy);
      if (!healthy) return;

      await syncFromBackend();
      intervalId = setInterval(() => {
        syncFromBackend().catch(() => { /* keep in-memory state */ });
      }, BACKEND_POLL_INTERVAL_MS);
    };

    startPolling();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [syncFromBackend]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (role) {
      sessionStorage.setItem('swm_user_role', role);
      sessionStorage.setItem('swm_user_name', userName);
      sessionStorage.setItem('swm_user_email', userEmail);
      sessionStorage.setItem('swm_user_suburb', userSuburb);
    } else {
      sessionStorage.removeItem('swm_user_role');
      sessionStorage.removeItem('swm_user_name');
      sessionStorage.removeItem('swm_user_email');
      sessionStorage.removeItem('swm_user_suburb');
    }
  }, [role, userName, userEmail, userSuburb]);

  const login = useCallback(
    (r: UserRole, name?: string, email?: string, suburb?: string) => {
      if (!r) return;

      let defaultName = name;
      let defaultEmail = email;
      let defaultSuburb = suburb;

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

      if (!defaultSuburb) {
        if (r === 'admin') defaultSuburb = 'Civic';
        else if (r === 'staff') defaultSuburb = 'Belconnen';
        else defaultSuburb = 'Canberra City';
      }

      setRole(r);
      setUserName(defaultName);
      setUserEmail(defaultEmail);
      setUserSuburb(defaultSuburb);
    },
    []
  );

  const registerResident = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      suburb: string;
    }) => {
      const local = createResidentAccount(input);
      if (!local.ok) {
        return { ok: false, error: local.error };
      }

      try {
        const saved = await registerCitizenAccount({
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          password: input.password,
          suburb: input.suburb.trim(),
        });
        login('citizen', saved.name, saved.email, saved.suburb);
        return { ok: true };
      } catch {
        if (local.user) {
          login(local.user.role, local.user.name, local.user.email, local.user.suburb);
        }
        return { ok: true };
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    setRole(null);
    setUserName('');
    setUserEmail('');
    setUserSuburb('');
    sessionStorage.clear();
  }, []);

  const submitPublicReport = useCallback(
    (data: Omit<PublicReport, 'id' | 'status' | 'createdAt'>) => {
      const currentReports = getStoredReports();
      const existingIds = currentReports.map((r) => r.id);
      const refId = generateReportId(existingIds);
      const newReport: PublicReport = {
        ...data,
        accountEmail: role === 'citizen' && userEmail ? userEmail.toLowerCase() : undefined,
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

      if (backendAvailable) {
        apiCreateReport(newReport).catch(() => { /* retain local copy */ });
      }

      return newReport;
    },
    [role, userEmail, backendAvailable]
  );

  const setReportStatus = useCallback((id: string, status: ReportStatus) => {
    const current = getStoredReports();
    const normalized = normalizeReportStatus(status);
    const updated = current.map((r) => (r.id === id ? { ...r, status: normalized } : r));
    saveStoredReports(updated);
    setReports(updated);
    if (backendAvailable) {
      apiPatchReportStatus(id, normalized).catch(() => { /* retain local fallback */ });
    }
  }, [backendAvailable]);

  const triggerCollection = useCallback((binId: string) => {
    // Always apply local collection logic so UI remains responsive
    const { updatedBins, updatedReports, updatedCollections } =
      executeBinCollection(binId);
    setBins(updatedBins);
    setReports(updatedReports);
    setCollections(updatedCollections);

    if (backendAvailable) {
      apiBinCollect(binId)
        .then(() => syncFromBackend())
        .catch(() => { /* retain the responsive local fallback */ });
    }
  }, [backendAvailable, syncFromBackend]);

  const assignRoute = useCallback((driverName?: string) => {
    const updatedCollections = assignCollectionRoute(driverName);
    setCollections(updatedCollections);
    if (backendAvailable) {
      apiAssignCollectionRoute(driverName)
        .then(() => syncFromBackend())
        .catch(() => { /* retain local fallback */ });
    }
  }, [backendAvailable, syncFromBackend]);

  const setTicketStatus = useCallback((id: string, status: TicketStatus) => {
    const updated = updateMaintenanceTicketStatus(id, status);
    setTickets(updated);
    if (backendAvailable) {
      apiPatchTicketStatus(id, status).catch(() => { /* retain local fallback */ });
    }
  }, [backendAvailable]);

  const resetAllDemoData = useCallback(() => {
    const fresh = resetDemoData();
    setBins(fresh.bins);
    setReports(fresh.reports);
    setCollections(fresh.collections);
    setTickets(fresh.tickets);
    if (backendAvailable) {
      resetBackendDemoData()
        .then(() => syncFromBackend())
        .catch(() => { /* retain local fallback */ });
    }
  }, [backendAvailable, syncFromBackend]);

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
      userSuburb,
      registerResident,
      bins,
      reports,
      collections,
      tickets,
      newReportCount,
      criticalBinCount,
      binsNeedingCollectionCount,
      login,
      logout,
      submitPublicReport,
      setReportStatus,
      triggerCollection,
      assignRoute,
      setTicketStatus,
      resetAllDemoData,
      refreshData,
    }),
    [
      role,
      userName,
      userEmail,
      userSuburb,
      registerResident,
      bins,
      reports,
      collections,
      tickets,
      newReportCount,
      criticalBinCount,
      binsNeedingCollectionCount,
      login,
      logout,
      submitPublicReport,
      setReportStatus,
      triggerCollection,
      assignRoute,
      setTicketStatus,
      resetAllDemoData,
      refreshData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

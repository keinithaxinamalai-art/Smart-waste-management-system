import { useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import './components/Header.css';
import { Sidebar, type NavId } from './components/Sidebar';
import './components/Sidebar.css';
import { AppProvider } from './context/AppContext';
import { useApp } from './hooks/useApp';
import { DashboardView, MapView } from './views/DashboardView';
import { DriverView } from './views/DriverView';
import './views/DriverView.css';
import { LoginView } from './views/LoginView';
import './views/LoginView.css';
import { MaintenanceView } from './views/MaintenanceView';
import './views/MaintenanceView.css';
import { PublicReportView } from './views/PublicReportView';
import './views/PublicReportView.css';
import { PublicReportsAdminView } from './views/PublicReportsAdminView';
import './views/PublicReportsAdminView.css';
import { ReportsView } from './views/ReportsView';
import './views/ReportsView.css';
import { RoutesView } from './views/RoutesView';
import './views/RoutesView.css';
import {
  clearExportParam,
  getExportMode,
  isExportCaptureMode,
  readSavedRole,
} from './lib/routing';

type AppScreen = 'login' | 'public' | 'app';

function initialRoute(): { screen: AppScreen; nav: NavId } {
  const mode = getExportMode();

  if (mode === 'public' || mode === 'public-success') {
    return { screen: 'public', nav: 'dashboard' };
  }
  if (mode === 'login') {
    return { screen: 'login', nav: 'dashboard' };
  }
  if (mode === 'driver' || mode === 'staff') {
    return { screen: 'app', nav: 'driver' };
  }
  if (mode) {
    const navMap: Record<string, NavId> = {
      dashboard: 'dashboard',
      map: 'map',
      routes: 'routes',
      maintenance: 'maintenance',
      reports: 'reports',
      'public-reports': 'public-reports',
    };
    return { screen: 'app', nav: navMap[mode] ?? 'dashboard' };
  }

  const saved = readSavedRole();
  if (saved === 'driver' || (saved as any) === 'staff') {
    return { screen: 'app', nav: 'driver' };
  }

  return { screen: 'app', nav: 'dashboard' };
}

function AppRoutes() {
  const { role, logout } = useApp();
  const exportMode = getExportMode();
  const [{ screen, nav }, setRoute] = useState(initialRoute);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setScreen = (next: AppScreen) => {
    setRoute((prev) => ({ ...prev, screen: next }));
  };

  const setNav = (next: NavId) => {
    setRoute((prev) => ({ ...prev, nav: next }));
  };

  const handleLogout = () => {
    logout();
    clearExportParam();
    setRoute({ screen: 'login', nav: 'dashboard' });
  };

  const handleManagerLogin = () => {
    clearExportParam();
    setRoute({ screen: 'app', nav: 'dashboard' });
  };

  const handleDriverLogin = () => {
    clearExportParam();
    setRoute({ screen: 'app', nav: 'driver' });
  };

  const handleCitizenLogin = () => {
    clearExportParam();
    setRoute({ screen: 'public', nav: 'dashboard' });
  };

  if (!role) {
    if (screen === 'public') {
      return (
        <PublicReportView
          variant="standalone"
          onBack={() => setScreen('login')}
          demoSuccessId={exportMode === 'public-success' ? 'PR-DEMO001' : undefined}
        />
      );
    }
    return (
      <LoginView
        onPublicReport={() => setScreen('public')}
        onManagerLogin={handleManagerLogin}
        onDriverLogin={handleDriverLogin}
        onCitizenLogin={handleCitizenLogin}
      />
    );
  }

  if (role === 'citizen') {
    return (
      <PublicReportView
        variant="standalone"
        onBack={handleLogout}
        demoSuccessId={exportMode === 'public-success' ? 'PR-DEMO001' : undefined}
      />
    );
  }

  if (screen === 'public') {
    return (
      <PublicReportView
        variant="standalone"
        onBack={() => setScreen('app')}
        demoSuccessId={exportMode === 'public-success' ? 'PR-DEMO001' : undefined}
      />
    );
  }

  if (role === 'staff' || role === 'driver') {
    return (
      <div className="driver-shell">
        <DriverView onLogout={handleLogout} />
        <button
          type="button"
          className="driver-public-link"
          onClick={() => setScreen('public')}
        >
          Report a bin (public)
        </button>
      </div>
    );
  }

  const renderView = () => {
    switch (nav) {
      case 'dashboard':
        return <DashboardView onNavigate={setNav} />;
      case 'map':
        return <MapView />;
      case 'routes':
        return <RoutesView />;
      case 'driver':
        return <DriverView onLogout={handleLogout} />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'reports':
        return <ReportsView />;
      case 'public-reports':
        return <PublicReportsAdminView />;
      default:
        return <DashboardView onNavigate={setNav} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        active={nav}
        onNavigate={setNav}
        onPublicReport={() => setScreen('public')}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-area">
        <Header
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          onLogout={handleLogout}
        />
        <main className="page-content">{renderView()}</main>
      </div>
    </div>
  );
}

function App() {
  const exportKey = typeof window !== 'undefined' ? window.location.search : '';
  const showExportBanner =
    typeof window !== 'undefined' && isExportCaptureMode();

  return (
    <AppProvider key={exportKey}>
      {showExportBanner && (
        <p className="export-mode-banner" role="status">
          Screenshot mode — remove <code>?export=…</code> from the URL for the normal app.
        </p>
      )}
      <AppRoutes key={exportKey} />
    </AppProvider>
  );
}

export default App;

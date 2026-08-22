import {
  LayoutDashboard,
  Map,
  Route,
  Wrench,
  FileBarChart,
  Truck,
  Recycle,
  Users,
} from 'lucide-react';
import { useApp } from '../hooks/useApp';

export type NavId =
  | 'dashboard'
  | 'routes'
  | 'driver'
  | 'maintenance'
  | 'reports'
  | 'map'
  | 'public-reports';

interface SidebarProps {
  active: NavId;
  onNavigate: (id: NavId) => void;
  onPublicReport?: () => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navItems: { id: NavId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Bin Map', icon: Map },
  { id: 'routes', label: 'Route Planning', icon: Route },
  { id: 'public-reports', label: 'Public Reports', icon: Users },
  { id: 'driver', label: 'Driver View', icon: Truck },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'reports', label: 'Reports & KPIs', icon: FileBarChart },
];

export function Sidebar({ active, onNavigate, onPublicReport, mobileOpen, onClose }: SidebarProps) {
  const { newReportCount } = useApp();

  const handleNav = (id: NavId) => {
    onNavigate(id);
    onClose?.();
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden={!mobileOpen}
      />
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Recycle size={22} strokeWidth={2.25} />
        </div>
        <div>
          <span className="sidebar-title">Smart Waste</span>
          <span className="sidebar-subtitle">Canberra · TCCS Pilot</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-link ${active === id ? 'active' : ''}`}
            onClick={() => handleNav(id)}
          >
            <Icon size={18} strokeWidth={2} />
            {label}
            {id === 'public-reports' && newReportCount > 0 && (
              <span className="sidebar-badge">{newReportCount}</span>
            )}
          </button>
        ))}
      </nav>

      {onPublicReport && (
        <button type="button" className="sidebar-public-cta" onClick={onPublicReport}>
          Report a bin (public)
        </button>
      )}

      <div className="sidebar-footer">
        <div className="pilot-badge">Pilot Program</div>
        <p className="sidebar-footer-text">Territory & Municipal Services</p>
      </div>
    </aside>
    </>
  );
}

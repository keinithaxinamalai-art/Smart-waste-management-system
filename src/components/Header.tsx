import { Bell, LogOut, Menu, RefreshCw, Search, User } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { ROLE_LABELS } from '../types';

interface HeaderProps {
  onLogout: () => void;
  onMenuToggle?: () => void;
}

export function Header({ onLogout, onMenuToggle }: HeaderProps) {
  const { userName, role, newReportCount, criticalBinCount, resetAllDemoData } = useApp();
  const notifCount = criticalBinCount + newReportCount;

  const handleResetDemoData = () => {
    const confirmed = window.confirm(
      'Reset Demo Data?\n\nThis will restore default seeded bins, reports, and collections for demonstration testing.'
    );
    if (confirmed) {
      resetAllDemoData();
      alert('Demo data has been restored to default seed state.');
    }
  };

  const displayRoleLabel = role ? ROLE_LABELS[role] ?? 'User' : 'Guest';

  return (
    <header className="top-header">
      {onMenuToggle && (
        <button
          type="button"
          className="header-icon-btn header-menu-btn"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}
      <div className="search-wrap">
        <Search size={18} className="search-icon" />
        <input
          type="search"
          placeholder="Search Canberra bins, suburbs, reports…"
          className="search-input"
          aria-label="Search"
        />
      </div>

      <div className="header-actions">
        {role === 'admin' && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', gap: '0.35rem' }}
            onClick={handleResetDemoData}
            title="Reset Demo Data to Seed State"
          >
            <RefreshCw size={14} /> Reset Demo Data
          </button>
        )}

        <button type="button" className="header-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          {notifCount > 0 && <span className="notif-dot">{notifCount}</span>}
        </button>

        <button
          type="button"
          className="header-icon-btn header-logout"
          onClick={onLogout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>

        <div className="header-user">
          <div className="header-user-avatar">
            <User size={18} />
          </div>
          <div className="header-user-info">
            <span className="header-user-name">{userName}</span>
            <span className="header-user-role">{displayRoleLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

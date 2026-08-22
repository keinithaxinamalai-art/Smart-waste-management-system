import { Bell, LogOut, Menu, Search, User } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { stats } from '../data/mockData';

interface HeaderProps {
  onLogout: () => void;
  onMenuToggle?: () => void;
}

export function Header({ onLogout, onMenuToggle }: HeaderProps) {
  const { userName, role, newReportCount } = useApp();
  const notifCount = stats.activeAlerts + newReportCount;

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
          placeholder="Search bins, routes, locations…"
          className="search-input"
          aria-label="Search"
        />
      </div>

      <div className="header-actions">
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
            <span className="header-user-role">
              {role === 'manager' ? 'TCCS Operations' : 'Collection Driver'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

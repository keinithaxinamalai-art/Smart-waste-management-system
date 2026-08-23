import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileText,
  LogOut,
  Menu,
  Recycle,
  RefreshCw,
  Search,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { ROLE_LABELS } from '../types';

interface HeaderProps {
  onLogout: () => void;
  onMenuToggle?: () => void;
}

export function Header({ onLogout, onMenuToggle }: HeaderProps) {
  const {
    userName,
    role,
    bins,
    reports,
    collections,
    newReportCount,
    criticalBinCount,
    resetAllDemoData,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

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

  // Interactive Search filtering bins, reports, and collections
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const matchedBins = bins.filter(
      (b) =>
        b.id.toLowerCase().includes(query) ||
        b.location.toLowerCase().includes(query) ||
        b.suburb.toLowerCase().includes(query)
    );

    const matchedReports = reports.filter(
      (r) =>
        r.id.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query) ||
        r.suburb.toLowerCase().includes(query) ||
        (r.issueLabel && r.issueLabel.toLowerCase().includes(query))
    );

    const matchedCollections = collections.filter(
      (c) =>
        c.id.toLowerCase().includes(query) ||
        c.binId.toLowerCase().includes(query) ||
        c.suburb.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query)
    );

    return {
      bins: matchedBins,
      reports: matchedReports,
      collections: matchedCollections,
      total: matchedBins.length + matchedReports.length + matchedCollections.length,
    };
  }, [searchQuery, bins, reports, collections]);

  // Dynamic notification list items
  const notifItems = useMemo(() => {
    const items: { id: string; title: string; sub: string; type: 'critical' | 'report' | 'collection' }[] = [];

    bins
      .filter((b) => b.fillLevel >= 90)
      .forEach((b) => {
        items.push({
          id: `notif-bin-${b.id}`,
          title: `Critical Bin Alert: ${b.id} (${b.fillLevel}% full)`,
          sub: `${b.location} · ${b.suburb}`,
          type: 'critical',
        });
      });

    reports
      .filter((r) => r.status === 'Submitted')
      .forEach((r) => {
        items.push({
          id: `notif-rep-${r.id}`,
          title: `New Public Report: ${r.id}`,
          sub: `${r.issueLabel || r.issue} in ${r.suburb}`,
          type: 'report',
        });
      });

    collections
      .filter((c) => c.status === 'Pending')
      .forEach((c) => {
        items.push({
          id: `notif-col-${c.id}`,
          title: `Pending Collection: ${c.binId}`,
          sub: `Assigned: ${c.assignedTo}`,
          type: 'collection',
        });
      });

    return items;
  }, [bins, reports, collections]);

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

      {/* Interactive Search Bar */}
      <div className="search-wrap" style={{ position: 'relative' }}>
        <Search size={18} className="search-icon" />
        <input
          type="search"
          placeholder="Search Canberra bins, suburbs, reports (e.g. WDN-104, WST-2026)..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search bins, suburbs, and reports"
        />
        {searchQuery && (
          <button
            type="button"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
            }}
            onClick={() => setSearchQuery('')}
          >
            <X size={16} />
          </button>
        )}

        {/* Search Results Dropdown Overlay */}
        {searchResults && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              maxHeight: '320px',
              overflowY: 'auto',
              zIndex: 100,
              padding: '0.5rem',
            }}
          >
            {searchResults.total === 0 ? (
              <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>
                No matching bins, reports, or collections found.
              </div>
            ) : (
              <div>
                {searchResults.bins.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
                      Smart Bins ({searchResults.bins.length})
                    </div>
                    {searchResults.bins.map((b) => (
                      <div
                        key={b.id}
                        style={{ padding: '0.4rem 0.5rem', borderRadius: '4px', background: '#f9fafb', marginBottom: '4px', fontSize: '0.85rem' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong><Recycle size={14} style={{ display: 'inline', marginRight: 4 }} /> {b.id}</strong>
                          <span className={`badge ${b.fillLevel >= 90 ? 'badge-critical' : 'badge-normal'}`}>{b.fillLevel}%</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{b.location} ({b.suburb})</div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.reports.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
                      Waste Reports ({searchResults.reports.length})
                    </div>
                    {searchResults.reports.map((r) => (
                      <div
                        key={r.id}
                        style={{ padding: '0.4rem 0.5rem', borderRadius: '4px', background: '#f9fafb', marginBottom: '4px', fontSize: '0.85rem' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong><FileText size={14} style={{ display: 'inline', marginRight: 4 }} /> {r.id}</strong>
                          <span className="badge badge-warning">{r.status}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{r.issueLabel || r.issue} · {r.suburb}</div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.collections.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>
                      Collection Tasks ({searchResults.collections.length})
                    </div>
                    {searchResults.collections.map((c) => (
                      <div
                        key={c.id}
                        style={{ padding: '0.4rem 0.5rem', borderRadius: '4px', background: '#f9fafb', marginBottom: '4px', fontSize: '0.85rem' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong><Truck size={14} style={{ display: 'inline', marginRight: 4 }} /> {c.id} ({c.binId})</strong>
                          <span className="badge badge-secondary">{c.status}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{c.location}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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

        {/* Interactive Notification Bell Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="header-icon-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifDropdown((prev) => !prev)}
            title="Toggle Notifications"
          >
            <Bell size={20} />
            {notifCount > 0 && <span className="notif-dot">{notifCount}</span>}
          </button>

          {showNotifDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '10px',
                width: '320px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                padding: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  borderBottom: '1px solid #f3f4f6',
                  paddingBottom: '0.5rem',
                }}
              >
                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>System Alerts & Notifications</strong>
                <span className="badge badge-critical">{notifCount} Active</span>
              </div>

              {notifItems.length === 0 ? (
                <div style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#16a34a', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={24} style={{ margin: '0 auto 0.25rem' }} />
                  <p>All smart bins and reports are operating normally.</p>
                </div>
              ) : (
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {notifItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '0.5rem',
                        marginBottom: '0.35rem',
                        borderRadius: '6px',
                        background: item.type === 'critical' ? '#fef2f2' : item.type === 'report' ? '#fffbeb' : '#f0fdf4',
                        borderLeft: `3px solid ${item.type === 'critical' ? '#dc2626' : item.type === 'report' ? '#d97706' : '#16a34a'}`,
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>
                        {item.type === 'critical' && <AlertTriangle size={14} style={{ color: '#dc2626', display: 'inline', marginRight: 4 }} />}
                        {item.type === 'report' && <FileText size={14} style={{ color: '#d97706', display: 'inline', marginRight: 4 }} />}
                        {item.type === 'collection' && <Truck size={14} style={{ color: '#16a34a', display: 'inline', marginRight: 4 }} />}
                        {item.title}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '2px' }}>{item.sub}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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

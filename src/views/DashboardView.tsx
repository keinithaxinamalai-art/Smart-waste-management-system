import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Recycle,
  Route,
  ShieldAlert,
  Truck,
  Users,
} from 'lucide-react';
import { AlertsList } from '../components/AlertsList';
import '../components/AlertsList.css';
import { BinTable } from '../components/BinTable';
import '../components/BinTable.css';
import { CollectionsChart } from '../components/Charts';
import { MapPanel } from '../components/MapPanel';
import '../components/MapPanel.css';
import type { NavId } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import '../components/StatCard.css';
import { useApp } from '../hooks/useApp';

interface DashboardViewProps {
  onNavigate?: (id: NavId) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const {
    bins,
    reports,
    newReportCount,
    criticalBinCount,
    binsNeedingCollectionCount,
    triggerCollection,
  } = useApp();

  const totalBins = bins.length;
  const avgFill =
    totalBins > 0
      ? Math.round(bins.reduce((sum, b) => sum + b.fillLevel, 0) / totalBins)
      : 0;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;
  const criticalBins = bins.filter((b) => b.fillLevel >= 80 || b.status === 'Critical');

  return (
    <>
      <div className="page-header page-header--row">
        <div>
          <h1>TCCS Administrator Dashboard</h1>
          <p>Canberra SmartWaste Management System — Territory & Municipal Services</p>
        </div>
        <span className="live-pill">Live Telemetry · ACT Grid Active</span>
      </div>

      {newReportCount > 0 && (
        <button
          type="button"
          className="public-alert-banner"
          onClick={() => onNavigate?.('public-reports')}
        >
          <Users size={20} />
          <span>
            <strong>{newReportCount} active public report{newReportCount > 1 ? 's' : ''}</strong>
            {' '}from ACT citizens — review and assign collection routes
          </span>
          <ChevronRight size={20} />
        </button>
      )}

      <div className="stats-grid">
        <StatCard
          label="Active Reports"
          value={newReportCount}
          sub="Requires TCCS review"
          icon={Users}
          variant={newReportCount > 0 ? 'alert' : undefined}
          onClick={newReportCount > 0 ? () => onNavigate?.('public-reports') : undefined}
        />
        <StatCard
          label="Critical Bins"
          value={criticalBinCount}
          sub="Fill Level ≥ 90%"
          icon={AlertTriangle}
          variant={criticalBinCount > 0 ? 'alert' : undefined}
        />
        <StatCard
          label="Collection Needed"
          value={binsNeedingCollectionCount}
          sub="Fill Level ≥ 80%"
          icon={Truck}
          variant="warning"
        />
        <StatCard
          label="Avg Network Fill"
          value={`${avgFill}%`}
          sub="Across Canberra zones"
          icon={Gauge}
        />
        <StatCard
          label="Total Monitored Bins"
          value={totalBins}
          sub="ACT Smart-Bin Grid"
          icon={Recycle}
        />
        <StatCard
          label="Resolved Reports"
          value={resolvedReports}
          sub="Completed cleanups"
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {criticalBins.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid #dc2626' }}>
          <div className="card-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b' }}>
              <ShieldAlert size={20} /> Critical Smart-Bins Requiring Priority Pickup
            </h2>
            <span className="badge badge-critical">{criticalBins.length} Bins</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {criticalBins.map((bin) => (
                <div
                  key={bin.id}
                  style={{
                    padding: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{bin.id}</strong>
                    <span className="badge badge-critical">{bin.fillLevel}% Full</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>{bin.location} ({bin.suburb})</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Priority Score: <strong>{bin.priorityScore}</strong> ({bin.collectionPriority})
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginTop: '0.25rem', padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }}
                    onClick={() => triggerCollection(bin.id)}
                  >
                    <Truck size={14} /> Dispatch Collection Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Live Canberra Bin Map</h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate?.('map')}
            >
              Expand Map View
            </button>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <MapPanel />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>System Alerts & Telemetry</h2>
            <span className="badge badge-critical">{criticalBinCount} critical</span>
          </div>
          <div className="card-body">
            <AlertsList limit={5} />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate?.('routes')}
              >
                <Route size={16} /> View Optimized Routes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-bottom">
        <div className="card">
          <div className="card-header">
            <h2>Weekly Waste Collection Trend</h2>
          </div>
          <div className="card-body">
            <CollectionsChart />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Smart Bin Telemetry Status</h2>
          </div>
          <BinTable limit={6} />
        </div>
      </div>
    </>
  );
}

export function MapView() {
  return (
    <>
      <div className="page-header">
        <h1>Canberra Bin Network Map</h1>
        <p>Geographic view of smart bins across ACT suburbs — click markers for details</p>
      </div>
      <div className="card">
        <div className="card-body">
          <MapPanel />
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <h2>All Monitored Smart Bins</h2>
        </div>
        <BinTable />
      </div>
    </>
  );
}

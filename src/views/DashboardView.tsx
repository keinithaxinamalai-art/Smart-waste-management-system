import { AlertTriangle, ChevronRight, Gauge, Recycle, Route, Truck, Users } from 'lucide-react';
import { AlertsList } from '../components/AlertsList';
import '../components/AlertsList.css';
import { BinTable } from '../components/BinTable';
import '../components/BinTable.css';
import { CollectionsChart } from '../components/Charts';
import { MapPanel } from '../components/MapPanel';
import '../components/MapPanel.css';
import { StatCard } from '../components/StatCard';
import '../components/StatCard.css';
import { useApp } from '../hooks/useApp';
import { stats } from '../data/mockData';
import type { NavId } from '../components/Sidebar';

interface DashboardViewProps {
  onNavigate?: (id: NavId) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { newReportCount } = useApp();

  return (
    <>
      <div className="page-header page-header--row">
        <div>
          <h1>Manager Dashboard</h1>
          <p>Smart Waste Management — Canberra TCCS pilot operations</p>
        </div>
        <span className="live-pill">Live · Updated just now</span>
      </div>

      {newReportCount > 0 && (
        <button
          type="button"
          className="public-alert-banner"
          onClick={() => onNavigate?.('public-reports')}
        >
          <Users size={20} />
          <span>
            <strong>{newReportCount} new public report{newReportCount > 1 ? 's' : ''}</strong>
            {' '}from citizens — review and assign collection
          </span>
          <ChevronRight size={20} />
        </button>
      )}

      <div className="stats-grid">
        <StatCard
          label="Public reports"
          value={newReportCount}
          sub="Awaiting review"
          icon={Users}
          variant={newReportCount > 0 ? 'alert' : undefined}
          onClick={newReportCount > 0 ? () => onNavigate?.('public-reports') : undefined}
        />
        <StatCard label="Active alerts" value={stats.activeAlerts} sub="Require attention" icon={AlertTriangle} variant="alert" />
        <StatCard label="Avg fill level" value={`${stats.avgFillPercent}%`} sub="Network-wide average" icon={Gauge} />
        <StatCard label="Total bins" value={stats.totalBins} sub="Across ACT pilot zones" icon={Recycle} />
        <StatCard label="Collections today" value={stats.collectionsToday} sub="+12% vs last week" icon={Truck} variant="success" />
        <StatCard label="Distance saved" value={`${stats.distanceSavedKm} km`} sub="Route optimisation" icon={Route} variant="success" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Live bin map</h2>
            <button type="button" className="btn btn-secondary">View Bin WDN-104</button>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <MapPanel />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent alerts</h2>
            <span className="badge badge-critical">{stats.activeAlerts} active</span>
          </div>
          <div className="card-body">
            <AlertsList limit={5} />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-primary">Plan Route</button>
              <button type="button" className="btn btn-ghost">View all</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-bottom">
        <div className="card">
          <div className="card-header">
            <h2>Weekly collections</h2>
          </div>
          <div className="card-body">
            <CollectionsChart />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Bin status</h2>
            <button type="button" className="btn btn-ghost">Export</button>
          </div>
          <BinTable limit={5} />
        </div>
      </div>
    </>
  );
}

export function MapView() {
  return (
    <>
      <div className="page-header">
        <h1>Bin Map</h1>
        <p>Geographic view of all monitored bins — tap markers for details</p>
      </div>
      <div className="card">
        <div className="card-body">
          <MapPanel />
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <h2>All bins</h2>
        </div>
        <BinTable />
      </div>
    </>
  );
}

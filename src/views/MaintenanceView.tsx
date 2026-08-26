import { useMemo, useState } from 'react';
import {
  Activity,
  BatteryCharging,
  CheckCircle2,
  Lock,
  Radio,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { FAULT_DETAILS, FAULT_LABELS } from '../constants/faultLabels';
import { useApp } from '../hooks/useApp';
import type { FaultType, TicketStatus } from '../types';
import './MaintenanceView.css';

type TicketFilter = 'all' | TicketStatus;

const FAULT_ICONS: Record<FaultType, typeof ShieldAlert> = {
  sensor_error: ShieldAlert,
  low_battery: BatteryCharging,
  lid_jam: Lock,
  offline: Radio,
};

export function MaintenanceView() {
  const { bins, tickets, setTicketStatus } = useApp();
  const [filter, setFilter] = useState<TicketFilter>('all');

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === 'Open').length,
      inProgress: tickets.filter((t) => t.status === 'In Progress').length,
      resolved: tickets.filter((t) => t.status === 'Resolved').length,
    }),
    [tickets]
  );

  const visibleTickets = useMemo(() => {
    const filtered = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);
    const order: Record<TicketStatus, number> = { Open: 0, 'In Progress': 1, Resolved: 2 };
    return [...filtered].sort((a, b) => order[a.status] - order[b.status]);
  }, [tickets, filter]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <>
      <div className="page-header">
        <h1>Smart Bin Maintenance & Sensor Diagnostics</h1>
        <p>
          Simulated sensor errors, low-battery alerts, and lid mechanism jams with technician
          work orders from Open to In Progress and Resolved
        </p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#3730a3' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-label">Active Sensors</div>
            <div className="stat-value">
              {bins.filter((b) => b.sensorStatus === 'Online').length} / {bins.length}
            </div>
            <div className="stat-sub">Telemetry heartbeat OK</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
            <BatteryCharging size={20} />
          </div>
          <div>
            <div className="stat-label">Low Battery Warnings</div>
            <div className="stat-value">{bins.filter((b) => b.sensorStatus === 'Warning').length}</div>
            <div className="stat-sub">Sub-20% voltage level</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#991b1b' }}>
            <Radio size={20} />
          </div>
          <div>
            <div className="stat-label">Sensor Faults & Offline</div>
            <div className="stat-value">
              {bins.filter((b) => b.sensorStatus === 'Fault' || b.sensorStatus === 'Offline').length}
            </div>
            <div className="stat-sub">Requires technician check</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
            <Wrench size={20} />
          </div>
          <div>
            <div className="stat-label">Open Work Orders</div>
            <div className="stat-value">{counts.open}</div>
            <div className="stat-sub">{counts.inProgress} in progress · {counts.resolved} resolved</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Technician Work Orders</h2>
          <span className="badge badge-warning">{counts.open + counts.inProgress} Active</span>
        </div>
        <div className="card-body">
          <div className="ticket-filters">
            {(
              [
                ['all', `All (${tickets.length})`],
                ['Open', `Open (${counts.open})`],
                ['In Progress', `In Progress (${counts.inProgress})`],
                ['Resolved', `Resolved (${counts.resolved})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`ticket-filter-chip ${filter === value ? 'active' : ''}`}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {visibleTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#16a34a' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 600 }}>No technician tickets in this status.</p>
            </div>
          ) : (
            <ul className="maintenance-list">
              {visibleTickets.map((ticket) => {
                const Icon = FAULT_ICONS[ticket.faultType];
                return (
                  <li key={ticket.id} className="maintenance-item">
                    <div className={`maintenance-icon maintenance-icon--${ticket.faultType}`}>
                      <Icon size={20} />
                    </div>
                    <div className="maintenance-body">
                      <span className="maintenance-type">
                        {ticket.id} · {FAULT_LABELS[ticket.faultType]}
                      </span>
                      <strong>
                        {ticket.binId} — {ticket.location} ({ticket.suburb})
                      </strong>
                      <p>{ticket.notes || FAULT_DETAILS[ticket.faultType]}</p>
                      <span className="maintenance-meta">Updated {formatDate(ticket.updatedAt)}</span>
                    </div>
                    <div className="maintenance-actions">
                      <span className={`ticket-status ticket-status--${ticket.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {ticket.status}
                      </span>
                      {ticket.status === 'Open' && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setTicketStatus(ticket.id, 'In Progress')}
                        >
                          <Wrench size={14} /> Acknowledge Ticket
                        </button>
                      )}
                      {ticket.status === 'In Progress' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setTicketStatus(ticket.id, 'Resolved')}
                        >
                          <CheckCircle2 size={14} /> Mark Resolved
                        </button>
                      )}
                      {ticket.status === 'Resolved' && (
                        <span className="maintenance-resolved-label">Lifecycle complete</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

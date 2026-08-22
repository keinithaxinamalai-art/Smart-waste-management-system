import { useState } from 'react';
import { Activity, BatteryCharging, CheckCircle2, Radio, ShieldAlert, Wrench } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import './MaintenanceView.css';

export function MaintenanceView() {
  const { bins } = useApp();
  const [resolvedTickets, setResolvedTickets] = useState<string[]>([]);

  const faultBins = bins.filter(
    (b) => (b.sensorStatus === 'Fault' || b.sensorStatus === 'Warning' || b.sensorStatus === 'Offline') &&
      !resolvedTickets.includes(b.id)
  );

  const handleResolveTicket = (binId: string) => {
    setResolvedTickets((prev) => [...prev, binId]);
  };

  return (
    <>
      <div className="page-header">
        <h1>Smart Bin Maintenance & Sensor Diagnostics</h1>
        <p>Telemetry status monitoring, sensor battery levels, and technician dispatches</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff', color: '#3730a3' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="stat-label">Active Sensors</div>
            <div className="stat-value">{bins.filter((b) => b.sensorStatus === 'Online').length} / {bins.length}</div>
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
            <div className="stat-value">{bins.filter((b) => b.sensorStatus === 'Fault' || b.sensorStatus === 'Offline').length}</div>
            <div className="stat-sub">Requires technician check</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Sensor Maintenance Tickets</h2>
          <span className="badge badge-warning">{faultBins.length} Open Tickets</span>
        </div>
        <div className="card-body">
          {faultBins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#16a34a' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontWeight: 600 }}>All smart bin telemetry sensors are fully operational.</p>
            </div>
          ) : (
            <ul className="maintenance-list">
              {faultBins.map((bin) => (
                <li key={bin.id} className="maintenance-item">
                  <div className="maintenance-icon">
                    {bin.sensorStatus === 'Fault' ? (
                      <ShieldAlert size={20} style={{ color: '#dc2626' }} />
                    ) : bin.sensorStatus === 'Warning' ? (
                      <BatteryCharging size={20} style={{ color: '#d97706' }} />
                    ) : (
                      <Radio size={20} style={{ color: '#4b5563' }} />
                    )}
                  </div>
                  <div className="maintenance-body">
                    <span className="maintenance-type">{bin.sensorStatus} ALERT</span>
                    <strong>{bin.id} — {bin.location} ({bin.suburb})</strong>
                    <p>
                      {bin.sensorStatus === 'Fault'
                        ? 'Ultrasonic level sensor error — periodic missed Heartbeat telemetry.'
                        : bin.sensorStatus === 'Warning'
                        ? 'Sensor battery degraded to 14% — schedule battery swap.'
                        : 'Module offline — no RF ping received for > 2 hours.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleResolveTicket(bin.id)}
                  >
                    <Wrench size={14} /> Dispatch Technician
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

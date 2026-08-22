import { AlertTriangle, Battery, Radio, Users } from 'lucide-react';
import { useApp } from '../hooks/useApp';

export interface DynamicAlert {
  id: string;
  binId: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
  icon: typeof AlertTriangle;
}

export function AlertsList({ limit = 5 }: { limit?: number }) {
  const { bins, reports } = useApp();

  const generatedAlerts: DynamicAlert[] = [];

  // 1. Critical bins (≥90%)
  bins
    .filter((b) => b.fillLevel >= 90)
    .forEach((b) => {
      generatedAlerts.push({
        id: `ALT-CRIT-${b.id}`,
        binId: b.id,
        message: `FULL_BIN alert — capacity at ${b.fillLevel}% (${b.suburb})`,
        severity: 'high',
        time: 'Just now',
        icon: AlertTriangle,
      });
    });

  // 2. Sensor faults or warnings
  bins
    .filter((b) => b.sensorStatus === 'Fault' || b.sensorStatus === 'Offline')
    .forEach((b) => {
      generatedAlerts.push({
        id: `ALT-SENS-${b.id}`,
        binId: b.id,
        message: `Sensor ${b.sensorStatus} — telemetry ping missed (${b.suburb})`,
        severity: 'high',
        time: 'Active',
        icon: Radio,
      });
    });

  // 3. Active public reports
  reports
    .filter((r) => r.status === 'Submitted')
    .forEach((r) => {
      generatedAlerts.push({
        id: `ALT-REP-${r.id}`,
        binId: r.binId || r.suburb,
        message: `New public waste report: ${r.issueLabel || r.issue} (${r.suburb})`,
        severity: r.urgency === 'Critical' || r.urgency === 'High' ? 'high' : 'medium',
        time: 'Pending review',
        icon: Users,
      });
    });

  // 4. Collection required bins (80-89%)
  bins
    .filter((b) => b.fillLevel >= 80 && b.fillLevel < 90)
    .forEach((b) => {
      generatedAlerts.push({
        id: `ALT-WARN-${b.id}`,
        binId: b.id,
        message: `Approaching capacity threshold (${b.fillLevel}%)`,
        severity: 'medium',
        time: 'Scheduled',
        icon: Battery,
      });
    });

  const items = generatedAlerts.slice(0, limit);

  if (items.length === 0) {
    return (
      <div style={{ padding: '1rem', color: '#16a34a', fontSize: '0.875rem' }}>
        No active system alerts. All smart bins operating within normal thresholds.
      </div>
    );
  }

  return (
    <ul className="alerts-list">
      {items.map((alert) => {
        const Icon = alert.icon;
        return (
          <li key={alert.id} className={`alert-item alert-item--${alert.severity}`}>
            <div className="alert-icon">
              <Icon size={16} />
            </div>
            <div className="alert-body">
              <span className="alert-bin">{alert.binId}</span>
              <p className="alert-msg">{alert.message}</p>
              <span className="alert-time">{alert.time}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

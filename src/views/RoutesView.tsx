import { useState } from 'react';
import { CheckCircle2, Route, Truck } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import './RoutesView.css';

export function RoutesView() {
  const { bins } = useApp();
  const [assigned, setAssigned] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Generate suggested sequence from bins requiring collection sorted by priority score
  const sequence = [...bins]
    .filter((b) => b.fillLevel >= 50)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const handleAssignDriver = () => {
    setAssigned(true);
    setToast('Suggested collection sequence assigned to Route Driver 1 (ACT-TRK-04)!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      <div className="page-header">
        <h1>Suggested Collection Sequence</h1>
        <p>Demonstration collection order based on current smart-bin collection priorities</p>
      </div>

      {toast && (
        <div
          style={{
            background: '#d1fae5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '0.875rem 1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={20} />
          {toast}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Route ACT-R104 — Priority Collection Sequence</h2>
            <button
              type="button"
              className={`btn ${assigned ? 'btn-success' : 'btn-primary'}`}
              onClick={handleAssignDriver}
              disabled={assigned}
            >
              {assigned ? (
                <>
                  <CheckCircle2 size={16} /> Assigned & Active
                </>
              ) : (
                <>
                  <Truck size={16} /> Approve & Assign Driver
                </>
              )}
            </button>
          </div>
          <div className="card-body">
            <ol className="route-list">
              {sequence.map((stop, idx) => (
                <li key={stop.id} className="route-stop">
                  <span className="route-order">{idx + 1}</span>
                  <div className="route-stop-body">
                    <strong>{stop.id}</strong>
                    <span>{stop.location} ({stop.suburb})</span>
                  </div>
                  <span
                    className={`route-fill ${
                      stop.fillLevel >= 90
                        ? 'route-fill--high'
                        : stop.fillLevel >= 80
                        ? 'route-fill--warn'
                        : ''
                    }`}
                  >
                    {stop.fillLevel}% ({stop.collectionPriority})
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Sequence Overview</h2>
          </div>
          <div className="card-body route-summary">
            <div className="route-summary-stat">
              <Route size={24} />
              <div>
                <span className="route-summary-value">{sequence.length} Priority Stops</span>
                <span className="route-summary-label">Estimated route duration: ~1h 45m</span>
              </div>
            </div>
            <div className="route-summary-stat">
              <span className="route-summary-value">Priority Based</span>
              <span className="route-summary-label">Sequence ordered by fill level & urgency score</span>
            </div>
            {sequence.length > 0 && (
              <p className="route-note">
                Current order: {sequence.slice(0, 4).map((s) => `${s.id} (${s.fillLevel}%)`).join(' → ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

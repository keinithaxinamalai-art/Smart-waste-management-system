import { useMemo, useState } from 'react';
import { CheckCircle2, MapPinned, Route, Truck } from 'lucide-react';
import { CanberraMap } from '../components/CanberraMap';
import { useDrivingRouteSummary } from '../hooks/useDrivingRoute';
import { useApp } from '../hooks/useApp';
import { formatDistanceKm, formatDurationMin } from '../lib/canberraGeo';
import { getBinStatus, getRequiredCollectionSequence } from '../utils/binUtils';
import './RoutesView.css';

export function RoutesView() {
  const { bins, assignRoute } = useApp();
  const [assigned, setAssigned] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sequence = useMemo(() => getRequiredCollectionSequence(bins), [bins]);
  const driving = useDrivingRouteSummary(sequence);

  const handleAssignDriver = () => {
    assignRoute('Route Driver 1 (ACT-TRK-04)');
    setAssigned(true);
    setToast('Suggested collection sequence assigned and persisted to Route Driver 1 (ACT-TRK-04)!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      <div className="page-header">
        <h1>Suggested Collection Sequence</h1>
        <p>
          Bins at 80% or more, ordered by priority score. The map traces that order on Canberra
          roads using OSRM (Open Source Routing Machine).
        </p>
      </div>

      {toast && (
        <div className="route-toast">
          <CheckCircle2 size={20} />
          {toast}
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <h2>Live route map — Hume depot to priority stops</h2>
          <span className="badge badge-normal">
            {driving?.source === 'osrm' ? 'OSRM road path' : driving ? 'Straight-line fallback' : 'Loading path…'}
          </span>
        </div>
        <div className="card-body" style={{ paddingTop: 0 }}>
          <CanberraMap bins={bins} routeStops={sequence} height={460} showDepot />
          <p className="route-note" style={{ marginTop: '0.85rem' }}>
            Teal line = streets from OSRM. Pins that are faded are under 80% and are not on the
            truck run. This is not GPS tracking and not AI routing.
          </p>
        </div>
      </div>

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
              <li className="route-stop">
                <span className="route-order route-order--depot">D</span>
                <div className="route-stop-body">
                  <strong>Hume Collection Depot</strong>
                  <span>Start of run</span>
                </div>
              </li>
              {sequence.map((stop, idx) => (
                <li key={stop.id} className="route-stop">
                  <span className="route-order">{idx + 1}</span>
                  <div className="route-stop-body">
                    <strong>{stop.id}</strong>
                    <span>{stop.location} ({stop.suburb})</span>
                  </div>
                  <span
                    className={`route-fill ${
                      stop.fillLevel >= 90 ? 'route-fill--high' : 'route-fill--warn'
                    }`}
                  >
                    {stop.fillLevel}% ({getBinStatus(stop.fillLevel)})
                  </span>
                </li>
              ))}
              <li className="route-stop">
                <span className="route-order route-order--depot">D</span>
                <div className="route-stop-body">
                  <strong>Return to Hume Depot</strong>
                  <span>End of run</span>
                </div>
              </li>
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
                <span className="route-summary-value">{sequence.length} required stops</span>
                <span className="route-summary-label">Only Collection Required and Critical bins</span>
              </div>
            </div>
            <div className="route-summary-stat">
              <MapPinned size={24} />
              <div>
                <span className="route-summary-value">
                  {driving ? formatDistanceKm(driving.distanceKm) : '…'}
                </span>
                <span className="route-summary-label">
                  {driving
                    ? `${formatDurationMin(driving.durationMin)} driving${
                        driving.source === 'osrm' ? ' (OSRM + stop time)' : ' (estimate)'
                      }`
                    : 'Asking OSRM for road distance'}
                </span>
              </div>
            </div>
            <div className="route-summary-stat">
              <span className="route-summary-value">Priority then roads</span>
              <span className="route-summary-label">
                Which bins: fill ≥ 80% and score. Which streets: OSRM.
              </span>
            </div>
            {sequence.length > 0 && (
              <p className="route-note">
                Current order: Depot → {sequence.map((s) => `${s.id} (${s.fillLevel}%)`).join(' → ')}{' '}
                → Depot
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

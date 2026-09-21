import { CheckCircle2, MapPin, Navigation, Route, Truck } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { optimizeCollectionRoute } from '../lib/routeOptimization';
import { MapPanel } from '../components/MapPanel';
import '../components/MapPanel.css';
import { useState } from 'react';
import './RoutesView.css';

export function RoutesView() {
  const { bins, assignRoute } = useApp();
  const { location: driverLocation, source: locationSource, errorMsg: locationError } = useDriverLocation();
  const [assigned, setAssigned] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Optimized route using nearest-neighbour from driver's current location
  const route = optimizeCollectionRoute(driverLocation, bins);
  const sequence = route.stops;

  // Build route polyline coordinates: Driver → Stop1 → Stop2 → ...
  const routeCoords: Array<[number, number]> = [
    [driverLocation.lat, driverLocation.lng],
    ...sequence.map((s) => [s.bin.lat!, s.bin.lng!] as [number, number]),
  ];

  const handleAssignDriver = () => {
    assignRoute('Route Driver 1 (ACT-TRK-04)');
    setAssigned(true);
    setToast('Optimized collection route assigned to Route Driver 1 (ACT-TRK-04)!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      <div className="page-header">
        <h1>Optimized Collection Route</h1>
        <p>Nearest-neighbour route from driver's current location — only bins ≥80% fill</p>
      </div>

      {/* Driver location status banner */}
      <div
        className={`driver-location-banner ${locationSource === 'gps' ? 'driver-location-banner--gps' : 'driver-location-banner--fallback'}`}
      >
        {locationSource === 'gps' ? (
          <>
            <Navigation size={16} />
            <span>
              <strong>GPS Location Active</strong> — Route calculated from your real position
              ({driverLocation.lat.toFixed(4)}°, {driverLocation.lng.toFixed(4)}°)
            </span>
          </>
        ) : locationSource === 'pending' ? (
          <>
            <MapPin size={16} />
            <span>Detecting location…</span>
          </>
        ) : (
          <>
            <MapPin size={16} />
            <span>
              <strong>Demo Location — Canberra Civic</strong>
              {locationError ? ` (${locationError})` : ' — GPS unavailable'}
            </span>
          </>
        )}
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

      {/* Route map */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header">
          <h2>Live Route Map — OpenStreetMap</h2>
        </div>
        <div className="card-body" style={{ paddingTop: 0 }}>
          <MapPanel
            driverLocation={driverLocation}
            routeCoords={sequence.length > 0 ? routeCoords : undefined}
            height={400}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Route ACT-R104 — Optimized Sequence</h2>
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
            {sequence.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <CheckCircle2 size={40} style={{ color: '#16a34a', marginBottom: '0.5rem' }} />
                <p style={{ fontWeight: 600 }}>No bins require collection right now!</p>
                <p style={{ fontSize: '0.85rem' }}>All bins are below 80% fill level.</p>
              </div>
            ) : (
              <ol className="route-list">
                {sequence.map((stop) => (
                  <li key={stop.bin.id} className="route-stop">
                    <span className="route-order">{stop.stopNumber}</span>
                    <div className="route-stop-body">
                      <strong>{stop.bin.id}</strong>
                      <span>{stop.bin.location} ({stop.bin.suburb})</span>
                      <span className="route-distance">
                        📍 {stop.distanceFromPrevKm.toFixed(1)} km from previous stop
                      </span>
                    </div>
                    <span
                      className={`route-fill ${
                        stop.bin.fillLevel >= 90
                          ? 'route-fill--high'
                          : 'route-fill--warn'
                      }`}
                    >
                      {stop.bin.fillLevel}% ({stop.bin.status})
                    </span>
                  </li>
                ))}
              </ol>
            )}
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
                <span className="route-summary-value">{sequence.length} Required Stop{sequence.length !== 1 ? 's' : ''}</span>
                <span className="route-summary-label">Bins at ≥80% fill requiring collection</span>
              </div>
            </div>
            <div className="route-summary-stat">
              <span className="route-summary-value">
                {route.totalDistanceKm.toFixed(1)} km
              </span>
              <span className="route-summary-label">
                Total straight-line route distance (not road distance)
              </span>
            </div>
            <div className="route-summary-stat">
              <span className="route-summary-value">Location-Aware</span>
              <span className="route-summary-label">
                Nearest-neighbour optimisation from{' '}
                {locationSource === 'gps' ? 'your GPS position' : 'Canberra Civic (demo fallback)'}
              </span>
            </div>
            {sequence.length > 0 && (
              <p className="route-note">
                Order: {sequence.slice(0, 4).map((s) => `${s.bin.id} (${s.bin.fillLevel}%)`).join(' → ')}
                {sequence.length > 4 ? ` → +${sequence.length - 4} more` : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

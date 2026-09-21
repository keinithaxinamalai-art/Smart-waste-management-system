import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  LogOut,
  MapPin,
  Navigation,
  Truck,
} from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { optimizeCollectionRoute } from '../lib/routeOptimization';
import { getBinStatus } from '../utils/binUtils';
import './DriverView.css';

interface DriverViewProps {
  onLogout?: () => void;
}

export function DriverView({ onLogout }: DriverViewProps) {
  const { bins, triggerCollection } = useApp();
  const { location: driverLocation, source: locationSource } = useDriverLocation();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Use the same optimized route as RoutesView (nearest-neighbour from driver location)
  const route = optimizeCollectionRoute(driverLocation, bins);
  const queue = route.stops;

  const nextStop = queue.length > 0 ? queue[0] : null;
  const upcomingStops = queue.slice(1, 4);

  const handleMarkCollected = (binId: string) => {
    triggerCollection(binId);
    setSuccessMsg(`Collection completed for Bin ${binId}! Fill level reset to 5%.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="driver-container">
      <div className="page-header">
        <h1>Collection Staff — Route ACT-R104</h1>
        <p>Active collection run · Optimized from driver location · Bins ≥80% fill</p>
      </div>

      {/* Location source indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.875rem',
          borderRadius: 6,
          fontSize: '0.8rem',
          fontWeight: 500,
          marginBottom: '1rem',
          background: locationSource === 'gps' ? '#d1fae5' : '#fef3c7',
          color: locationSource === 'gps' ? '#065f46' : '#92400e',
          border: `1px solid ${locationSource === 'gps' ? '#a7f3d0' : '#fde68a'}`,
        }}
      >
        {locationSource === 'gps' ? <Navigation size={14} /> : <MapPin size={14} />}
        {locationSource === 'gps'
          ? `GPS Active — Route from ${driverLocation.lat.toFixed(3)}°, ${driverLocation.lng.toFixed(3)}°`
          : 'Demo Mode — Canberra Civic fallback location'}
      </div>

      {successMsg && (
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
          {successMsg}
        </div>
      )}

      {nextStop ? (
        <div className="driver-card card">
          <div className="driver-next">
            <span className="driver-label">Optimized Stop #1</span>
            <h2>{nextStop.bin.id}</h2>
            <p className="driver-location">
              <MapPin size={16} /> {nextStop.bin.location} ({nextStop.bin.suburb})
            </p>
            <p style={{ fontSize: '0.8rem', color: '#3b82f6', margin: '0.25rem 0 0' }}>
              📍 {nextStop.distanceFromPrevKm.toFixed(1)} km from your current position
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span
                className={`badge ${
                  nextStop.bin.fillLevel >= 90 ? 'badge-critical' : 'badge-warning'
                }`}
                style={{ fontSize: '0.9rem' }}
              >
                {nextStop.bin.fillLevel}% Fill ({getBinStatus(nextStop.bin.fillLevel)})
              </span>
              <span className="badge badge-warning" style={{ fontSize: '0.9rem' }}>
                Priority: {nextStop.bin.collectionPriority} ({nextStop.bin.priorityScore})
              </span>
              <span className="badge badge-normal" style={{ fontSize: '0.9rem' }}>
                Type: {nextStop.bin.wasteType}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary driver-action"
            onClick={() => handleMarkCollected(nextStop.bin.id)}
          >
            <Check size={20} />
            Mark Collected & Empty Bin
          </button>

          {upcomingStops.length > 0 && (
            <div className="driver-queue">
              <span>Upcoming stops: </span>
              {upcomingStops.map((stop, idx) => (
                <span key={stop.bin.id} style={{ fontWeight: 600 }}>
                  #{idx + 2} {stop.bin.id} ({stop.bin.suburb} · {stop.bin.fillLevel}% · {stop.distanceFromPrevKm.toFixed(1)}km)
                  {idx < upcomingStops.length - 1 ? ' → ' : ''}
                </span>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn btn-ghost driver-logout"
            onClick={onLogout}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      ) : (
        <div className="driver-card card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ color: '#16a34a', marginBottom: '1rem' }}>
            <CheckCircle2 size={56} />
          </div>
          <h2>All High-Priority Collections Completed!</h2>
          <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>
            There are currently no bins requiring urgent pickup across the ACT network.
          </p>
          <button
            type="button"
            className="btn btn-ghost driver-logout"
            style={{ marginTop: '1.5rem' }}
            onClick={onLogout}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h2><Truck size={18} /> Full ACT Smart-Bin Queue</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="bin-table-wrap">
            <table className="bin-table">
              <thead>
                <tr>
                  <th>Bin ID</th>
                  <th>Location</th>
                  <th>Fill %</th>
                  <th>Priority Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bins.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.id}</strong></td>
                    <td>{b.location} ({b.suburb})</td>
                    <td>
                      <span className={b.fillLevel >= 80 ? 'text-danger font-bold' : ''}>
                        {b.fillLevel}% ({getBinStatus(b.fillLevel)})
                      </span>
                    </td>
                    <td>{b.priorityScore} ({b.collectionPriority})</td>
                    <td>
                      {b.fillLevel > 10 ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleMarkCollected(b.id)}
                        >
                          Mark Collected
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Clean</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

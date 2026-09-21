/**
 * MapPanel.tsx — Real Leaflet/OpenStreetMap interactive map
 *
 * Replaces the previous fake dot-grid with a genuine geographic map showing
 * smart-bin locations for Canberra using actual lat/lng coordinates.
 *
 * Features:
 * - CircleMarker per bin (avoids Leaflet PNG icon asset problems in Vite)
 * - Status-based marker colour (Critical, Collection Required, Moderate, Normal)
 * - Popup with bin ID, location, suburb, fill %, status
 * - Optional driver location marker (blue)
 * - Optional route polyline (Driver → Stop 1 → Stop 2 → ...)
 * - Centred on Canberra ACT
 */

import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../hooks/useApp';
import { getBinStatus } from '../utils/binUtils';
import type { DriverLocation } from '../lib/routeOptimization';
import type { Bin } from '../types';
import { useEffect } from 'react';

// Canberra centre
const CANBERRA_CENTRE: [number, number] = [-35.2809, 149.1300];
const DEFAULT_ZOOM = 11;

/** Marker colours consistent with existing badge/status colours in the app */
function markerColor(bin: Bin): string {
  const status = getBinStatus(bin.fillLevel);
  if (status === 'Critical') return '#dc2626';           // red-600
  if (status === 'Collection Required') return '#d97706'; // amber-600
  if (status === 'Moderate') return '#ca8a04';            // yellow-600
  return '#16a34a';                                        // green-600
}

function markerRadius(bin: Bin): number {
  const status = getBinStatus(bin.fillLevel);
  if (status === 'Critical') return 12;
  if (status === 'Collection Required') return 10;
  return 8;
}

/** Force Leaflet to recalculate the map size when the container becomes visible */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
}

export interface MapPanelProps {
  /** Optional driver location — shows a blue marker if provided */
  driverLocation?: DriverLocation | null;
  /** Optional ordered route stops — shows a polyline if provided */
  routeCoords?: Array<[number, number]>;
  /** Map height — defaults to 380px */
  height?: number | string;
}

export function MapPanel({ driverLocation, routeCoords, height = 380 }: MapPanelProps) {
  const { bins } = useApp();

  const binsWithCoords = bins.filter(
    (b) => typeof b.lat === 'number' && typeof b.lng === 'number'
  );

  return (
    <div className="map-leaflet-wrap" style={{ height, width: '100%', position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer
        center={CANBERRA_CENTRE}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapResizer />

        {/* OpenStreetMap base tile layer — free, no API key required */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Smart bin markers */}
        {binsWithCoords.map((bin) => {
          const status = getBinStatus(bin.fillLevel);
          const color = markerColor(bin);
          return (
            <CircleMarker
              key={bin.id}
              center={[bin.lat!, bin.lng!]}
              radius={markerRadius(bin)}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong style={{ fontSize: '0.95rem' }}>{bin.id}</strong>
                  <div style={{ fontSize: '0.82rem', color: '#374151', marginTop: 4 }}>
                    {bin.location}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280' }}>{bin.suburb}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      background: color,
                      color: '#fff',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {bin.fillLevel}% — {status}
                    </span>
                    <span style={{
                      background: '#f3f4f6',
                      color: '#374151',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                    }}>
                      {bin.wasteType}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 4 }}>
                    Sensor: {bin.sensorStatus} · Priority: {bin.collectionPriority}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Driver location marker */}
        {driverLocation && (
          <CircleMarker
            center={[driverLocation.lat, driverLocation.lng]}
            radius={10}
            pathOptions={{
              color: '#1d4ed8',
              fillColor: '#3b82f6',
              fillOpacity: 0.9,
              weight: 3,
            }}
          >
            <Popup>
              <strong>🚛 Driver Location</strong>
              <div style={{ fontSize: '0.8rem', color: '#374151', marginTop: 4 }}>
                {driverLocation.lat.toFixed(4)}°S, {driverLocation.lng.toFixed(4)}°E
              </div>
            </Popup>
          </CircleMarker>
        )}

        {/* Route polyline: Driver → Stop 1 → Stop 2 → ... */}
        {routeCoords && routeCoords.length >= 2 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              opacity: 0.7,
              dashArray: '8, 6',
            }}
          />
        )}
      </MapContainer>

      {/* Legend */}
      <div className="map-legend map-legend--leaflet">
        <span><i className="legend-dot" style={{ background: '#dc2626' }} /> Critical (≥90%)</span>
        <span><i className="legend-dot" style={{ background: '#d97706' }} /> Coll. Required (80–89%)</span>
        <span><i className="legend-dot" style={{ background: '#ca8a04' }} /> Moderate (50–79%)</span>
        <span><i className="legend-dot" style={{ background: '#16a34a' }} /> Normal (0–49%)</span>
        {driverLocation && (
          <span><i className="legend-dot" style={{ background: '#3b82f6' }} /> Driver</span>
        )}
      </div>
    </div>
  );
}

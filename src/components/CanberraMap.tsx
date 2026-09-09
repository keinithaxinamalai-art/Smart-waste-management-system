import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Bin } from '../types';
import {
  fetchDrivingRoute,
  HUME_DEPOT,
  resolveBinCoords,
  type DrivingRoute,
  type LatLng,
} from '../lib/canberraGeo';
import { getBinStatus } from '../utils/binUtils';
import 'leaflet/dist/leaflet.css';
import './CanberraMap.css';

interface CanberraMapProps {
  bins: Bin[];
  routeStops?: Bin[];
  height?: number;
  showDepot?: boolean;
  selectedBinId?: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  Critical: '#dc2626',
  'Collection Required': '#d97706',
  Moderate: '#0d9488',
  Normal: '#64748b',
};

function FitToPoints({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) {
      map.setView([-35.28, 149.13], 11);
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
      return;
    }
    map.fitBounds(
      points.map((p) => [p.lat, p.lng] as [number, number]),
      { padding: [36, 36], maxZoom: 13 }
    );
    const t = window.setTimeout(() => map.invalidateSize(), 180);
    return () => window.clearTimeout(t);
  }, [map, points]);
  return null;
}

export function CanberraMap({
  bins,
  routeStops = [],
  height = 420,
  showDepot = true,
  selectedBinId = null,
}: CanberraMapProps) {
  const [driving, setDriving] = useState<DrivingRoute | null>(null);

  const routeKey = routeStops.map((s) => s.id).join(',');

  const waypoints = useMemo(() => {
    if (routeStops.length === 0) return [];
    const stops = routeStops.map(resolveBinCoords);
    return [HUME_DEPOT, ...stops, HUME_DEPOT];
    // routeKey captures stop identity so a new array of the same bins does not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  const fitPoints = useMemo(() => {
    const pts = bins.map(resolveBinCoords);
    if (showDepot) pts.push(HUME_DEPOT);
    if (driving?.path.length) return driving.path;
    return pts;
  }, [bins, driving, showDepot]);

  useEffect(() => {
    let cancelled = false;
    fetchDrivingRoute(waypoints.length < 2 ? [] : waypoints).then((route) => {
      if (!cancelled) setDriving(route);
    });
    return () => {
      cancelled = true;
    };
  }, [waypoints]);

  return (
    <div className="cbr-map" style={{ height }}>
      <MapContainer
        center={[-35.28, 149.13]}
        zoom={11}
        scrollWheelZoom
        className="cbr-map__canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FitToPoints points={fitPoints} />

        {showDepot && (
          <CircleMarker
            center={[HUME_DEPOT.lat, HUME_DEPOT.lng]}
            radius={9}
            pathOptions={{ color: '#0f172a', fillColor: '#0d5c4b', fillOpacity: 1, weight: 2 }}
          >
            <Popup>
              <strong>{HUME_DEPOT.name}</strong>
              <br />
              Start and return point for Route ACT-R104
            </Popup>
          </CircleMarker>
        )}

        {driving && driving.path.length > 1 && (
          <Polyline
            positions={driving.path.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{
              color: driving.source === 'osrm' ? '#0f766e' : '#64748b',
              weight: 5,
              opacity: 0.85,
              dashArray: driving.source === 'osrm' ? undefined : '8 8',
            }}
          />
        )}

        {bins.map((bin) => {
          const pos = resolveBinCoords(bin);
          const status = getBinStatus(bin.fillLevel);
          const onRoute = routeStops.some((s) => s.id === bin.id);
          const selected = selectedBinId === bin.id;
          return (
            <CircleMarker
              key={bin.id}
              center={[pos.lat, pos.lng]}
              radius={selected || onRoute ? 11 : 8}
              pathOptions={{
                color: '#fff',
                weight: 2,
                fillColor: STATUS_COLOR[status] ?? '#64748b',
                fillOpacity: onRoute || routeStops.length === 0 ? 1 : 0.45,
              }}
            >
              <Popup>
                <strong>{bin.id}</strong> — {status}
                <br />
                {bin.location} ({bin.suburb})
                <br />
                Fill {bin.fillLevel}% · priority {bin.priorityScore}
                {onRoute ? <><br />On today&apos;s collection run</> : null}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

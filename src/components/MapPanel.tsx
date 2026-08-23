import { MapPin } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { getBinStatus } from '../utils/binUtils';

export function MapPanel() {
  const { bins } = useApp();

  const criticalCount = bins.filter((b) => getBinStatus(b.fillLevel) === 'Critical').length;
  const collectionReqCount = bins.filter((b) => getBinStatus(b.fillLevel) === 'Collection Required').length;
  const moderateCount = bins.filter((b) => getBinStatus(b.fillLevel) === 'Moderate').length;
  const normalCount = bins.filter((b) => getBinStatus(b.fillLevel) === 'Normal').length;

  return (
    <div className="map-panel">
      <div className="map-grid" aria-hidden>
        {bins.map((bin, i) => {
          const status = getBinStatus(bin.fillLevel);
          const isCritical = status === 'Critical';
          const isCollectionReq = status === 'Collection Required';
          const isModerate = status === 'Moderate';

          let dotClass = 'map-dot--normal';
          if (isCritical) dotClass = 'map-dot--critical';
          else if (isCollectionReq || isModerate) dotClass = 'map-dot--warning';

          return (
            <span
              key={bin.id}
              className={`map-dot ${dotClass}`}
              style={{
                left: `${12 + (i * 19) % 74}%`,
                top: `${18 + (i * 25) % 62}%`,
              }}
              title={`${bin.id} — ${bin.location} (${bin.suburb}): ${bin.fillLevel}% fill (${status})`}
            />
          );
        })}
      </div>

      <div className="map-overlay">
        <MapPin size={20} />
        <span>Canberra ACT — Prototype Smart-Bin Telemetry Map</span>
        <p className="map-hint">
          {criticalCount} Critical (90–100%), {collectionReqCount} Collection Required (80–89%), {moderateCount} Moderate (50–79%), {normalCount} Normal (0–49%)
        </p>
      </div>

      <div className="map-legend">
        <span><i className="legend-dot legend-dot--critical" /> Critical (90–100%)</span>
        <span><i className="legend-dot legend-dot--warning" /> Collection Required (80–89%)</span>
        <span><i className="legend-dot legend-dot--warning" style={{ opacity: 0.7 }} /> Moderate (50–79%)</span>
        <span><i className="legend-dot legend-dot--normal" /> Normal (0–49%)</span>
      </div>
    </div>
  );
}

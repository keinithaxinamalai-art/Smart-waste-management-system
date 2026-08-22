import { MapPin } from 'lucide-react';
import { useApp } from '../hooks/useApp';

export function MapPanel() {
  const { bins } = useApp();

  const critical = bins.filter((b) => b.fillLevel >= 90 || b.status === 'Critical');
  const warning = bins.filter((b) => b.fillLevel >= 50 && b.fillLevel < 90);

  return (
    <div className="map-panel">
      <div className="map-grid" aria-hidden>
        {bins.map((bin, i) => {
          const isCritical = bin.fillLevel >= 90 || bin.status === 'Critical';
          const isWarning = bin.fillLevel >= 50 && bin.fillLevel < 90;
          return (
            <span
              key={bin.id}
              className={`map-dot ${
                isCritical
                  ? 'map-dot--critical'
                  : isWarning
                  ? 'map-dot--warning'
                  : ''
              }`}
              style={{
                left: `${12 + (i * 19) % 74}%`,
                top: `${18 + (i * 25) % 62}%`,
              }}
              title={`${bin.id} — ${bin.location} (${bin.suburb}): ${bin.fillLevel}% fill`}
            />
          );
        })}
      </div>

      <div className="map-overlay">
        <MapPin size={20} />
        <span>Canberra ACT — Prototype Smart-Bin Telemetry Map</span>
        <p className="map-hint">
          {critical.length} critical bins (≥90%), {warning.length} moderate bins (50-89%)
        </p>
      </div>

      <div className="map-legend">
        <span><i className="legend-dot legend-dot--critical" /> Critical (≥90%)</span>
        <span><i className="legend-dot legend-dot--warning" /> Moderate (50-89%)</span>
        <span><i className="legend-dot legend-dot--normal" /> Normal (&lt;50%)</span>
      </div>
    </div>
  );
}

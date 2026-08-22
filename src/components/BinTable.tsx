import { CheckCircle2, Truck } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import type { Bin, BinStatusLabel } from '../types';

function renderStatusBadge(status: BinStatusLabel, fillLevel: number) {
  if (fillLevel >= 90 || status === 'Critical') {
    return <span className="badge badge-critical">Critical ({fillLevel}%)</span>;
  }
  if (fillLevel >= 80 || status === 'Collection Required') {
    return <span className="badge badge-warning">Collection Req.</span>;
  }
  if (fillLevel >= 50 || status === 'Moderate') {
    return <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#92400e' }}>Moderate</span>;
  }
  return <span className="badge badge-normal">Normal</span>;
}

function getFillClass(fillLevel: number) {
  if (fillLevel >= 90) return 'fill-critical';
  if (fillLevel >= 50) return 'fill-warning';
  return 'fill-normal';
}

export function BinTable({ limit }: { limit?: number }) {
  const { bins, triggerCollection } = useApp();
  const rows = limit ? bins.slice(0, limit) : bins;

  return (
    <div className="bin-table-wrap">
      <table className="bin-table">
        <thead>
          <tr>
            <th>Bin ID</th>
            <th>Location & Suburb</th>
            <th>Waste Type</th>
            <th>Fill Level</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((bin: Bin) => (
            <tr key={bin.id}>
              <td className="bin-id">
                <strong>{bin.id}</strong>
              </td>
              <td>
                <div style={{ fontWeight: 500 }}>{bin.location}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{bin.suburb}</div>
              </td>
              <td>{bin.wasteType}</td>
              <td>
                <div className="fill-cell">
                  <div className={`fill-bar ${getFillClass(bin.fillLevel)}`}>
                    <div
                      className="fill-bar-inner"
                      style={{ width: `${bin.fillLevel}%` }}
                    />
                  </div>
                  <span className="fill-pct">{bin.fillLevel}%</span>
                </div>
              </td>
              <td>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color:
                      bin.collectionPriority === 'Critical'
                        ? '#dc2626'
                        : bin.collectionPriority === 'High'
                        ? '#d97706'
                        : bin.collectionPriority === 'Medium'
                        ? '#2563eb'
                        : '#16a34a',
                  }}
                >
                  {bin.collectionPriority} ({bin.priorityScore})
                </span>
              </td>
              <td>{renderStatusBadge(bin.status, bin.fillLevel)}</td>
              <td>
                {bin.fillLevel >= 80 ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.3rem' }}
                    onClick={() => triggerCollection(bin.id)}
                  >
                    <Truck size={14} /> Collect
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <CheckCircle2 size={14} /> OK
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

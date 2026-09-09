import { CollectionsChart, CompositionChart, VolumeChart } from '../components/Charts';
import { useApp } from '../hooks/useApp';

export function ReportsView() {
  const { bins, collections, reports } = useApp();

  const totalBins = bins.length || 1;
  const generalCount = bins.filter((b) => b.wasteType === 'General').length;
  const recyclableCount = bins.filter((b) => b.wasteType === 'Recyclable').length;
  const organicCount = bins.filter((b) => b.wasteType === 'Organic').length;

  const dynamicComposition = [
    { name: 'General Waste', value: Math.round((generalCount / totalBins) * 100), color: '#0d5c4b' },
    { name: 'Recyclables', value: Math.round((recyclableCount / totalBins) * 100), color: '#14b8a6' },
    { name: 'Organics', value: Math.round((organicCount / totalBins) * 100), color: '#6ee7b7' },
  ];

  const completedCollections = collections.filter((c) => c.status === 'Completed').length;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;

  return (
    <>
      <div className="page-header">
        <h1>Reports & KPIs</h1>
        <p>Operational metrics and smart bin waste composition analytics</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 560 }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>Completed Collections</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-950)' }}>{completedCollections}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>Resolved Citizen Reports</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--green-900)' }}>{resolvedReports}</div>
        </div>
      </div>

      <div className="dashboard-grid-bottom" style={{ marginTop: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <h2>Weekly Collections Trend</h2>
          </div>
          <div className="card-body">
            <CollectionsChart />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2>Estimated Waste Volume (Tonnes)</h2>
          </div>
          <div className="card-body">
            <VolumeChart />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <h2>Network Waste Composition</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <CompositionChart data={dynamicComposition} />
          <ul className="composition-legend">
            {dynamicComposition.map((item) => (
              <li key={item.name}>
                <span style={{ background: item.color }} />
                {item.name} — {item.value}%
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

import { CanberraMap } from './CanberraMap';
import { useApp } from '../hooks/useApp';
import { getBinStatus, getRequiredCollectionSequence } from '../utils/binUtils';

interface MapPanelProps {
  height?: number;
  showRoute?: boolean;
}

export function MapPanel({ height = 360, showRoute = false }: MapPanelProps) {
  const { bins } = useApp();
  const routeStops = showRoute ? getRequiredCollectionSequence(bins) : [];

  const criticalCount = bins.filter((b) => getBinStatus(b.fillLevel) === 'Critical').length;
  const collectionReqCount = bins.filter((b) => getBinStatus(b.fillLevel) === 'Collection Required').length;

  return (
    <div>
      <CanberraMap bins={bins} routeStops={routeStops} height={height} showDepot />
      <p className="map-hint" style={{ marginTop: '0.75rem' }}>
        Live OpenStreetMap of Canberra. Pins use the seeded ACT coordinates.
        {showRoute
          ? ' The teal line is the OSRM road path (depot → priority stops → depot). Stop order is still the ≥80% priority score, not AI.'
          : ` ${criticalCount} critical and ${collectionReqCount} collection-required bins. Open Route Planning to draw the truck path.`}
      </p>
    </div>
  );
}

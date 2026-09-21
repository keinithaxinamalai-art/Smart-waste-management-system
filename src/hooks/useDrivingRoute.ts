import { useEffect, useState } from 'react';
import {
  fetchDrivingRoute,
  HUME_DEPOT,
  resolveBinCoords,
  type DrivingRoute,
} from '../lib/canberraGeo';
import type { Bin } from '../types';

export function useDrivingRouteSummary(routeStops: Bin[]) {
  const [route, setRoute] = useState<DrivingRoute | null>(null);
  const routeKey = routeStops.map((s) => s.id).join(',');

  useEffect(() => {
    let cancelled = false;
    const points =
      routeStops.length === 0
        ? []
        : [HUME_DEPOT, ...routeStops.map(resolveBinCoords), HUME_DEPOT];
    fetchDrivingRoute(points).then((next) => {
      if (!cancelled) setRoute(next);
    });
    return () => {
      cancelled = true;
    };
    // routeStops is read when routeKey changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  return route;
}

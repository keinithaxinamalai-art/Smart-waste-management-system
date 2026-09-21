/**
 * src/hooks/useDriverLocation.ts — Browser Geolocation hook
 *
 * Obtains the driver's current position using the browser Geolocation API.
 * Falls back to a Canberra Civic coordinate if permission is denied or
 * the API is unavailable.
 *
 * Fallback location: Canberra Civic (-35.2809, 149.1300)
 * This is consistent with the demo suburb "Canberra City" already used
 * in the project's bin data.
 */

import { useEffect, useState } from 'react';
import type { DriverLocation } from '../lib/routeOptimization';

export type LocationSource = 'gps' | 'fallback' | 'pending';

export interface DriverLocationState {
  location: DriverLocation;
  source: LocationSource;
  /** Error message if geolocation was denied or failed */
  errorMsg: string | null;
}

/** Canberra Civic — used when GPS is unavailable */
export const CANBERRA_CIVIC_FALLBACK: DriverLocation = {
  lat: -35.2809,
  lng: 149.1300,
};

export function useDriverLocation(): DriverLocationState {
  const [state, setState] = useState<DriverLocationState>({
    location: CANBERRA_CIVIC_FALLBACK,
    source: 'pending',
    errorMsg: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: CANBERRA_CIVIC_FALLBACK,
        source: 'fallback',
        errorMsg: 'Geolocation not supported by this browser.',
      });
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      setState({
        location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        source: 'gps',
        errorMsg: null,
      });
    };

    const onError = (err: GeolocationPositionError) => {
      setState({
        location: CANBERRA_CIVIC_FALLBACK,
        source: 'fallback',
        errorMsg:
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied — using Canberra Civic demo location.'
            : 'Unable to determine GPS location — using Canberra Civic demo location.',
      });
    };

    // Single position request — does not continuously drain battery
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60000,
    });
  }, []); // Request once on mount

  return state;
}

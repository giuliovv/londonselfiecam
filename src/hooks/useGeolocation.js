import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(() => {
    setLoading(true);
    setError(null);
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        (e) => {
          setError(e.message || 'Permission denied');
          setLoading(false);
          reject(e);
        },
        { timeout: 10000 },
      );
    });
  }, []);

  return { location, loading, error, request };
}

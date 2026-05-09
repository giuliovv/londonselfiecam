import { useState, useCallback } from 'react';

const TFL_URL = 'https://api.tfl.gov.uk/Place/Type/JamCam';

function getProp(cam, key) {
  return (cam.additionalProperties || []).find((p) => p.key === key)?.value ?? null;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let cachedCams = null;

export function useTflCams() {
  const [cams, setCams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNearest = useCallback(async (userLat, userLon) => {
    setLoading(true);
    setError(null);
    try {
      if (!cachedCams) {
        const res = await fetch(TFL_URL);
        if (!res.ok) throw new Error(`TFL API error ${res.status}`);
        cachedCams = await res.json();
      }

      const sorted = cachedCams
        .filter((c) => getProp(c, 'imageUrl') && getProp(c, 'available') === 'true')
        .map((c) => ({ ...c, distKm: haversineKm(userLat, userLon, c.lat, c.lon) }))
        .sort((a, b) => a.distKm - b.distKm);

      setCams(sorted);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { cams, loading, error, fetchNearest, getProp };
}

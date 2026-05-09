import { useState, useEffect, useMemo, useCallback } from 'react';

const TFL_URL = 'https://api.tfl.gov.uk/Place/Type/JamCam';

function getProp(cam, key) {
  return (cam.additionalProperties || []).find((p) => p.key === key)?.value ?? null;
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

let cachedCams = null;
let inflight = null;

function normalize(raw, idx) {
  const imageUrl = getProp(raw, 'imageUrl');
  const videoUrl = getProp(raw, 'videoUrl');
  const view = getProp(raw, 'view');
  const updated = getProp(raw, 'updated');

  const common = raw.commonName || '';
  // Try to split "A40 Edgware Rd / Marylebone Rd" into road + name.
  const parts = common.split('/').map((s) => s.trim()).filter(Boolean);
  let road = '';
  let displayName = common;
  const roadMatch = common.match(/\b(A\d+|B\d+|M\d+)\b/);
  if (roadMatch) road = roadMatch[1];
  if (parts.length === 2) {
    displayName = parts.join(' / ');
  }
  // Short tile id (last 3 digits of TFL id) for HUD overlays.
  const idMatch = (raw.id || '').match(/(\d+)\.?(\d+)?$/);
  const shortId =
    'JC' +
    (idMatch ? (idMatch[1] || '').slice(-3).padStart(3, '0') : String(idx).padStart(3, '0'));

  return {
    id: raw.id,
    shortId,
    displayName,
    road,
    view,
    updated,
    lat: raw.lat,
    lng: raw.lon,
    imageUrl,
    videoUrl,
    available: getProp(raw, 'available') === 'true',
  };
}

export function useTflCams() {
  const [cams, setCams] = useState(cachedCams || []);
  const [loading, setLoading] = useState(!cachedCams);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cachedCams) {
        setCams(cachedCams);
        setLoading(false);
        return;
      }
      try {
        if (!inflight) {
          inflight = fetch(TFL_URL).then((r) => {
            if (!r.ok) throw new Error(`TFL API error ${r.status}`);
            return r.json();
          });
        }
        const raw = await inflight;
        const normalized = raw
          .map(normalize)
          .filter((c) => c.imageUrl && c.available && Number.isFinite(c.lat) && Number.isFinite(c.lng));
        cachedCams = normalized;
        if (!cancelled) {
          setCams(normalized);
          setLoading(false);
        }
      } catch (e) {
        inflight = null;
        if (!cancelled) {
          setError(e.message || String(e));
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const nearestTo = useCallback(
    (lat, lng, n = 1) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return cams.slice(0, n);
      return cams
        .map((c) => ({ ...c, distKm: haversineKm(lat, lng, c.lat, c.lng) }))
        .sort((a, b) => a.distKm - b.distKm)
        .slice(0, n);
    },
    [cams],
  );

  const byId = useCallback((id) => cams.find((c) => c.id === id) || null, [cams]);

  return { cams, loading, error, nearestTo, byId };
}

// Resolve a route's waypoints into specific cam objects.
export function resolveRouteCams(route, allCams) {
  if (!allCams || allCams.length === 0) return [];
  const used = new Set();
  return route.waypoints
    .map((w) => {
      const ranked = allCams
        .filter((c) => !used.has(c.id))
        .map((c) => ({ c, d: haversineKm(w.lat, w.lng, c.lat, c.lng) }))
        .sort((a, b) => a.d - b.d);
      const pick = ranked[0]?.c;
      if (pick) used.add(pick.id);
      return pick ? { ...pick, label: w.label } : null;
    })
    .filter(Boolean);
}

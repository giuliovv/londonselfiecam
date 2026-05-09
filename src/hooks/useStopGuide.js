// useStopGuide — fetches a tiny travel-guide payload for a single TfL cam:
//   - Nearest Wikipedia article (intro extract + thumbnail + page URL)
//   - 3-6 nearby POIs from OpenStreetMap (Overpass) with walking distances
//   - Nearest tube stop from TfL StopPoint with step-free flag
//
// All three sources are free, CORS-friendly, and require no backend.
// Results cached in localStorage for 7 days, keyed by cam.id.

import { useEffect, useState } from 'react';
import { haversineKm } from './useTflCams';

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_PREFIX = 'lsc.guide.';

function readCache(camId) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + camId);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(camId, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + camId, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // localStorage full or disabled — silent
  }
}

// ---- Wikipedia ----
const WIKI_API = 'https://en.wikipedia.org/w/api.php';

async function fetchWikipedia(lat, lng) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${lat}|${lng}`,
    ggsradius: '400',
    ggslimit: '5',
    prop: 'coordinates|pageimages|description|info|extracts',
    pithumbsize: '400',
    exintro: '1',
    explaintext: '1',
    exchars: '420',
    inprop: 'url',
    origin: '*',
    format: 'json',
  });
  const r = await fetch(`${WIKI_API}?${params}`);
  if (!r.ok) throw new Error(`wiki ${r.status}`);
  const j = await r.json();
  const pages = Object.values(j.query?.pages || {});
  return pages
    .map((p) => {
      const coord = p.coordinates?.[0];
      return {
        title: p.title,
        description: p.description,
        extract: p.extract?.replace(/\s+/g, ' ').trim() || null,
        thumbnail: p.thumbnail?.source || null,
        url: p.fullurl,
        distM: coord ? haversineKm(lat, lng, coord.lat, coord.lon) * 1000 : null,
      };
    })
    .sort((a, b) => (a.distM ?? Infinity) - (b.distM ?? Infinity));
}

// ---- Overpass / OSM ----
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const POI_ICONS = {
  museum: '🏛',
  gallery: '🎨',
  attraction: '🎡',
  artwork: '🗿',
  viewpoint: '🌆',
  monument: '🗽',
  memorial: '⚱',
  castle: '🏰',
  ruins: '🏚',
  cafe: '☕',
  restaurant: '🍽',
  pub: '🍺',
  bar: '🍸',
  ice_cream: '🍦',
  bakery: '🥐',
};

function poiIcon(tags) {
  if (tags.tourism && POI_ICONS[tags.tourism]) return POI_ICONS[tags.tourism];
  if (tags.amenity && POI_ICONS[tags.amenity]) return POI_ICONS[tags.amenity];
  if (tags.historic) return '🏛';
  return '◇';
}

function poiCategory(tags) {
  return tags.tourism || tags.historic || tags.amenity || 'place';
}

async function fetchOverpass(lat, lng) {
  const query = `[out:json][timeout:15];(
    node["tourism"~"attraction|museum|gallery|artwork|viewpoint|monument"](around:300,${lat},${lng});
    node["historic"](around:300,${lat},${lng});
    node["amenity"~"cafe|restaurant|pub|bar|ice_cream|bakery"](around:300,${lat},${lng});
  );out body 40;`;

  const r = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  });
  if (!r.ok) throw new Error(`overpass ${r.status}`);
  const j = await r.json();

  const seen = new Set();
  return (j.elements || [])
    .filter((e) => e.tags?.name && Number.isFinite(e.lat) && Number.isFinite(e.lon))
    .map((e) => ({
      id: e.id,
      name: e.tags.name,
      category: poiCategory(e.tags),
      icon: poiIcon(e.tags),
      distM: Math.round(haversineKm(lat, lng, e.lat, e.lon) * 1000),
    }))
    .sort((a, b) => a.distM - b.distM)
    .filter((p) => {
      const key = p.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
}

// ---- TfL StopPoint ----
async function fetchTfl(lat, lng) {
  const url = `https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${lng}&stopTypes=NaptanMetroStation&radius=700`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`tfl ${r.status}`);
  const j = await r.json();
  const stops = j.stopPoints || [];
  if (!stops.length) return null;
  const nearest = stops.sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9))[0];
  const props = nearest.additionalProperties || [];
  const stepFreeProp = props.find((p) =>
    /step.*free|wheelchair/i.test(p.key || ''),
  );
  const stepFree = stepFreeProp
    ? /yes|true|full|partial/i.test(stepFreeProp.value || '')
    : false;
  return {
    name: (nearest.commonName || '').replace(/\s+Underground Station$/i, ''),
    distM: Math.round(nearest.distance ?? 0),
    stepFree,
    lines: (nearest.lineIdentifier || []).slice(0, 4),
  };
}

// ---- Hook ----
export function useStopGuide(cam, { enabled = true } = {}) {
  const [state, setState] = useState({
    loading: false,
    error: null,
    hero: null,
    pois: [],
    tube: null,
  });

  const camId = cam?.id;
  const lat = cam?.lat;
  const lng = cam?.lng;

  useEffect(() => {
    if (!enabled || !camId || !Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;

    const cached = readCache(camId);
    if (cached) {
      setState({ loading: false, error: null, ...cached });
      return undefined;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    (async () => {
      const [wikiResult, poisResult, tubeResult] = await Promise.allSettled([
        fetchWikipedia(lat, lng),
        fetchOverpass(lat, lng),
        fetchTfl(lat, lng),
      ]);

      if (cancelled) return;

      const wikiArr = wikiResult.status === 'fulfilled' ? wikiResult.value : [];
      const pois = poisResult.status === 'fulfilled' ? poisResult.value : [];
      const tube = tubeResult.status === 'fulfilled' ? tubeResult.value : null;

      // Prefer the article that has both a thumbnail and an extract
      const hero =
        wikiArr.find((w) => w.extract && w.thumbnail) ||
        wikiArr.find((w) => w.extract) ||
        wikiArr[0] ||
        null;

      const data = { hero, pois, tube };
      writeCache(camId, data);

      const allFailed =
        wikiResult.status === 'rejected' &&
        poisResult.status === 'rejected' &&
        tubeResult.status === 'rejected';

      setState({
        loading: false,
        error: allFailed ? 'guide unavailable' : null,
        ...data,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [camId, lat, lng, enabled]);

  return state;
}

// Helper exposed for the component: format a distance in metres as a
// short walking-time chip ("3m" = 3 minute walk; "<1m" if very close).
export function walkMin(distM) {
  if (distM == null) return '';
  const min = Math.max(1, Math.round(distM / 75)); // ~4.5 km/h pace
  return `${min}m`;
}

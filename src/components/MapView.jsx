import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

// London centre
const DEFAULT_CENTER = [-0.118, 51.509];
const DEFAULT_ZOOM = 11;

export function MapView({ cams, onPick, selected, userLoc }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync cam pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existing = markersRef.current;
    const seen = new Set();

    cams.forEach((c) => {
      if (!Number.isFinite(c.lat) || !Number.isFinite(c.lng)) return;
      seen.add(c.id);
      const isSel = selected === c.id;

      if (existing[c.id]) {
        // Update style if selection changed
        const el = existing[c.id].getElement();
        el.style.width = isSel ? '16px' : '10px';
        el.style.height = isSel ? '16px' : '10px';
        el.style.boxShadow = isSel ? '0 0 0 3px var(--rec), 0 0 12px var(--rec)' : '0 0 6px rgba(220,36,31,0.6)';
        el.style.zIndex = isSel ? '20' : '10';
        return;
      }

      const el = document.createElement('button');
      el.style.cssText = `
        width: ${isSel ? 16 : 10}px;
        height: ${isSel ? 16 : 10}px;
        border-radius: 50%;
        background: var(--rec, #dc241f);
        border: 1.5px solid #fff;
        cursor: pointer;
        padding: 0;
        box-shadow: ${isSel ? '0 0 0 3px var(--rec), 0 0 12px var(--rec)' : '0 0 6px rgba(220,36,31,0.6)'};
        transition: width 0.15s, height 0.15s, box-shadow 0.15s;
        z-index: ${isSel ? 20 : 10};
      `;
      el.setAttribute('aria-label', c.displayName);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onPick && onPick(c.id);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([c.lng, c.lat])
        .addTo(map);

      existing[c.id] = marker;
    });

    // Remove stale markers
    Object.keys(existing).forEach((id) => {
      if (!seen.has(id)) {
        existing[id].remove();
        delete existing[id];
      }
    });
  }, [cams, selected, onPick]);

  // Pan to selected cam
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    const cam = cams.find((c) => c.id === selected);
    if (cam) map.easeTo({ center: [cam.lng, cam.lat], zoom: Math.max(map.getZoom(), 14), duration: 400 });
  }, [selected, cams]);

  // User location blue dot
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!userLoc) return;

    const el = document.createElement('div');
    el.style.cssText = `
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #4fc3f7;
      border: 2.5px solid #fff;
      box-shadow: 0 0 0 5px rgba(79,195,247,0.3);
      pointer-events: none;
    `;

    userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([userLoc.lon, userLoc.lat])
      .addTo(map);

    // Fly to user on first location fix
    map.flyTo({ center: [userLoc.lon, userLoc.lat], zoom: 13, duration: 1200 });
  }, [userLoc]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
    />
  );
}

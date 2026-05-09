import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const DEFAULT_CENTER = [-0.118, 51.509];
const DEFAULT_ZOOM = 11;
const SOURCE_ID = 'cams';
const LAYER_ID = 'cam-dots';
const LAYER_SEL_ID = 'cam-dot-selected';

function toGeoJSON(cams, selectedId) {
  return {
    type: 'FeatureCollection',
    features: cams
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
      .map((c) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: { id: c.id, selected: c.id === selectedId ? 1 : 0 },
      })),
  };
}

export function MapView({ cams, onPick, selected, userLoc }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const readyRef = useRef(false);

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

    map.on('load', () => {
      map.addSource(SOURCE_ID, { type: 'geojson', data: toGeoJSON([], null) });

      // All cam pins
      map.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['==', ['get', 'selected'], 0],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 4, 14, 7],
          'circle-color': '#dc241f',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
          'circle-opacity': 0.9,
        },
      });

      // Selected cam pin (larger, glowing)
      map.addLayer({
        id: LAYER_SEL_ID,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['==', ['get', 'selected'], 1],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 7, 14, 12],
          'circle-color': '#dc241f',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#fff',
          'circle-blur': 0.1,
        },
      });

      readyRef.current = true;
      map.fire('_ready');
    });

    // Click on any cam pin
    map.on('click', LAYER_ID, (e) => {
      const id = e.features[0]?.properties?.id;
      if (id) onPick && onPick(id);
    });
    map.on('click', LAYER_SEL_ID, (e) => {
      const id = e.features[0]?.properties?.id;
      if (id) onPick && onPick(id);
    });

    map.on('mouseenter', LAYER_ID, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', LAYER_ID, () => { map.getCanvas().style.cursor = ''; });

    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update GeoJSON whenever cams or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      const src = map.getSource(SOURCE_ID);
      if (src) src.setData(toGeoJSON(cams, selected));
    };

    if (readyRef.current) {
      update();
    } else {
      map.once('_ready', update);
    }
  }, [cams, selected]);

  // Pan to selected cam
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    const cam = cams.find((c) => c.id === selected);
    if (!cam) return;
    const go = () => map.easeTo({ center: [cam.lng, cam.lat], zoom: Math.max(map.getZoom(), 14), duration: 400 });
    if (readyRef.current) go(); else map.once('_ready', go);
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
      width:16px;height:16px;border-radius:50%;
      background:#4fc3f7;border:2.5px solid #fff;
      box-shadow:0 0 0 5px rgba(79,195,247,0.3);
      pointer-events:none;
    `;

    const add = () => {
      userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([userLoc.lon, userLoc.lat])
        .addTo(map);
      map.flyTo({ center: [userLoc.lon, userLoc.lat], zoom: 13, duration: 1200 });
    };
    if (readyRef.current) add(); else map.once('_ready', add);
  }, [userLoc]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />;
}

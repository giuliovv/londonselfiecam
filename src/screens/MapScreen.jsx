import { useMemo, useState } from 'react';
import { MapView } from '../components/MapView';
import { CamTile } from '../components/CamTile';
import { loadSnaps } from '../lib/snapStorage';

const LONDON_CENTER = { lat: 51.5074, lng: -0.1278 };
const QUADRANTS = [
  { id: 'ALL', label: 'ALL' },
  { id: 'NW', label: 'NW' },
  { id: 'NE', label: 'NE' },
  { id: 'SW', label: 'SW' },
  { id: 'SE', label: 'SE' },
];

function camInQuadrant(cam, q) {
  if (q === 'ALL') return true;
  const north = cam.lat >= LONDON_CENTER.lat;
  const east = cam.lng >= LONDON_CENTER.lng;
  if (q === 'NW') return north && !east;
  if (q === 'NE') return north && east;
  if (q === 'SW') return !north && !east;
  if (q === 'SE') return !north && east;
  return true;
}

export function MapScreen({ cams, onOpenCam, userLoc }) {
  const [sel, setSel] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [quadrant, setQuadrant] = useState('ALL');
  const [capturedOnly, setCapturedOnly] = useState(false);

  const capturedIds = useMemo(() => {
    if (!capturedOnly) return null;
    const ids = new Set();
    for (const s of loadSnaps()) {
      if (s.camId) ids.add(s.camId);
      if (s.shortId) ids.add(s.shortId);
    }
    return ids;
  }, [capturedOnly]);

  const visibleCams = useMemo(() => {
    return cams.filter((c) => {
      if (!camInQuadrant(c, quadrant)) return false;
      if (capturedIds && !(capturedIds.has(c.id) || capturedIds.has(c.shortId))) return false;
      return true;
    });
  }, [cams, quadrant, capturedIds]);

  const filterActive = quadrant !== 'ALL' || capturedOnly;
  const selCam = visibleCams.find((c) => c.id === sel);

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <MapView cams={visibleCams} onPick={setSel} selected={sel} userLoc={userLoc} />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 12,
          zIndex: 80,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7), transparent)',
        }}
      >
        <div className="row between hud" style={{ fontSize: 11 }}>
          <span>
            <span className="rec-dot" /> {visibleCams.length}
            {filterActive ? `/${cams.length}` : ''} CAMS · LIVE
          </span>
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="chip"
            style={{
              background: filterActive || filterOpen ? 'var(--ink)' : 'transparent',
              color: filterActive || filterOpen ? 'var(--bg)' : 'var(--ink)',
              borderColor: filterActive || filterOpen ? 'var(--ink)' : 'var(--line)',
              cursor: 'pointer',
            }}
          >
            FILTER{filterActive ? ` · ${visibleCams.length}/${cams.length}` : ''}
          </button>
        </div>
        <div
          className="h-display"
          style={{
            fontSize: 28,
            color: 'var(--ink)',
            marginTop: 4,
            background: 'rgba(0,0,0,0.55)',
            padding: '4px 10px',
            display: 'inline-block',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          THE GRID.
        </div>

        {filterOpen && (
          <div
            style={{
              marginTop: 8,
              background: 'var(--hud-bg)',
              border: '1px solid var(--line)',
              padding: 10,
            }}
          >
            <div className="hud" style={{ fontSize: 10, color: 'var(--ink-dim)', marginBottom: 6 }}>
              QUADRANT
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              {QUADRANTS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuadrant(q.id)}
                  className="chip"
                  style={{
                    background: quadrant === q.id ? 'var(--ink)' : 'transparent',
                    color: quadrant === q.id ? 'var(--bg)' : 'var(--ink)',
                    borderColor: quadrant === q.id ? 'var(--ink)' : 'var(--line)',
                    cursor: 'pointer',
                    fontSize: 10,
                    padding: '4px 10px',
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
            <div className="hud" style={{ fontSize: 10, color: 'var(--ink-dim)', margin: '10px 0 6px' }}>
              SAVED
            </div>
            <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
              <button
                onClick={() => setCapturedOnly((v) => !v)}
                className="chip"
                style={{
                  background: capturedOnly ? 'var(--ink)' : 'transparent',
                  color: capturedOnly ? 'var(--bg)' : 'var(--ink)',
                  borderColor: capturedOnly ? 'var(--ink)' : 'var(--line)',
                  cursor: 'pointer',
                  fontSize: 10,
                  padding: '4px 10px',
                }}
              >
                CAPTURED ONLY
              </button>
              {filterActive && (
                <button
                  onClick={() => {
                    setQuadrant('ALL');
                    setCapturedOnly(false);
                  }}
                  className="chip"
                  style={{
                    cursor: 'pointer',
                    fontSize: 10,
                    padding: '4px 10px',
                    color: 'var(--rec)',
                    borderColor: 'var(--rec)',
                  }}
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {selCam && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 100,
            zIndex: 80,
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            padding: 10,
          }}
        >
          <div className="row gap-3">
            <div
              style={{
                width: 110,
                aspectRatio: '4/3',
                position: 'relative',
                overflow: 'hidden',
                outline: '1px solid var(--line)',
                flexShrink: 0,
              }}
            >
              <CamTile cam={selCam} hideHud />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="hud" style={{ fontSize: 10, color: 'var(--rec)' }}>
                {selCam.shortId}
              </div>
              <div
                className="text-mono"
                style={{
                  fontSize: 14,
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {selCam.displayName}
              </div>
              <div className="hud" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>
                {selCam.view || 'CCTV'} · {selCam.road || 'TfL'}
              </div>
              <div className="row gap-2 mt-2">
                <button
                  onClick={() => onOpenCam(selCam.id)}
                  className="chip rec"
                  style={{ flex: 1, justifyContent: 'center', padding: 8 }}
                >
                  ▶ OPEN CAM
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selCam.lat},${selCam.lng}&travelmode=walking`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="chip"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: 8,
                    textDecoration: 'none',
                  }}
                  title="Walking directions in Google Maps"
                >
                  ↗ DIRECTIONS
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

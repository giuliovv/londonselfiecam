import { useState } from 'react';
import { MapView } from '../components/MapView';
import { CamTile } from '../components/CamTile';

export function MapScreen({ cams, onOpenCam, userLoc }) {
  const [sel, setSel] = useState(null);
  const selCam = cams.find((c) => c.id === sel);

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <MapView cams={cams} onPick={setSel} selected={sel} userLoc={userLoc} />

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
            <span className="rec-dot" /> {cams.length} CAMS · LIVE
          </span>
          <span className="chip">FILTER</span>
        </div>
        <div
          className="h-display"
          style={{ fontSize: 28, color: 'var(--ink)', marginTop: 4 }}
        >
          THE GRID.
        </div>
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

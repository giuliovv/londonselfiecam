import { useState } from 'react';
import { CamTile } from '../components/CamTile';
import { Scanlines, Grain, Vignette, Brackets } from '../components/Overlays';
import { useTickingTime } from '../hooks/useTickingTime';

const FILTERS = {
  normal: {},
  night: { filter: 'hue-rotate(80deg) saturate(1.4) brightness(0.9) contrast(1.2)' },
  sepia: { filter: 'sepia(0.7) contrast(1.05) brightness(1.05)' },
  bw: { filter: 'saturate(0) contrast(1.2)' },
  vhs: { filter: 'saturate(1.4) contrast(1.1) hue-rotate(-10deg)' },
};

export function CamViewer({ cam, onBack, onSnap, missionStop }) {
  const time = useTickingTime();
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState('normal');
  const [snapping, setSnapping] = useState(false);
  const [whiteFlash, setWhiteFlash] = useState(false);

  if (!cam) {
    return (
      <div className="screen" style={{ background: 'var(--bg)', padding: 16 }}>
        <button onClick={onBack} className="chip">
          ◂ BACK
        </button>
        <div className="err mt-4">CAM NOT FOUND · {Date.now()}</div>
      </div>
    );
  }

  const doSnap = () => {
    setSnapping(true);
    setWhiteFlash(true);
    setTimeout(() => setWhiteFlash(false), 120);
    setTimeout(() => {
      onSnap?.({ cam, filter, time: new Date(), zoom, frozenAt: Date.now() });
      setSnapping(false);
    }, 700);
  };

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          transition: 'transform 0.4s ease',
          ...FILTERS[filter],
        }}
      >
        <CamTile cam={cam} hideHud big video />
      </div>
      <Scanlines />
      <Grain />
      <Vignette />
      <Brackets />

      {whiteFlash && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fff',
            zIndex: 200,
            animation: 'shutter 0.7s ease',
          }}
        />
      )}

      {/* TOP HUD */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 12,
          zIndex: 80,
        }}
      >
        <div className="row between hud" style={{ fontSize: 11 }}>
          <button onClick={onBack} className="chip">
            ◂ BACK
          </button>
          <span className="chip rec">
            <span
              className="rec-dot"
              style={{ background: '#fff' }}
            />{' '}
            &nbsp;LIVE
          </span>
          <span className="chip">{time}</span>
        </div>
        <div className="tape-edge mt-2" />
        <div
          className="row between hud mt-2"
          style={{ fontSize: 10, color: 'var(--ink-dim)' }}
        >
          <span>{cam.shortId}</span>
          <span style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cam.displayName.toUpperCase()}
          </span>
          <span>{cam.road || cam.view || 'TfL'}</span>
        </div>
        {Number.isFinite(cam.lat) && Number.isFinite(cam.lng) && (
          <div className="row mt-2" style={{ justifyContent: 'stretch' }}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${cam.lat},${cam.lng}&travelmode=walking`}
              target="_blank"
              rel="noreferrer noopener"
              className="chip rec"
              style={{
                flex: 1,
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                padding: '10px 14px',
                letterSpacing: '0.22em',
                textDecoration: 'none',
                boxShadow: '0 0 14px rgba(255,45,45,0.55), inset 0 0 0 1px rgba(255,255,255,0.18)',
              }}
              title="Walking directions in Google Maps"
            >
              🚶 WALK HERE ⇗
            </a>
          </div>
        )}
        {missionStop && (
          <div
            className="mt-2 hud"
            style={{
              background: 'var(--rec)',
              color: '#fff',
              padding: '6px 10px',
              fontSize: 10,
              letterSpacing: '0.15em',
            }}
          >
            ▍ MISSION: {missionStop.task}
          </div>
        )}
      </div>

      {/* SIDE controls */}
      <div
        style={{
          position: 'absolute',
          right: 10,
          top: '32%',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <button
          className="chip"
          onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
        >
          +
        </button>
        <div
          className="hud"
          style={{ textAlign: 'center', fontSize: 9, color: 'var(--ink-dim)' }}
        >
          ×{zoom.toFixed(2)}
        </div>
        <button
          className="chip"
          onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
        >
          −
        </button>
      </div>

      {/* BOTTOM control bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px 28px',
          zIndex: 80,
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.85))',
        }}
      >
        <div
          className="row gap-2"
          style={{ overflowX: 'auto', paddingBottom: 12, justifyContent: 'center' }}
        >
          {Object.keys(FILTERS).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="chip"
              style={{
                background: filter === f ? 'var(--ink)' : 'transparent',
                color: filter === f ? 'var(--bg)' : 'var(--ink)',
                whiteSpace: 'nowrap',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="row between" style={{ alignItems: 'center' }}>
          <div
            className="hud"
            style={{ fontSize: 10, color: 'var(--ink-dim)' }}
          >
            ISO 800
            <br />
            F2.8 · 1/60
          </div>
          <button
            onClick={doSnap}
            disabled={snapping}
            style={{
              width: 86,
              height: 86,
              borderRadius: '50%',
              border: '3px solid var(--ink)',
              background: 'var(--rec)',
              boxShadow: '0 0 0 4px var(--bg), 0 0 32px var(--rec)',
              animation: snapping ? 'shutter 0.7s ease' : 'none',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 6,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            />
            <span
              className="hud"
              style={{
                color: '#fff',
                fontSize: 12,
                letterSpacing: '0.15em',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {snapping ? '...' : 'SNAP'}
            </span>
          </button>
          <div
            className="hud"
            style={{
              fontSize: 10,
              color: 'var(--ink-dim)',
              textAlign: 'right',
            }}
          >
            {cam.shortId}
            <br />
            4:3 · 720p
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CamTile } from '../components/CamTile';
import { Scanlines, Grain, Vignette } from '../components/Overlays';
import { useTickingTime } from '../hooks/useTickingTime';

export function Landing({ cams, onEnter, onPickCam, onOpenStream }) {
  const time = useTickingTime();
  const [count, setCount] = useState(412);
  useEffect(() => {
    const id = setInterval(
      () => setCount((c) => c + (Math.random() > 0.5 ? 1 : -1)),
      1700,
    );
    return () => clearInterval(id);
  }, []);

  const wall = cams.slice(0, 24);

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div className="live-wall">
        {wall.map((c) => (
          <CamTile key={c.id} cam={c} onClick={() => onPickCam(c.id)} hideHud video />
        ))}
        {wall.length < 24 &&
          Array.from({ length: 24 - wall.length }).map((_, i) => (
            <div key={`p${i}`} className="cam-tile" data-state="off" />
          ))}
      </div>
      <Scanlines />
      <Grain />
      <Vignette />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 60,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 16,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none',
        }}
      >
        <div className="hud" style={{ pointerEvents: 'auto' }}>
          <div className="row between" style={{ fontSize: 11, letterSpacing: '0.12em', alignItems: 'center' }}>
            <span>
              <span className="rec-dot" /> &nbsp;LIVE · TFL JAM CAM
            </span>
            {onOpenStream && (
              <button type="button" className="stream-chip" onClick={onOpenStream}>
                ↗ THE STREAM
              </button>
            )}
          </div>
          <div
            className="row mt-1"
            style={{
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'var(--ink-dim)',
              justifyContent: 'flex-end',
            }}
          >
            <span>{time}</span>
          </div>
          <div className="tape-edge" style={{ marginTop: 8 }} />
          <div
            className="row between mt-2"
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--ink-dim)',
            }}
          >
            <span>CH 01—24 / {cams.length || '...'}</span>
            <span>STEREO</span>
            <span>SP</span>
          </div>
        </div>

        <div
          style={{
            pointerEvents: 'auto',
            textAlign: 'left',
            background: 'rgba(0,0,0,0.55)',
            padding: '14px 16px',
            border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            alignSelf: 'flex-start',
            maxWidth: '100%',
          }}
        >
          <div
            className="hud"
            style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--rec)' }}
          >
            ▍ NOW WATCHING LONDON
          </div>
          <h1
            className="h-display"
            style={{
              fontSize: 'min(15.5vw, 64px)',
              marginTop: 6,
              color: 'var(--ink)',
            }}
          >
            LONDON
            <br />
            SELFIE
            <br />
            CAM<span style={{ color: 'var(--rec)' }}>.</span>
          </h1>
          <div
            className="hud mt-3"
            style={{
              fontSize: 12,
              letterSpacing: '0.15em',
              color: 'var(--ink)',
              maxWidth: 320,
              lineHeight: 1.5,
            }}
          >
            BE SEEN, FROM THE OTHER SIDE.
            <br />
            HIJACK A TFL TRAFFIC CAM, STRIKE A POSE,
            <br />
            COLLECT THE CITY ONE FRAME AT A TIME.
          </div>
        </div>

        <div style={{ pointerEvents: 'auto' }}>
          <div
            className="row between mb-3 hud"
            style={{
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'var(--ink-dim)',
            }}
          >
            <span>{count} VIEWERS</span>
            <span>·</span>
            <span>{cams.length} CAMS LIVE</span>
            <span>·</span>
            <span>0 OFFLINE</span>
          </div>
          <button
            onClick={onEnter}
            style={{
              width: '100%',
              padding: 18,
              background: 'var(--rec)',
              color: '#fff',
              fontFamily: 'var(--font-hud)',
              fontSize: 18,
              letterSpacing: '0.25em',
              border: '2px solid var(--ink)',
              boxShadow: '0 0 0 2px var(--rec), 0 0 24px var(--rec)',
            }}
          >
            ▶ &nbsp; TAP IN
          </button>
        </div>
      </div>
    </div>
  );
}

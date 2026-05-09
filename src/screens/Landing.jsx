import { useEffect, useState } from 'react';
import { CamTile } from '../components/CamTile';
import { Scanlines, Grain, Vignette, Brackets } from '../components/Overlays';
import { useTickingTime } from '../hooks/useTickingTime';
import { MapView } from '../components/MapView';

export function Landing({ hook, cams, onEnter, onPickCam }) {
  if (hook === 'single') return <LandingSingle cams={cams} onEnter={onEnter} onPickCam={onPickCam} />;
  if (hook === 'map') return <LandingMap cams={cams} onEnter={onEnter} onPickCam={onPickCam} />;
  return <LandingWall cams={cams} onEnter={onEnter} onPickCam={onPickCam} />;
}

function LandingWall({ cams, onEnter, onPickCam }) {
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
          <CamTile key={c.id} cam={c} onClick={() => onPickCam(c.id)} hideHud />
        ))}
        {/* Pad if not enough cams loaded yet */}
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
          <div className="row between" style={{ fontSize: 11, letterSpacing: '0.12em' }}>
            <span>
              <span className="rec-dot" /> &nbsp;LIVE · TFL JAM CAM
            </span>
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

        <div style={{ pointerEvents: 'auto', textAlign: 'left' }}>
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
          <div
            className="hud center mt-2"
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              color: 'var(--ink-dim)',
            }}
          >
            18+ · NO FACES STORED · CCTV ART
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingSingle({ cams, onEnter }) {
  const time = useTickingTime();
  const cam = cams[1] || cams[0];
  if (!cam) return <div className="screen" />;
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <CamTile cam={cam} hideHud big video />
      </div>
      <Scanlines />
      <Grain />
      <Vignette />
      <Brackets />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 60,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div className="hud" style={{ fontSize: 11 }}>
          <div className="row between">
            <span>
              <span className="rec-dot" /> REC · {cam.shortId}
            </span>
            <span>{time}</span>
          </div>
          <div className="tape-edge mt-2" />
        </div>

        <div style={{ textAlign: 'left' }}>
          <div
            className="hud"
            style={{
              fontSize: 11,
              color: 'var(--rec)',
              letterSpacing: '0.2em',
            }}
          >
            CH 02 · {cam.displayName.toUpperCase()}
          </div>
          <h1
            className="h-display"
            style={{
              fontSize: 'min(16vw, 68px)',
              color: 'var(--ink)',
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}
          >
            BE SEEN.
            <br />
            FROM
            <br />
            OUTSIDE.
          </h1>
          <div
            className="hud mt-3"
            style={{
              fontSize: 12,
              color: 'var(--ink)',
              textShadow: '0 1px 6px rgba(0,0,0,0.9)',
            }}
          >
            JUMP THROUGH THE LENS — TAP IN ↓
          </div>
        </div>

        <button
          onClick={onEnter}
          style={{
            padding: 16,
            background: 'var(--ink)',
            color: 'var(--bg)',
            fontFamily: 'var(--font-hud)',
            fontSize: 18,
            letterSpacing: '0.25em',
          }}
        >
          ▶ &nbsp; ENTER THE CAM
        </button>
      </div>
    </div>
  );
}

function LandingMap({ cams, onEnter, onPickCam }) {
  const time = useTickingTime();
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <MapView cams={cams.slice(0, 60)} onPick={onPickCam} pulsing />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 60,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.6), transparent 25%, transparent 60%, rgba(0,0,0,0.85))',
        }}
      >
        <div className="hud" style={{ pointerEvents: 'auto' }}>
          <div className="row between" style={{ fontSize: 11 }}>
            <span>
              <span className="rec-dot" /> {cams.length} CAMS · LIVE
            </span>
            <span>{time}</span>
          </div>
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <h1
            className="h-display"
            style={{ fontSize: 'min(15vw, 60px)', color: 'var(--ink)' }}
          >
            PICK A
            <br />
            POSTCODE.
            <br />
            POSE.
          </h1>
          <button
            onClick={onEnter}
            className="mt-4"
            style={{
              width: '100%',
              padding: 16,
              background: 'var(--rec)',
              color: '#fff',
              fontFamily: 'var(--font-hud)',
              fontSize: 16,
              letterSpacing: '0.25em',
              border: '1px solid var(--ink)',
            }}
          >
            ▶ ENTER
          </button>
        </div>
      </div>
    </div>
  );
}

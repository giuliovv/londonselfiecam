import { useState, useMemo } from 'react';
import { CamTile } from '../components/CamTile';
import { StopGuide } from '../components/StopGuide';
import { CamViewer } from './CamViewer';
import { ROUTES, missionFor } from '../data/london';
import { resolveRouteCams } from '../hooks/useTflCams';

export function Planner({ cams, activeRoute, onStartRoute, onSnap }) {
  const [openRoute, setOpenRoute] = useState(null);

  if (activeRoute) {
    return (
      <RouteTimeline
        cams={cams}
        route={activeRoute}
        onClose={() => onStartRoute(null)}
        onSnap={onSnap}
      />
    );
  }
  if (openRoute) {
    return (
      <RouteDetail
        cams={cams}
        route={openRoute}
        onBack={() => setOpenRoute(null)}
        onStart={() => {
          setOpenRoute(null);
          onStartRoute(openRoute);
        }}
      />
    );
  }
  return <RouteList onPick={setOpenRoute} cams={cams} />;
}

function RouteList({ onPick, cams }) {
  return (
    <div
      className="screen-scroll"
      style={{ background: 'var(--bg)', padding: '0 0 100px' }}
    >
      <div className="px-4" style={{ paddingTop: 18 }}>
        <div
          className="hud"
          style={{ fontSize: 11, color: 'var(--rec)', letterSpacing: '0.2em' }}
        >
          ▍ THE PLANNER
        </div>
        <h1
          className="h-display"
          style={{
            fontSize: 'min(13vw, 56px)',
            marginTop: 6,
            color: 'var(--ink)',
          }}
        >
          PICK A
          <br />
          STORY,
          <br />
          WALK IT.
        </h1>
        <div
          className="hud mt-3"
          style={{ fontSize: 12, color: 'var(--ink-dim)', lineHeight: 1.5 }}
        >
          {ROUTES.length} CURATED ROUTES — EACH STOP IS A REAL TFL CAM. SNAP TO ADVANCE.
        </div>
      </div>

      <div className="tape-edge mt-4" />

      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {ROUTES.map((r) => (
          <RouteCard
            key={r.id}
            route={r}
            cams={cams}
            onClick={() => onPick(r)}
          />
        ))}
      </div>

      <div className="px-4 mt-4">
        <button
          className="chip"
          style={{
            width: '100%',
            padding: 14,
            justifyContent: 'center',
            border: '1px dashed var(--ink-dim)',
          }}
        >
          ＋ BUILD MY OWN ROUTE
        </button>
      </div>
    </div>
  );
}

function RouteCard({ route, cams, onClick }) {
  const stops = useMemo(
    () => resolveRouteCams(route, cams).slice(0, 4),
    [route, cams],
  );
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        textAlign: 'left',
        background: 'var(--bg-2)',
        border: '1px solid var(--line)',
        borderLeft: `4px solid ${route.color}`,
        padding: 14,
        color: 'var(--ink)',
      }}
    >
      <div className="row between">
        <div
          className="hud"
          style={{
            fontSize: 10,
            color: route.color,
            letterSpacing: '0.2em',
          }}
        >
          ROUTE · {route.id.toUpperCase()}
        </div>
        <div className="hud" style={{ fontSize: 10, color: 'var(--ink-dim)' }}>
          {route.duration} · {route.waypoints.length} STOPS
        </div>
      </div>
      <div className="h-display mt-2" style={{ fontSize: 28, lineHeight: 1 }}>
        {route.icon} {route.name}
      </div>
      <div
        className="text-mono mt-2"
        style={{ fontSize: 12, color: 'var(--ink-dim)' }}
      >
        {route.tagline}
      </div>

      <div className="row gap-2 mt-3" style={{ overflow: 'hidden' }}>
        {stops.map((c) => (
          <div
            key={c.id}
            style={{ width: '100%', aspectRatio: '4/3', flex: 1 }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                outline: '1px solid var(--line)',
              }}
            >
              <CamTile cam={c} hideHud />
            </div>
          </div>
        ))}
        {stops.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: '100%',
                aspectRatio: '4/3',
                flex: 1,
                background: 'rgba(245,241,232,0.04)',
              }}
            />
          ))}
      </div>
    </button>
  );
}

function RouteDetail({ route, cams, onBack, onStart }) {
  const stops = useMemo(() => resolveRouteCams(route, cams), [route, cams]);
  const heroCam = stops[0];

  return (
    <div
      className="screen-scroll"
      style={{ background: 'var(--bg)', padding: '0 0 24px' }}
    >
      <div
        style={{
          position: 'relative',
          height: 200,
          overflow: 'hidden',
          borderBottom: `4px solid ${route.color}`,
        }}
      >
        {heroCam ? (
          <CamTile cam={heroCam} hideHud big video />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--bg-2)',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <button onClick={onBack} className="chip">
            ◂ BACK
          </button>
          <div>
            <div
              className="hud"
              style={{
                fontSize: 10,
                color: route.color,
                letterSpacing: '0.2em',
              }}
            >
              {route.icon} ROUTE · {route.id.toUpperCase()}
            </div>
            <div
              className="h-display"
              style={{ fontSize: 36, color: 'var(--ink)' }}
            >
              {route.name}
            </div>
          </div>
        </div>
      </div>

      <div
        className="px-4 py-3 row between hud"
        style={{
          fontSize: 11,
          color: 'var(--ink-dim)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <span>⌚ {route.duration}</span>
        <span>📍 {route.waypoints.length} STOPS</span>
        <span>🚶 {route.distance}</span>
      </div>

      <div className="px-4 mt-4">
        <div
          className="text-mono"
          style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}
        >
          {route.tagline}.
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="section-title mb-3">Stops</div>
        <div className="rail">
          {stops.map((c, i) => (
            <div key={c.id} className="stop">
              <div className="row between gap-3">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    className="hud"
                    style={{ fontSize: 10, color: 'var(--ink-dim)' }}
                  >
                    STOP {String(i + 1).padStart(2, '0')} · {c.shortId}
                  </div>
                  <div
                    className="text-mono"
                    style={{
                      fontSize: 16,
                      color: 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.label || c.displayName}
                  </div>
                  <div
                    className="hud"
                    style={{ fontSize: 10, color: 'var(--ink-dim)' }}
                  >
                    {c.view || 'CCTV'} · {c.road || 'TfL'}
                  </div>
                </div>
                <div
                  style={{
                    width: 64,
                    height: 48,
                    position: 'relative',
                    overflow: 'hidden',
                    outline: '1px solid var(--line)',
                    flexShrink: 0,
                  }}
                >
                  <CamTile cam={c} hideHud />
                </div>
              </div>
              <div
                className="hud mt-2"
                style={{
                  fontSize: 10,
                  color: route.color,
                  letterSpacing: '0.15em',
                }}
              >
                ▍ TASK: {missionFor(c.id, i).toUpperCase()}
              </div>
              <StopGuide cam={c} accent={route.color} />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background:
            'linear-gradient(180deg, rgba(10,10,10,0) 0%, var(--bg) 35%)',
          zIndex: 5,
        }}
      >
        <button
          onClick={onStart}
          style={{
            width: '100%',
            padding: 16,
            background: route.color,
            color: '#000',
            fontFamily: 'var(--font-hud)',
            fontSize: 16,
            letterSpacing: '0.25em',
            border: '2px solid var(--ink)',
            cursor: 'pointer',
          }}
        >
          ▶ &nbsp;START THIS ROUTE
        </button>
      </div>
    </div>
  );
}

function RouteTimeline({ route, cams, onClose, onSnap }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [openCam, setOpenCam] = useState(null);
  const stops = useMemo(() => resolveRouteCams(route, cams), [route, cams]);
  const total = stops.length;

  if (openCam !== null) {
    return (
      <CamViewer
        cam={stops[openCam]}
        onBack={() => setOpenCam(null)}
        missionStop={{ task: missionFor(stops[openCam].id, openCam) }}
        onSnap={(s) => {
          if (openCam === stepIdx) setStepIdx((i) => Math.min(total - 1, i + 1));
          setOpenCam(null);
          onSnap?.(s);
        }}
      />
    );
  }

  return (
    <div className="screen-scroll" style={{ background: 'var(--bg)' }}>
      <div className="px-4" style={{ paddingTop: 14 }}>
        <div className="row between">
          <button onClick={onClose} className="chip">
            ◂ END ROUTE
          </button>
          <div
            className="chip"
            style={{ background: route.color, color: '#000', borderColor: route.color }}
          >
            {stepIdx} / {total}
          </div>
        </div>
        <div
          className="h-display mt-2"
          style={{ fontSize: 28, color: 'var(--ink)' }}
        >
          {route.icon} {route.name}
        </div>
        <div className="bar mt-3">
          <i
            style={{
              width: `${(stepIdx / Math.max(total, 1)) * 100}%`,
              background: route.color,
              boxShadow: `0 0 10px ${route.color}`,
            }}
          />
        </div>
      </div>

      <div className="tape-edge mt-3" />

      <div className="px-4 mt-3" style={{ paddingBottom: 100 }}>
        <div className="rail">
          {stops.map((c, i) => {
            const done = i < stepIdx;
            const current = i === stepIdx;
            return (
              <div
                key={c.id}
                className="stop"
                data-done={done}
                data-current={current}
              >
                <div
                  className="hud"
                  style={{ fontSize: 10, color: 'var(--ink-dim)' }}
                >
                  STOP {String(i + 1).padStart(2, '0')} · {c.shortId}
                </div>
                <div
                  className="text-mono"
                  style={{
                    fontSize: 18,
                    color: done ? 'var(--ink-dim)' : 'var(--ink)',
                    textDecoration: done ? 'line-through' : 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.label || c.displayName}
                </div>
                <div
                  className="hud mt-1"
                  style={{
                    fontSize: 10,
                    color: route.color,
                    letterSpacing: '0.12em',
                  }}
                >
                  ▍ {missionFor(c.id, i).toUpperCase()}
                </div>

                {current && (
                  <>
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/10',
                        marginTop: 10,
                        overflow: 'hidden',
                        outline: `2px solid ${route.color}`,
                      }}
                    >
                      <CamTile cam={c} hideHud big video />
                      <div className="cam-hud">
                        <div className="tl">
                          <span className="rec-dot" /> LIVE
                        </div>
                        <div className="br">{c.shortId}</div>
                      </div>
                    </div>
                    <div className="row gap-2 mt-2">
                      <button
                        onClick={() => setOpenCam(i)}
                        style={{
                          flex: 1,
                          padding: 12,
                          background: route.color,
                          color: '#000',
                          fontFamily: 'var(--font-hud)',
                          letterSpacing: '0.18em',
                          fontSize: 13,
                          border: 0,
                        }}
                      >
                        ▶ OPEN CAM &amp; SNAP
                      </button>
                      <button onClick={() => setStepIdx(i + 1)} className="chip">
                        SKIP
                      </button>
                    </div>
                    <div
                      className="hud mt-2"
                      style={{ fontSize: 10, color: 'var(--ink-dim)' }}
                    >
                      Walk: ~9 min from previous stop
                    </div>
                    <StopGuide cam={c} accent={route.color} defaultOpen />
                  </>
                )}

                {done && (
                  <div className="row gap-2 mt-2">
                    <span
                      className="chip"
                      style={{
                        background: 'var(--acc-1)',
                        color: '#000',
                        borderColor: 'var(--acc-1)',
                      }}
                    >
                      ✓ SNAPPED
                    </span>
                    <span className="chip" style={{ fontSize: 10 }}>
                      +25 XP
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


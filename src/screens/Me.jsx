import { useState } from 'react';
import { CamTile } from '../components/CamTile';
import { QUESTS, FRIENDS } from '../data/london';

function Stat({ label, v }) {
  return (
    <div style={{ flex: 1 }}>
      <div className="h-display" style={{ fontSize: 22, color: 'var(--ink)' }}>
        {v}
      </div>
      <div
        className="hud"
        style={{
          fontSize: 10,
          color: 'var(--ink-dim)',
          letterSpacing: '0.15em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function Me({ cams, onOpenCam }) {
  const [tab, setTab] = useState('quests');
  const me = FRIENDS.find((f) => f.you);

  return (
    <div
      className="screen-scroll"
      style={{ background: 'var(--bg)', paddingBottom: 100 }}
    >
      <div className="px-4" style={{ paddingTop: 14 }}>
        <div
          className="hud"
          style={{
            fontSize: 10,
            color: 'var(--rec)',
            letterSpacing: '0.2em',
          }}
        >
          ▍ YOU
        </div>
        <div
          className="row between mt-2"
          style={{ alignItems: 'flex-end' }}
        >
          <div>
            <div
              className="h-display"
              style={{ fontSize: 30, color: 'var(--ink)' }}
            >
              @you
            </div>
            <div
              className="hud"
              style={{
                fontSize: 11,
                color: 'var(--ink-dim)',
                marginTop: 4,
              }}
            >
              JOINED 02 MAY · LEVEL 03
            </div>
          </div>
          <div
            style={{
              width: 60,
              height: 60,
              border: '2px solid var(--ink)',
              background: 'var(--bg-2)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-hud)',
              fontSize: 24,
              color: 'var(--rec)',
              position: 'relative',
            }}
          >
            ◉
            <span
              style={{
                position: 'absolute',
                inset: -4,
                border: '1px dashed var(--ink-dim)',
              }}
            />
          </div>
        </div>

        <div
          className="row gap-3 mt-4"
          style={{
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            padding: '12px 0',
          }}
        >
          <Stat label="CAMS" v={me.cams} />
          <Stat label="SNAPS" v={me.snaps} />
          <Stat label="STREAK" v={`${me.streak}d`} />
          <Stat label="XP" v="2,840" />
        </div>
      </div>

      <div className="row mt-4 px-4 gap-2">
        {['quests', 'friends', 'snaps'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="chip"
            style={{
              background: tab === t ? 'var(--ink)' : 'transparent',
              color: tab === t ? 'var(--bg)' : 'var(--ink)',
              borderColor: tab === t ? 'var(--ink)' : 'var(--line)',
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'quests' && (
        <div
          className="px-4 mt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {QUESTS.map((q) => {
            const pct = Math.min(1, q.progress / q.target);
            const done = q.progress >= q.target;
            return (
              <div
                key={q.id}
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  padding: 12,
                  position: 'relative',
                }}
              >
                <div className="row between">
                  <div>
                    <div
                      className="hud"
                      style={{
                        fontSize: 10,
                        color: done ? 'var(--acc-1)' : 'var(--ink-dim)',
                        letterSpacing: '0.18em',
                      }}
                    >
                      {done ? '▍ COMPLETE' : `▍ ${q.progress} / ${q.target}`}
                    </div>
                    <div
                      className="text-mono mt-1"
                      style={{ fontSize: 16, color: 'var(--ink)' }}
                    >
                      {q.name}
                    </div>
                    <div
                      className="hud"
                      style={{
                        fontSize: 11,
                        color: 'var(--ink-dim)',
                        marginTop: 2,
                      }}
                    >
                      {q.desc}
                    </div>
                  </div>
                  <div
                    className="hud"
                    style={{
                      fontSize: 10,
                      color: 'var(--rec)',
                      textAlign: 'right',
                    }}
                  >
                    REWARD
                    <br />
                    {q.reward}
                  </div>
                </div>
                <div className="bar mt-3">
                  <i
                    style={{
                      width: `${pct * 100}%`,
                      background: done ? 'var(--acc-1)' : 'var(--rec)',
                      boxShadow: `0 0 10px ${done ? 'var(--acc-1)' : 'var(--rec)'}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'friends' && (
        <div
          className="px-4 mt-4"
          style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <div
            className="hud"
            style={{
              fontSize: 11,
              color: 'var(--ink-dim)',
              letterSpacing: '0.2em',
              padding: '6px 0',
            }}
          >
            WEEK · CAMS VISITED
          </div>
          {FRIENDS.map((f, i) => (
            <div
              key={f.name}
              className="row between"
              style={{
                padding: '10px 12px',
                background: f.you ? 'var(--bg-2)' : 'transparent',
                border: f.you
                  ? '1px solid var(--rec)'
                  : '1px solid var(--line)',
              }}
            >
              <div className="row gap-3">
                <div
                  className="hud"
                  style={{
                    fontSize: 14,
                    color: i < 3 ? 'var(--rec)' : 'var(--ink-dim)',
                    width: 24,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div
                    className="text-mono"
                    style={{ fontSize: 14, color: 'var(--ink)' }}
                  >
                    {f.name}
                    {f.you && ' ◀'}
                  </div>
                  <div
                    className="hud"
                    style={{ fontSize: 10, color: 'var(--ink-dim)' }}
                  >
                    {f.snaps} snaps · {f.streak}d streak
                  </div>
                </div>
              </div>
              <div
                className="hud"
                style={{ fontSize: 22, color: 'var(--ink)' }}
              >
                {f.cams}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'snaps' && (
        <div className="px-4 mt-4">
          <div
            className="hud"
            style={{
              fontSize: 11,
              color: 'var(--ink-dim)',
              letterSpacing: '0.2em',
              marginBottom: 10,
            }}
          >
            YOUR ROLL · {me.snaps} FRAMES
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 4,
            }}
          >
            {cams.slice(0, 9).map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenCam(c.id)}
                style={{
                  aspectRatio: '1/1',
                  position: 'relative',
                  overflow: 'hidden',
                  outline: '1px solid var(--line)',
                  cursor: 'pointer',
                }}
              >
                <CamTile cam={c} hideHud />
                <div
                  style={{
                    position: 'absolute',
                    left: 4,
                    bottom: 4,
                    fontFamily: 'var(--font-hud)',
                    fontSize: 8,
                    color: '#fff',
                    textShadow: '0 0 3px #000',
                  }}
                >
                  {c.shortId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

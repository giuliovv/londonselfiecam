import { useState, useEffect } from 'react';
import { QUESTS, FRIENDS } from '../data/london';
import { loadSnaps, deleteSnap } from '../lib/snapStorage';
import { upgradeToGoogle, getDisplayName } from '../lib/auth';

function computeStats(snaps) {
  const count = snaps.length;
  const uniqueCams = new Set(snaps.map((s) => s.camId)).size;

  // Streak: consecutive days ending today (or yesterday) with at least one snap
  const daySet = new Set(
    snaps.map((s) => new Date(s.time).toLocaleDateString('en-CA')), // YYYY-MM-DD
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (daySet.has(d.toLocaleDateString('en-CA'))) streak++;
    else if (i > 0) break; // gap found — stop (allow missing today)
  }

  const xp = count * 120 + uniqueCams * 80;
  const level = Math.max(1, Math.floor(xp / 1000) + 1);

  // Joined date = earliest snap, or null
  const times = snaps.map((s) => new Date(s.time)).filter((d) => !isNaN(d));
  const joined = times.length
    ? new Date(Math.min(...times)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()
    : null;

  return { count, uniqueCams, streak, xp, level, joined };
}

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

export function Me({ cams, onOpenCam, user }) {
  const [tab, setTab] = useState('quests');
  const me = FRIENDS.find((f) => f.you);
  const [snaps, setSnaps] = useState(() => loadSnaps());
  const [signingIn, setSigningIn] = useState(false);
  const stats = computeStats(snaps);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    try {
      await upgradeToGoogle();
    } catch (e) {
      console.error('Google sign-in failed:', e);
    } finally {
      setSigningIn(false);
    }
  }

  useEffect(() => {
    const updated = loadSnaps();
    setSnaps(updated);
  }, [tab]);

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
              {user ? getDisplayName(user).toUpperCase() : '@YOU'}
            </div>
            <div
              className="hud"
              style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 4 }}
            >
              {stats.joined ? `JOINED ${stats.joined} · ` : ''}LEVEL {String(stats.level).padStart(2, '0')}
            </div>
            {user?.isAnonymous && (
              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="chip"
                style={{ marginTop: 8, fontSize: 10, padding: '4px 10px' }}
              >
                {signingIn ? '...' : 'G · SIGN IN WITH GOOGLE'}
              </button>
            )}
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
          <Stat label="CAMS" v={stats.uniqueCams} />
          <Stat label="SNAPS" v={stats.count} />
          <Stat label="STREAK" v={`${stats.streak}d`} />
          <Stat label="XP" v={stats.xp.toLocaleString()} />
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
            YOUR ROLL · {stats.count} FRAMES
          </div>
          {snaps.length === 0 ? (
            <div
              className="hud"
              style={{
                fontSize: 11,
                color: 'var(--ink-dim)',
                letterSpacing: '0.15em',
                textAlign: 'center',
                marginTop: 40,
              }}
            >
              NO SNAPS YET · HIT THE SHUTTER
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 4,
              }}
            >
              {snaps.map((s) => (
                <div
                  key={s.id}
                  style={{
                    aspectRatio: '1/1',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: '1px solid var(--line)',
                    cursor: 'pointer',
                    background: '#111',
                  }}
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = s.dataUrl;
                    a.download = `londonselfiecam-${s.shortId}.jpg`;
                    a.click();
                  }}
                >
                  <img
                    src={s.dataUrl}
                    alt={s.camName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.6)',
                      padding: '2px 4px',
                      fontFamily: 'var(--font-hud)',
                      fontSize: 8,
                      color: '#fff',
                      letterSpacing: '0.08em',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{s.shortId}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSnap(s.id);
                        setSnaps(loadSnaps());
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--rec)',
                        fontFamily: 'var(--font-hud)',
                        fontSize: 8,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

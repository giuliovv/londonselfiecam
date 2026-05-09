import { useState, useEffect } from 'react';
import { subscribeFeed } from '../lib/firebaseFeed';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function todayStamp() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function timeAgo(ts) {
  if (!ts) return '?';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}

export function Feed({ cams, onOpenCam }) {
  const [items, setItems] = useState(null); // null = loading

  useEffect(() => {
    return subscribeFeed((snaps) => setItems(snaps));
  }, []);

  const byId = (id) => cams.find((c) => c.id === id);

  return (
    <div className="screen-scroll" style={{ background: 'var(--bg)', paddingBottom: 100 }}>
      <div className="px-4" style={{ paddingTop: 14 }}>
        <div className="row between">
          <div>
            <div className="hud" style={{ fontSize: 11, color: 'var(--rec)', letterSpacing: '0.2em' }}>
              ▍ THE STREAM
            </div>
            <div className="h-display" style={{ fontSize: 32, color: 'var(--ink)', marginTop: 4 }}>
              RECENT
              <br />
              SNAPS.
            </div>
          </div>
          <div className="hud" style={{ fontSize: 10, color: 'var(--ink-dim)', textAlign: 'right' }}>
            <span className="rec-dot" /> LIVE
            <br />
            FEED
          </div>
        </div>
      </div>

      <div className="tape-edge mt-3" />

      {items === null && (
        <div className="hud" style={{ fontSize: 11, color: 'var(--ink-dim)', letterSpacing: '0.2em', textAlign: 'center', marginTop: 60 }}>
          ◌ LOADING
        </div>
      )}

      {items !== null && items.length === 0 && (
        <div className="hud" style={{ fontSize: 11, color: 'var(--ink-dim)', letterSpacing: '0.15em', textAlign: 'center', marginTop: 60 }}>
          NO SNAPS YET · BE THE FIRST
        </div>
      )}

      {items !== null && items.length > 0 && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          {items.map((s) => {
            const cam = byId(s.camId);
            const who = s.displayName || `ANON_${(s.uid || '????').slice(0, 4).toUpperCase()}`;
            return (
              <div key={s.id}>
                <div className="row between hud" style={{ fontSize: 11, color: 'var(--ink-dim)' }}>
                  <span style={{ color: 'var(--ink)' }}>{who}</span>
                  <span>{timeAgo(s.createdAt)} ago · {s.shortId}</span>
                </div>

                <div className="polaroid mt-2" style={{ transform: 'rotate(0)' }}>
                  <div
                    className="frame"
                    onClick={() => cam && onOpenCam(cam.id)}
                    style={{ cursor: cam ? 'pointer' : 'default' }}
                  >
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.camName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      <div className="cam-feed cam-feed--placeholder" />
                    )}
                    <div style={{
                      position: 'absolute', left: 6, top: 6,
                      fontFamily: 'var(--font-hud)', fontSize: 9,
                      color: '#fff', background: 'rgba(0,0,0,0.5)',
                      padding: '1px 5px', maxWidth: 'calc(100% - 12px)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {s.shortId} · {s.camName?.toUpperCase()}
                    </div>
                    <div style={{
                      position: 'absolute', right: 6, bottom: 6,
                      fontFamily: 'var(--font-hud)', fontSize: 11,
                      color: '#ffae00', textShadow: '0 0 6px rgba(255,132,0,0.6)',
                    }}>
                      {todayStamp()}
                    </div>
                  </div>
                  <div className="meta">
                    <span>{(s.filter || 'normal').toUpperCase()}</span>
                    <span>{s.road}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

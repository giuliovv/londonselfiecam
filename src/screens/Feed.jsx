import { useMemo } from 'react';
import { CamTile } from '../components/CamTile';
import { FEED } from '../data/london';
import { haversineKm } from '../hooks/useTflCams';

function nearestCam(cams, lat, lng) {
  if (!cams || !cams.length) return null;
  let best = cams[0];
  let bestD = haversineKm(lat, lng, best.lat, best.lng);
  for (let i = 1; i < cams.length; i++) {
    const d = haversineKm(lat, lng, cams[i].lat, cams[i].lng);
    if (d < bestD) {
      bestD = d;
      best = cams[i];
    }
  }
  return best;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const todayStamp = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export function Feed({ cams, onOpenCam }) {
  const items = useMemo(() => {
    return FEED.map((s, i) => {
      const cam = nearestCam(cams, s.near.lat, s.near.lng);
      return {
        ...s,
        cam,
        likes: 18 + ((s.id.charCodeAt(1) * 13 + i * 41) % 200),
        shares: 2 + ((s.id.charCodeAt(1) * 7 + i * 19) % 28),
      };
    }).filter((x) => x.cam);
  }, [cams]);

  return (
    <div
      className="screen-scroll"
      style={{ background: 'var(--bg)', paddingBottom: 100 }}
    >
      <div className="px-4" style={{ paddingTop: 14 }}>
        <div className="row between">
          <div>
            <div
              className="hud"
              style={{
                fontSize: 11,
                color: 'var(--rec)',
                letterSpacing: '0.2em',
              }}
            >
              ▍ THE STREAM
            </div>
            <div
              className="h-display"
              style={{ fontSize: 32, color: 'var(--ink)', marginTop: 4 }}
            >
              RECENT
              <br />
              SNAPS.
            </div>
          </div>
          <div
            className="hud"
            style={{
              fontSize: 10,
              color: 'var(--ink-dim)',
              textAlign: 'right',
            }}
          >
            <span className="rec-dot" /> 188 LIVE
            <br />
            UPDATES /MIN
          </div>
        </div>
      </div>

      <div className="tape-edge mt-3" />

      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        {items.map((s) => (
          <div key={s.id}>
            <div
              className="row between hud"
              style={{ fontSize: 11, color: 'var(--ink-dim)' }}
            >
              <span style={{ color: 'var(--ink)' }}>{s.who}</span>
              <span>
                {s.whenAgo} ago · {s.cam.shortId}
              </span>
            </div>

            <div
              className="polaroid mt-2"
              style={{ transform: 'rotate(0)' }}
            >
              <div
                className="frame"
                onClick={() => onOpenCam(s.cam.id)}
                style={{ cursor: 'pointer' }}
              >
                <CamTile cam={s.cam} hideHud />
                <div
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: 6,
                    fontFamily: 'var(--font-hud)',
                    fontSize: 9,
                    color: '#fff',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '1px 5px',
                    maxWidth: 'calc(100% - 12px)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s.cam.shortId} · {s.cam.displayName.toUpperCase()}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    right: 6,
                    bottom: 6,
                    fontFamily: 'var(--font-hud)',
                    fontSize: 11,
                    color: '#ffae00',
                    textShadow: '0 0 6px rgba(255,132,0,0.6)',
                  }}
                >
                  {todayStamp()}
                </div>
              </div>
              <div className="meta">
                <span>♥ {s.likes}</span>
                <span>↗ {s.shares}</span>
              </div>
            </div>

            <div
              className="text-mono mt-2"
              style={{ fontSize: 13, color: 'var(--ink)' }}
            >
              "{s.caption}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';

const REFRESH_INTERVAL_MS = 5 * 60_000; // TFL updates clips every ~5 min

function formatDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

function formatAge(seconds) {
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s ago`;
}

function formatCountdown(seconds) {
  const remaining = Math.max(0, Math.round(REFRESH_INTERVAL_MS / 1000) - seconds);
  return `next in ${Math.floor(remaining / 60)}m ${remaining % 60}s`;
}

export function CamCard({ cam, getProp }) {
  const videoUrl = getProp(cam, 'videoUrl');
  const imageUrl = getProp(cam, 'imageUrl');
  const view = getProp(cam, 'view');
  const [ts, setTs] = useState(() => Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const refresh = useCallback(() => setTs(Date.now()), []);

  useEffect(() => {
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    setSecondsAgo(0);
    const id = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [ts]);

  const src = `${videoUrl || imageUrl}?t=${ts}`;

  return (
    <div className="cam-card">
      <div className="cam-img-wrap">
        {videoUrl ? (
          <video
            key={ts}
            className="cam-img"
            src={src}
            autoPlay
            loop
            muted
            playsInline
            poster={imageUrl}
          />
        ) : (
          <img key={ts} className="cam-img" src={src} alt={cam.commonName} />
        )}
        <button className="refresh-btn" onClick={refresh} title="Reload clip">
          ↺
        </button>
      </div>
      <div className="cam-info">
        <div className="cam-name">{cam.commonName}</div>
        <div className="cam-meta">
          <span>{formatDist(cam.distKm)}</span>
          {view && <span className="badge">{view}</span>}
          <span className="badge">10s clip · {formatAge(secondsAgo)}</span>
          <span className="refresh-age">{formatCountdown(secondsAgo)}</span>
        </div>
      </div>
    </div>
  );
}

export function CamThumb({ cam, getProp, onClick }) {
  return (
    <button className="nearby-item" onClick={onClick}>
      <img
        className="nearby-thumb"
        src={getProp(cam, 'imageUrl')}
        alt=""
        loading="lazy"
      />
      <div className="nearby-text">
        <div className="nearby-name">{cam.commonName}</div>
        <div className="nearby-dist">{formatDist(cam.distKm)}</div>
      </div>
    </button>
  );
}

import { useState, useEffect, useCallback } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

function formatDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

export function CamCard({ cam, getProp }) {
  const videoUrl = getProp(cam, 'videoUrl');
  const imageUrl = getProp(cam, 'imageUrl');
  const view = getProp(cam, 'view');
  const [ts, setTs] = useState(() => Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);

  const refresh = useCallback(() => setTs(Date.now()), []);

  // Auto-refresh clip every 30 s
  useEffect(() => {
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // Update "X s ago" counter every second
  useEffect(() => {
    const id = setInterval(() => setSecondsAgo(Math.floor((Date.now() - ts) / 1000)), 1000);
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
          <span className="badge live">● Live</span>
          <span className="refresh-age">refreshed {secondsAgo}s ago</span>
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

import { useState, useRef, useCallback } from 'react';

function formatDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

export function CamCard({ cam, getProp }) {
  const videoUrl = getProp(cam, 'videoUrl');
  const imageUrl = getProp(cam, 'imageUrl');
  const view = getProp(cam, 'view');
  const videoRef = useRef(null);
  const [key, setKey] = useState(0);

  const refresh = useCallback(() => {
    setKey((k) => k + 1);
  }, []);

  return (
    <div className="cam-card">
      <div className="cam-img-wrap">
        {videoUrl ? (
          <video
            key={key}
            ref={videoRef}
            className="cam-img"
            src={`${videoUrl}?t=${key}`}
            autoPlay
            loop
            muted
            playsInline
            poster={imageUrl}
          />
        ) : (
          <img className="cam-img" src={`${imageUrl}?t=${key}`} alt={cam.commonName} />
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

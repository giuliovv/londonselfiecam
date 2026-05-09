import { useState } from 'react';

function formatDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

function bustCache(url) {
  return `${url}?t=${Date.now()}`;
}

export function CamCard({ cam, getProp }) {
  const [imgSrc, setImgSrc] = useState(() => bustCache(getProp(cam, 'imageUrl')));
  const view = getProp(cam, 'view');

  return (
    <div className="cam-card">
      <div className="cam-img-wrap">
        <img className="cam-img" src={imgSrc} alt={cam.commonName} />
        <button className="refresh-btn" onClick={() => setImgSrc(bustCache(getProp(cam, 'imageUrl')))} title="Refresh">
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
        src={`${getProp(cam, 'imageUrl')}?t=${Date.now()}`}
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

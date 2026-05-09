import { useState, useEffect } from 'react';
import { useTickingTime } from '../hooks/useTickingTime';

// Refresh static jam-cam JPGs every minute to keep the wall visibly alive.
const IMG_REFRESH_MS = 60_000;

export function CamTile({ cam, onClick, big = false, hideHud = false, video = false, label }) {
  const time = useTickingTime();
  const [bust, setBust] = useState(() => Date.now());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!cam?.imageUrl || video) return undefined;
    const id = setInterval(
      () => setBust(Date.now()),
      IMG_REFRESH_MS + Math.random() * 8000,
    );
    return () => clearInterval(id);
  }, [cam?.imageUrl, video]);

  if (!cam || cam.available === false) {
    return <div className="cam-tile" data-state="off" onClick={onClick} />;
  }

  const src = cam.imageUrl ? `${cam.imageUrl}?t=${bust}` : null;
  const videoSrc = cam.videoUrl ? `${cam.videoUrl}?t=${bust}` : null;
  const display = label || cam.displayName || '';

  return (
    <div className="cam-tile" onClick={onClick}>
      {video && videoSrc ? (
        <video
          key={videoSrc}
          className={big ? 'cam-feed cam-feed--big' : 'cam-feed'}
          src={videoSrc}
          poster={src}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setLoaded(true)}
        />
      ) : src ? (
        <img
          className={big ? 'cam-feed cam-feed--big' : 'cam-feed'}
          src={src}
          alt={display}
          loading={big ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      ) : (
        <div className="cam-feed cam-feed--placeholder" />
      )}

      {!loaded && !video && (
        <div className="cam-feed cam-feed--placeholder" style={{ position: 'absolute', inset: 0 }} />
      )}

      <div className="cam-scanlines" />

      {!hideHud && (
        <div className="cam-hud">
          <div className="tl">
            <span className="rec-dot" /> REC
          </div>
          <div className="tr">{cam.shortId}</div>
          <div className="bl">{display.toUpperCase()}</div>
          <div className="br">{time}</div>
        </div>
      )}
    </div>
  );
}


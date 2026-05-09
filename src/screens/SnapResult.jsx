import { useEffect, useState } from 'react';
import { formatDate, formatTime } from '../hooks/useTickingTime';

const WEATHERS = [
  '14°C · OVERCAST',
  '11°C · DRIZZLE',
  '17°C · CLEAR',
  '9°C · MIST',
  '13°C · CLOUDY',
];

const FILTERS = {
  normal: 'none',
  night: 'hue-rotate(80deg) saturate(1.4) brightness(0.9) contrast(1.2)',
  sepia: 'sepia(0.7) contrast(1.05) brightness(1.05)',
  bw: 'saturate(0) contrast(1.2)',
  vhs: 'saturate(1.4) contrast(1.1) hue-rotate(-10deg)',
};

function drawToBlob(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      try {
        canvas.toBlob((b) => (b ? resolve(b) : reject()), 'image/jpeg', 0.92);
      } catch {
        reject();
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function SnapResult({ snap, onDone, onShare }) {
  const [printed, setPrinted] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    setSharing(true);
    const imgUrl = snap.cam.imageUrl
      ? `${snap.cam.imageUrl}?t=${snap.frozenAt || Date.now()}`
      : null;
    const text = `Spotted on a TFL jam cam 📸 ${snap.cam.displayName.toUpperCase()} · #LondonSelfieCam`;

    try {
      if (navigator.share) {
        // Try to get image blob via canvas (works if TFL S3 sends CORS headers)
        const blob = imgUrl ? await drawToBlob(imgUrl) : null;
        if (blob) {
          const file = new File([blob], 'londonselfiecam.jpg', { type: 'image/jpeg' });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: 'London Selfie Cam', text });
            onShare?.();
            return;
          }
        }
        // Fall back: share cam image URL directly — shows image preview in WhatsApp/iMessage
        await navigator.share({ title: 'London Selfie Cam', text, url: imgUrl || window.location.href });
        onShare?.();
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${imgUrl || window.location.href}`);
        onShare?.();
      }
    } catch {
      onShare?.();
    } finally {
      setSharing(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => setPrinted(true), 250);
    return () => clearTimeout(t);
  }, []);

  const d = snap.time instanceof Date ? snap.time : new Date(snap.time);
  const hms = formatTime(d);
  const dateStr = formatDate(d);
  const weather = WEATHERS[(snap.cam.shortId || 'JC').length % WEATHERS.length];
  const printNo = String(Math.floor(Math.random() * 999)).padStart(3, '0');
  const frozenSrc = snap.cam.imageUrl
    ? `${snap.cam.imageUrl}?t=${snap.frozenAt || Date.now()}`
    : null;
  const filterCss = FILTERS[snap.filter] || 'none';

  return (
    <div
      className="screen"
      style={{
        background: 'radial-gradient(60% 60% at 50% 30%, #1a1a1a, #050505 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 24px 24px',
      }}
    >
      <div
        className="hud"
        style={{
          color: 'var(--ink-dim)',
          fontSize: 11,
          letterSpacing: '0.2em',
        }}
      >
        ◂ &nbsp;PRINTING&nbsp; ◂
      </div>

      <div
        className="polaroid mt-4"
        style={{
          width: '100%',
          maxWidth: 320,
          transform: printed
            ? 'translateY(0) rotate(-1.5deg)'
            : 'translateY(-220px) rotate(0)',
          transition: 'transform 1.1s cubic-bezier(.2,.7,.2,1)',
        }}
      >
        <div className="frame">
          {frozenSrc ? (
            <img
              src={frozenSrc}
              alt={snap.cam.displayName}
              style={{ filter: filterCss }}
            />
          ) : (
            <div className="cam-feed cam-feed--placeholder" />
          )}
          <div className="cam-scanlines" />

          {/* cam label */}
          <div
            style={{
              position: 'absolute',
              left: 8,
              top: 8,
              fontFamily: 'var(--font-hud)',
              fontSize: 10,
              color: '#fff',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 6px',
              letterSpacing: '0.1em',
              maxWidth: 'calc(100% - 16px)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <span className="rec-dot" /> &nbsp;{snap.cam.shortId} ·{' '}
            {snap.cam.displayName.toUpperCase()}
          </div>

          {/* weather */}
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              fontFamily: 'var(--font-hud)',
              fontSize: 10,
              color: '#fff',
              background: 'rgba(0,0,0,0.6)',
              padding: '2px 6px',
              letterSpacing: '0.1em',
            }}
          >
            {weather}
          </div>

          {/* date stamp */}
          <div
            style={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              fontFamily: 'var(--font-hud)',
              fontSize: 14,
              letterSpacing: '0.06em',
              color: '#ffae00',
              textShadow: '0 0 6px rgba(255, 132, 0, 0.6)',
              textAlign: 'right',
            }}
          >
            {dateStr}
            <br />
            <span style={{ fontSize: 12 }}>{hms}</span>
          </div>

          {/* watermark */}
          <div
            style={{
              position: 'absolute',
              left: 8,
              bottom: 8,
              fontFamily: 'var(--font-hud)',
              fontSize: 10,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.15em',
            }}
          >
            LONDONSELFIECAM ▎
          </div>
        </div>

        <div className="meta">
          <span>NO. {printNo}/24</span>
          <span
            style={{
              maxWidth: '60%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {snap.cam.road || snap.cam.view || 'TFL'}
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 12,
            textAlign: 'center',
            color: '#888',
            fontSize: 11,
            letterSpacing: '0.2em',
            fontFamily: 'var(--font-hud)',
          }}
        >
          ★ ★ ★ &nbsp;LSC&nbsp; ★ ★ ★
        </div>
      </div>

      <div className="row gap-3 mt-6" style={{ width: '100%', maxWidth: 320 }}>
        <button
          onClick={handleShare}
          disabled={sharing}
          className="chip solid"
          style={{ flex: 1, padding: 14, justifyContent: 'center' }}
        >
          {sharing ? '...' : '↗ SHARE'}
        </button>
        <button
          onClick={onDone}
          className="chip"
          style={{ flex: 1, padding: 14, justifyContent: 'center' }}
        >
          SAVE & EXIT
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { formatDate, formatTime } from '../hooks/useTickingTime';
import { generatePolaroid } from '../lib/generatePolaroid';
import { saveSnap } from '../lib/snapStorage';

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

export function SnapResult({ snap, onDone, onShare }) {
  const [printed, setPrinted] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  // polaroidBlob is generated once on mount; dataUrl derived from it
  const blobRef = useRef(null);
  const dataUrlRef = useRef(null);
  const [ready, setReady] = useState(false);

  const d = snap.time instanceof Date ? snap.time : new Date(snap.time);
  const hms = formatTime(d);
  const dateStr = formatDate(d);
  const weather = WEATHERS[(snap.cam.shortId || 'JC').length % WEATHERS.length];
  const printNo = String((snap.frozenAt || Date.now()) % 999).padStart(3, '0');
  const frozenSrc = snap.cam.imageUrl
    ? `${snap.cam.imageUrl}?t=${snap.frozenAt || Date.now()}`
    : null;
  const filterCss = FILTERS[snap.filter] || 'none';

  useEffect(() => {
    const t = setTimeout(() => setPrinted(true), 250);
    return () => clearTimeout(t);
  }, []);

  // Generate polaroid in background as soon as component mounts
  useEffect(() => {
    let cancelled = false;
    generatePolaroid(snap).then((blob) => {
      if (cancelled) return;
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      dataUrlRef.current = url;
      setReady(true);
    }).catch(() => setReady(false));
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleShare() {
    setSharing(true);
    try {
      const blob = blobRef.current;
      if (navigator.share && blob) {
        const file = new File([blob], 'londonselfiecam.jpg', { type: 'image/jpeg' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: 'London Selfie Cam' });
          onShare?.();
          return;
        }
      }
      // Fallback: share cam image URL
      const imgUrl = snap.cam.imageUrl
        ? `${snap.cam.imageUrl}?t=${snap.frozenAt || Date.now()}`
        : window.location.href;
      const text = `Spotted on a TFL jam cam 📸 ${snap.cam.displayName.toUpperCase()} · #LondonSelfieCam`;
      if (navigator.share) {
        await navigator.share({ title: 'London Selfie Cam', text, url: imgUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${imgUrl}`);
      }
      onShare?.();
    } catch {
      onShare?.();
    } finally {
      setSharing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const blob = blobRef.current;
      if (!blob) { onDone?.(); return; }

      // Download to device
      const url = dataUrlRef.current || URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `londonselfiecam-${snap.cam.shortId}-${Date.now()}.jpg`;
      a.click();

      // Persist to localStorage roll
      const reader = new FileReader();
      reader.onload = (e) => {
        saveSnap(snap, e.target.result);
        onDone?.();
      };
      reader.onerror = () => onDone?.();
      reader.readAsDataURL(blob);
    } catch {
      onDone?.();
    } finally {
      setSaving(false);
    }
  }

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
          onClick={handleSave}
          disabled={saving || !ready}
          className="chip"
          style={{ flex: 1, padding: 14, justifyContent: 'center' }}
        >
          {saving ? '...' : ready ? '↓ SAVE' : '◌ DEVELOPING'}
        </button>
      </div>
    </div>
  );
}

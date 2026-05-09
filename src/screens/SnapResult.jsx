import { useEffect, useRef, useState } from 'react';
import { formatDate, formatTime } from '../hooks/useTickingTime';
import { generatePolaroid } from '../lib/generatePolaroid';
import { saveSnap } from '../lib/snapStorage';
import { uploadSnap, updateSnapAi } from '../lib/firebaseFeed';
import { captionPolaroid, speak } from '../lib/aiClient';
import { pickBillboard } from '../data/sponsors';

const PERSONAS = [
  { id: 'sassy', label: 'sassy' },
  { id: 'roast', label: 'roast' },
  { id: 'compliment', label: 'nice' },
];

const VOICES = [
  { id: 'narrator', label: 'narrator' },
  { id: 'vibe', label: 'vibe' },
  { id: 'raspy', label: 'raspy' },
];

const WEATHERS = [
  '14°C · OVERCAST',
  '11°C · DRIZZLE',
  '17°C · CLEAR',
  '9°C · MIST',
  '13°C · CLOUDY',
  '21°C · SUNNY',
  '8°C · RAINY',
  '6°C · STORMY',
  '15°C · BREEZY',
  '4°C · FOGGY',
  '19°C · WARM',
  '12°C · SHOWERS',
];

const FILTERS = {
  normal: 'none',
  night: 'hue-rotate(80deg) saturate(1.4) brightness(0.9) contrast(1.2)',
  sepia: 'sepia(0.7) contrast(1.05) brightness(1.05)',
  bw: 'saturate(0) contrast(1.2)',
  vhs: 'saturate(1.4) contrast(1.1) hue-rotate(-10deg)',
};

// Used for share links. In the browser this is the current origin (Vercel
// in prod, localhost in dev). Recipients open whichever environment the
// share was created from.
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : '';

const PENS = {
  sharpie: {
    family: '"Permanent Marker", "Caveat", cursive',
    color: '#1a1a1a',
    size: 22,
    rotate: -2,
    weight: 400,
  },
  cute: {
    family: '"Indie Flower", "Caveat", cursive',
    color: '#d63384',
    size: 24,
    rotate: -1,
    weight: 400,
  },
  cursive: {
    family: '"Caveat", cursive',
    color: '#1a4ea8',
    size: 28,
    rotate: -3,
    weight: 700,
  },
};

const MAX_NOTE_LENGTH = 28;

function formatNoteDate(d) {
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = String(d.getFullYear()).slice(2);
  return `${day} ${month} '${year}`;
}

// Detect once at module load — no user gesture needed for canShare
const CAN_SHARE_FILES =
  typeof navigator.canShare === 'function' &&
  navigator.canShare({ files: [new File([''], 'x.jpg', { type: 'image/jpeg' })] });
const CAN_SHARE = typeof navigator.share === 'function';

export function SnapResult({ snap, user, onDone, onShare }) {
  const [printed, setPrinted] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pen, setPen] = useState('sharpie');
  const [feedStatus, setFeedStatus] = useState('pending'); // pending | uploading | done | error
  const [snapDocId, setSnapDocId] = useState('');
  const blobRef = useRef(null);
  const dataUrlRef = useRef(null);
  const uploadedRef = useRef(false);
  const [ready, setReady] = useState(false);

  // --- AI state ---
  const [persona, setPersona] = useState('sassy');
  const [voice, setVoice] = useState('narrator');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [trivia, setTrivia] = useState('');
  const [landmark, setLandmark] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBusy, setAudioBusy] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  const d = snap.time instanceof Date ? snap.time : new Date(snap.time);
  const hms = formatTime(d);
  const dateStr = formatDate(d);
  const weather = WEATHERS[Math.abs(snap.frozenAt || +d) % WEATHERS.length];
  const defaultNote = `London ♥ ${formatNoteDate(d)}`;
  const [note, setNote] = useState(defaultNote);
  const printNo = String((snap.frozenAt || Date.now()) % 999).padStart(3, '0');
  const frozenSrc = snap.cam.imageUrl
    ? `${snap.cam.imageUrl}?t=${snap.frozenAt || Date.now()}`
    : null;
  const filterCss = FILTERS[snap.filter] || 'none';
  const billboard = pickBillboard(snap.frozenAt || +d || snap.cam.shortId);

  useEffect(() => {
    const t = setTimeout(() => setPrinted(true), 250);
    return () => clearTimeout(t);
  }, []);

  // Regenerate polaroid whenever pen/note changes so the shared JPEG matches the preview.
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(false);
    generatePolaroid(snap, { pen, note }).then((blob) => {
      if (cancelled) return;
      blobRef.current = blob;
      if (dataUrlRef.current) URL.revokeObjectURL(dataUrlRef.current);
      dataUrlRef.current = URL.createObjectURL(blob);
      setReady(true);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [snap, pen, note]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-upload to feed once on first successful generation
  useEffect(() => {
    if (!ready || !user || uploadedRef.current) return;
    uploadedRef.current = true;
    setFeedStatus('uploading');
    uploadSnap(snap, blobRef.current, user)
      .then(({ id }) => {
        setSnapDocId(id);
        setFeedStatus('done');
      })
      .catch(() => setFeedStatus('error'));
  }, [ready, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Revoke any pending audio URL on unmount.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function handleCaption() {
    if (aiBusy) return;
    setAiBusy(true);
    setAiError('');
    try {
      const result = await captionPolaroid({
        imageUrl: snap.cam.imageUrl,
        persona,
        camName: snap.cam.displayName,
      });
      if (result.caption) setNote(result.caption.slice(0, MAX_NOTE_LENGTH));
      setTrivia(result.trivia || '');
      setLandmark(result.landmark || '');
      // Patch the AI metadata onto the existing snap doc (for the share view).
      if (snapDocId) {
        updateSnapAi(snapDocId, {
          caption: result.caption,
          persona,
          voice,
          landmark: result.landmark,
          trivia: result.trivia,
        });
      }
    } catch (e) {
      setAiError(String(e.message || e).slice(0, 80));
    } finally {
      setAiBusy(false);
    }
  }

  async function handlePlay() {
    if (audioBusy) return;
    // If currently playing, pause.
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      return;
    }
    // If already loaded for this voice/text, just resume.
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
      return;
    }
    setAudioBusy(true);
    setAiError('');
    try {
      const url = await speak({ text: note, voice });
      setAudioUrl(url);
      // Wait for the audio to actually be playable end-to-end before we hit
      // play(). Without this, iOS Safari (and sometimes Chrome) drops the
      // first ~200ms of audio, which sounds like clipped first words.
      await new Promise((resolve) => {
        const audio = audioRef.current;
        if (!audio) return resolve();
        audio.src = url;
        audio.preload = 'auto';
        audio.load();
        if (audio.readyState >= 3) return resolve();
        const onReady = () => {
          audio.removeEventListener('canplaythrough', onReady);
          resolve();
        };
        audio.addEventListener('canplaythrough', onReady, { once: true });
        // Safety net so a stuck load can't hang the UI.
        setTimeout(() => {
          audio.removeEventListener('canplaythrough', onReady);
          resolve();
        }, 3000);
      });
      if (audioRef.current) await audioRef.current.play().catch(() => {});
    } catch (e) {
      setAiError(String(e.message || e).slice(0, 80));
    } finally {
      setAudioBusy(false);
    }
  }

  // When the user edits the note or changes voice, the cached audio is stale.
  // Drop it so the next ▶ click regenerates.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAudioUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
    setAudioPlaying(false);
  }, [note, voice]);

  async function handleShare() {
    setSharing(true);
    const blob = blobRef.current;
    const camName = (snap.cam.displayName || 'London cam').toUpperCase();
    const camId = snap.cam.shortId ? encodeURIComponent(snap.cam.shortId) : '';
    const appLink = snapDocId
      ? `${SITE_URL}/?share=${snapDocId}`
      : `${SITE_URL}/${camId ? `?cam=${camId}` : ''}`;
    const text = `Spotted on a TFL jam cam 📸 ${camName} · #LondonSelfieCam`;

    try {
      if (CAN_SHARE_FILES && blob) {
        const file = new File([blob], 'londonselfiecam.jpg', { type: 'image/jpeg' });
        await navigator.share({ files: [file], title: 'London Selfie Cam', text, url: appLink });
      } else if (CAN_SHARE) {
        await navigator.share({ title: 'London Selfie Cam', text, url: appLink });
      } else {
        await navigator.clipboard.writeText(`${text}\n${appLink}`);
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.warn('Share failed:', e);
    } finally {
      setSharing(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const blob = blobRef.current;
      if (!blob) { onDone?.(); return; }

      // Download to device immediately
      const url = dataUrlRef.current || URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `londonselfiecam-${snap.cam.shortId}-${Date.now()}.jpg`;
      a.click();

      // Persist to localStorage roll
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => { saveSnap(snap, e.target.result); resolve(); };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      onDone?.();
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
      <button
        onClick={onDone}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'none',
          border: 'none',
          color: 'var(--ink-dim)',
          fontFamily: 'var(--font-hud)',
          fontSize: 11,
          letterSpacing: '0.15em',
          cursor: 'pointer',
          padding: '6px 0',
        }}
      >
        ← BACK
      </button>

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
        className="hud"
        style={{
          fontSize: 10,
          letterSpacing: '0.18em',
          marginTop: 4,
          color: feedStatus === 'done' ? 'var(--acc-1)' : feedStatus === 'error' ? 'var(--rec)' : 'var(--ink-dim)',
        }}
      >
        {feedStatus === 'pending' && ''}
        {feedStatus === 'uploading' && '◌ POSTING TO FEED...'}
        {feedStatus === 'done' && '▍ POSTED TO FEED'}
        {feedStatus === 'error' && '✕ FEED UPLOAD FAILED'}
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

          <div
            className="snap-billboard"
            style={{
              '--bb-bg': billboard.bg,
              '--bb-fg': billboard.fg,
              '--bb-accent': billboard.accent,
            }}
            aria-hidden="true"
          >
            <div className="snap-billboard-inner">
              <div className="snap-billboard-brand">{billboard.brand}</div>
              <div className="snap-billboard-headline">{billboard.headline}</div>
            </div>
            <div className="snap-billboard-tag">SPONSORED</div>
          </div>

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
        <input
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
          maxLength={MAX_NOTE_LENGTH}
          aria-label="Polaroid note"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 14,
            textAlign: 'center',
            fontFamily: PENS[pen].family,
            fontSize: PENS[pen].size,
            color: PENS[pen].color,
            fontWeight: PENS[pen].weight,
            transform: `rotate(${PENS[pen].rotate}deg)`,
            transformOrigin: 'center',
            lineHeight: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
            width: '100%',
          }}
        />
      </div>

      {(landmark || trivia) && (
        <div
          className="mt-3"
          style={{
            width: '100%',
            maxWidth: 320,
            background: 'rgba(255, 174, 0, 0.08)',
            border: '1px solid rgba(255, 174, 0, 0.35)',
            color: '#ffd58a',
            fontFamily: 'var(--font-hud)',
            fontSize: 10,
            letterSpacing: '0.05em',
            padding: '8px 10px',
            lineHeight: 1.4,
          }}
        >
          {landmark && <strong style={{ color: '#ffae00' }}>📍 {landmark.toUpperCase()}</strong>}
          {landmark && trivia && ' · '}
          {trivia}
        </div>
      )}

      <div
        className="row gap-2 mt-4"
        style={{
          width: '100%',
          maxWidth: 320,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: 10,
            color: 'var(--ink-dim)',
            letterSpacing: '0.2em',
            marginRight: 4,
          }}
        >
          PEN
        </span>
        {Object.keys(PENS).map((p) => (
          <button
            key={p}
            onClick={() => setPen(p)}
            className="chip"
            style={{
              background: pen === p ? 'var(--ink)' : 'transparent',
              color: pen === p ? 'var(--bg)' : 'var(--ink)',
              fontSize: 10,
              padding: '4px 10px',
              fontFamily: PENS[p].family,
              letterSpacing: 0,
              textTransform: 'lowercase',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div
        className="row gap-2 mt-2"
        style={{
          width: '100%',
          maxWidth: 320,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: 10,
            color: 'var(--ink-dim)',
            letterSpacing: '0.2em',
            marginRight: 4,
          }}
        >
          TONE
        </span>
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className="chip"
            style={{
              background: persona === p.id ? 'var(--ink)' : 'transparent',
              color: persona === p.id ? 'var(--bg)' : 'var(--ink)',
              fontSize: 10,
              padding: '4px 10px',
              letterSpacing: 0,
              textTransform: 'lowercase',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div
        className="row gap-2 mt-2"
        style={{
          width: '100%',
          maxWidth: 320,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: 10,
            color: 'var(--ink-dim)',
            letterSpacing: '0.2em',
            marginRight: 4,
          }}
        >
          VOICE
        </span>
        {VOICES.map((v) => (
          <button
            key={v.id}
            onClick={() => setVoice(v.id)}
            className="chip"
            style={{
              background: voice === v.id ? 'var(--ink)' : 'transparent',
              color: voice === v.id ? 'var(--bg)' : 'var(--ink)',
              fontSize: 10,
              padding: '4px 10px',
              letterSpacing: 0,
              textTransform: 'lowercase',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="row gap-2 mt-3" style={{ width: '100%', maxWidth: 320 }}>
        <button
          onClick={handleCaption}
          disabled={aiBusy || !ready}
          className="chip"
          style={{ flex: 1, padding: 10, justifyContent: 'center', fontSize: 11 }}
        >
          {aiBusy ? '...thinking' : '✨ CAPTION'}
        </button>
        <button
          onClick={handlePlay}
          disabled={audioBusy || !note}
          className="chip"
          style={{ flex: 1, padding: 10, justifyContent: 'center', fontSize: 11 }}
        >
          {audioBusy ? '...generating' : audioPlaying ? '◼ PAUSE' : '▶ LISTEN'}
        </button>
      </div>

      {aiError && (
        <div
          className="mt-2"
          style={{
            width: '100%',
            maxWidth: 320,
            color: 'var(--rec, #ff5252)',
            fontFamily: 'var(--font-hud)',
            fontSize: 10,
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}
        >
          ✕ {aiError}
        </div>
      )}

      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="auto"
        onPlay={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
        onEnded={() => setAudioPlaying(false)}
        style={{ display: 'none' }}
      />

      <div className="row gap-3 mt-3" style={{ width: '100%', maxWidth: 320 }}>
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

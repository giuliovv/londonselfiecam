import { useEffect, useRef, useState } from 'react';
import { getSnap } from '../lib/firebaseFeed';
import { speak } from '../lib/aiClient';

export function SharedView({ shareId, onClose }) {
  const [snap, setSnap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBusy, setAudioBusy] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');
    getSnap(shareId)
      .then((doc) => {
        if (cancelled) return;
        if (!doc) setError('Polaroid not found.');
        else setSnap(doc);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e.message || e).slice(0, 120));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  // Revoke pending object URL on unmount.
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function handlePlay() {
    if (audioBusy || !snap) return;
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      return;
    }
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
      return;
    }
    const text = snap.caption || snap.camName || 'A polaroid from London.';
    const voice = snap.voice || 'narrator';
    setAudioBusy(true);
    setError('');
    try {
      const url = await speak({ text, voice });
      setAudioUrl(url);
      // Wait until the audio is fully buffered before playing — otherwise
      // iOS Safari clips the first ~200ms ("words clipped").
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
        setTimeout(() => {
          audio.removeEventListener('canplaythrough', onReady);
          resolve();
        }, 3000);
      });
      if (audioRef.current) await audioRef.current.play().catch(() => {});
    } catch (e) {
      setError(String(e.message || e).slice(0, 80));
    } finally {
      setAudioBusy(false);
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
        padding: '60px 24px 32px',
        minHeight: '100%',
        overflowY: 'auto',
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
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
      )}

      <div
        className="hud"
        style={{
          color: 'var(--ink-dim)',
          fontSize: 11,
          letterSpacing: '0.2em',
        }}
      >
        ◂ &nbsp;SHARED POLAROID&nbsp; ◂
      </div>

      {loading && (
        <div
          style={{
            marginTop: 40,
            color: 'var(--ink-dim)',
            fontFamily: 'var(--font-hud)',
            fontSize: 11,
            letterSpacing: '0.15em',
          }}
        >
          ◌ DEVELOPING...
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            marginTop: 40,
            color: 'var(--rec, #ff5252)',
            fontFamily: 'var(--font-hud)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}
        >
          ✕ {error}
        </div>
      )}

      {snap && !loading && (
        <>
          <img
            src={snap.imageUrl}
            alt={snap.caption || snap.camName || 'London polaroid'}
            style={{
              width: '100%',
              maxWidth: 320,
              marginTop: 16,
              borderRadius: 4,
              boxShadow: '0 18px 48px rgba(0,0,0,0.6)',
              transform: 'rotate(-1.5deg)',
            }}
          />

          {snap.caption && (
            <div
              className="mt-3"
              style={{
                width: '100%',
                maxWidth: 320,
                color: 'var(--ink)',
                fontFamily: '"Caveat", cursive',
                fontSize: 22,
                lineHeight: 1.2,
                textAlign: 'center',
                padding: '4px 8px',
              }}
            >
              “{snap.caption}”
            </div>
          )}

          {(snap.landmark || snap.trivia) && (
            <div
              className="mt-2"
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
              {snap.landmark && (
                <strong style={{ color: '#ffae00' }}>
                  📍 {snap.landmark.toUpperCase()}
                </strong>
              )}
              {snap.landmark && snap.trivia && ' · '}
              {snap.trivia}
            </div>
          )}

          <button
            onClick={handlePlay}
            disabled={audioBusy}
            className="chip solid mt-3"
            style={{
              width: '100%',
              maxWidth: 320,
              padding: 14,
              justifyContent: 'center',
              fontSize: 12,
              letterSpacing: '0.15em',
            }}
          >
            {audioBusy
              ? '... GENERATING'
              : audioPlaying
              ? '◼ PAUSE'
              : `▶ HEAR THIS (${snap.voice || 'narrator'})`}
          </button>

          <audio
            ref={audioRef}
            src={audioUrl || undefined}
            preload="auto"
            onPlay={() => setAudioPlaying(true)}
            onPause={() => setAudioPlaying(false)}
            onEnded={() => setAudioPlaying(false)}
            style={{ display: 'none' }}
          />

          <div
            className="mt-4"
            style={{
              textAlign: 'center',
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-hud)',
              fontSize: 10,
              letterSpacing: '0.2em',
              lineHeight: 1.6,
            }}
          >
            ▎ LONDONSELFIECAM ▎
            <br />
            <a
              href="/"
              style={{ color: 'var(--ink)', textDecoration: 'none' }}
            >
              MAKE YOUR OWN →
            </a>
          </div>
        </>
      )}
    </div>
  );
}

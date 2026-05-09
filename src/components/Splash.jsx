import { formatDate } from '../hooks/useTickingTime';

export function Splash({ show, camCount = 0 }) {
  return (
    <div
      className={`splash ${show ? '' : 'fade-out'}`}
      style={{ display: show ? 'flex' : 'none' }}
    >
      <div style={{ padding: 20 }}>
        <div
          className="hud"
          style={{ fontSize: 11, color: 'var(--rec)', letterSpacing: '0.2em' }}
        >
          <span className="rec-dot" /> &nbsp;TFL CCTV · LIVE
        </div>
        <div className="tape-edge mt-3" />
      </div>

      <div style={{ padding: 24, textAlign: 'left' }}>
        <h1
          className="h-display glitch"
          style={{
            fontSize: 'min(20vw, 80px)',
            color: 'var(--ink)',
            lineHeight: 0.85,
          }}
        >
          LONDON
          <br />
          SELFIE
          <br />
          CAM
          <span style={{ color: 'var(--rec)' }}>.</span>
        </h1>
        <div
          className="hud mt-4"
          style={{
            fontSize: 12,
            color: 'var(--ink-dim)',
            letterSpacing: '0.15em',
          }}
        >
          BOOTING CCTV NETWORK ...
          <br />
          ░░░░░░░░░░ 100%
          <br />
          {camCount > 0 ? `${camCount} CAMS ONLINE` : 'CONTACTING TFL ...'}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div className="tape-edge" />
        <div
          className="hud mt-3 row between"
          style={{ fontSize: 10, color: 'var(--ink-dim)' }}
        >
          <span>v1.0.0-jam</span>
          <span>NTP: {formatDate(new Date())}</span>
        </div>
      </div>
    </div>
  );
}

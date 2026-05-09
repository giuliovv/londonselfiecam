// Stylised London map. Abstract grid + Thames curve + tube-line motif.
// Cam pins are placed by real lat/lng, projected into a central-London bbox.

const BBOX = { minLat: 51.42, maxLat: 51.56, minLng: -0.3, maxLng: 0.05 };

function project(lat, lng) {
  const x = (lng - BBOX.minLng) / (BBOX.maxLng - BBOX.minLng);
  const y = 1 - (lat - BBOX.minLat) / (BBOX.maxLat - BBOX.minLat);
  return { x: 4 + x * 92, y: 8 + y * 84 };
}

export function MapView({ cams, onPick, pulsing = false, selected }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <pattern id="gridPat" width="4" height="4" patternUnits="userSpaceOnUse">
            <path
              d="M 4 0 L 0 0 0 4"
              fill="none"
              stroke="rgba(245,241,232,0.06)"
              strokeWidth="0.2"
            />
          </pattern>
          <linearGradient id="thames" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,229,255,0.05)" />
            <stop offset="50%" stopColor="rgba(0,229,255,0.18)" />
            <stop offset="100%" stopColor="rgba(0,229,255,0.05)" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#gridPat)" />

        {/* Thames — fatter, more meandering */}
        <path
          d="M 0 60 Q 12 56, 22 60 Q 32 66, 42 64 Q 52 62, 60 66 Q 68 70, 78 64 Q 88 60, 100 64 L 100 74 Q 88 70, 78 74 Q 68 80, 60 76 Q 52 72, 42 74 Q 32 76, 22 70 Q 12 66, 0 70 Z"
          fill="url(#thames)"
          stroke="rgba(0,229,255,0.55)"
          strokeWidth="0.4"
        />

        {/* tube line motifs */}
        <path d="M 4 30 L 96 30" stroke="#dc241f" strokeWidth="0.35" opacity="0.5" />
        <path d="M 4 42 L 96 38" stroke="#0019a8" strokeWidth="0.35" opacity="0.5" />
        <path d="M 12 12 L 88 90" stroke="#00782a" strokeWidth="0.35" opacity="0.45" />
        <path d="M 90 8 L 10 88" stroke="#ffd400" strokeWidth="0.35" opacity="0.45" />
        <path d="M 4 18 Q 50 28 96 18" stroke="#9b0058" strokeWidth="0.35" opacity="0.4" />

        {/* parks */}
        <ellipse cx="34" cy="36" rx="9" ry="5.5" fill="rgba(0,255,102,0.06)" stroke="rgba(0,255,102,0.32)" strokeWidth="0.22" />
        <ellipse cx="62" cy="20" rx="5" ry="3" fill="rgba(0,255,102,0.06)" stroke="rgba(0,255,102,0.32)" strokeWidth="0.22" />
        <ellipse cx="76" cy="46" rx="3" ry="2" fill="rgba(0,255,102,0.05)" stroke="rgba(0,255,102,0.25)" strokeWidth="0.2" />

        {/* compass */}
        <g transform="translate(88, 14)">
          <circle r="4" fill="none" stroke="var(--ink-dim)" strokeWidth="0.3" />
          <path d="M 0 -3 L 0.6 0 L 0 3 L -0.6 0 Z" fill="var(--rec)" />
          <text
            fontSize="2"
            fill="var(--ink-dim)"
            textAnchor="middle"
            y="-4.5"
            fontFamily="var(--font-hud)"
          >
            N
          </text>
        </g>

        {/* corner labels */}
        <g
          fontSize="2"
          fill="var(--ink-dim)"
          fontFamily="var(--font-hud)"
          opacity="0.5"
        >
          <text x="4" y="6">W1A</text>
          <text x="86" y="6">EC1</text>
          <text x="4" y="98">SW1</text>
          <text x="86" y="98">SE1</text>
        </g>
      </svg>

      {/* pins */}
      {cams.map((c) => {
        const inBbox =
          c.lat >= BBOX.minLat &&
          c.lat <= BBOX.maxLat &&
          c.lng >= BBOX.minLng &&
          c.lng <= BBOX.maxLng;
        if (!inBbox) return null;
        const { x, y } = project(c.lat, c.lng);
        const isSel = selected === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onPick && onPick(c.id)}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'transparent',
              border: 0,
              padding: 0,
              cursor: 'pointer',
              zIndex: isSel ? 20 : 10,
            }}
            aria-label={c.displayName}
          >
            {pulsing && (
              <span
                style={{
                  position: 'absolute',
                  inset: 4,
                  borderRadius: '50%',
                  background: 'var(--rec)',
                  opacity: 0.4,
                  animation: 'pinPulse 2s ease-out infinite',
                }}
              />
            )}
            <span
              style={{
                position: 'absolute',
                inset: 8,
                borderRadius: '50%',
                background: 'var(--rec)',
                boxShadow: '0 0 8px var(--rec)',
                border: '1.5px solid var(--ink)',
              }}
            />
            {isSel && (
              <span
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: 6,
                  marginLeft: 4,
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-hud)',
                  fontSize: 9,
                  color: 'var(--ink)',
                  letterSpacing: '0.05em',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '1px 4px',
                }}
              >
                {(c.displayName || '').toUpperCase()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

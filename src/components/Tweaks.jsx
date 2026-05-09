import { useState } from 'react';

export function Tweaks({ tweaks, setTweak }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="tweaks-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open tweaks"
        title="Tweaks"
      >
        ⚙
      </button>
      {open && (
        <div className="tweaks-popover">
          <h4>THEME</h4>
          <div className="opts">
            {[
              ['y2k', 'Y2K'],
              ['tfl', 'TfL'],
              ['cinematic', 'CINE'],
            ].map(([v, l]) => (
              <button
                key={v}
                className="opt"
                data-on={tweaks.theme === v}
                onClick={() => setTweak('theme', v)}
              >
                {l}
              </button>
            ))}
          </div>
          <h4>LANDING HOOK</h4>
          <div className="opts">
            {[
              ['wall', 'WALL'],
              ['single', 'HERO'],
              ['map', 'MAP'],
            ].map(([v, l]) => (
              <button
                key={v}
                className="opt"
                data-on={tweaks.hook === v}
                onClick={() => setTweak('hook', v)}
              >
                {l}
              </button>
            ))}
          </div>
          <h4>PLANNER LAYOUT</h4>
          <div
            className="opts"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {[
              ['timeline', 'TIMELINE'],
              ['postcards', 'POSTCARDS'],
            ].map(([v, l]) => (
              <button
                key={v}
                className="opt"
                data-on={tweaks.plannerLayout === v}
                onClick={() => setTweak('plannerLayout', v)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from 'react';
import { useStopGuide, walkMin } from '../hooks/useStopGuide';

export function StopGuide({ cam, defaultOpen = false, accent = 'var(--rec)' }) {
  const [open, setOpen] = useState(defaultOpen);
  const guide = useStopGuide(cam, { enabled: open });

  return (
    <div className="stop-guide" data-open={open}>
      <button
        className="stop-guide__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span style={{ color: accent }}>{open ? '▾' : '▸'}</span>
        &nbsp;WHAT&apos;S HERE
        {!open && (
          <span className="stop-guide__hint">
            wiki · nearby · tube
          </span>
        )}
      </button>

      {open && (
        <div className="stop-guide__body">
          {guide.loading && <GuideSkeleton />}

          {!guide.loading && guide.hero && (
            <div className="stop-guide__hero">
              {guide.hero.thumbnail && (
                <img
                  src={guide.hero.thumbnail}
                  alt={guide.hero.title}
                  className="stop-guide__thumb"
                  loading="lazy"
                />
              )}
              <div className="stop-guide__hero-text">
                <div className="stop-guide__hero-title">
                  {guide.hero.title.toUpperCase()}
                </div>
                {guide.hero.description && (
                  <div className="stop-guide__hero-desc">
                    {guide.hero.description}
                  </div>
                )}
                {guide.hero.extract && (
                  <p className="stop-guide__hero-extract">{guide.hero.extract}</p>
                )}
                {guide.hero.url && (
                  <a
                    href={guide.hero.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="stop-guide__wiki-link"
                  >
                    wiki ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {!guide.loading && !guide.hero && !guide.error && (
            <div className="stop-guide__empty">
              No nearby Wikipedia article — try the cam itself for the live story.
            </div>
          )}

          {!guide.loading && guide.pois.length > 0 && (
            <div className="stop-guide__section">
              <div className="stop-guide__section-title">📷 NEARBY · 300 m</div>
              <ul className="stop-guide__poi-list">
                {guide.pois.map((p) => (
                  <li key={p.id} className="stop-guide__poi">
                    <span className="stop-guide__poi-icon">{p.icon}</span>
                    <span className="stop-guide__poi-name">{p.name}</span>
                    <span className="stop-guide__poi-dist">
                      {walkMin(p.distM)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!guide.loading && guide.tube && (
            <div className="stop-guide__tube">
              <span className="stop-guide__tube-icon">🚇</span>
              <span className="stop-guide__tube-name">
                {guide.tube.name.toUpperCase()}
              </span>
              <span className="stop-guide__tube-dist">{walkMin(guide.tube.distM)}</span>
              {guide.tube.stepFree && (
                <span className="stop-guide__tube-flag">♿ STEP-FREE</span>
              )}
            </div>
          )}

          {!guide.loading && guide.error && (
            <div className="stop-guide__empty">
              Guide unavailable — check connection.
            </div>
          )}

          <div className="stop-guide__attribution">
            © OSM contributors · Wikipedia CC BY-SA · TfL
          </div>
        </div>
      )}
    </div>
  );
}

function GuideSkeleton() {
  return (
    <div className="stop-guide__skeleton">
      <div className="stop-guide__skeleton-thumb" />
      <div className="stop-guide__skeleton-lines">
        <div className="stop-guide__skeleton-line" style={{ width: '70%' }} />
        <div className="stop-guide__skeleton-line" style={{ width: '95%' }} />
        <div className="stop-guide__skeleton-line" style={{ width: '85%' }} />
        <div className="stop-guide__skeleton-line" style={{ width: '40%' }} />
      </div>
    </div>
  );
}

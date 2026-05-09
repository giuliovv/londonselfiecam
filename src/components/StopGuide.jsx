import { useState } from 'react';
import { useStopGuide, walkMin } from '../hooks/useStopGuide';

// Build a Google Maps URL that:
// - dropPin: opens the map centered on the coords with a pin labeled by name
// - directions: opens turn-by-turn directions to the coords from current loc
function gmapsPin({ lat, lng, name }) {
  // The `query` param accepts "lat,lng" and Maps shows a pin. Adding the
  // name as part of `query` lets Maps surface the named result on top.
  const q = name
    ? `${encodeURIComponent(name)}+%40${lat},${lng}`
    : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function directionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

export function StopGuide({ cam, defaultOpen = false, accent = 'var(--rec)' }) {
  const [open, setOpen] = useState(defaultOpen);
  const guide = useStopGuide(cam, { enabled: open });

  const camDirections =
    cam && Number.isFinite(cam.lat) && Number.isFinite(cam.lng)
      ? directionsUrl(cam.lat, cam.lng)
      : null;

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
          <span className="stop-guide__hint">wiki · nearby · tube · directions</span>
        )}
      </button>

      {open && (
        <div className="stop-guide__body">
          {camDirections && (
            <a
              href={camDirections}
              target="_blank"
              rel="noreferrer noopener"
              className="stop-guide__directions"
              style={{ borderColor: accent, color: accent }}
            >
              <span aria-hidden>↗</span>
              GET DIRECTIONS · GOOGLE MAPS
            </a>
          )}

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
                {guide.pois.map((p) => {
                  const href =
                    Number.isFinite(p.lat) && Number.isFinite(p.lng)
                      ? gmapsPin({ lat: p.lat, lng: p.lng, name: p.name })
                      : null;
                  const Inner = (
                    <>
                      <span className="stop-guide__poi-icon">{p.icon}</span>
                      <span className="stop-guide__poi-name">{p.name}</span>
                      <span className="stop-guide__poi-dist">
                        {walkMin(p.distM)}
                      </span>
                      {href && (
                        <span className="stop-guide__poi-arrow" aria-hidden>
                          ↗
                        </span>
                      )}
                    </>
                  );
                  return (
                    <li key={p.id} className="stop-guide__poi">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="stop-guide__poi-link"
                          title={`Open ${p.name} in Google Maps`}
                        >
                          {Inner}
                        </a>
                      ) : (
                        <span className="stop-guide__poi-link stop-guide__poi-link--static">
                          {Inner}
                        </span>
                      )}
                    </li>
                  );
                })}
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
            © OSM contributors · Wikipedia CC BY-SA · TfL · Google Maps
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

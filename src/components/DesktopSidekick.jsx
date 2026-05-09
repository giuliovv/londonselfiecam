import { QRCodeSVG } from 'qrcode.react';

const MOBILE_URL = 'https://londonselfiecam-virid.vercel.app/';
const URL_LABEL = 'londonselfiecam-virid.vercel.app';

const PROTOCOL_STEPS = [
  ['LOCATE', 'GPS finds your location and pins the nearest TfL JamCam on the map.'],
  ['PEEK', 'Tap a camera pin to see the live feed and street name.'],
  ['NAVIGATE', 'Google Maps walks you to the exact spot in the camera’s field of view.'],
  ['LISTEN', 'An AI audio guide plays as you walk — narrated by ElevenLabs.'],
  ['SNAP', 'Arrive, open the live cam in the app, and tap Snap.'],
  ['KEEP', 'Photo saves to your London Photo Book with location tags.'],
  ['SHARE', 'Share to social or collect more cameras across the city.'],
];

const REVENUE_STREAMS = [
  {
    title: 'SPONSORED PINS',
    rate: 'CPM / CPC',
    desc: 'Brands pay for live, geo-targeted placement on the map.',
  },
  {
    title: 'SNAP BILLBOARDS',
    rate: 'CPM',
    desc: 'Disclosed virtual brand wall on every shared photo.',
  },
  {
    title: 'CAM TAKEOVERS',
    rate: '£ / DAY',
    desc: 'A brand owns a TfL cam: branded HUD, frame and CTA.',
  },
  {
    title: 'PRO TIER',
    rate: '£4.99 / MO',
    desc: 'Ad-free, premium pens, unlimited London Photo Book.',
  },
];

export function DesktopSidekick() {
  return (
    <aside className="desktop-sidekick" aria-label="Open on phone">
      <div className="sidekick-scroll">
        <div className="sidekick-tag">
          <span className="rec-dot" />
          DESKTOP USER DETECTED
        </div>

        <div className="sidekick-divider" aria-hidden="true" />

        <p className="sidekick-copy">
          Find a TfL cam near you,
          <br />
          walk up, wave — and snap
          <br />
          your <strong>London selfie.</strong>
        </p>

      <div className="sidekick-example">
        <div className="sidekick-example-steps">
          <span>① FIND A CAM</span>
          <span>→</span>
          <span>② WAVE 👋</span>
          <span>→</span>
          <span>③ SNAP</span>
        </div>
        <div className="sidekick-example-frame">
          <img
            src="/example-snap.jpg"
            alt="Example polaroid snap from Regent St"
          />
        </div>
        <div className="sidekick-example-caption">
          REAL SNAP · REGENT ST / CONDUIT ST · JC451
        </div>
      </div>

      <section className="sidekick-protocol" aria-label="How it works">
        <header className="sidekick-protocol-header">
          <span className="sidekick-protocol-tag">
            <span className="rec-dot" />
            PROTOCOL
          </span>
          <span className="sidekick-protocol-count">07 STEPS</span>
        </header>
        <ol className="sidekick-protocol-list">
          {PROTOCOL_STEPS.map(([title, desc], i) => (
            <li key={title} className="sidekick-protocol-step">
              <span className="sidekick-protocol-num">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="sidekick-protocol-body">
                <span className="sidekick-protocol-title">{title}</span>
                <span className="sidekick-protocol-desc">{desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sidekick-revenue" aria-label="Monetization model">
        <header className="sidekick-revenue-header">
          <span className="sidekick-revenue-tag">
            <span className="green-dot" aria-hidden="true" />
            REVENUE
          </span>
          <span className="sidekick-revenue-count">04 STREAMS</span>
        </header>
        <ol className="sidekick-revenue-list">
          {REVENUE_STREAMS.map((s, i) => (
            <li key={s.title} className="sidekick-revenue-item">
              <span className="sidekick-revenue-num">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="sidekick-revenue-body">
                <span className="sidekick-revenue-row">
                  <span className="sidekick-revenue-title">{s.title}</span>
                  <span className="sidekick-revenue-rate">{s.rate}</span>
                </span>
                <span className="sidekick-revenue-desc">{s.desc}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="sidekick-revenue-tldr">
          ▌ EVERY CAM = A NEW BILLBOARD
        </div>
      </section>

      <div className="sidekick-scroll-nudge" aria-hidden="true">
        ↓ SCROLL FOR QR
      </div>

      <h3 className="sidekick-qr-title">
        POINT
        <br />
        YOUR
        <br />
        PHONE<span className="accent">.</span>
      </h3>

      <div className="sidekick-qr">
        <div className="sidekick-qr-header">
          <span>● TX READY</span>
          <span>OP-403</span>
        </div>

        <div className="sidekick-qr-frame">
          <div className="sidekick-qr-corners" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <QRCodeSVG
            value={MOBILE_URL}
            size={224}
            bgColor="#f5f1e8"
            fgColor="#0a0a0a"
            level="M"
            marginSize={2}
          />
        </div>

        <div className="sidekick-qr-cta">
          <span className="arrow">↳</span>
          SCAN TO BEAM
        </div>

        <div className="sidekick-qr-footer">
          <span>v1.0.0-jam</span>
          <span>LDN · UK</span>
        </div>
      </div>

      <div className="sidekick-divider" aria-hidden="true" />

      <div className="sidekick-foot">
        <div className="sidekick-foot-label">OPEN ON PHONE</div>
        <a
          className="sidekick-foot-url"
          href={MOBILE_URL}
          target="_blank"
          rel="noreferrer noopener"
        >
          {URL_LABEL}
        </a>
      </div>
      </div>

      <div className="sidekick-rail-cue" aria-hidden="true">
        <span className="rail-cue-label">SCROLL</span>
        <span className="rail-cue-stack">
          <span className="rail-cue-arrow">↓</span>
          <span className="rail-cue-arrow">↓</span>
          <span className="rail-cue-arrow">↓</span>
        </span>
      </div>
    </aside>
  );
}

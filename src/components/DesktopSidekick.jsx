import { QRCodeSVG } from 'qrcode.react';

const MOBILE_URL = 'https://londonselfiecam-virid.vercel.app/';
const URL_LABEL = 'londonselfiecam-virid.vercel.app';

export function DesktopSidekick() {
  return (
    <aside className="desktop-sidekick" aria-label="Open on phone">
      <div className="sidekick-tag">
        <span className="rec-dot" />
        DESKTOP USER DETECTED
      </div>

      <div className="sidekick-divider" aria-hidden="true" />

      <h2 className="sidekick-title h-display glitch">
        LONDON
        <br />
        SELFIE
        <br />
        CAM<span className="accent">.</span>
      </h2>

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

      <div className="sidekick-scroll-nudge" aria-hidden="true">
        ↓ SCROLL
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
    </aside>
  );
}

import { QRCodeSVG } from 'qrcode.react';

const MOBILE_URL = 'https://d2bx7f2chgqsy.cloudfront.net/';
const URL_LABEL = 'd2bx7f2chgqsy.cloudfront.net';

export function DesktopSidekick() {
  return (
    <aside className="desktop-sidekick" aria-label="Open on phone">
      <div className="sidekick-tag">
        <span className="rec-dot" />
        DESKTOP USER DETECTED
      </div>

      <div className="sidekick-divider" aria-hidden="true" />

      <h2 className="sidekick-title h-display glitch">
        POINT
        <br />
        YOUR
        <br />
        PHONE<span className="accent">.</span>
      </h2>

      <p className="sidekick-copy">
        This rig was built for the
        <br />
        palm of your hand. <strong>600+ live</strong>
        <br />
        TFL street cams, captured,
        <br />
        filtered, and shareable.
      </p>

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

// Mock monetization inventory — sponsor pins shown on the map and
// virtual billboards composited onto user snaps. Real-world: this would
// be served from an ad backend with bidding, geo-targeting and CTR tracking.

export const SPONSOR_PINS = [
  {
    id: 'pret-charing',
    name: 'PRET A MANGER',
    tag: 'COFFEE',
    lat: 51.5081,
    lng: -0.1281,
    color: '#9b1a1a',
    cta: '50% OFF FLAT WHITE',
    blurb: 'Charing Cross · until 11am',
  },
  {
    id: 'tate-modern',
    name: 'TATE MODERN',
    tag: 'CULTURE',
    lat: 51.5076,
    lng: -0.0994,
    color: '#0a2dff',
    cta: 'PICASSO · FREE ENTRY',
    blurb: 'Bankside · ends 12 Oct',
  },
  {
    id: 'tube-pass',
    name: 'TUBE PASS+',
    tag: 'TRANSIT',
    lat: 51.5145,
    lng: -0.0750,
    color: '#dc241f',
    cta: 'UNLIMITED · £29.50/WK',
    blurb: 'TfL · zones 1–3',
  },
  {
    id: 'aqua-shard',
    name: 'AQUA SHARD',
    tag: 'DINING',
    lat: 51.5045,
    lng: -0.0865,
    color: '#ffae00',
    cta: 'SKY VIEW · 31ST FLOOR',
    blurb: 'The Shard · book tonight',
  },
  {
    id: 'westend-live',
    name: 'WEST END LIVE',
    tag: 'TICKETS',
    lat: 51.5128,
    lng: -0.1310,
    color: '#ff2bff',
    cta: 'WICKED · TONIGHT 7PM',
    blurb: 'Apollo Victoria · £45',
  },
];

export const BILLBOARD_ADS = [
  {
    id: 'bb-pret',
    brand: 'PRET',
    headline: 'EAT.\nDRINK.\nLONDON.',
    bg: '#f1e3cb',
    fg: '#9b1a1a',
    accent: '#9b1a1a',
  },
  {
    id: 'bb-tate',
    brand: 'TATE NOW',
    headline: 'PICASSO\nUNTIL OCT.',
    bg: '#fafafa',
    fg: '#0a2dff',
    accent: '#0a2dff',
  },
  {
    id: 'bb-tfl',
    brand: 'TUBE+',
    headline: 'GO\nFURTHER\nFOR LESS',
    bg: '#ffffff',
    fg: '#0a0a0a',
    accent: '#dc241f',
  },
  {
    id: 'bb-shard',
    brand: 'AQUA SHARD',
    headline: 'LONDON\nFROM\nABOVE',
    bg: '#0a0a0a',
    fg: '#ffae00',
    accent: '#ffae00',
  },
  {
    id: 'bb-west',
    brand: 'WEST END',
    headline: 'WICKED\nNOW\nPLAYING',
    bg: '#1a0033',
    fg: '#ff2bff',
    accent: '#ff2bff',
  },
];

export function pickBillboard(seed) {
  const digits = String(seed ?? Date.now()).replace(/\D/g, '').slice(-8);
  const n = Number(digits) || 0;
  return BILLBOARD_ADS[Math.abs(n) % BILLBOARD_ADS.length];
}

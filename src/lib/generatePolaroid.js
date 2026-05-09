// Draws a polaroid-style image to a canvas and returns a JPEG Blob.
// The cam image is fetched via /cam-proxy/* (our CloudFront proxy that
// adds Access-Control-Allow-Origin: * to TFL S3 responses).

const FILTERS = {
  normal: 'none',
  night: 'hue-rotate(80deg) saturate(1.4) brightness(0.9) contrast(1.2)',
  sepia: 'sepia(0.7) contrast(1.05) brightness(1.05)',
  bw: 'saturate(0) contrast(1.2)',
  vhs: 'saturate(1.4) contrast(1.1) hue-rotate(-10deg)',
};

const WEATHERS = [
  '14°C · OVERCAST',
  '11°C · DRIZZLE',
  '17°C · CLEAR',
  '9°C · MIST',
  '13°C · CLOUDY',
];

const PENS = {
  sharpie: { family: '"Permanent Marker"', size: 26, color: '#1a1a1a', rotate: -2, weight: 400 },
  cute: { family: '"Indie Flower"', size: 28, color: '#d63384', rotate: -1, weight: 400 },
  cursive: { family: '"Caveat"', size: 32, color: '#1a4ea8', rotate: -3, weight: 700 },
};

function formatNoteDate(d) {
  const day = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = String(d.getFullYear()).slice(2);
  return `${day} ${month} '${year}`;
}

// Remap TFL S3 URLs to our CORS-enabled proxy path
function proxify(url) {
  if (!url) return null;
  // url is like https://s3-eu-west-1.amazonaws.com/jamcams.tfl.gov.uk/00002.00865.jpg
  const m = url.match(/jamcams\.tfl\.gov\.uk\/(.+)/);
  if (m) return `/cam-proxy/${m[1]}`;
  return url;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function generatePolaroid(snap, options = {}) {
  const pen = PENS[options.pen] || PENS.sharpie;
  const DPR = 2;
  const W = 400, PAD = 16, IMG_W = W - PAD * 2, STRIP = 92;
  const H = PAD + IMG_W + STRIP;

  const canvas = document.createElement('canvas');
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  // Cream polaroid background
  ctx.fillStyle = '#f6f1e6';
  ctx.fillRect(0, 0, W, H);

  // Dark image area placeholder
  ctx.fillStyle = '#111';
  ctx.fillRect(PAD, PAD, IMG_W, IMG_W);

  // Attempt to draw cam image via proxy
  const rawUrl = snap.cam.imageUrl
    ? `${snap.cam.imageUrl}?t=${snap.frozenAt || Date.now()}`
    : null;
  const proxyUrl = rawUrl ? proxify(rawUrl) : null;

  let imageLoaded = false;
  if (proxyUrl) {
    try {
      const img = await loadImage(proxyUrl);
      // object-fit: cover into square
      const ar = img.naturalWidth / img.naturalHeight;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (ar > 1) { sw = img.naturalHeight; sx = (img.naturalWidth - sw) / 2; }
      else        { sh = img.naturalWidth;  sy = (img.naturalHeight - sh) / 2; }
      const filter = FILTERS[snap.filter] || 'none';
      if (filter !== 'none') ctx.filter = filter;
      ctx.drawImage(img, sx, sy, sw, sh, PAD, PAD, IMG_W, IMG_W);
      ctx.filter = 'none';
      imageLoaded = true;
    } catch {
      // leave dark placeholder
    }
  }

  if (!imageLoaded) {
    ctx.fillStyle = '#222';
    ctx.font = `${12 * DPR / DPR}px monospace`;
    ctx.fillStyle = '#555';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NO SIGNAL', W / 2, PAD + IMG_W / 2);
    ctx.textBaseline = 'alphabetic';
  }

  // --- Image overlays ---
  ctx.font = '10px monospace';

  // Top-left: cam label
  const label = `● ${snap.cam.shortId} · ${snap.cam.displayName.toUpperCase()}`;
  const labelMetrics = ctx.measureText(label);
  const labelW = Math.min(labelMetrics.width + 14, IMG_W - 8);
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(PAD + 6, PAD + 6, labelW, 18);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText(label, PAD + 11, PAD + 17, labelW - 8);

  // Top-right: weather
  const weather = WEATHERS[(snap.cam.shortId || 'JC').length % WEATHERS.length];
  const wM = ctx.measureText(weather);
  const wW = wM.width + 14;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(PAD + IMG_W - wW - 6, PAD + 6, wW, 18);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'right';
  ctx.fillText(weather, PAD + IMG_W - 11, PAD + 17);

  // Bottom-right: date stamp
  const d = snap.time instanceof Date ? snap.time : new Date(snap.time);
  const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const timeStr = d.toTimeString().slice(0, 8);
  ctx.fillStyle = '#ffae00';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, PAD + IMG_W - 8, PAD + IMG_W - 18);
  ctx.font = '11px monospace';
  ctx.fillText(timeStr, PAD + IMG_W - 8, PAD + IMG_W - 5);

  // Bottom-left: watermark
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('LONDONSELFIECAM ▎', PAD + 8, PAD + IMG_W - 5);

  // --- Bottom strip ---
  ctx.fillStyle = '#555';
  ctx.font = '11px monospace';
  const printNo = String(Math.floor((snap.frozenAt || Date.now()) % 999)).padStart(3, '0');
  ctx.textAlign = 'left';
  ctx.fillText(`NO. ${printNo}/24`, PAD + 4, PAD + IMG_W + 22);
  const road = snap.cam.road || snap.cam.view || 'TFL';
  ctx.textAlign = 'right';
  ctx.fillText(road.toUpperCase(), W - PAD - 4, PAD + IMG_W + 22);

  // Handwritten note — replaces the old "★ ★ ★ LSC ★ ★ ★" line.
  // Font must be loaded before measuring/drawing or canvas falls back to serif.
  try {
    await document.fonts.load(`${pen.weight} ${pen.size}px ${pen.family}`);
  } catch { /* fall through with default font */ }

  const note = `London ♥ ${formatNoteDate(d)}`;
  ctx.save();
  ctx.fillStyle = pen.color;
  ctx.font = `${pen.weight} ${pen.size}px ${pen.family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(W / 2, PAD + IMG_W + STRIP - 22);
  ctx.rotate((pen.rotate * Math.PI) / 180);
  ctx.fillText(note, 0, 0);
  ctx.restore();

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}

const KEY = 'lsc_snaps';
const MAX_SNAPS = 50;

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(snaps) {
  try {
    localStorage.setItem(KEY, JSON.stringify(snaps));
  } catch {
    // Storage full — drop oldest
    const trimmed = snaps.slice(-Math.floor(MAX_SNAPS / 2));
    try { localStorage.setItem(KEY, JSON.stringify(trimmed)); } catch { /* give up */ }
  }
}

export function saveSnap(snap, dataUrl) {
  const snaps = load();
  snaps.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    camId: snap.cam.id,
    camName: snap.cam.displayName,
    shortId: snap.cam.shortId,
    road: snap.cam.road || snap.cam.view || 'TFL',
    filter: snap.filter,
    time: snap.time instanceof Date ? snap.time.toISOString() : snap.time,
    dataUrl,
  });
  // Keep newest MAX_SNAPS
  if (snaps.length > MAX_SNAPS) snaps.splice(0, snaps.length - MAX_SNAPS);
  save(snaps);
}

export function loadSnaps() {
  return load().slice().reverse(); // newest first
}

export function deleteSnap(id) {
  save(load().filter((s) => s.id !== id));
}

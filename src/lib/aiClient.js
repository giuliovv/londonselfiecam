// Frontend wrappers around the Vercel /api functions that proxy
// OpenAI (caption) and ElevenLabs (TTS).

export async function captionPolaroid({ imageUrl, persona = 'sassy', camName }) {
  const r = await fetch('/api/caption', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, persona, camName }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `caption_failed_${r.status}`);
  }
  return r.json();
}

// Returns an object-URL pointing at the generated MP3.
// Caller is responsible for revoking it (URL.revokeObjectURL) when done.
export async function speak({ text, voice = 'narrator' }) {
  const r = await fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `speak_failed_${r.status}`);
  }
  const blob = await r.blob();
  return URL.createObjectURL(blob);
}

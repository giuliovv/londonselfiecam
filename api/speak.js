// Vercel serverless function: ElevenLabs text-to-speech.
// POST { text: string, voice?: 'narrator' | 'vibe' | 'raspy' | <raw voiceId> }
// → audio/mpeg bytes

// Current ElevenLabs shared-library voice IDs (the older Adam/Bella/Sam IDs
// have been deprecated for some accounts). If any of these still 404 for a
// given account, we fall back to the user's first available voice below.
const VOICE_PRESETS = {
  narrator: 'nPczCjzI2devNBz1zQrb', // Brian — deep documentary
  vibe:     'pFZP5JQG7iQjIQuC4Bku', // Lily — bright young
  raspy:    'cjVigY5qzO86Huf0OWal', // Eric — character/grit
};

const MAX_CHARS = 600; // hard cap so a stuck loop can't burn credits

// Cached across warm invocations — avoid hitting /v1/voices every request.
let cachedFallbackVoiceId = null;

async function fetchFirstAvailableVoice(apiKey) {
  if (cachedFallbackVoiceId) return cachedFallbackVoiceId;
  try {
    const r = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey, accept: 'application/json' },
    });
    if (!r.ok) return null;
    const data = await r.json();
    const id = data.voices?.[0]?.voice_id || null;
    if (id) cachedFallbackVoiceId = id;
    return id;
  } catch {
    return null;
  }
}

async function callTts(voiceId, apiKey, text) {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.5 },
      }),
    },
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });
    return;
  }

  const { text, voice = 'narrator' } = req.body || {};
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'text required' });
    return;
  }
  const safeText = text.slice(0, MAX_CHARS);
  // Allow callers to pass either a preset key or a raw 20-char ElevenLabs voiceId.
  const voiceId = VOICE_PRESETS[voice] || (typeof voice === 'string' && voice.length === 20 ? voice : VOICE_PRESETS.narrator);

  try {
    let upstream = await callTts(voiceId, apiKey, safeText);

    // If the preset voice isn't on this account, fall back to the user's
    // first available voice and retry once.
    if (!upstream.ok && (upstream.status === 404 || upstream.status === 422 || upstream.status === 400)) {
      const fallback = await fetchFirstAvailableVoice(apiKey);
      if (fallback && fallback !== voiceId) {
        upstream = await callTts(fallback, apiKey, safeText);
      }
    }

    if (!upstream.ok) {
      const errText = await upstream.text();
      res.status(502).json({ error: 'elevenlabs_error', detail: errText.slice(0, 400) });
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).json({ error: 'fetch_failed', detail: String(e).slice(0, 300) });
  }
}

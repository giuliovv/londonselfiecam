// Vercel serverless function: ElevenLabs text-to-speech.
// POST { text: string, voice?: 'narrator' | 'vibe' | 'raspy' | <raw voiceId> }
// → audio/mpeg bytes

const VOICE_PRESETS = {
  narrator: 'pNInz6obpbAFm5rn0bom', // Adam — deep documentary
  vibe:     'EXAVITQu4vr4xnSDxMAC', // Bella — bright, Y2K teen energy
  raspy:    'yoZ06aMxZJJ28mfd3POQ', // Sam — character/grit
};

const MAX_CHARS = 600; // hard cap so a stuck loop can't burn credits

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
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: safeText,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.5 },
        }),
      },
    );

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

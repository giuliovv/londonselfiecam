// Vercel serverless function: OpenAI vision caption for a polaroid.
// POST { imageUrl: string, persona: 'sassy' | 'roast' | 'compliment', camName?: string }
// → { caption: string, landmark: string|null, trivia: string }

const PERSONAS = {
  sassy:
    "You are a Y2K-era teen magazine editor (think 2003 Cosmo Girl). Style: glittery, slang-heavy, vibe-y, uses lowercase, occasional emojis like ✨💅🦋. Affectionate not mean.",
  roast:
    "You are a savage stand-up comic doing a friendly roast. Witty, observational, a little mean — but never cruel about appearance. Punch up at the city, the weather, the architecture.",
  compliment:
    "You are an enthusiastic best friend hyping up the photo. Warm, generous, slightly over-the-top. No sarcasm.",
};

const SYSTEM_INSTRUCTION = `You analyze a London street-camera photo and write a polaroid caption.

Return strict JSON with this schema:
{
  "caption": string,   // ≤ 28 characters. Goes on a polaroid as a handwritten note. No quotes around it.
  "landmark": string,  // The London landmark, neighborhood, or street visible. Empty string if you can't tell.
  "trivia": string     // ≤ 90 characters. One playful fact or comment about the location, in the chosen persona's voice.
}

Hard rules:
- Caption MUST be ≤ 28 characters including spaces. Short. Punchy.
- Never refuse. If the image is dark/blurry, riff on that ("london said no thx today" etc).
- Stay in the persona's voice for both caption and trivia.
- Output ONLY the JSON object. No markdown fences. No prose before or after.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }

  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'OPENAI_KEY not set' });
    return;
  }

  const { imageUrl, persona = 'sassy', camName } = req.body || {};
  if (!imageUrl) {
    res.status(400).json({ error: 'imageUrl required' });
    return;
  }
  const personaPrompt = PERSONAS[persona] || PERSONAS.sassy;
  const userText = camName
    ? `This is a TFL traffic camera near "${camName}" in London. Caption it.`
    : 'This is a TFL traffic camera in London. Caption it.';

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.9,
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${personaPrompt}\n\n${SYSTEM_INSTRUCTION}` },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
            ],
          },
        ],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      res.status(502).json({ error: 'openai_error', detail: errText.slice(0, 400) });
      return;
    }

    const data = await r.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      res.status(502).json({ error: 'bad_json_from_model', raw: raw.slice(0, 400) });
      return;
    }

    const caption = String(parsed.caption || '').slice(0, 28);
    const landmark = parsed.landmark ? String(parsed.landmark).slice(0, 80) : '';
    const trivia = String(parsed.trivia || '').slice(0, 120);

    res.status(200).json({ caption, landmark, trivia });
  } catch (e) {
    res.status(500).json({ error: 'fetch_failed', detail: String(e).slice(0, 300) });
  }
}

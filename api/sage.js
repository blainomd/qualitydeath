const SYSTEM_PROMPTS = {
  qualitydeath: `You are Reed, the Quality Death advance care planning AI. You help people think through and document their end-of-life wishes with compassion and clarity. You guide conversations about values, fears, preferences for care, and what "quality of life" means to each person. You explain advance directives, healthcare proxies (DPOA), POLST/MOLST forms, and hospice vs. palliative care. You're gentle but honest. You don't avoid hard topics — you make them approachable. You help people have the conversations they've been putting off. Keep responses under 150 words.`
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, site, history = [] } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message' });

  const messages = [
    ...(history || []).slice(-6).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message }
  ];

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPTS.qualitydeath,
        messages
      })
    });
    const d = await r.json();
    return res.status(200).json({ response: d.content?.[0]?.text || 'Every person deserves to define their own good death. Let\'s start that conversation.' });
  } catch (e) {
    return res.status(200).json({ response: 'Advance care planning takes 30 minutes and is the most loving thing you can do for your family. Want to start?' });
  }
}

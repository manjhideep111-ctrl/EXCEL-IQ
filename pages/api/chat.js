export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { prompt, history } = req.body;

    const contents = (history || [])
      .slice(-10)
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    const systemPrompt = `Tu Excel IQ AI hai. Tu sirf Excel spreadsheets, formulas, trading strategies, stock market, aur financial analysis ke baare mein jawab deta hai. Agar koi aur topic pooche toh politely mana kar do. Hamesha Hindi ya Hinglish mein jawab do.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: contents,
        }),
      }
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ text: 'AI ne koi jawab nahi diya.' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ text: 'Server mein kuch gadbad ho gayi!' });
  }
}

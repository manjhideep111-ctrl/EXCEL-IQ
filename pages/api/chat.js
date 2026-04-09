export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        }),
      }
    );

    const data = await response.json();
    console.log('Gemini:', JSON.stringify(data));

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ text: 'Error: ' + JSON.stringify(data) });
    }
  } catch (error) {
    res.status(500).json({ text: 'Server error: ' + error.message });
  }
}

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('excel-iq-chat');
    if (saved) setChat(JSON.parse(saved));
    const savedTheme = localStorage.getItem('excel-iq-dark');
    if (savedTheme) setDarkMode(JSON.parse(savedTheme));
  }, []);

  useEffect(() => {
    localStorage.setItem('excel-iq-chat', JSON.stringify(chat));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  useEffect(() => {
    localStorage.setItem('excel-iq-dark', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    const newChat = [...chat, { role: 'user', text: userMsg }];
    setChat(newChat);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, history: newChat }),
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: 'bot', text: data.text }]);
    } catch {
      setChat(prev => [...prev, { role: 'bot', text: 'Error: Kuch gadbad ho gayi!' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  const clearChat = () => {
    setChat([]);
    localStorage.removeItem('excel-iq-chat');
  };

  const suggestions = [
    'Excel mein VLOOKUP kaise use karein?',
    'Trading mein Stop Loss kya hota hai?',
    'Pivot Table banana sikhao',
    'Moving Average kya hai?',
  ];

  const bg = darkMode ? '#1a1a2e' : '#f0f2f5';
  const cardBg = darkMode ? '#16213e' : '#ffffff';
  const textColor = darkMode ? '#e0e0e0' : '#333333';
  const inputBg = darkMode ? '#0f3460' : '#ffffff';
  const borderColor = darkMode ? '#444' : '#ddd';

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial', padding: '20px', transition: 'all 0.3s' }}>
      <div style={{ width: '100%', maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, color: textColor, fontSize: '22px' }}>Excel IQ AI</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: cardBg, color: textColor, cursor: 'pointer' }}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={clearChat} style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: cardBg, color: 'red', cursor: 'pointer' }}>
              Clear
            </button>
          </div>
        </div>

        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: '12px', height: '420px', overflowY: 'auto', padding: '16px', marginBottom: '12px' }}>
          {chat.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <p style={{ color: textColor, opacity: 0.6, marginBottom: '16px' }}>Koi bhi sawaal poochho!</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => setInput(s)} style={{ padding: '8px 12px', borderRadius: '20px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, cursor: 'pointer', fontSize: '13px' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chat.map((msg, i) => (
            <div key={i} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: '16px', background: msg.role === 'user' ? '#007bff' : (darkMode ? '#0f3460' : '#f0f0f0'), color: msg.role === 'user' ? 'white' : textColor, fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
              {msg.role === 'bot' && (
                <button onClick={() => copyText(msg.text)} style={{ marginTop: '4px', fontSize: '11px', background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer' }}>
                  Copy
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ color: textColor, opacity: 0.6, fontSize: '14px' }}>
              AI soch raha hai...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Sawaal likho... (Enter dabao bhejna ke liye)"
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: inputBg, color: textColor, fontSize: '14px', outline: 'none' }}
          />
          <button onClick={handleSend} disabled={loading} style={{ padding: '12px 20px', borderRadius: '10px', background: loading ? '#aaa' : '#007bff', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

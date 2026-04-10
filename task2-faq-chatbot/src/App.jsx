import { useState, useRef, useEffect } from "react";

// ─── FAQ DATA ────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "What is your return policy?", a: "You can return any item within 30 days of purchase for a full refund, provided it's in its original condition. Simply contact our support team to initiate the process." },
  { q: "How long does shipping take?", a: "Standard shipping takes 5–7 business days. Express shipping (2–3 days) is available at checkout for an additional fee." },
  { q: "Do you ship internationally?", a: "Yes! We ship to over 50 countries. International orders typically arrive within 10–15 business days depending on customs processing." },
  { q: "How can I track my order?", a: "Once your order ships, you'll receive an email with a tracking number. You can use it on our website or the carrier's site to track your package in real time." },
  { q: "Can I change or cancel my order?", a: "Orders can be modified or cancelled within 1 hour of placement. After that, they enter processing and cannot be changed. Please contact us immediately if needed." },
  { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All transactions are secured with SSL encryption." },
  { q: "Is my personal information safe?", a: "Absolutely. We never sell your data to third parties. All personal information is stored securely and used solely to process your orders and improve your experience." },
  { q: "How do I contact customer support?", a: "You can reach our support team via email at support@example.com, or live chat on our website Monday–Friday 9am–6pm." },
  { q: "Do you offer gift cards?", a: "Yes! Gift cards are available in denominations of $25, $50, $100, and $200. They never expire and can be used on any purchase." },
  { q: "What if my item arrives damaged?", a: "We're sorry to hear that! Please take photos of the damage and email them to support@example.com within 48 hours. We'll send a replacement or issue a full refund right away." },
];

// ─── SIMPLE TF-IDF COSINE SIMILARITY ─────────────────────────────────────────
function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
}
function termFreq(tokens) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  return tf;
}
function cosineSim(a, b) {
  const allTerms = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, magA = 0, magB = 0;
  allTerms.forEach(t => {
    const va = a[t] || 0, vb = b[t] || 0;
    dot += va * vb; magA += va * va; magB += vb * vb;
  });
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
function findBestFAQ(query) {
  const qTf = termFreq(tokenize(query));
  let best = null, bestScore = 0;
  FAQS.forEach(faq => {
    const fTf = termFreq(tokenize(faq.q));
    const score = cosineSim(qTf, fTf);
    if (score > bestScore) { bestScore = score; best = faq; }
  });
  return { faq: best, score: bestScore };
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h3a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h3V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2zm-3 9a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3zm-6 5h6v1H9v-1z" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

const SUGGESTIONS = [
  "What's your return policy?",
  "How long is shipping?",
  "Do you ship internationally?",
  "How do I track my order?",
  "What payment methods do you accept?",
];

export default function FAQChatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! 👋 I'm your FAQ assistant. Ask me anything about orders, shipping, returns, or payments.", ts: Date.now() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg = { role: "user", text: userText, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Try local cosine similarity first
    const { faq, score } = findBestFAQ(userText);
    const THRESHOLD = 0.15;

    if (faq && score >= THRESHOLD) {
      // Good local match
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "bot",
          text: faq.a,
          matched: faq.q,
          ts: Date.now()
        }]);
        setLoading(false);
      }, 400);
    } else {
      // Fallback to Claude for open-ended questions
      try {
        const faqContext = FAQS.map((f, i) => `Q${i + 1}: ${f.q}\nA${i + 1}: ${f.a}`).join("\n\n");
        const res = await fetch("/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `You are a helpful FAQ chatbot. Here are the FAQs you know:\n\n${faqContext}\n\nUser question: "${userText}"\n\nAnswer helpfully based on the FAQs above. If the question is unrelated to the FAQs, politely say you can only help with the topics listed. Keep your answer concise and friendly.`
            }]
          })
        });
        const data = await res.json();
        const reply = data.content?.[0]?.text || "I'm not sure about that. Please contact our support team!";
        setMessages(prev => [...prev, { role: "bot", text: reply.trim(), ts: Date.now() }]);
      } catch {
        setMessages(prev => [...prev, { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again!", ts: Date.now() }]);
      }
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Nunito:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
        body { background: #f7f3ee; }
        .shell {
          min-height: 100vh;
          background: linear-gradient(160deg, #fdf8f3 0%, #ede8e0 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
          font-family: 'Nunito', sans-serif;
        }
        .window {
          width: 100%; max-width: 520px;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 32px 80px rgba(60,40,10,0.13), 0 2px 8px rgba(60,40,10,0.06);
          overflow: hidden;
          display: flex; flex-direction: column;
          height: 680px;
          border: 1px solid #e8e0d4;
        }
        .header {
          background: linear-gradient(135deg, #2d2013, #4a3520);
          padding: 18px 22px;
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0;
        }
        .bot-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #e8c97e, #c9a84c);
          display: flex; align-items: center; justify-content: center;
          color: #2d2013;
          flex-shrink: 0;
          animation: pulse 3s ease-in-out infinite;
        }
        .header-info h2 {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem; font-weight: 800;
          color: #f0ebe0; letter-spacing: 0.3px;
        }
        .header-info p { font-size: 0.75rem; color: #a09070; font-weight: 400; }
        .online-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #7ecf8a; margin-right: 4px;
          display: inline-block;
          box-shadow: 0 0 6px #7ecf8a;
        }
        .msgs {
          flex: 1; overflow-y: auto; padding: 20px 18px;
          display: flex; flex-direction: column; gap: 14px;
          scroll-behavior: smooth;
        }
        .msgs::-webkit-scrollbar { width: 4px; }
        .msgs::-webkit-scrollbar-track { background: transparent; }
        .msgs::-webkit-scrollbar-thumb { background: #e0d8cc; border-radius: 2px; }
        .msg { animation: fadeUp 0.28s ease; max-width: 82%; }
        .msg.user { align-self: flex-end; }
        .msg.bot { align-self: flex-start; }
        .bubble {
          padding: 11px 15px; border-radius: 18px;
          font-size: 0.9rem; line-height: 1.55;
          font-weight: 400;
        }
        .user .bubble {
          background: linear-gradient(135deg, #4a3520, #2d2013);
          color: #f0ebe0;
          border-bottom-right-radius: 4px;
        }
        .bot .bubble {
          background: #f5f0ea;
          color: #2d2013;
          border-bottom-left-radius: 4px;
          border: 1px solid #e8e0d4;
        }
        .matched-label {
          font-size: 0.7rem; color: #b09060;
          margin-top: 5px; margin-left: 2px;
          font-style: italic;
        }
        .ts { font-size: 0.68rem; color: #c0b8a8; margin-top: 4px; text-align: right; }
        .bot .ts { text-align: left; }
        .typing {
          align-self: flex-start;
          background: #f5f0ea;
          border: 1px solid #e8e0d4;
          border-radius: 18px; border-bottom-left-radius: 4px;
          padding: 13px 18px;
          display: flex; gap: 5px; align-items: center;
        }
        .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #b09060;
          animation: blink 1.2s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        .suggestions {
          padding: 0 18px 10px;
          display: flex; flex-wrap: wrap; gap: 7px;
          flex-shrink: 0;
        }
        .sug {
          background: #f5f0ea;
          border: 1px solid #e0d8cc;
          border-radius: 20px;
          padding: 5px 13px;
          font-size: 0.78rem; color: #7a6040;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-weight: 500;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .sug:hover { background: #4a3520; color: #f0ebe0; border-color: #4a3520; }
        .input-bar {
          display: flex; align-items: flex-end; gap: 10px;
          padding: 12px 16px 16px;
          border-top: 1px solid #ede8e0;
          flex-shrink: 0;
        }
        textarea {
          flex: 1;
          background: #f9f5f0;
          border: 1.5px solid #e0d8cc;
          border-radius: 14px;
          padding: 10px 14px;
          font-family: 'Nunito', sans-serif;
          font-size: 0.9rem;
          color: #2d2013;
          resize: none; outline: none;
          min-height: 42px; max-height: 120px;
          transition: border-color 0.2s;
          line-height: 1.45;
        }
        textarea:focus { border-color: #c9a84c; background: #fff; }
        textarea::placeholder { color: #c0b8a8; }
        .send-btn {
          width: 42px; height: 42px; border-radius: 13px;
          background: linear-gradient(135deg, #c9a84c, #e8c97e);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #2d2013;
          transition: opacity 0.15s, transform 0.1s;
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .faq-count {
          text-align: center;
          font-size: 0.72rem; color: #b0a898;
          padding: 6px 0 0;
          flex-shrink: 0;
        }
      `}</style>

      <div className="shell">
        <div className="window">
          <div className="header">
            <div className="bot-avatar"><BotIcon /></div>
            <div className="header-info">
              <h2>FAQ Assistant</h2>
              <p><span className="online-dot" />Online · Powered by AI</p>
            </div>
          </div>

          <div className="faq-count">{FAQS.length} topics available</div>

          <div className="msgs">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="bubble">{m.text}</div>
                {m.matched && <div className="matched-label">Matched: "{m.matched}"</div>}
                <div className="ts">{formatTime(m.ts)}</div>
              </div>
            ))}
            {loading && (
              <div className="typing">
                <div className="dot" /><div className="dot" /><div className="dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div className="suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="sug" onClick={() => sendMessage(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="input-bar">
            <textarea
              ref={inputRef}
              placeholder="Ask a question…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

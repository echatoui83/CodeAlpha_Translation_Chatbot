import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "auto", label: "Detect automatically" },
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
  { code: "ja", label: "Japanese" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "ko", label: "Korean" },
  { code: "tr", label: "Turkish" },
  { code: "pl", label: "Polish" },
  { code: "sv", label: "Swedish" },
];

const SRC_LANGUAGES = LANGUAGES;
const TGT_LANGUAGES = LANGUAGES.filter((l) => l.code !== "auto");

const CHAR_LIMIT = 1000;

function Spinner() {
  return (
    <svg
      className="spinner"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 22, height: 22, animation: "spin 0.9s linear infinite" }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon({ done }) {
  return done ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function SpeakIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
      <path d="M7 16V4m0 0L3 8m4-4l4 4" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

export default function TranslationTool() {
  const [srcLang, setSrcLang] = useState("auto");
  const [tgtLang, setTgtLang] = useState("fr");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const debounceRef = useRef(null);

  const translate = async (text, src, tgt) => {
    if (!text.trim()) { setOutputText(""); setDetectedLang(""); return; }
    setLoading(true);
    setError("");
    try {
      const prompt =
        src === "auto"
          ? `Detect the language of the following text, then translate it to ${tgt}.\nRespond in this exact format:\nDETECTED: [language name]\nTRANSLATION: [translated text]\n\nText to translate:\n${text}`
          : `Translate the following text from ${src} to ${tgt}. Respond with only the translation, nothing else.\n\nText:\n${text}`;

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
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      if (src === "auto") {
        const detectedMatch = raw.match(/DETECTED:\s*(.+)/i);
        const translationMatch = raw.match(/TRANSLATION:\s*([\s\S]+)/i);
        setDetectedLang(detectedMatch ? detectedMatch[1].trim() : "");
        setOutputText(translationMatch ? translationMatch[1].trim() : raw.trim());
      } else {
        setOutputText(raw.trim());
        setDetectedLang("");
      }
    } catch {
      setError("Translation failed. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (inputText.trim()) translate(inputText, srcLang, tgtLang);
      else { setOutputText(""); setDetectedLang(""); }
    }, 700);
    return () => clearTimeout(debounceRef.current);
  }, [inputText, srcLang, tgtLang]);

  const handleSwap = () => {
    if (srcLang === "auto") return;
    setSrcLang(tgtLang);
    setTgtLang(srcLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSpeak = () => {
    if (!outputText || speaking) return;
    const utt = new SpeechSynthesisUtterance(outputText);
    const langMap = { fr: "fr-FR", en: "en-US", ar: "ar-SA", es: "es-ES", de: "de-DE", zh: "zh-CN", ja: "ja-JP", pt: "pt-PT", ru: "ru-RU", it: "it-IT", nl: "nl-NL", ko: "ko-KR", tr: "tr-TR", pl: "pl-PL", sv: "sv-SE" };
    utt.lang = langMap[tgtLang] || "en-US";
    setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    speechSynthesis.speak(utt);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100%{opacity:0.6} 50%{opacity:1} }
        body { background: #0c0e14; }
        .wrap {
          min-height: 100vh;
          background: #0c0e14;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center;
          padding: 32px 16px;
          font-family: 'DM Sans', sans-serif;
        }
        .header { text-align: center; margin-bottom: 36px; }
        .header h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          color: #f0ebe0;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .header p { color: #7a7f8e; font-size: 0.95rem; font-weight: 300; }
        .card {
          width: 100%; max-width: 860px;
          background: #14161e;
          border: 1px solid #22263a;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.5);
          animation: fadeIn 0.5s ease;
        }
        .lang-bar {
          display: flex; align-items: center; gap: 0;
          background: #0f111a;
          border-bottom: 1px solid #22263a;
          padding: 0 4px;
        }
        .lang-select {
          flex: 1;
          appearance: none;
          background: transparent;
          border: none;
          color: #c9cdd8;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 16px 20px;
          cursor: pointer;
          outline: none;
        }
        .lang-select option { background: #1a1d28; color: #c9cdd8; }
        .swap-btn {
          background: #1e2130;
          border: 1px solid #2a2f45;
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #7a7f8e;
          transition: all 0.2s;
          flex-shrink: 0;
          margin: 0 6px;
        }
        .swap-btn:hover:not(:disabled) { color: #e8c97e; border-color: #e8c97e; background: #2a2535; }
        .swap-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .panels { display: grid; grid-template-columns: 1fr 1fr; }
        @media(max-width: 600px) { .panels { grid-template-columns: 1fr; } }
        .panel { position: relative; padding: 0; }
        .panel + .panel { border-left: 1px solid #22263a; }
        @media(max-width: 600px) { .panel + .panel { border-left: none; border-top: 1px solid #22263a; } }
        textarea {
          width: 100%; height: 200px;
          background: transparent;
          border: none; outline: none; resize: none;
          color: #e8eaf0;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem; font-weight: 300;
          line-height: 1.6;
          padding: 20px 22px;
        }
        textarea::placeholder { color: #3a3f52; }
        .output-box {
          width: 100%; min-height: 200px;
          padding: 20px 22px;
          color: #e8eaf0;
          font-size: 1rem; font-weight: 300;
          line-height: 1.6;
          position: relative;
        }
        .output-placeholder { color: #3a3f52; }
        .detected-badge {
          display: inline-block;
          background: #1e2a1e;
          color: #7ecf8a;
          border: 1px solid #2e4a2e;
          border-radius: 20px;
          font-size: 0.75rem;
          padding: 2px 10px;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .panel-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 14px 12px;
          border-top: 1px solid #1a1e2e;
        }
        .char-count { font-size: 0.75rem; color: #4a4f62; }
        .char-warn { color: #c97e7e; }
        .action-btn {
          background: none; border: none;
          color: #5a5f72;
          cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          padding: 5px 10px;
          border-radius: 8px;
          transition: all 0.15s;
        }
        .action-btn:hover { background: #1e2130; color: #e8c97e; }
        .action-btn.active { color: #7ecf8a; }
        .action-btns { display: flex; gap: 4px; }
        .loading-layer {
          position: absolute; inset: 0;
          background: rgba(12,14,20,0.6);
          display: flex; align-items: center; justify-content: center;
          border-radius: 0;
          color: #e8c97e;
        }
        .shimmer {
          width: 60%; height: 14px; background: #1e2130;
          border-radius: 8px; animation: shimmer 1.2s infinite;
          margin-bottom: 10px;
        }
        .shimmer2 { width: 40%; }
        .error-bar {
          background: #2a1a1a; color: #e87e7e;
          border-top: 1px solid #3a2020;
          padding: 10px 20px; font-size: 0.85rem;
          text-align: center;
        }
        .translate-btn {
          display: block; width: calc(100% - 40px);
          margin: 0 20px 18px;
          background: linear-gradient(135deg, #c9a84c, #e8c97e);
          color: #0c0e14;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 0.95rem;
          border: none; border-radius: 12px;
          padding: 13px;
          cursor: pointer;
          transition: opacity 0.2s;
          letter-spacing: 0.3px;
        }
        .translate-btn:hover { opacity: 0.88; }
        .divider { width: 1px; background: #22263a; align-self: stretch; }
      `}</style>

      <div className="wrap">
        <div className="header">
          <h1>Lingua</h1>
          <p>AI-powered translation across 15+ languages</p>
        </div>

        <div className="card">
          <div className="lang-bar">
            <select className="lang-select" value={srcLang} onChange={e => setSrcLang(e.target.value)}>
              {SRC_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <button className="swap-btn" onClick={handleSwap} disabled={srcLang === "auto"} title="Swap languages">
              <SwapIcon />
            </button>
            <select className="lang-select" value={tgtLang} onChange={e => setTgtLang(e.target.value)}>
              {TGT_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          <div className="panels">
            <div className="panel">
              <textarea
                placeholder="Enter text to translate…"
                value={inputText}
                maxLength={CHAR_LIMIT}
                onChange={e => setInputText(e.target.value)}
              />
              <div className="panel-footer">
                <span className={`char-count ${inputText.length > CHAR_LIMIT * 0.9 ? "char-warn" : ""}`}>
                  {inputText.length}/{CHAR_LIMIT}
                </span>
                {inputText && (
                  <button className="action-btn" onClick={() => { setInputText(""); setOutputText(""); setDetectedLang(""); }}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="panel">
              <div className="output-box">
                {loading ? (
                  <>
                    <div className="shimmer" />
                    <div className="shimmer shimmer2" />
                  </>
                ) : outputText ? (
                  <>
                    {detectedLang && <div><span className="detected-badge">🌐 {detectedLang}</span></div>}
                    <span>{outputText}</span>
                  </>
                ) : (
                  <span className="output-placeholder">Translation will appear here…</span>
                )}
              </div>
              <div className="panel-footer">
                <span />
                <div className="action-btns">
                  <button className="action-btn" onClick={handleCopy} disabled={!outputText}>
                    <CopyIcon done={copied} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button className={`action-btn ${speaking ? "active" : ""}`} onClick={handleSpeak} disabled={!outputText || speaking}>
                    <SpeakIcon />
                    {speaking ? "Speaking…" : "Listen"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-bar">{error}</div>}
        </div>
      </div>
    </>
  );
}

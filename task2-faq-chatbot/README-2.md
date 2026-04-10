# 🤖 FAQ Chatbot — AI-Powered Q&A Assistant

> Task 2 — Chatbot for FAQs  
> Built with React + Vite + NLP (TF-IDF Cosine Similarity) + Claude API fallback

## ✨ Features

- **Local NLP matching** — TF-IDF cosine similarity to find the best FAQ answer instantly (no API call needed for known questions)
- **Claude AI fallback** — for ambiguous or out-of-scope questions, Claude answers intelligently using the FAQ context
- Typing indicator animation
- Quick-reply suggestion buttons
- Shows which FAQ was matched (for transparency)
- Smooth animated chat bubbles

## 🧠 How It Works

```
User question
     │
     ▼
TF-IDF Cosine Similarity against FAQ database
     │
     ├── score ≥ 0.15 → Return best matching FAQ answer instantly
     │
     └── score < 0.15 → Claude API fallback with FAQ context injected
```

This approach mimics real production chatbots: fast local matching first, AI for edge cases.

## 🛠 Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 18 |
| Bundler | Vite 5 |
| NLP | Custom TF-IDF + Cosine Similarity (vanilla JS) |
| AI Fallback | Claude API (Anthropic) |
| Styling | CSS-in-JS (inline styles) |
| Fonts | Google Fonts — Syne + Nunito |

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/task2-faq-chatbot.git
cd task2-faq-chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

```bash
cp .env.example .env
```

Then open `.env` and paste your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

> Get your key at [console.anthropic.com](https://console.anthropic.com/)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
task2-faq-chatbot/
├── src/
│   ├── App.jsx        # Chatbot UI + NLP logic + Claude fallback
│   └── main.jsx       # React entry point
├── index.html
├── vite.config.js     # Vite config with API proxy
├── .env.example       # Environment variable template
├── .gitignore
└── package.json
```

## 📝 Customizing the FAQs

In `src/App.jsx`, find the `FAQS` array at the top of the file and edit it:

```js
const FAQS = [
  { q: "Your question here?", a: "Your answer here." },
  // add as many as you want
]
```

No other changes needed — the NLP and AI fallback adapt automatically.

## 🔐 Security Note

The `.env` file is listed in `.gitignore` and will **never** be pushed to GitHub.  
Never hardcode your API key directly in source code.

---

Made with ❤️ — Task 2 of NLP Project

# 🧠 NLP Projects

Two AI-powered web applications built as part of an NLP course, using **React**, **Vite**, and the **Claude API** (Anthropic).

---

## 📁 Projects

| # | Project | Description |
|---|---------|-------------|
| 1 | [Lingua — Translation Tool](./task1-translation-tool/) | Translate text between 15+ languages with auto-detection |
| 2 | [FAQ Chatbot](./task2-faq-chatbot/) | Smart chatbot using TF-IDF cosine similarity + AI fallback |

---

## 🚀 Task 1 — Lingua (Language Translation Tool)

### Features
- 🌍 15+ languages supported
- 🔍 Automatic source language detection
- ⚡ Real-time translation (debounced)
- 📋 Copy to clipboard
- 🔊 Text-to-speech (listen to translation)
- 🔄 Swap source ↔ target language

### Run locally
```bash
cd task1-translation-tool
npm install
cp .env.example .env       # add your API key
npm run dev
```

---

## 🤖 Task 2 — FAQ Chatbot

### Features
- 🧮 TF-IDF cosine similarity for instant FAQ matching (no API call)
- 🤖 Claude AI fallback for out-of-scope questions
- 💬 Animated chat UI with typing indicator
- 💡 Quick-reply suggestion buttons
- 🏷️ Shows which FAQ was matched

### How it works
```
User question
     │
     ▼
TF-IDF Cosine Similarity  ──── score ≥ 0.15 ──→  Return FAQ answer instantly
     │
     └── score < 0.15 ──→  Claude API (with FAQ context injected)
```

### Run locally
```bash
cd task2-faq-chatbot
npm install
cp .env.example .env       # add your API key
npm run dev
```

---

## 🔑 API Key Setup

Both projects require an **Anthropic API key**.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account → **API Keys** → **Create Key**
3. In each project folder, create a `.env` file:

```bash
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

> ⚠️ Never commit your `.env` file — it is excluded by `.gitignore`.

---

## 🛠 Tech Stack

| Tool | Usage |
|------|-------|
| React 18 | UI framework |
| Vite 5 | Dev server & bundler |
| Claude API | AI translation & chatbot fallback |
| TF-IDF (vanilla JS) | FAQ matching algorithm |
| Google Fonts | Playfair Display, DM Sans, Syne, Nunito |

---

## 📂 Repository Structure

```
nlp-projects/
├── task1-translation-tool/
│   ├── src/
│   │   ├── App.jsx          # Translation UI + Claude API calls
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
└── task2-faq-chatbot/
    ├── src/
    │   ├── App.jsx          # Chatbot UI + TF-IDF + Claude fallback
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## 👤 Author

**echatoui83** — [github.com/echatoui83](https://github.com/echatoui83)

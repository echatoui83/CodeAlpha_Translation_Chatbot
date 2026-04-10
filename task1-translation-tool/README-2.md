# 🌐 Lingua — AI Language Translation Tool

> Task 1 — Language Translation Tool  
> Built with React + Vite + Claude API (Anthropic)

## ✨ Features

- Translate text between 15+ languages
- Auto-detect source language
- Real-time translation (debounced)
- Copy to clipboard button
- Text-to-speech (listen to the translation)
- Swap source ↔ target languages instantly

## 🛠 Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 18 |
| Bundler | Vite 5 |
| AI / Translation | Claude API (Anthropic) |
| Styling | CSS-in-JS (inline styles) |
| Fonts | Google Fonts — Playfair Display + DM Sans |

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/task1-translation-tool.git
cd task1-translation-tool
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
task1-translation-tool/
├── src/
│   ├── App.jsx        # Main translation UI component
│   └── main.jsx       # React entry point
├── index.html
├── vite.config.js     # Vite config with API proxy
├── .env.example       # Environment variable template
├── .gitignore
└── package.json
```

## 🔐 Security Note

The `.env` file is listed in `.gitignore` and will **never** be pushed to GitHub.  
Never hardcode your API key directly in source code.

## 📸 Preview

> Dark-themed translation interface with two panels, language selectors, swap button, copy & listen actions.

---

Made with ❤️ — Task 1 of NLP Project

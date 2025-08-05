# EdgeSuggestAI

A minimal Edge browser extension to auto-suggest search queries as you type on Google, Bing, and DuckDuckGo, using real-time suggestions from the internet.

## Features

- Detects search input on major engines
- Fetches suggestions from the Google Suggest API as you type
- Keyboard/mouse navigation support
- Clean, styled dropdown UI
- No user tracking

## Installation

1. Download or clone this folder.
2. Go to Edge: `edge://extensions/`
3. Enable "Developer mode".
4. Click "Load unpacked", select this folder.
5. Visit Google, Bing, or DuckDuckGo and start typing in the search box!

## Files

- `manifest.json`: Extension manifest (v3)
- `content.js`: Core logic/UI, fetches and shows suggestions
- `styles.css`: Dropdown styling
- `icons/`: SVG icons

---

*This MVP fetches real-time suggestions from Google. For Bing or DuckDuckGo, you can adjust the fetch API endpoint in content.js.*
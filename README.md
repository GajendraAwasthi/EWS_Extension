# EdgeSuggestAI

A robust, cross-browser extension for Edge, Chrome, and Firefox that auto-suggests internet search queries as you type in the search bar of Google, Bing, and DuckDuckGo.

## Features

- Works reliably across Edge, Chrome, Firefox
- Supports Google, Bing, DuckDuckGo
- Fetches suggestions from Google Suggest API in real time
- Keyboard and mouse navigation (Up/Down/Enter/Click)
- Overlay dropdown styled to avoid native overlaps
- Handles dynamic navigation (SPA/soft reload) on supported sites
- No user tracking

## Installation

1. Download or clone this folder.
2. Go to your browser's extension manager:
   - Edge/Chrome: `edge://extensions/` or `chrome://extensions/`
   - Firefox: `about:debugging#/runtime/this-firefox`
3. Enable "Developer mode".
4. Click "Load unpacked" (Edge/Chrome) or "Load Temporary Add-on" (Firefox), and select this folder.
5. Visit Google, Bing, or DuckDuckGo and start typing in the search box!

---

*If the dropdown does not appear, please refresh the page after loading the extension, and try again. This extension is designed to work even with soft navigation (SPAs) on supported search engines.*

---

![image1](image1)
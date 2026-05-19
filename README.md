# chromext

A monorepo of free, open-source Chrome extensions for solo builders.

## Why

I'm a solo builder. I ship products alone. Every extension I install is a trust decision — it can read my tabs, my clipboard, my network. The Chrome Web Store is full of closed-source extensions with "Read and change all data on all websites" permissions and no way to verify what they actually do.

So I build my own. Every extension in this repo:

- **Requests only what it needs** — no broad permissions, no "all websites"
- **Makes zero external network calls** — no analytics, no tracking, no telemetry
- **Is inspectable in minutes** — small codebases, plain JavaScript, no bundlers
- **Ships on day one** — built to pass Chrome Web Store review immediately

If you're a solo builder too, you can use these as-is, fork them, or read the source to see exactly how they work before you trust them.

## Extensions

| Extension | Description | Permissions |
|---|---|---|
| [seo-shot](./seo-shot) | Instant on-page SEO snapshot. 12 checks, score out of 100. Pure DOM — no API. | `activeTab`, `scripting` |
| [pasteguard](./pasteguard) | Stop pasting API keys and secrets into AI chats. Warns, masks, or blocks. 15 patterns across 20 AI sites. | `storage`, `scripting`, `activeTab` |
| [google-translate-dark](./google-translate-dark) | Calm, very-dark theme for Google Translate. Toggle button + 8-color accent picker. | `storage`, `scripting` |

## Structure

```
chromext/
├── README.md
├── LICENSE
├── .gitignore
├── seo-shot/                 # Each extension is self-contained
│   ├── README.md
│   ├── manifest.json
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js           # 12 checks, scoring engine
│   │   └── popup.css
│   └── icons/
├── pasteguard/               # Each extension is self-contained
│   ├── README.md
│   ├── manifest.json
│   ├── patterns.js           # 15 regex detection rules
│   ├── content.js            # Paste interceptor + overlay
│   ├── content.css           # Warning dialog styling
│   ├── background.js         # Service worker, badge counter
│   ├── popup/                # Settings UI
│   └── icons/
└── google-translate-dark/
    ├── README.md
    ├── manifest.json
    ├── darkmode.css          # 406 exact Google DOM selectors
    ├── content.js            # Toggle button + accent injection
    ├── content.css           # Button animations
    ├── background.js         # Dynamic CSS injection
    ├── popup/                # Accent color picker
    └── icons/
```

## Philosophy

- **Minimal permissions** — every extension requests only what it needs
- **No data collection** — zero tracking, zero analytics, zero network calls
- **Manifest V3** — current Chrome extension standard
- **MIT licensed** — use, modify, ship freely
- **Self-documenting** — each extension has its own README

## Publishing

All extensions are Chrome Web Store ready. See [STORE.md](./STORE.md) for pre-written descriptions and screenshot guides. See [PRIVACY.md](./PRIVACY.md) for the shared privacy policy (link this in the CWS dashboard).

## Setup

Each extension is independent. Load any as an unpacked extension:

1. Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the extension directory (e.g. `pasteguard/`)

Or [publish to the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish) — each extension meets all review requirements: minimal permissions, no obfuscation, no remote code, clear functionality.

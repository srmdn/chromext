# chromext

A monorepo of free, open-source Chrome extensions for solo builders.

## Extensions

| Extension | Description | Permissions |
|---|---|---|
| [seo-shot](./seo-shot) | Instant on-page SEO snapshot. 12 checks, score out of 100. Pure DOM — no API. | `activeTab`, `scripting` |
| [pasteguard](./pasteguard) | Stop pasting API keys and secrets into AI chats. Warns, masks, or blocks. 15 detection patterns across 14 AI sites. | `storage`, `scripting`, `activeTab` |
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

## Setup

Each extension is independent. Load any as an unpacked extension:

1. Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the extension directory (e.g. `pasteguard/`)

Or [publish to the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish) — each extension meets all review requirements: minimal permissions, no obfuscation, no remote code, clear functionality.

# chromext

A monorepo of free, open-source Chrome extensions for solo builders.

## Extensions

| Extension | Description | Status |
|---|---|---|---|
| [pasteguard](./pasteguard) | Prevent pasting API keys and secrets into AI chats | ✅ v1.0.0 |
| [google-translate-dark](./google-translate-dark) | Calm, very-dark theme for Google Translate with accent color picker | ✅ v1.0.0 |

## Philosophy

- **Minimal permissions** — every extension requests only what it needs
- **No data collection** — zero tracking, zero analytics, zero network calls
- **Manifest V3** — current Chrome extension standard
- **MIT licensed** — use, modify, ship freely

## Setup

Each extension is self-contained. Load any of them as an unpacked extension:

1. Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the extension directory

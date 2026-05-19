# Chrome Web Store Listings

Copy-paste into the CWS dashboard for each extension.

---

## PasteGuard

**Short description** (132 chars max):
```
Stop pasting API keys and secrets into ChatGPT, Claude, and other AI chats. Warns, masks, or blocks before you leak credentials.
```

**Detailed description**:
```
PasteGuard scans your clipboard when you paste into AI chat interfaces. If secrets are detected — API keys, tokens, database URLs, private keys — it warns you and offers to mask them before the paste goes through.

☰ What it detects
• OpenAI, Anthropic, GitHub, Stripe, AWS, Google API keys
• JWT tokens and bearer tokens
• Slack, Twilio tokens
• Database connection strings
• Private key blocks
• .env file assignments with sensitive keys

☰ Protected sites
ChatGPT, Claude, Gemini, Copilot, DeepSeek, Perplexity, Poe, You.com, Mistral, HuggingFace Chat, Groq, Grok, Cursor, v0, Bolt — 20 AI chat and coding assistants.

☰ Two modes
• Warn & ask — shows a dialog letting you mask secrets before pasting
• Block completely — stops the paste and shows what was detected

☰ Privacy
Zero external network calls. Zero data collection. Your clipboard content never leaves your browser. All detection runs locally. No analytics, no tracking, no telemetry.

☰ Open source
Full source at github.com/srmdn/chromext — inspect every line before you trust it.
```

**Category**: Productivity
**Language**: English

---

## SEO Shot

**Short description** (132 chars max):
```
Instant on-page SEO snapshot. 12 checks, score out of 100. No signup, no API key — just click and scan.
```

**Detailed description**:
```
SEO Shot gives you an instant SEO health check for any page. Click the icon and get a score out of 100 with actionable fixes.

☰ 12 checks
• Title tag — presence and optimal length (50–60 chars)
• Meta description — presence and length (120–160 chars)
• H1 heading — should be exactly one
• Heading hierarchy — no skipped levels (H1→H2→H3)
• Image alt text — percentage of images with alt attributes
• Open Graph tags — og:title, description, image, url
• Twitter Card — card, title, description, image
• Canonical URL — presence and self-reference
• Robots meta — index/noindex, follow/nofollow
• Structured data — JSON-LD presence and types
• Mobile viewport — width=device-width
• Language — html lang attribute

☰ How it works
Pure DOM scanning. No external APIs, no page reloads, no account needed. Click, scan, fix. Everything runs locally in your browser.

☰ Privacy
No data collection. No analytics. No network calls. Your page content never leaves your browser.

☰ Open source
Full source at github.com/srmdn/chromext.
```

**Category**: Developer Tools
**Language**: English

---

## Dark Theme for Google Translate

**Short description** (132 chars max):
```
Calm, very-dark theme for Google Translate. Toggle with one click. Custom accent colors. Easy on the eyes.
```

**Detailed description**:
```
A clean, very-dark theme for Google Translate that's easy on the eyes during long translation sessions.

☰ Features
• One-click toggle — moon/sun button right in the page header
• 8 accent colors — blue, teal, purple, amber, rose, cyan, orange, pink
• Full coverage — every Google Translate UI element is themed
• No flash — CSS injected before the page renders

☰ Privacy
No data collection. No analytics. No network calls. Preferences stored locally in your browser.

☰ Open source
Full source at github.com/srmdn/chromext.
```

**Category**: Accessibility
**Language**: English

---

## Screenshots

Screenshots must be **1280×800 pixels** (or 1280×720 minimum). Submit at least one per extension.

### PasteGuard
1. **Main dialog**: Paste the test secrets into ChatGPT, capture the warning dialog showing detected secrets
2. **Popup**: Click the extension icon, capture the popup with toggle and stats
3. **Blocked state**: Switch to Block mode, paste again, capture the blocked dialog

### SEO Shot
1. **Good score**: Scan a well-optimized page (e.g. github.com), capture the results
2. **Warning score**: Scan a page with missing meta/OG tags, capture the warnings
3. **Popup**: Capture the popup with checks expanded

### Google Translate Dark
1. **Dark mode on**: Open translate.google.com with dark mode active, capture the full page
2. **Popup**: Click the extension icon, capture the accent color picker
3. **Toggle button**: Show the moon/sun button in the page header

### How to capture
1. Open Chrome DevTools → Device Toolbar (Ctrl+Shift+M)
2. Set resolution to 1280×800
3. Use Chrome's built-in screenshot: DevTools → ⋮ menu → Capture screenshot

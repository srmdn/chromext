# PasteGuard

Stop pasting API keys and secrets into AI chats.

## What it does

Scans your clipboard when you paste into AI chat interfaces (ChatGPT, Claude, Gemini, etc.). If secrets are detected, it shows a warning and lets you mask them before the paste goes through — or blocks the paste entirely.

## Protected sites

ChatGPT, Claude, Gemini, Copilot, DeepSeek, Perplexity, Poe, You.com

## Detected secrets

OpenAI keys, Anthropic keys, GitHub tokens, Stripe live keys, AWS access keys, Google API keys, JWTs, private key blocks, bearer tokens, Slack tokens, Twilio tokens, database connection strings, `.env` assignments

## Usage

1. Load as unpacked extension in Chrome
2. Open any AI chat site
3. Paste normally — PasteGuard intercepts if secrets are found
4. Choose: **Mask Secrets & Paste** or **Paste Anyway** or **Cancel**

## Modes

- **Warn & ask** — shows dialog, you decide
- **Block completely** — blocks the paste, shows what was caught
- **Off** — disable via popup

## Install

```
Chrome → chrome://extensions → Developer mode → Load unpacked → select this folder
```

## Permissions

- `storage` — save your preferences (warn/block mode)
- `scripting` + `activeTab` — intercept paste events on AI sites
- Host permissions — only on AI chat domains

**Zero external network calls. Zero data collection.**

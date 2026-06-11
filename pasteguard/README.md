# PasteGuard

Stop pasting API keys and secrets into AI chats.

## What it does

Scans pasted text locally when you paste into supported AI chat interfaces in Chrome. If secrets are detected, it shows a warning and lets you mask them before the paste goes through — or blocks the paste entirely.

## Protected sites

ChatGPT, Claude, Gemini, Copilot, DeepSeek, Perplexity, Poe, You.com, Mistral, HuggingFace Chat, Groq, Grok, xAI, Cursor, v0, Bolt

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

## How it works

PasteGuard runs only on the supported AI sites listed below. It inspects pasted text locally in your browser when you paste into a chat-style composer field on those sites. It does not send pasted text anywhere.

## Install

```
Chrome → chrome://extensions → Developer mode → Load unpacked → select this folder
```

## Permissions

- `storage` — save your preferences (warn/block mode)
- Host access on listed AI chat domains — intercept paste events in supported web chat interfaces

**Zero external network calls. Zero data collection.**

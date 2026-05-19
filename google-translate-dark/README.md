# Dark Theme for Google Translate

A calm, very-dark theme for Google Translate. Toggle with the moon/sun button in the page header.

## What it does

Adds a dark theme to translate.google.com with a toggle button injected into the header. Also includes an accent color picker popup — choose from 8 colors.

## Palette

| Element | Color |
|---|---|
| Background | `#202124` |
| Surface | `#242528` |
| Text | `#bdc1c6` |
| Accent | `#62a6f3` (customizable) |

## Usage

1. Load as unpacked extension in Chrome
2. Open `translate.google.com`
3. Click the moon/sun icon in the page header to toggle dark mode
4. Click the extension icon for accent color picker

## Install

```
Chrome → chrome://extensions → Developer mode → Load unpacked → select this folder
```

## Permissions

- `storage` — save accent color and toggle state
- `scripting` — dynamic CSS injection
- Host permissions — translate.google.* domains only

**Zero external network calls. Zero data collection.**

## Credits

CSS selectors adapted from the working extension by klarworks.programmer. Built on top of Google's Material Design 3 tokens.

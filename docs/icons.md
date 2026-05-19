# Icon Guide

Use this page as the source of truth for Chrome extension icon work in this repo.

## Current Convention

- Source art lives in each package at `icons/icon.svg`
- Generated PNGs live beside it:
  - `icons/icon16.png`
  - `icons/icon32.png`
  - `icons/icon48.png`
  - `icons/icon128.png`
- PNG is the required output format for extension and store icons
- Background must stay transparent
- Toolbar uses `16` and `32`
- Extension page and store use `48` and `128`

## Manifest Wiring

Use this pattern in each extension manifest:

```json
{
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png"
    }
  }
}
```

## Workflow

1. Edit the source SVG only.
2. Regenerate PNGs with:

```bash
node scripts/export-icons.mjs
```

3. Reload the extension in `chrome://extensions`.
4. Check the toolbar icon and the extension details page.

## Design Rules

- Keep the icon square and centered.
- Avoid text unless it stays readable at `16x16`.
- Prefer a bold silhouette over thin detail.
- Use transparent padding only if you want store-safe breathing room.
- If the icon reads too small, scale the SVG art, not the PNG canvas.

## Chrome Store Notes

- Chrome requires a `128x128` icon in the manifest.
- Chrome Web Store best practice is `96x96` artwork inside `128x128` with transparent padding.
- This repo currently uses a full-canvas `128x128` treatment because it reads better in the toolbar and store preview.

## Tooling

- Export script: [scripts/export-icons.mjs](../scripts/export-icons.mjs)
- Manifest examples:
  - [seo-shot/manifest.json](../seo-shot/manifest.json)
  - [pasteguard/manifest.json](../pasteguard/manifest.json)
  - [google-translate-dark/manifest.json](../google-translate-dark/manifest.json)

## Before You Commit

- Rebuild PNGs after SVG changes
- Verify `16x16` and `32x32` still read clearly
- Reload the unpacked extension and confirm Chrome picked up the new assets

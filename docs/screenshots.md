# Screenshots

Real screenshots from each extension. These are the same types of assets used for the Chrome Web Store listings.

## CSS Peek

Hover inspection with tooltip, CSS details, and selector copy.

![CSS Peek screenshot](/screenshots/css-peek.jpg)

## PasteGuard

Paste interception warning on a supported AI chat page before secrets leak.

![PasteGuard screenshot](/screenshots/pasteguard.jpg)

## SEO Shot

Popup-based on-page SEO scan with score and checklist.

![SEO Shot screenshot](/screenshots/seo-shot.jpg)

## Midnight Translate

Soft dark theme applied directly to Google Translate.

![Midnight Translate screenshot](/screenshots/midnight-translate.jpg)

---

## Capture Notes

Chrome extensions are not websites. Most screenshots are popups, overlays, or injected page UI, but the Chrome Web Store still expects fixed screenshot sizes.

### CWS requirements

| Field | Required | Format |
|---|---|---|
| Screenshots | Yes (1–5) | PNG or JPEG, 1280×800 or 640×400 |
| Store icon | Yes | PNG, 128×128 |
| Small promo tile | Optional | PNG or JPEG, 440×280 |
| Marquee | Optional | PNG or JPEG, 1400×560 |

### Capture setup

1. Open Chrome.
2. Open DevTools with `Cmd+Opt+I`.
3. Toggle Device Toolbar with `Cmd+Shift+M`.
4. Select `Responsive`.
5. Set dimensions to `1280 × 800`.
6. Set zoom to `100%`.
7. Capture with `Cmd+Shift+P` → `Capture screenshot`.

### Storage convention

Keep raw or draft listing screenshots in each extension's local `store-assets/` directory. Commit only the selected public screenshots that should appear in the docs site or README files.

# SEO Shot

Instant on-page SEO snapshot. Score out of 100 with actionable fixes. No API needed — pure DOM scanning.

## What it checks

| Check | Detail |
|---|---|
| Title tag | Presence, length (50–60 optimal), content |
| Meta description | Presence, length (120–160 optimal) |
| H1 heading | Count (should be exactly 1) |
| Heading hierarchy | H1→H2→H3 order, no skipped levels |
| Image alt text | % of images with alt attributes |
| Open Graph tags | og:title, og:description, og:image, og:url |
| Twitter Card | card, title, description, image |
| Canonical URL | Presence, self-referencing |
| Robots meta | index/noindex, follow/nofollow |
| Structured data | JSON-LD blocks and types |
| Mobile viewport | width=device-width |
| Language | html lang attribute |

## Usage

1. Load as unpacked extension
2. Navigate to any page
3. Click the extension icon
4. Get your score and checklist

## Install

```
Chrome → chrome://extensions → Developer mode → Load unpacked → select this folder
```

## Permissions

- `activeTab` — scan the current page when you click the icon
- `scripting` — run the DOM scanner

**Zero external network calls. Zero data collection. No storage.**

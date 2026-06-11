# SEO Shot

Instant on-page SEO snapshot. Score out of 100 with actionable fixes. No API needed — pure DOM scanning.

## What it checks

| Check | Detail |
|---|---|
| Title tag | Presence, length (50–60 optimal), content |
| Meta description | Presence, length (120–160 optimal) |
| H1 heading | Count (should be exactly 1) |
| Heading hierarchy | Starts with H1, no skipped levels (H1→H2→H3...) |
| Image alt text | % of images with an `alt` attribute |
| Open Graph tags | og:title, og:description, og:image, og:url |
| Twitter Card | card, title, description, image |
| Canonical URL | Presence, whether it self-references current path |
| Robots meta | index/noindex, follow/nofollow |
| Structured data | JSON-LD blocks and types |
| Mobile viewport | width=device-width |
| Language | html lang attribute |

## Usage

1. Load as unpacked extension
2. Navigate to any page
3. Click the extension icon
4. Get your score and checklist

## Known behavior

Archive pages, category listings, and tag pages typically score lower than single posts. This is expected: WordPress and similar CMS platforms rarely generate unique meta descriptions, OG tags, or optimized titles for archive views. SEO Shot scores what's actually on the page — low scores on archives are correct, not a bug.

## Install

```
Chrome → chrome://extensions → Developer mode → Load unpacked → select this folder
```

## Permissions

- `activeTab` — scan the current page when you click the icon
- `scripting` — run the DOM scanner

No broad host permissions. SEO Shot only scans the active page after a user click.

**Zero external network calls. Zero data collection. No storage.**

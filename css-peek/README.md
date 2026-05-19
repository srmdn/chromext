# CSS Peek

Hover over any element to see its CSS properties. Click to copy a unique selector to your clipboard.

## What it does

- **Hover** any element → floating tooltip shows tag, classes, box model, font, colors, dimensions
- **Click** an element while inspecting → copies the CSS selector to clipboard
- **Toggle on/off** from the popup — no persistent listeners when disabled

## Inspected properties

| Category | Details |
|---|---|
| Identity | Tag name, ID, classes |
| Layout | Display type, position, width × height |
| Box model | Margin, border, padding (TRBL) |
| Typography | Font family, size, weight, line height |
| Colors | Text color + background (with swatches) |

## Usage

1. Load as unpacked extension in Chrome
2. Navigate to any page
3. Click the extension icon → **Start Inspecting**
4. Hover over elements → tooltip appears
5. Click any element → selector copied to clipboard
6. Click icon → **Inspecting...** to disable

## Install

```
Chrome → chrome://extensions → Developer mode → Load unpacked → select this folder
```

## Permissions

- `activeTab` — inject inspector into current tab on demand
- `scripting` — run the hover listener and tooltip
- `storage` — (reserved for future preferences)

**Zero external network calls. Zero data collection.**

## Design

Purple `#7c4dff` — conveys inspection, insight, and CSS creativity. Eye + CSS brackets icon.

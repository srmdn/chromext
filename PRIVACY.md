# Privacy Policy

**Last updated: May 2026**

This privacy policy applies to all extensions in the chromext monorepo. Each extension follows the same principles.

## Data Collection

**We collect nothing.** None of these extensions:

- Collect personal information
- Track browsing activity
- Use analytics or telemetry
- Send data to external servers
- Store data outside your browser's local storage
- Use cookies or tracking pixels

## Data Storage

Any preferences you set (toggle states, accent colors) are stored exclusively in Chrome's built-in `chrome.storage` API. This data stays on your device and is never transmitted anywhere. It may sync across your devices through Chrome Sync if you have that enabled.

## Network Requests

These extensions make **zero external network requests**. They do not load remote scripts, images, fonts, or stylesheets. All code runs locally in your browser.

## Permissions

Each extension requests only the minimum permissions needed for its functionality:

- **PasteGuard**: `storage` (save preferences), `scripting` + `activeTab` (intercept paste events on AI chat sites)
- **SEO Shot**: `activeTab` + `scripting` (scan the current page when you click the icon)
- **Google Translate Dark**: `storage` (save accent color and toggle state), `scripting` (inject dark CSS)

No extension requests "Read and change all data on all websites."

## Third Parties

We do not share, sell, or transfer any data to third parties because we do not collect any data.

## Changes

If this policy changes, the updated version will be posted in this repository.

## Contact

For questions about this privacy policy: [github.com/srmdn/chromext](https://github.com/srmdn/chromext)

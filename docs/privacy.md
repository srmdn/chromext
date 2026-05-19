# Privacy Policy

**Last updated: May 2026**

This privacy policy applies to all extensions in the chromext monorepo.

## Data Collection

**We collect nothing.** None of these extensions collect, store, or transmit:

- Personal information
- Browsing activity or history
- Clipboard contents
- Page content
- Form data or inputs

## Where Data Lives

Any preferences you set (toggle states, accent colors, mode selections) are stored exclusively in Chrome's built-in `chrome.storage` API. This data:

- Stays on your device
- Is never transmitted externally
- May sync across your devices through Chrome Sync (if you have it enabled)

## Network Requests

These extensions make **zero external network requests**. They do not:

- Load remote scripts, fonts, images, or stylesheets
- Call third-party APIs
- Send analytics or telemetry
- Phone home for any reason

All code runs locally in your browser.

## Permissions

Each extension requests only the minimum permissions needed:

<div class="ext-card" style="margin-bottom: 16px">
  <strong>PasteGuard</strong>
  <p><code>storage</code> — save your warn/block preference<br>
  <code>scripting</code> + <code>activeTab</code> — intercept paste events on AI chat sites</p>
</div>

<div class="ext-card" style="margin-bottom: 16px">
  <strong>SEO Shot</strong>
  <p><code>activeTab</code> + <code>scripting</code> — scan the current page when you click the icon</p>
</div>

<div class="ext-card" style="margin-bottom: 16px">
  <strong>Google Translate Dark</strong>
  <p><code>storage</code> — save accent color and toggle state<br>
  <code>scripting</code> — inject dark CSS on translate.google.*</p>
</div>

No extension requests "Read and change all data on all websites."

## Third Parties

We do not share, sell, or transfer any data to third parties because we do not collect any data.

## Open Source

Every line of code is public. You can inspect exactly what each extension does:

- [PasteGuard source](https://github.com/srmdn/chromext/tree/master/pasteguard)
- [SEO Shot source](https://github.com/srmdn/chromext/tree/master/seo-shot)
- [Google Translate Dark source](https://github.com/srmdn/chromext/tree/master/google-translate-dark)

## Contact

For questions about this privacy policy, open an issue or discussion at [github.com/srmdn/chromext](https://github.com/srmdn/chromext).

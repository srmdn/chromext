---
layout: home
hero:
  name: "chromext"
  text: "Chrome Extensions for Solo Builders"
  tagline: Free, open-source, inspectable. No telemetry, no broad permissions, no bullshit.
  actions:
    - theme: brand
      text: View on GitHub
      link: https://github.com/srmdn/chromext
    - theme: alt
      text: Privacy Policy
      link: /privacy

features:
  - title: Minimal Permissions
    details: Every extension requests only what it needs. No "Read and change all data on all websites."
  - title: Zero Network Calls
    details: No analytics, no tracking, no telemetry. Your data never leaves your browser.
  - title: Inspectable Source
    details: Plain JavaScript, no bundlers, no obfuscation. Read every line before you trust it.
  - title: CWS Ready
    details: Built to pass Chrome Web Store review on the first try. Manifest V3, no remote code.
---

## Extensions

<div class="ext-card">
  <h3>👁️ CSS Peek</h3>
  <p>Hover any element to see its CSS properties. Box model, fonts, colors — right there without opening DevTools. Click to copy a CSS selector.</p>
  <p><strong>Inspected properties</strong> — tag + classes, box model (M/B/P/C), font stack + size + weight, colors with swatches, display type, dimensions.</p>
  <div class="ext-perms">
    <span class="perm-badge">activeTab</span>
    <span class="perm-badge">scripting</span>
  </div>
  <p style="margin-top: 12px"><a href="https://github.com/srmdn/chromext/tree/master/css-peek">Source →</a></p>
</div>

<div class="ext-card">
  <h3>🛡️ PasteGuard</h3>
  <p>Stop pasting API keys and secrets into AI chats. Scans pasted text locally on supported web-based AI chat interfaces. Warns, masks, or blocks before you leak credentials.</p>
  <p><strong>15 detection patterns</strong> — OpenAI, Anthropic, GitHub, Stripe, AWS keys, JWTs, private keys, database URLs, .env assignments.</p>
  <div class="ext-perms">
    <span class="perm-badge">storage</span>
  </div>
  <p style="margin-top: 12px"><a href="https://github.com/srmdn/chromext/tree/master/pasteguard">Source →</a></p>
</div>

<div class="ext-card">
  <h3>🔍 SEO Shot</h3>
  <p>Instant on-page SEO snapshot. Score out of 100 with actionable fixes. Pure DOM scanning — no API keys, no signup, no external calls.</p>
  <p><strong>12 checks</strong> — title, meta description, H1, heading hierarchy, image alt text, Open Graph, Twitter Card, canonical URL, robots meta, structured data, mobile viewport, language.</p>
  <div class="ext-perms">
    <span class="perm-badge">activeTab</span>
    <span class="perm-badge">scripting</span>
  </div>
  <p style="margin-top: 12px"><a href="https://github.com/srmdn/chromext/tree/master/seo-shot">Source →</a></p>
</div>

<div class="ext-card">
  <h3>🌙 Midnight Translate</h3>
  <p>Soft midnight mode for Google Translate with a floating page toggle and accent color controls.</p>
  <p><strong>Local-only theme state</strong> — no remote code, no background worker, no broad site access beyond supported Translate pages.</p>
  <div class="ext-perms">
    <span class="perm-badge">storage</span>
  </div>
  <p style="margin-top: 12px"><a href="https://github.com/srmdn/chromext/tree/master/midnight-translate">Source →</a></p>
</div>

## Philosophy

I'm a solo builder. Every extension I install is a trust decision. The Chrome Web Store is full of closed-source extensions with broad permissions and no way to verify what they actually do.

So I build my own.

<div class="principles">
  <div class="principle">
    <strong>Minimal Permissions</strong>
    No broad "all websites" access. Each extension asks for exactly what it needs.
  </div>
  <div class="principle">
    <strong>Zero Network Calls</strong>
    No analytics, no tracking, no telemetry. Everything runs locally.
  </div>
  <div class="principle">
    <strong>Inspectable in Minutes</strong>
    Small codebases, plain JavaScript, no bundlers. Read every line.
  </div>
  <div class="principle">
    <strong>CWS Ready on Day One</strong>
    Manifest V3, no obfuscation, no remote code. Ships immediately.
  </div>
</div>

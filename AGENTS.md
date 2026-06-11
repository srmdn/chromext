# AGENTS.md — chromext

## Scope

- Applies to entire `chromext` repo.
- This repo is a monorepo of independent Chrome extensions plus a docs site.

## Structure

- Each extension lives in its own top-level folder:
  - `css-peek/`
  - `seo-shot/`
  - `pasteguard/`
  - `google-translate-dark/`
- Each extension is published to the Chrome Web Store as its own separate item.
- Repo root contains shared docs, scripts, and project-wide metadata.
- `docs/` is the VitePress site for landing page, privacy page, and screenshots/docs.

## Defaults

- Keep changes minimal, targeted, and easy to review.
- Do not add dependencies without approval.
- Preserve plain-JS, low-complexity style unless repo direction changes explicitly.
- Prefer least-privilege Chrome extension permissions.
- Avoid remote code, analytics, telemetry, or unnecessary network behavior.

## Commands

- Prefer `rtk <command>` when applicable.
- Docs site:
  - `npm run dev`
  - `npm run build`
  - `npm run serve`
- Syntax check single extension scripts with:
  - `node --check path/to/file.js`

## Verification

- If changing extension logic:
  - syntax-check changed JS files
  - smoke test as unpacked extension when feasible
  - verify manifest, README, and behavior still match
- If changing docs site:
  - run `npm run build`
- Before commit, run the smallest relevant verification for touched areas.

## Publishing

- Treat each extension folder as independently shippable.
- Keep store listing claims aligned with actual implemented behavior.
- Keep privacy claims accurate and conservative.
- Favor `activeTab` over broad host permissions when possible.
- Any permission that increases review risk should have a clear product reason.

## Versioning

- Version each extension independently in its own `manifest.json`.
- Chrome Web Store versioning is per extension, not per monorepo.
- Keep `1.0.0` for first public release unless there is a reason to mark it as pre-release internally.
- After an extension is published, every update must bump that extension's manifest version.
- Do not force all extensions to share the same version number.
- Root `package.json` version is optional and should not be treated as extension release truth.

## Release Tags

- Prefer git tags per extension release.
- Tag format:
  - `seo-shot-v1.0.0`
  - `pasteguard-v1.0.0`
  - `css-peek-v1.0.0`
  - `google-translate-dark-v1.0.0`
- Optional repo-wide milestone tags are allowed for grouped launches, for example:
  - `chromext-2026-06-launch`
- Extension manifest versions remain the source of truth for CWS uploads.

## Editing Notes

- Do not assume shared runtime code across extensions.
- Be careful when changing selectors or DOM assumptions for site-specific extensions.
- Update docs when behavior, permissions, or publish posture changes.

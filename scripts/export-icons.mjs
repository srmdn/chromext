#!/usr/bin/env node

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

const PACKAGES = ['seo-shot', 'pasteguard', 'google-translate-dark', 'css-peek'];
const SIZES = [16, 32, 48, 128];

function findChrome() {
  const envPath = process.env.CHROME_PATH?.trim();
  if (envPath) return envPath;

  for (const candidate of CHROME_CANDIDATES) {
    const probe = spawnSync('test', ['-x', candidate], { stdio: 'ignore' });
    if (probe.status === 0) return candidate;
  }

  throw new Error(
    'Google Chrome not found. Set CHROME_PATH or install Chrome at /Applications/Google Chrome.app.',
  );
}

function renderIcon(chromePath, svgPath, outPath, size) {
  const workDir = mkdtempSync(join(tmpdir(), 'chromext-icons-'));
  const htmlPath = join(workDir, 'icon.html');
  const svg = readFileSync(svgPath, 'utf8').replace(/^<svg\b/, `<svg width="${size}" height="${size}"`);
  const html = `<!doctype html>
<html>
  <body style="margin:0;background:transparent;overflow:hidden">
${svg}
  </body>
</html>
`;

  writeFileSync(htmlPath, html);

  const result = spawnSync(
    chromePath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--default-background-color=00000000',
      `--window-size=${size},${size}`,
      `--screenshot=${outPath}`,
      `file://${htmlPath}`,
    ],
    { encoding: 'utf8' },
  );

  rmSync(workDir, { recursive: true, force: true });

  if (result.status !== 0) {
    throw new Error(
      `Chrome failed for ${outPath}\n${result.stderr || result.stdout || 'unknown error'}`,
    );
  }
}

function main() {
  const chromePath = findChrome();

  for (const pkg of PACKAGES) {
    const iconDir = join(ROOT, pkg, 'icons');
    const svgPath = join(iconDir, 'icon.svg');

    for (const size of SIZES) {
      const outPath = join(iconDir, `icon${size}.png`);
      renderIcon(chromePath, svgPath, outPath, size);
    }
  }
}

main();

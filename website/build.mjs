#!/usr/bin/env node
// Builds getzapl.ie: copies src/ to dist/ and fills {{placeholders}} in HTML, CSS and JS
// from site.config.json (contact addresses and links live there, once).
// No dependencies. Run: node website/build.mjs
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');
const config = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));

// Derived values, so the HTML never spells out an address or subject line by hand.
const values = {
  ...config,
  salesMailto: `mailto:${config.salesEmail}?subject=${encodeURIComponent('Zaplie')}`,
  supportMailto: `mailto:${config.supportEmail}?subject=${encodeURIComponent('Zaplie support')}`,
};

if (existsSync(dist)) rmSync(dist, { recursive: true });
cpSync(src, dist, { recursive: true });

const templated = new Set(['.html', '.css', '.js', '.xml', '.txt', '.webmanifest']);
const missing = new Set();

/** Replaces each {{placeholder}} in one file with its value, noting any that are unknown. */
function fill(file) {
  const text = readFileSync(file, 'utf8');
  const out = text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    if (!(key in values)) missing.add(key);
    return values[key] ?? '';
  });
  writeFileSync(file, out);
}

/** Fills every templated file under a directory, recursively; font licences are left as they are. */
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (templated.has(extname(name)) && !name.startsWith('OFL-')) fill(path);
  }
}

walk(dist);

if (missing.size) {
  console.error(`Unknown placeholders: ${[...missing].join(', ')}`);
  process.exit(1);
}

// The Zaplie portal (Login, top right) is the signed-in part of the site, at /portal/. It is
// the Teams tabs app from knowall-ai/zaplie-bot built for that path:
//   cd zaplie-bot/tabs && PUBLIC_URL=/portal REACT_APP_API_BASE_URL=https://<portal backend> npm run build
// PORTAL_DIST points at that build (default: a zaplie-bot checkout next to this repository).
// Without it the marketing page still builds, and /portal/ is simply absent. It is copied after the
// placeholders are filled: the portal is a finished build, and its bundle may legitimately contain
// text that looks like a {{placeholder}}.
const portal = process.env.PORTAL_DIST ?? join(root, '..', '..', 'zaplie-bot', 'tabs', 'build');
const portalIndex = join(portal, 'index.html');
if (existsSync(portalIndex)) {
  // A build for the root of its own host would load its scripts from /static/, which
  // does not exist here. Refuse it rather than publish a blank portal.
  const html = readFileSync(portalIndex, 'utf8');
  if (!/(src|href)="\/portal\//.test(html)) {
    console.error(`The portal build at ${portal} is not built for /portal/: rebuild it with PUBLIC_URL=/portal.`);
    process.exit(1);
  }
  cpSync(portal, join(dist, 'portal'), { recursive: true });
  console.log(`Portal included from ${portal}`);
} else {
  console.warn(`Portal not included: no build at ${portal} (set PORTAL_DIST, or build zaplie-bot/tabs with PUBLIC_URL=/portal).`);
}

console.log(`Built ${dist}`);

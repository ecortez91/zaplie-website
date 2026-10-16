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
console.log(`Built ${dist}`);

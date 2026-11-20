// Leonida Platinum — the program that hands in this entry (Node 22, standard library only).
//
// The guide itself is the app/ folder beside this file: plain static files a desktop browser
// opens offline (index.html, its ES module app.js, the stylesheet, and the trophy list in
// data/trophies.json — no build step, no library, no network request), so a player's checklist
// never leaves their machine. This program just gathers app/ and screenshots/ into the output
// directory and writes dossier.json, the summary the judge reads, using the vendored make.fun
// library. It does not draw anything itself.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Make the output directory, copy the whole guide in, then the screenshots beside it.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Verify the copy landed: every file the guide needs must exist in the output and
// be non-empty, or the entry would hand the judge a broken guide. Fail loudly and
// name the file instead of silently shipping a partial copy.
function requireNonEmpty(path) {
  if (!existsSync(path) || statSync(path).size === 0) {
    throw new Error(`output is missing or empty: ${path}`);
  }
}

for (const rel of ['app/index.html', 'app/app.js', 'app/style.css', 'app/data/trophies.json']) {
  requireNonEmpty(join(out, rel));
}
const shots = readdirSync(join(out, 'screenshots')).filter((f) => f.endsWith('.jpg'));
if (shots.length === 0) {
  throw new Error(`output is missing or empty: ${join(out, 'screenshots')} (no screenshots copied)`);
}
for (const shot of shots) {
  requireNonEmpty(join(out, 'screenshots', shot));
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the
// others refuse an entry the scorer would refuse (more than 4 screenshots or one over 256 KiB;
// more than 993 files and directories in app/ or 48 MiB of app files: app/ counts beside
// /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

// The dossier is what the judge reads first — confirm it was actually written.
requireNonEmpty(join(out, 'dossier.json'));

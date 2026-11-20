[![make.fun](https://make.fun/badge.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun entry](https://make.fun/badge-entry.svg)](https://github.com/Noman7860000/makefun-gta6-trophy-guide-01)
[![make.fun bounty](https://make.fun/badge-bounty.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline web app that is the complete guide and tracker for the **55 PlayStation 5 trophies** of Grand Theft Auto VI. Open `app/index.html` in a desktop browser and it works with the network off — nothing leaves your machine.

## What it does

- **Every trophy, with its official name, description and grade** — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze — plus a short how-to tip for each, written for this guide.
- **Checklist saved in the browser** — tick trophies off as you earn them; your progress persists in `localStorage` and survives reloads.
- **Progress at a glance** — a progress ring, percentage, and counts by grade, plus per-phase counts on the roadmap.
- **Roadmap to the Platinum** — four phases in order: play the story, grab the 13 missables before the finale, finish strangers and side content, then cleanup and 100%.
- **Missable flags** — 13 trophies are one-time moments, partner activities or story choices. They are flagged on every card and in the detail view, and the Missable filter lists them all.
- **Spoiler setting** — story trophies are hidden by default until you earn them; turn it off to see everything.
- **Filters, search and sort** — filter by grade, missable, story, side, collectible, earned or not earned; search by name or description; sort by roadmap order, grade or name.
- **Per-trophy detail** — click any card for the full description, kind, missable status and the how-to guide.
- **Export / import / reset** — download your progress as JSON, import it on another browser, or reset it.

## Run it

```bash
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` directly in a browser. To produce the entry output:

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html` — the page, header, roadmap, controls and grid
- `app/app.js` — the tracker: filters, search, sort, spoilers, localStorage, export/import
- `app/style.css` — dark Vice City theme
- `app/data/trophies.json` — the official 55 trophies, enriched with kind, missable and story flags and a guide tip each
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to the output and writes `dossier.json`
- `screenshots/` — 4 screenshots of the built guide

## Bounty

Built for the [GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01) on make.fun.

---

Built by [web3nouman](https://make.fun/u/web3nouman) — [referral link](https://make.fun/r/9y40b2n3)

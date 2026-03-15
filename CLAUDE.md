# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MailSpec is a browser-based direct mail component weight and dimension calculator. It helps USPS project managers define, validate, and share the physical and postal attributes of mail pieces. The app runs entirely client-side with no build tooling — just open `index.html` in a browser.

## Architecture

**No build system.** Pure HTML/CSS/JavaScript served via CDN (Tailwind CSS, Google Material Symbols). Deployed to GitHub Pages from `main` branch.

**Data namespace pattern:** All data modules attach to `window.MailSpec` since there's no bundler. Each data file in `app/data/` initializes `window.MailSpec = window.MailSpec || {};` and attaches its export. The inline script in `index.html` aliases these to local `const` variables (e.g., `const STOCKS = window.MailSpec.STOCKS;`).

**Script load order matters** — `index.html` loads data files first, then the inline script that references them:
1. `app/data/stocks.js` → `window.MailSpec.STOCKS`, `.loadCustomStocks`, `.STORAGE_KEY_CUSTOM_STOCKS`
2. `app/data/templates.js` → `window.MailSpec.TEMPLATES`
3. `app/data/coatings.js` → `window.MailSpec.COATINGS`
4. `app/data/seals.js` → `window.MailSpec.SEALS`
5. `app/data/postage.js` → `window.MailSpec.POSTAGE`

**State & persistence:** App state lives in JS variables (`components`, `globalBuffer`, etc.) and auto-saves to `localStorage` under keys: `mailspec_current_assembly`, `mailspec_saved_configs`, `mailspec_custom_stocks`.

**Event handling:** Uses both inline `onclick` handlers and a `data-add-component`/`data-add-template` event delegation system. All functions are explicitly bound to `window` for onclick access.

## Development

No install, build, or test commands — open `index.html` directly in a browser (or use a local server). Hard refresh to pick up changes.

The legacy single-file version is preserved as `mailspec-assembly-tool-v2.4.html` for reference. The modular version in `index.html` + `app/data/` + `assets/` should behave identically.

## Key Constraints

- **No bundler.** All JS uses `window.MailSpec` namespace, not ES modules.
- **Data accuracy is critical.** Paper stock calipers, GSM values, and postage rates come from manufacturer spec sheets and USPS schedules. Never modify data values without explicit instruction.
- **Mobile-first.** 768px breakpoint separates mobile (tab navigation, panel switching) from desktop (side-by-side panels). All touch targets must be ≥44px.
- **Offline-capable.** No server dependencies after initial load. Tailwind and fonts load from CDN on first visit.

## Migration Status

The project is being migrated from a single 2,200-line HTML file into a modular structure. Phases completed:
- **Phase 1.1-1.2:** Scaffolding + data extraction (stocks, templates, coatings, seals, postage into `app/data/`; CSS into `assets/styles.css`)

Remaining inline JS in `index.html` (~800 lines of functions) will be extracted into `app/components/` and `app/utils/` in future phases.

## Development Plan

The full development plan is in docs/DEVELOPMENT-PLAN.md. Phases overview:
- Phase 1: Foundation — Codebase migration (1.1-1.2 complete, 1.3-1.6 remaining)
- Phase 2: Data integrity and provenance
- Phase 3: Accuracy verification and confidence indicators
- Phase 4: Enhanced capabilities (self-mailer compliance, postage comparison, new component types)
- Phase 5: Future considerations

## Workflow

- Planning and design discussions happen in Claude AI (claude.ai), not here
- Complex changes are delivered as prompt files pasted into Claude Code
- Simple fixes are typed directly into Claude Code
- Testing: hard refresh browser (Cmd+Shift+R)
- Always commit with descriptive messages referencing the phase number

## Session Handoff

At the end of each working session, update this file's Migration Status section with what was completed and what's next. This is the primary mechanism for transferring context between sessions.

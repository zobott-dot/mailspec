# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MailSpec is a browser-based direct mail component weight and dimension calculator. It helps USPS project managers define, validate, and share the physical and postal attributes of mail pieces. The app runs entirely client-side with no build tooling — just open `index.html` in a browser.

## Architecture

**No build system.** Pure HTML/CSS/JavaScript served via CDN (Tailwind CSS, Google Material Symbols). Deployed to GitHub Pages from `main` branch.

**Data namespace pattern:** All data modules attach to `window.MailSpec` since there's no bundler. Each data file in `app/data/` initializes `window.MailSpec = window.MailSpec || {};` and attaches its export. The inline script in `index.html` aliases these to local `const` variables (e.g., `const STOCKS = window.MailSpec.STOCKS;`).

**Script load order matters** — `index.html` loads files in this order:
1. `app/data/stocks.js` → `window.MailSpec.STOCKS`, `.loadCustomStocks`, `.STORAGE_KEY_CUSTOM_STOCKS`
1b. `app/data/provenance.js` → `window.MailSpec.PROVENANCE`
2. `app/data/templates.js` → `window.MailSpec.TEMPLATES`
3. `app/data/coatings.js` → `window.MailSpec.COATINGS`
4. `app/data/seals.js` → `window.MailSpec.SEALS`
5. `app/data/postage.js` → `window.MailSpec.POSTAGE`
6. `app/utils/calculations.js` → `window.MailSpec.Calculations`
7. `app/utils/postal.js` → `window.MailSpec.Postal`
7b. `app/utils/compliance.js` → `window.MailSpec.Compliance`
8. `app/state.js` → `window.MailSpec.State`, `.STORAGE_KEY_CURRENT`, `.STORAGE_KEY_CONFIGS`
9. `app/components/render.js` → `window.MailSpec.Components.renderComponents`, `.getSourceBadge`, `.getStockInfo`, `.filterStocks`, `.updateStockSearch`
10. `app/components/calculate.js` → `window.MailSpec.Components.calculate`
11. `app/components/config-manager.js` → `window.MailSpec.Components.saveConfiguration`, `.loadConfiguration`, `.deleteConfiguration`, `.renderConfigList`, `.exportConfigurations`, `.importConfigurations`
12. `app/components/bom-export.js` → `window.MailSpec.Components.copyBOMToClipboard`, `.exportBOMText`, `.generateBOMText`
13. `app/components/component-manager.js` → `window.MailSpec.Components.addComponent`, `.duplicateComponent`, `.removeComponent`, `.clearAllComponents`, `.updateComponent`, `.toggleDimMode`, `.toggleManual`, `.addTemplate`, `.addCustomStock`
14. `app/components/ui-controls.js` → `window.MailSpec.Components.updateGlobalBuffer`, `.updateGlobalThickBuffer`, `.updateGlobalSeal`, `.updateSealInfo`, `.switchTab`
15. Inline script → `init()`, `autoSave()`, `showAutosaveStatus()`, window bindings, event delegation

**State namespace:** App state lives on `window.MailSpec.State` (components, nextId, globalBuffer, globalThickBuffer, globalSealType, globalSealQty, lastBomData). Auto-saves to `localStorage` under keys: `mailspec_current_assembly`, `mailspec_saved_configs`, `mailspec_custom_stocks`.

**Component namespace:** All extracted UI functions live on `window.MailSpec.Components`. Each component file uses an IIFE that aliases `State` and `C` (Components) at the top, then defines functions and registers them on `C`. Cross-file calls use `C.functionName()`. The inline script registers `autoSave` and `showAutosaveStatus` on `C` so component files can call them.

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
- **Phase 1.3:** Calculation and postal logic extraction (`app/utils/calculations.js` for weight/thickness/coating/buffer math; `app/utils/postal.js` for classification/aspect ratio/postage/tray capacity)
- **Phase 1.4-1.5:** UI component extraction + state management (`app/state.js` for shared state on `window.MailSpec.State`; `app/components/` for render, calculate, config-manager, bom-export, component-manager, ui-controls). Inline script reduced to ~155 lines: init, autoSave, window bindings, event delegation.
- **Phase 1.6:** Verification checkpoint — code-level comparison of all calculation, classification, postage, and tray capacity logic confirmed identical to v2.4 reference. Data files (stocks, templates, coatings, seals, postage) verified byte-identical. One cosmetic fix applied (render.js empty state text). Browser verification recommended to confirm runtime behavior.

Phase 1 migration complete.
- **Phase 2.1:** Custom Panel Mode — added opt-in toggle on self-mailer, insert/sheet, accordion, and booklet components. Custom mode accepts flat size (for weight), finished size (for postal classification), and layer count (for thickness), bypassing standard fold derivation. Standard mode behavior unchanged. Toggle absent on envelope and card types. State persists in saved configurations.

- **Phase 2.1b:** UI polish — dynamic version number (v2.5, defined once in inline script, propagates to header/title/mobile/manual/console), removed `h-8` from global adjustment inputs for consistent mobile sizing, full dark mode with toggle (desktop header + mobile menu), localStorage persistence, comprehensive CSS coverage of all panels/cards/modals/inputs, print always light.

- **Hotfix:** iOS select height fix (`appearance:none` + custom SVG chevron on `select.input-field`). Landscape phone layout (side-by-side panels, compact header/inputs/cards via `@media (orientation: landscape) and (max-height: 500px)`). Tablet layout fix (side-by-side at 768-1023px). PWA manifest with `orientation: any`.

- **Phase 2.2:** Postal risk warnings — amber/red visual warnings in results panel when assembly values approach USPS classification boundaries. Monitors thickness (letter→flat at 0.25", flat→parcel at 0.75"), weight (1oz tier, 3.5oz letter max, 13oz flat max), dimensions (width 11.5", height 6.125"), and aspect ratio (1.3–2.5 range). Context-aware: only warns about the next relevant boundary for current classification. Warning container between summary cards and classification section. Dark mode support. Logic in `app/components/calculate.js` (internal `generatePostalWarnings` function).

- **Phase 2.3:** Data provenance — new `app/data/provenance.js` maps stock source keys to publisher, document, URL, and verification date. Stock info line in component cards now shows verified date (e.g., "· Jun 2025") and source badges link to manufacturer spec pages. `getStockInfo()` function in render.js. Sources modal updated with static verification dates. Provenance data separate from stock entries.

- **Phase 3:** Data confidence indicators — tolerance percentage (±3%/±5%/±7%) shown color-coded on stock info line, staleness detection on provenance dates (amber >12mo, red >24mo), custom stocks show "Unverified" label in purple italic. All implemented in `getStockInfo()` in render.js. Hover tooltips on all new indicators. Stock info line uses flex-wrap for mobile overflow.

- **Phase 4.1:** Self-mailer compliance checking — new `app/utils/compliance.js` evaluates tab requirements per DMM 201.3.14 based on fold type, weight, and optional design elements. Compliance panel appears in analysis when self-mailer component is present, showing pass/caution/fail status with specific guidance. Supports bi-fold, tri-fold, quarter-fold. Line glue recognized as alternative closure. Dark mode support.

- **Phase 4.1b:** Specialty fold templates — gate fold, double gate fold, roll fold, Z-fold, iron cross, French fold added to templates using Custom Panel Mode. `addTemplate()` and `addComponent()` pass through custom panel fields. New Specialty Folds section in templates modal with rose color scheme. Component name input width fix (`w-24` → `min-w-0 flex-1`).

- **Phase 2.4:** Print spec sheet — print-only div populated at print time by `preparePrintSheet()`. Typography-driven layout: 14pt title, 16pt summary numbers, thin rules, no UI chrome. Includes summary, classification, postage, warnings, compliance, BOM table, seals/buffers, footer disclaimer. Single portrait letter page. Dark mode forced to light on print. Old print rules replaced.

- **Phase 2.4b:** Quick Start Guide modal with 4-step onboarding (sky/teal button in desktop header and mobile menu). Manual updated with Custom Panels, Postal Risk Warnings, Self-Mailer Compliance, Print Spec Sheet, and Data Confidence sections. Component type descriptions updated. v2.5 What's New expanded to 8 feature cards. Dark mode support for Quick Start UI.

- **Phase 2.5:** Template category dropdowns in build panel — 6 category buttons (Envelopes, Reply Env, Self-Mailers, Specialty, Inserts, Cards) above component buttons, each with dropdown showing category templates for one-click add. Renamed component buttons row to "Add Custom". Removed category-specific colors (emerald/rose) from templates modal buttons. Dark mode support for dropdowns.

- **Phase 2.5b:** Build panel reorganization — consolidated Reply Envelopes into Envelopes dropdown with sub-labels (Outer / Reply & Remittance), renamed Specialty to Folds with sub-labels (Standard / Specialty) and added Accordion 4-panel and 6-panel templates, added Booklets category with self-cover, plus-cover (saddle), and perfect bound templates. `addTemplate()` now passes `coverStockName`, `binding`, and `panels` through to `addComponent()`. Removed type badge (ENV/FLAT/BOOKLET/etc.) from component card headers.

- **Phase 2.6:** Version bump to v2.6. Header buttons reordered (Quick Start, Manual, Templates, Configs, Sources, Stock). Quick Start rewritten for template-dropdown workflow. Manual What's New updated with v2.6 featured entry, v2.5 demoted. Manual Getting Started updated to reference template categories. Removed Add Custom component buttons row. Consolidated folds in templates modal. Dimension display precision to 3 decimal places.

Next: Phase 4.2+ (future phases).

## Development Plan

The full development plan is in docs/DEVELOPMENT-PLAN.md. Phases overview:
- Phase 1: Foundation — Codebase migration (complete)
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

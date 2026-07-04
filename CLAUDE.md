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

The legacy single-file version (`mailspec-assembly-tool-v2.4.html`) was removed 2026-07-03; it remains available in git history. The modular version in `index.html` + `app/data/` + `assets/` is the sole source.

## Testing

Open `tests/index.html` in a browser to run the regression test suite. It tests calculateComponentMetrics (all component types + custom panels + coatings + manual overrides), classifyPiece (all boundary conditions), lookupPostage (Notice 123 presort-tier ranges: MM/FC letter + flat, piece+pound heavy flats, weight-cap guards, letter-over-3.5oz re-quote, null-classification dashing), getWeightStatus, selectDimensionDriver (envelope precedence + largest-area tiebreak), calculateTrayCapacity (letter/flat/none modes + EMM trigger at MM-tray thresholds), and evaluateSelfMailer (all fold types + optional elements + weight limits + FSM size gate + paper minimums + perf-tab prohibition + glue-dot counts + specialty-fold advisory). It also covers getMinimumThickness (DMM two-tier floor), the Too Thin classification branch, and generatePostalWarnings (aspect-ratio boundary inclusivity, minimum-thickness red, weight bands). No framework needed — just open the page and check for green. Suite is at 191 assertions.

**Automated browser-pass caveat:** `preparePrintSheet()` calls `window.print()`, which opens Chrome's print preview and blocks the tab's main thread — an automated (claude-in-chrome) session cannot dismiss it and the tab freezes for the rest of the run. Skip print-sheet verification in automated passes (drive state + `C.calculate()` and read the DOM instead); leave the print spec sheet to a manual visual pass. Other known caveats: no `navigator.clipboard` (inspect `generateBOMText()` via console rather than Copy BOM); serve with no-cache headers or the browser will run stale cached `app/*.js` even after edits.

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

- **v3.0:** Review polish — click-outside close for template dropdowns, print button tooltip, Quick Start backup note, empty-state dashes in summary cards. Manual TOC with smooth-scroll. Data Confidence note neutral tone. Compliance panel hidden for postcards. Component card overflow menu (manual/swap behind "..."). Mobile tab bar simplified to 3 tabs. Browser-based regression test suite (`tests/index.html`). Removed "Pro" branding. Manual updated with Component Management card, Testing section, v3.0 What's New.

- **Accuracy Remediation (2026-07):** Comprehensive accuracy audit (2026-07-01) identified seven Now defects. Fixed and verified 2026-07-02: **Defect 1** — self-cover booklet double-count (cover pages now deducted from body unconditionally, commit `7110c50`); **Defect 3** — specialty stock GSM corrections (20mil magnet 800→1830, 15mil 600→1370, CR80 PVC 1400→1100; C2S boards moved to ±8% tolerance with "verify against house stock" note, commit `ac96375`); **Defect 4** — envelope dimension-driver selection now picks the largest-area envelope instead of the last one added (commit `6681b1d`); **Defect 5** — EMM trigger corrected to letter-tray thresholds per DMM/M033 (height > 4.625" or length > 10"), flats no longer show letter-tray counts, 1-ft row marked inapplicable under EMM (commit `ef175b5`); **Defect 6** — FSM compliance brought current to DMM 201.3.14: quarter-fold >1oz now 2 tabs @ 1.5" (was 3), optional elements now 2 tabs @ 1.5" + 100# paper (was +1 tab), glue dots now 3 spots ≤1oz / 4 spots >1oz (was generic count), perforated tabs now hard-fail as prohibited closure, new 6"×10.5" FSM size gate, new paper basis-weight minimums (70#/80#/100# by weight & optional elements), specialty-fold templates (gate/double-gate/iron-cross) now engage the panel with an MDA advisory, compliance panel footer replaced with a scope disclaimer noting unmodeled placement/orientation/panel-count rules. Compliance-fold-type flag propagates from templates through addComponent. The first selfmailer's finished dims are captured in the bomData loop (guarded to match the `.find()` used by the panel) and passed to `evaluateSelfMailer` along with `stockGsm`. Stale 2013-rule assertions flipped in the same commit. Test suite grew from 116 to 138 assertions. **Defect 7** — warning threshold fixes (fixed and verified 2026-07-03): aspect-ratio red warnings now fire strictly outside 1.3–2.5 (`< 1.3` / `> 2.5`), with an at-limit amber caution at exactly 1.3 or 2.5 (the classifier already treats the range as inclusive per DMM); new DMM two-tier minimum thickness (`getMinimumThickness`: 0.007", rising to 0.009" when height > 4.25" or length > 6"), and `classifyPiece` now returns **Non-Mailable / "Too Thin"** below the floor (branch ordered after Too Small, before Flat/Parcel) with a red warning; 3.5 oz warning reworded (weight forces flat pricing/preparation, not a classification change); `getWeightStatus` two-tier over 13 oz ("MM Flat only <16oz" for 13–16 oz, "Parcel" at ≥16 oz) with new amber (13–16) and red (≥16) warning bands. `generatePostalWarnings` extracted from `calculate.js` into `postal.js` (as `Postal.generatePostalWarnings`, calling `this.getMinimumThickness`) so the utils-only test suite can cover it — same extraction pattern as Defect 4's `selectDimensionDriver`. New test sections (Minimum Thickness, Postal Warnings) plus a stale 15 oz weight-status assertion flip; suite grew from 138 to 160 assertions. Remaining: **Defect 2** — postage restructure (scheduled with the July 12, 2026 Notice 123 refresh).

- **Housekeeping (2026-07-03):** Removed legacy `mailspec-assembly-tool-v2.4.html` (preserved in git history); exposed `perf_tab` in the seal picker with a "not FSM-compliant" warning label, wired into all three seal label maps (ui-controls `updateSealInfo`, bom-export, print sheet) — the Defect 6 perforated-tab prohibition in compliance.js is now reachable from the UI. Documented Perforated Tab in the Manual's seal quick-reference table and Tab Seals cards (grid now 2×2) with the DMM 201.3.14 prohibition note; fixed the Manual's incorrect DMM 201.3.15 citation to 201.3.14. No calculation or data changes; suite unchanged at 160 assertions.

- **Housekeeping (2026-07-04):** BOM text export (`generateBOMText()` in `bom-export.js`) now carries the self-mailer FSM compliance verdict — inserted between the seal block and `POSTAGE ESTIMATES`. It mirrors the print sheet's approach: reads the live `#compliancePanel` DOM (status via `.font-bold.text-sm`, messages via `.text-xs.text-slate-600 span:last-child`) rather than re-running evaluation, keeping the compliance panel the single source of truth. Emits nothing when no self-mailer is present (panel is `hidden`). Covers both Copy BOM and Export .txt since both call `generateBOMText()`. No compliance logic touched; suite unchanged at 160 (export block is DOM-reading UI outside the pure-function suite's scope). Also added a macOS section to `.gitignore` ignoring `.DS_Store`.

- **Defect 2 — Postage restructure + July 2026 Notice 123 refresh (2026-07-04):** The last open Now defect from the 2026-07-01 audit, bundled with the July 12, 2026 rate case. `app/data/postage.js` fully rewritten as a presort × entry matrix (`mmLetter`/`mmFlat`/`fcLetter`/`fcFlat` + `meta`) transcribed from the Final 6/15/2026 Notice 123 file (PRC Docket R2026-1, Order No. 9584); the July 2026 rate case removed ADC/AADC tiers in favor of **5-Digit / 3-Digit / Mixed** and raised the MM flat cap 16 oz → **20 oz**. `lookupPostage` rewritten as a pure `(pClass, weightOz) → {mm, fc, meta}` function returning presort-tier **ranges** (5-Digit → Mixed) with a `dscfBest`, not a single best-case cell: MM/FC letter ≤3.5 oz; MM flat piece-rate ≤4 oz and **piece+pound** >4 oz (`piece.none + perLb.none × oz/16`, entry-invariant piece portion); FC flat via the full 13-cell "weight not over N oz" table (`byOz[tier][ceil(oz)-1]`, clamped ≥0). Weight guards: MM flat **≥20 oz** dashes with a note (parity with `getWeightStatus` returning Parcel at ≥20 and the red warning band); FC flat >13 oz dashes with a note. Letter-dims pieces >3.5 oz **re-quote as a flat** (`requoted:true`) — the re-quote note is **appended** to (not clobbering) any existing quote note, so e.g. a 14 oz letter carries both "Over 13 oz — First-Class flat maximum." and the re-quote text. Null/Parcel/Non-Mailable classification → `{mm:null, fc:null}` so the card dashes. Card rendering in `calculate.js` (`renderPostageRow`/`renderPostageFooter` helpers + new `#postage*Sub`/`#postage*Note`/`#postageFooter` markup): range value, tier/entry/DSCF sub-line, amber-italic note line (reusing the tray-note `bg-amber-50`/`text-amber-700` dark pattern), and a `meta`-derived effective/verified footer that appends "(proposed)" in amber when `meta.status !== 'final'`. `getWeightStatus` and `Postal.generatePostalWarnings` moved to the 20 oz cap (band 13–20 amber, ≥20 red). The Manual rate table is now `#manualRateTable`, rendered from `POSTAGE` by `populateManualRates()` at init (full MM/FC letter + flat tiers, piece+pound block, 13-row FC flat table, range-disclosure + `meta` footer) — one source of truth, no hand-kept numbers left in `index.html` (the old contradictory "July 2025 / $0.336 / $0.531" static table is gone; the four stray "July 2025" prose spots and the BOM `POSTAGE ESTIMATES` header were updated/de-hardcoded too). BOM export's postage block now DOM-reads the live card (ranges + sub + visible notes + footer) instead of the removed `{marketingRate,firstClassRate}` shape; also fixed the doubled inch marks on the Mailing Dimensions line (Change 6 rider). Test suite: postage section rewritten against the matrix + weight-band assertions flipped to the 20 oz cap; **160 → 191 assertions, all green** (verified in a no-cache browser pass along with the card, re-quote, weight-band, manual-table, and BOM scenarios — the print spec sheet was **not** driven automatically per the `window.print()` freeze caveat above; it needs a manual visual check). A pre-commit grep of `index.html`/`tests/`/`app/` for old-cap prose (`16 oz`/`16oz`/`<16`/`under 16`) returned **nothing** — no lingering 16 oz text. Rates are Final but take effect **2026-07-12**; the card/manual/BOM footers disclose "eff. 7/12/2026," so deploying before then is honest (pieces entered pre-7/12 pay the superseded July 2025 rates, which the tool no longer shows).

- **v3.1 — Version bump + documentation refresh (2026-07-04):** Documentation-only release marking the close of the 2026-07-01 accuracy audit arc (all seven defects fixed 2026-07-02 → 2026-07-04). **No calculation logic, data values, or test assertions changed — suite stays at 191.** Changes: (1) `MAILSPEC_VERSION` `3.0` → `3.1`; new `MAILSPEC_BUILD_DATE = '2026-07-04'` and a combined `MAILSPEC_VERSION_FULL` (`'<ver> · <date>'`). Header, browser title, and mobile footer stay clean (`v3.1`, no date); the **Manual header and all console logs** show the full `v3.1 · 2026-07-04` string so staleness self-announces (same philosophy as the postage card's effective-date footer). **Version-string convention:** future releases touch **only** `MAILSPEC_VERSION` and `MAILSPEC_BUILD_DATE` — the static HTML fallbacks for `#manualVersion` ("MailSpec Manual") and `#mobileMenuVersion` ("MailSpec • Mobile Edition") were stripped of hardcoded version numbers so the init script is the single source of truth (both live inside modals that can't open before init runs). (2) What's New restructured — the orphan unversioned "July 2026 postage" card and the "v3.0 — Current Release" card collapse into one **"v3.1 — Current Release"** card gathering the whole arc (7 audit fixes, July 2026 Notice 123 final rates, MM flat cap 16→20 oz, live rate table, BOM gains, 191-assertion suite, build-date stamp); v3.0 demoted to a plain history card ("v3.0 — Review Polish"). (3) Manual accuracy sweep — new **"Reading the Postage Panel"** card in Tips & Features (range 5-Digit→Mixed, origin-entry/DSCF, amber re-quote & piece+pound notes, dash conditions, footer + "(proposed)" tag, points to the **Sources** panel for the full rate table); Testing section updated to **191 assertions** with expanded coverage tiles; mobile "Bottom Tab Navigation" corrected from a stale 4-tab grid (Build/Results/**Templates**/More) to the actual 3 tabs (Build/Results/More, More menu = Quick Start, Manual, Sources, Custom Stock, Dark Mode, Clear All). (4) **Rate-table location fix** — the live rate table (`#manualRateTable`) lives in the **Sources modal**, not the Manual; the What's New tile ("Live Manual Rate Table" → "Live Rate Table") and the new postage-panel card now reference the Sources panel (a cross-modal `#manual-getting-started` anchor was caught and removed). (5) `manifest.json` `name` "MailSpec Pro" → "MailSpec" (short_name and all else unchanged) — clears the last "Pro" straggler that survived the v3.0 de-branding. (6) Getting Started, Mobile, Quick Start, and compliance/seal docs verified accurate on read-through; a stale-prose grep (`16 oz`/`July 2025`/ADC/AADC/2013/old figures) returned nothing. CLAUDE.md version references bumped to 3.1.

Next: Phase 4.2+ (future phases). All seven 2026-07-01 audit defects are now closed.

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

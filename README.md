<p align="center">
  <img src="./readme-banner.svg" alt="MxInspector — DevTools for Mendix" width="100%">
</p>

# Mendix Inspector

> Chrome DevTools for Mendix — inspect widgets, view object data, debug page structure, profile performance, scan security, and audit accessibility. All from one dockable panel.

A Chrome/Edge extension that drops a dockable panel onto any running Mendix app. Open the Data Inspector to browse every entity, object, attribute, and association on the page with search, drill, and hover-highlight. Watch a live-updating list of the microflows and runtime operations your page is firing. Run a client-side security scan. Drag the panel around, double-click the header to minimize. Works with the Mendix 10+ and Mendix 11 React client. No server calls — reads directly from the client-side React Fiber tree.

![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-Extension-0078D7?logo=microsoftedge&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-Planned%20v0.3.0-lightgrey?logo=firefox&logoColor=white)
![Mendix 10](https://img.shields.io/badge/Mendix-10-0595DB)
![Mendix 11](https://img.shields.io/badge/Mendix-11-0595DB)
![Status](https://img.shields.io/badge/Status-Beta-orange)
![License](https://img.shields.io/badge/license-MIT-green)

<!-- 
![Mendix Inspector Demo](./docs/screenshots/inspector-demo.gif)
Uncomment when demo GIF is added
-->

---

## Features

### Data Inspector
Separate dockable panel (click the **Data** button at the bottom) that lists every entity, object, and attribute rendered or cached on the current page. Four sections: Page Parameters → Context Objects → On Page → Other Cached. Search/filter across everything. Hover an entity row → its containers pulse on the page with colored outlines plus floating labels. Click an attribute → value copies to clipboard. Dirty/new state badges on each object. System members shown separately with dashed border and italic values. **Auto-refreshes on SPA navigation** — no more clicking ↻ after every page change.

### Data Extraction
Extracts data directly from React Fiber (`memoizedProps`) for Mendix 10+. Uses the `Symbol(mxObject)` pattern to retrieve actual MxObject data from list items. Handles Mendix's nested value wrappers — Big.js decimals, wrapped primitives, `displayValue` patterns.

### Association Highlighting
Inside the Data Inspector's expanded object view, each association row shows a checkmark when the associated object is present. Click the row to highlight that object's element on the page; "Not on page" is shown when the associated object exists in memory but isn't currently rendered. Works with both reference (single) and reference set (multiple) associations.

### Parent Context
When an object's expanded view is open, the Data Inspector shows which DataView, ListView, or DataGrid contains that object — the parent's entity and object count — so you can trace data flow on deeply nested pages.

### Health Score & Insights
Single 0–100 score weighted across performance, accessibility, security, and nesting. Click the info icon for exact deductions. The Insights section ranks every issue found — hover one and the affected DOM pulses on the page, click to jump to the relevant section.

### Performance Tracking
Document-start perf tracker captures real first-load timings: Load, DOM nodes, request count, JS heap memory, FCP, LCP, TTFB, CLS. Thresholds color-coded against industry benchmarks. Rich tooltips on every metric explain what it measures and what to aim for.

### Data Sources (Live)
Lists every `/xas/` server call made during the current navigation, deduped by operationId (Mendix 10) or microflow name. Flags ×2+ repeat calls as likely nested data sources — the main Mendix perf anti-pattern. Shows inferred shape ("list ×50 sorted filtered") and average duration. **Autorefreshes every 5 seconds** while the section is open — only that section's HTML updates, not the whole panel, so open tooltips and scroll position survive. Per-navigation scoping so the list always reflects "this page", not every call since the tab opened.

### Security Scan
Client-side scan that surfaces what's reachable from the browser without hitting the backend:

- **CVE check** against the detected Mendix runtime version (9 CVEs currently tracked)
- **Mendix Constants secret detection** — pattern matching for JWT, AWS, GitHub, Slack, Stripe, Google, OpenAI/Anthropic, PEM, connection strings, credentialed URLs, plus a Shannon-entropy fallback. Values redacted by default with per-row reveal
- **Demo users** surfaced with role info; severity is environment-aware (red banner in production with score impact, yellow warning in dev)
- **Anonymous session** detection
- **Dev-mode indicators** — Mendix logger level, script bundles, React devtools hook
- **Writable sensitive entities** — flags if `System.User`, `Administration.Account`, or `System.FileDocument` are writable in the current session
- **Opt-in doc-endpoint probe** — click the button to HEAD `/rest-doc/`, `/odata-doc/`, `/ws-doc/`, `/debugger/` and color-code results

### Accessibility, Typography, CSS
Page-wide audits: WCAG level with specific failures, ARIA usage, landmarks, skip link, touch-target sizes (with EU EAA notice). Typography detection of font-family fallbacks and icon fonts. CSS analysis with per-metric tooltips.

### Style Inspector
Footer button (next to Data). Enters an element-picker mode — hover any element on the page to see its tag, Mendix/custom class chips, full typography (font, size, weight, line-height, letter-spacing, color with swatch), and CSS box (display, position, size, margin, padding) in one tooltip. Padding and margin are painted on the page as coloured overlays (orange = margin, green = padding), same mechanic as browser DevTools. Combines what used to be two separate inspect modes buried in the Typography and CSS sections into a single, discoverable footer button.

### PDF Export
One click to export the full report — health score, insights, all sections, metrics, security findings — into a shareable PDF.

### Strict Mode Compatible
Reads data from the client-side React Fiber tree — no server API calls. Works normally when Mendix Strict Mode is enabled, since Strict Mode only restricts `mx.data.get()` and similar client APIs.

### Non-Mendix-Site Friendly
Injects on every site (because custom Mendix domains exist and we need to catch bootstrap traffic), but auto-unhooks its XHR/fetch wrappers after 3 seconds on pages that don't look like Mendix. Third-party error trackers on unrelated sites won't attribute CSP or network errors to the extension.

---

## Installation

1. Download the latest release ZIP from [Releases](../../releases)
2. Unzip to a local folder
3. Open Chrome → `chrome://extensions/` (or Edge → `edge://extensions/`)
4. Enable **Developer mode** (toggle in top-right)
5. Click **Load unpacked**
6. Select the `src` folder from the unzipped release

> **Firefox support is on the v0.3.0 roadmap.** The extension uses `world: 'MAIN'` injection, which Firefox supports from v128+ — porting needs a separate manifest for Firefox's MV3 flavor.

---

## Usage

1. Navigate to any Mendix application
2. Click the **Mendix Inspector** icon in your Chrome toolbar
3. The panel slides in from the right — drag the header to reposition, double-click to minimize
4. Browse sections: Performance, Data Sources (auto-refreshing), Security, Accessibility, Typography, CSS, Network, Session
5. Click the **Data** button at the bottom to open the Data Inspector — search and drill into every entity / object / attribute on the page
6. Hover entity rows in the Data Inspector → the matching container pulses on the page
7. Click the **Style** button at the bottom to enter element-picker mode — hover any element to see its font, classes, and box model in one tooltip. Covers both typography and CSS.
8. Click **PDF** to export a shareable report
9. Press **ESC** to close the Data Inspector, Style Inspector, or any other picker mode

### Keyboard Shortcuts
- `Esc` — close Data Inspector / Style Inspector / any active picker mode
- `Double-click` on panel header — minimize / restore

### Console Commands
```javascript
// Check if data extractor is loaded
window.__MxDataExtractor

// Extract data from a specific element
window.__MxDataExtractor.extractDataFromElement(
  document.querySelector('.mx-name-yourWidget')
)

// Scan all data containers on the page
window.__MxDataExtractor.scanAllDataContainers()

// Open Data Inspector programmatically
window.__MxDataPanel.open()

// Peek at captured perf data
window.__mxiPerf.getSummary()
```

---

## Known Limitations (Beta)

- **Tested on Mendix 10 & 11 React client.** Should work on any React-based Mendix version. Mendix 11's DataGrid2 highlighting is fully supported as of v0.2.1 (the row element uses `display: contents`, which needs a special geometry pass — handled). If you run it on late Mendix 9 React apps and hit rough spots, let me know.
- **Not tested against the Dojo client (Mendix 7–9).** The codebase still has Dojo fallback paths from earlier versions but I haven't recently exercised them. Expect rough edges.
- **Mendix 10 microflow names are opaque.** The React client uses runtime operation IDs over the wire — real microflow names aren't resolvable client-side. The Data Sources section shows the hash + inferred shape instead.
- **Input widgets** — click events sometimes intercepted by tooltip libraries.
- **List items** — may show first item instead of clicked item in some edge cases.
- **Doc-endpoint probe** fires 4 HEAD requests to your own app on click; gated behind an explicit button so nothing goes out automatically.

---

## Roadmap

### v0.3.0
- **Live Attribute Editing** — edit client-side mxObject values directly in the Data Panel to test dynamic styling, conditional visibility, and widget behaviour without server round-trips or database edits. Opening an attribute makes it editable per type: String (text input), Integer/Long/Decimal (number input), Boolean (true/false toggle), Enumeration (dropdown populated from the enum's known values), DateTime (picker). AutoNumber, Hashed String, Binary, computed attributes, and associations stay read-only in v1. Uses `mxObject.set()` only — **never** `.commit()` — so mutations are purely client-side and revert on page reload; nothing touches the server. Each entity header gets two icon buttons top-right: a toggle to show/hide the orange "EDITED" pills next to mutated attributes (visual noise control — doesn't affect tracking), and a Revert All button that restores every attribute on that entity to its snapshotted original value. Built for the "what does the UI look like if this boolean were false" debugging workflow where today you'd have to edit the DB, refresh, observe, repeat
- **Firefox support** — port to Firefox's WebExtensions flavor of Manifest V3 (second manifest, `browser_specific_settings`, event-page background instead of service worker). Requires Firefox 128+ for `world: 'MAIN'`. Submit to AMO
- **Edge Add-ons Store listing** — the existing build already runs unpacked in Edge (it's Chromium); this is just the store submission so Edge users get one-click install
- **Visual impairment simulator** — overlay the page through filters that approximate how users with common visual conditions experience it: color-blindness (protanopia, deuteranopia, tritanopia, achromatopsia), low vision (various acuity levels), cataracts, glaucoma (peripheral vision loss), and macular degeneration (central vision loss). Implemented via SVG filters on an overlay layer, toggleable per type
- **Motor impairment simulator** — cursor-behaviour overlays that approximate reduced motor control: tremor simulation (adds jitter to the pointer), reduced pointer precision (dead-zone around target centre), slower click-to-activation timing, and a "hover trap" highlight for elements smaller than the WCAG 2.2 24×24 minimum target size. Helps you FEEL the gap between "works for me" and "works for a user with Parkinson's or essential tremor"
- **Enhanced CSS Inspector** — show CSS variables with computed values (e.g. `color: #FF5A5A` from `var(--brand-danger)`)
- **Association deep inspection** — click to fetch and display associated object's attributes
- **Widget Performance Profiler** — measure render time per widget, identify slowest widgets
- **Conditional visibility reasons** — show which elements are hidden and why
- **Export to JSON** — alongside PDF
- **Mendix 7–9 Dojo verification** — test, document, fix

### v0.4.0+
- **Pixel Measure Tool** — crosshair icon, drag to measure X/Y coordinates and distances
- **Color Picker Tool** — hover with zoomed-in view (Figma-style), click to pick, shows hex + CSS variable name, lists all page colors
- **Compare/Snapshot Mode** — save page state, compare before/after, show diff ("DOM increased by 200 nodes")
- **Dark Mode Toggle** — switch inspector UI between dark and light theme, persist preference
- **Custom Thresholds** — configure warning levels ("Warn at 1500 DOM nodes instead of 2000")
- **Page History** — track metrics across page navigations ("This page was faster last time")
- **Settings persistence** — remember panel position and preferences via `chrome.storage`
- **Additional secret patterns** for the security scanner (user contributions welcome)

### v1.0.0+
- **Chrome Web Store release**
- **DevTools panel integration** — dedicated tab in Chrome DevTools instead of overlay
- **Performance profiling** — track which widgets cause re-renders
- **Entity relationship diagram** — visualize associations between entities on page

### Experimental Ideas
- **Safari support** — would require wrapping the extension in a native macOS app via Xcode + `xcrun safari-web-extension-converter`, plus a paid Apple Developer account. Only worth doing if there's actual demand from Mendix devs on Safari, which so far there isn't
- **Microflow tracer** — highlight which microflows were triggered by an action (Mendix 10 limits apply — we'd only see opaque op IDs)
- **Access rule checker** — show which access rules apply to current user for displayed entities
- **Widget dependency tree** — show which widgets depend on which data sources
- **Time travel debugging** — record state changes and step through them

---

## Changelog

### 0.2.3-beta
Discoverability pass. User-session recordings showed people consistently missing the inspect tools — the "Inspect Mode" button was buried inside the Typography section and the "CSS Inspector" button was inside the CSS Analysis section. If you didn't know they were there and didn't expand both sections, you never saw them. This release promotes inspect to a first-class footer button next to Data and PDF, and consolidates the two old paths.

**Style button in footer** — new `Style` button sits between `Data` and `PDF` in the panel footer. Matches the same short-label rhythm (all three are one word, four-to-five characters). Secondary button style by default; flips to accent-yellow `Style ON` while the picker is active. Title attribute explains the scope on hover so users don't have to guess what "Style" means in practice.

**Combined inspect tooltip** — one hover handler replaces the two old ones (`toggleInspectMode` for typography + `toggleCssInspectMode` for CSS). The new tooltip leads with the tag + Mendix/custom class chips (the "what am I looking at" anchor), then a Typography block (font family, size, weight, line-height, letter-spacing, color with swatch), then a CSS Box block (display, position, size, margin, padding). The box-model overlay — orange for margin, green for padding, painted directly on the page — is retained from the old CSS inspector since it's genuinely useful and doesn't have a browser DevTools equivalent that works well on Mendix-rendered pages.

**Typography and CSS sections kept as page-wide audits** — only the inline inspect buttons were removed. The static analysis (primary font, fonts-used count, icon-font detection, size/weight distributions, stylesheet/rule/!important counts, design-system vs custom class split) is unchanged. The audits answer "is something wrong across this page"; the Style picker answers "why is *this element* styled like this." Different jobs, both kept.

**Legacy inspect modes kept functional but dormant** — `toggleInspectMode` and `toggleCssInspectMode` are still present and callable (ESC handler, `window.__mxi*` globals, main-panel cleanup paths all still reference them) but their buttons no longer exist in the rendered panel, so they're inert in normal use. Every `btn.style.*` write inside them is null-guarded so ghost calls don't throw. Kept rather than deleted to avoid breaking any custom integrations or debug console workflows that rely on the old globals.

**Banner fix** — `readme-banner.svg` was rendering the pixel 'e' in Times on GitHub because the pixel font wasn't embedded in the SVG. Added the `GeistPixelSquare` `@font-face` declaration inline (base64, same woff2 as the website uses). While at it, wrapped every letter in a per-letter `<tspan class="lttr">` and added a CSS keyframe animation that rotates which letter is in pixel form — mirrors the `.lttr.glitch` mechanic from mxinspector.com, but declarative since GitHub strips `<script>` from SVG README embeds.

**Font polish** — swapped the panel's primary sans from Inter to **Geist** (loaded from Google Fonts with Inter kept as a fallback, near-identical metrics so no layout drift), promoted **Geist Mono** as the preferred monospace for every technical reading (entity names, datasource identifiers, attribute keys/values, opIds, URL displays, tabular numeric metrics — all 19 monospace declarations across `inspector.js` and 1 in `mxi-data-panel.js`). An earlier iteration of this pass also experimented with a GeistPixelSquare pixel-font accent on the `MxInspector` title (rotating per-letter glitch) and on the big health-score number; both landed in review as reading more distracting than characterful, so both were reverted and the embedded `@font-face` (38KB base64 woff2) dropped from the CSS. The Geist/Geist Mono swap is the entire font story that ships with 0.2.3-beta.

**Green refresh** — bumped the success/health-good green from the muted `#2D9C5E` (forest) to `#3DDC97` (bright mint). Kept the same teal-lean hue family (~150°) that the original was in but pushed saturation and lightness so it genuinely pops on the dark card background. Applied consistently: the base variable, the score circle when score ≥ 80, the session Online status, the "No security issues detected" success cards, the `.mxi-insight.success` dots, the copy-button confirmation flash, and all associated `rgba(45,156,94,X)` tinted backgrounds/borders were rewritten to `rgba(61,220,151,X)` to keep tinted fills in the same hue family as the solid fill.

**perf-tracker.js bug fixes** — two non-Mendix-site error patterns surfaced while the 0.2.2 beta was in the wild:

- `Uncaught TypeError: url.indexOf is not a function` on sites that call fetch with a non-string URL (observed on eu.eastpak.com). `looksLikeMxCall` and the fetch-wrapper URL extractor both assumed `url` was a string; now both defensively coerce via `String(url)` with a try/catch fallback. Defense-in-depth — one check would have been enough to fix the symptom but two makes the invariant explicit at both boundaries.
- `Uncaught (in promise) TypeError: Failed to fetch` stack-attributed to perf-tracker.js:675 on CSP-strict sites (Google AI Studio, PayPal, GitHub, TransIP). The rejections aren't caused by the extension — the sites' own ad/analytics fetches get blocked by CSP and the promise rejects normally — but our fetch wrapper frame sits in the call chain, so unhandled rejections show the extension's stack trace and it looks guilty. Detection window halved from 3000ms to 1500ms, which cuts the exposure window in half. 1500ms is still comfortably long enough for any Mendix runtime to boot — `mxclientsystem` script tag lands well before that even on cold cache. Can't eliminate stack attribution entirely while wrapping fetch (inherent to the wrapping pattern), but the noise floor drops substantially.

### 0.2.2-beta
Small patch focused on two reliability fixes that surfaced after 0.2.1 was in real use.

**Double-click-to-minimize** — the collapse gesture on the main panel header was intermittently not firing, especially after a few open/close cycles. Root cause: the drag handler called `e.preventDefault()` on *every* mousedown in the header, not just once a drag actually began. That `preventDefault` interacted with focus/selection state accumulated across earlier clicks and occasionally broke the browser's internal pairing of two mousedowns into a `dblclick`. Rewrote the gesture with the same pattern the Data Inspector drag already uses: mousedown only marks the drag as "pending" with no preventDefault; `preventDefault` kicks in only once the cursor has moved past a 4px threshold, at which point the intent is clearly a drag and suppressing text selection is the right call. Pure clicks and double-clicks never hit preventDefault at all.

**Accessibility contrast false positives** — the A11y audit was flagging obviously-readable elements (like white text on a solid-blue primary button) as contrast failures. Five compounding issues, all fixed:
- **CSS Color Level 4 `color()` notation wasn't parsed.** Mendix Atlas and many modern themes now declare colours in srgb space, producing computed values like `color(srgb 0.119 0.232 0.718)` instead of `rgb(30, 59, 183)`. The old parser only matched `rgb()`/`rgba()`, returned null for everything else, and `getEffectiveBg` interpreted that as "no background, keep walking up" — falling through to the composite-over-white fallback and reporting white-on-white (1:1, catastrophic fail) for the primary-blue button. Parser now handles `color(srgb …)`, `color(srgb-linear …)`, `color(display-p3 …)`, hex shorthand, and the `none` keyword. This was the *actual* fix for the Create Order button false positive — the four items below are also real bugs we fixed along the way, but wouldn't have been enough on their own.
- **Gradient backgrounds were invisible to the check.** Themes that paint buttons with `background: linear-gradient(...)` and no solid `background-color` made `getComputedStyle` report `rgba(0,0,0,0)`. The walk-up passed through, hit the page's white background, and measured white-on-white. Now we detect `backgroundImage !== "none"` on any ancestor and bail out — can't measure contrast against a gradient reliably, so we don't flag it.
- **No alpha compositing.** The old code used a crude `alpha >= 0.5` threshold (accept) / `< 0.5` (ignore). Now translucent layers are properly alpha-blended via `out = src*src.a + dst*(1-src.a)`, so `rgba(255,0,0,0.3)` on white correctly composites to pale pink, not "red" and not "white".
- **Children and parents double-measured.** Both a `<button>` and its inner text-less icon `<span>` would be visited, potentially producing inconsistent results. Now: if an element has no direct text-node child, skip it and let the actual text containers handle their own check.
- **Floating-point wobble on the 4.5:1 boundary.** Pairs that should read as 4.5 sometimes compute to 4.497 and got flagged. Added a 0.1 tolerance — real failures clock in at 3.x or lower, so this only silences false positives.

### 0.2.1-beta
First patch on top of the 0.2.0 beta. Focus was on polish, Mendix 11 DataGrid2 support, and the "stuck with old data" problem on navigation.

**Mendix 11 DataGrid2 highlighting** — previously hover/click on an object in the Data Inspector would either do nothing visible or paint a "datagrid tetris" block across the whole grid. Three compounding bugs, all fixed:
- `scanAllDataContainers` used substring class matching (`[class*="widget-datagrid"]`) which picked up the outer container *plus* all 13 internal parts (`widget-datagrid-top-bar`, `widget-datagrid-content`, `widget-datagrid-grid-body`, etc.) as separate "containers". Each then produced phantom row elements. Switched to exact class-token matching (`.widget-datagrid`) + outermost-wins dedup
- `findRowElementsForContainer` couldn't disambiguate Mendix 11 rows — they render as just `<div class="tr" role="row">` with no "header"/"datagrid-row" hook. Rewrote around `[role="row"][aria-selected]` (the one reliable data-row disambiguator) plus a body-rowgroup scope, with `closest()`-based nested-container guard
- Mendix 11's `.table .tr { display: contents }` means the row element has no geometry — `getBoundingClientRect()` returns 0×0, so the overlay hid itself. Added a child-rect union fallback (`measureTarget()`) in both overlay systems

**Data Inspector auto-refresh on SPA nav** — no more clicking ↻ after page changes. Four triggers funnel into a two-phase refresh (500ms + 1500ms, second catches slow-loading pages):
- `hashchange` — classic client / deep-link URLs
- `popstate` — browser back/forward + some pushState routers  
- 1.5s poll on `mx.ui.getContentForm().path` — catches React-router pushState nav
- MutationObserver on the Mendix page container with 400ms debounce / 15-node threshold — catches nav where URL doesn't change but content does (same-path re-renders, popups, tab switchers)

**Empty-page clearing** — navigating to a page with no data containers now shows the "No data found" placeholder instead of leftover Mendix client-cache entries from the previous page. Mendix's `mx.data.objectCache` persists across pages; when the new page has no own data and no page params, we now suppress the cached section too.

**Polish**:
- Insight info button on hover/click — dark grey background with a severity-coloured border (yellow for warning, red for error, blue for info, green for success) instead of an always-yellow background that became unreadable and flipped the danger colour
- Section headers — hover background now respects the 16px rounded corners
- Persistent (pinned) highlight fades out when you hover a different object instead of stacking two highlights on the page. Same-set check keeps the pin when hovering back over the expanded row

**Non-Mendix-site friendliness** — perf-tracker still injects on every site (for custom-domain Mendix apps) but auto-unhooks its XHR/fetch wrappers after 3 seconds if it hasn't detected any Mendix signatures (`/xas/`, `_mxprotocol`, `window.mx`, `mxclientsystem` script). Third-party error trackers on non-Mendix pages no longer see our frame in their stack traces.

### 0.2.0-beta
- **Data Inspector** — separate dockable panel with entity drill (Page Params → Context → On Page → Cached), search/filter, pulse-highlight on hover, click-to-copy attribute values, dirty/new state badges, system members surfaced with distinct styling, column highlighting for grid cells
- **Data Sources section** — real `/xas/` call capture (deduped by operationId on Mendix 10, microflow name on classic), inferred shape badges ("list ×50 sorted"), repeat-count coloring for nested-data-source detection, writable-call flag
- **Live autorefresh** — Data Sources section updates every 5 seconds while open, surgical innerHTML swap (no whole-panel flicker), open tooltips and scroll position survive
- **State preservation on refresh** — scroll position, open sections, expanded insights, and open detail panels all restored after the inspector rebuilds
- **Health score** — single 0–100 number across performance, accessibility, security, and nesting, with per-deduction breakdown
- **Performance tracker** — `document_start` injection for accurate first-load timings (Load, DOM, Requests, Memory, FCP, LCP, TTFB, CLS). Per-navigation buckets for SPA page changes — only resets on real Mendix page path changes, not on title/query/hash drift (previously wiped the tracker mid-session on any live update)
- **Security scanner** — 9 Mendix runtime CVEs tracked. Pattern-matches constants against JWT/AWS/GitHub/Slack/Stripe/Google/OpenAI/Anthropic/PEM/connection-string/credentialed-URL plus Shannon-entropy fallback. Demo users, anonymous session, dev-mode indicators, writable sensitive entities. Environment-aware scoring (demo users critical in prod, expected in dev). Opt-in endpoint probe for `/rest-doc/`, `/odata-doc/`, `/ws-doc/`, `/debugger/`
- **Rich metric tooltips** — structured `{what, aim, details}` on every metric, matching the Performance Score info-tooltip style
- **Accessibility audit** — WCAG level detection with specific failure list, ARIA/landmarks/skip-link/main checks, small-touch-target warnings (WCAG 2.5.5 AAA), EU EAA notice
- **Typography & CSS analysis** — font-family fallback detection (skipping generic fallbacks), icon-font labeling, specificity analysis
- **Pluggable widgets** — non-Mendix-by-default with "show all" toggle
- **PDF export** — full report: health/a11y/security scores, session info, insights, performance (including TTFB & CLS), widgets, runtime Data Sources with per-call detail and writes, Conditional, Accessibility, Typography, CSS, Security (CVEs + Mendix constants secret scan + demo users + anonymous session + dev-mode + writable sensitive entities), and Network
- **Locale humanization** — `en_US` → "English US", `nl_NL` → "Dutch", etc. via a 50-code map with `Intl.DisplayNames` fallback
- **Meta pills** — Profile (Desktop/Phone/Tablet · Responsive/PWA), default locale, translation count
- **Phosphor icon set** — all user-visible emoticons replaced with matching Phosphor icons for visual consistency
- **Grey chip-style buttons** — info & refresh buttons in section headers match the insight info-button look (`.mxi-chip-btn`)
- Fix: Data Inspector drawer no longer scroll-locks the main panel on close
- Fix: Data Inspector drawer no longer snaps to top on open/close
- Fix: Constants section shows all (flagged + plain), with per-row reveal on flagged values
- Fix: Demo users list no longer truncates at 6 (shows all)

### 0.1.0-beta
- Widget Inspector with hover tooltips and click-to-expand panels
- React Fiber data extraction for Mendix 10+
- Dojo client fallback for Mendix 7-9
- Symbol(mxObject) extraction from list items
- Full attribute display with value unwrapping
- Association display with eye icon highlighting
- Parent container detection
- Boolean styling (green=true, orange=false)
- Draggable/resizable expanded panel
- ESC key handling
- Page metrics and performance tracking

### 0.0.3-alpha
- `findClickedListItem()` for specific list item detection
- Window-level input interceptor for stubborn inputs
- Enhanced debug logging

### 0.0.2-alpha
- Enhanced Object Inspector with attributes and associations
- Parent context section
- `getObjectAttributes()` with Symbol(mxObject) pattern

### 0.0.1-alpha
- Initial Chrome extension structure
- Basic widget inspection
- Page health score

---

## File Structure

```
mendix-inspector/
├── src/
│   ├── manifest.json
│   ├── background.js                 # Service worker — injects scripts on icon click
│   ├── content/
│   │   ├── inspector.js              # Main UI — panel shell, sections, PDF export (~5,511 lines)
│   │   ├── mx-data-extractor.js      # React Fiber + Dojo data extraction (~1,104 lines)
│   │   ├── mxi-layer-stack.js        # Layer-stack module (currently dormant — click-through behaviour didn't land cleanly, kept for future reference)
│   │   ├── mxi-data-panel.js         # Data Inspector (search, drill, pulse highlight, SPA-nav auto-refresh) (~2,726 lines)
│   │   ├── mxi-security.js           # Security scanner (secret patterns, CVEs, endpoint probe) (~563 lines)
│   │   └── perf-tracker.js           # document_start perf + network hook + SPA nav detection + non-Mendix-site auto-unhook (~935 lines)
│   └── icons/
├── releases/
│   ├── mendix-inspector-v0.2.0-beta.zip
│   ├── mendix-inspector-v0.2.1-beta.zip
│   ├── mendix-inspector-v0.2.2-beta.zip
│   └── mendix-inspector-v0.2.3-beta.zip
└── docs/
    └── screenshots/
```

---

## Development

### Making Changes

Pretty much everything behaves the same way: edit the file, click the refresh icon on the MxInspector tile at `chrome://extensions/`, reload the Mendix page. The one exception is `perf-tracker.js` — it injects at `document_start` so Chrome caches it aggressively. When editing that file, do a hard-reload (Ctrl+Shift+R) to force a fresh copy into the page.

### Debugging
Open DevTools on the Mendix page (F12) and check Console for `[MxInspector]` and `[MXI]` prefixed logs. The inspector runs in page context via `world: 'MAIN'` — full access to `window.mx`, `mx.session`, and React internals.

Useful globals the extension exposes (all under `window.*`):
- `__MxDataExtractor` — React Fiber extraction API
- `__MxDataPanel` — Data Inspector controller (open/close/refresh/focus)
- `__mxiPerf` — perf tracker buffer and `getSummary()`
- `__MxSecurity` — security scanner; call `.detect()` to see raw results
- `__mxInspectorRun` — full re-run of the inspector (what refresh() triggers)

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

Built by [Tim Maurer](https://timothymaurer.nl)

# Mendix Inspector

> Chrome DevTools for Mendix — inspect widgets, view object data, debug page structure, profile performance, scan security, and audit accessibility. All from one dockable panel.

A Chrome/Edge extension that drops a dockable panel onto any running Mendix app. Open the Data Inspector to browse every entity, object, attribute, and association on the page with search, drill, and hover-highlight. Watch a live-updating list of the microflows and runtime operations your page is firing. Run a client-side security scan. Drag the panel around, double-click the header to minimize. Works with the Mendix 10+ React client. No server calls — reads directly from the client-side React Fiber tree.

![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-Extension-0078D7?logo=microsoftedge&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-Planned%20v0.3.0-lightgrey?logo=firefox&logoColor=white)
![Mendix 10](https://img.shields.io/badge/Mendix-10-0595DB)
![Status](https://img.shields.io/badge/Status-Beta-orange)
![License](https://img.shields.io/badge/license-MIT-green)

<!-- 
![Mendix Inspector Demo](./docs/screenshots/inspector-demo.gif)
Uncomment when demo GIF is added
-->

---

## Features

### Data Inspector
Separate dockable panel (click the **Data** button at the bottom) that lists every entity, object, and attribute rendered or cached on the current page. Four sections: Page Parameters → Context Objects → On Page → Other Cached. Search/filter across everything. Hover an entity row → its containers pulse on the page with colored outlines plus floating labels. Click an attribute → value copies to clipboard. Dirty/new state badges on each object. System members shown separately with dashed border and italic values.

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

### PDF Export
One click to export the full report — health score, insights, all sections, metrics, security findings — into a shareable PDF.

### Strict Mode Compatible
Reads data from the client-side React Fiber tree — no server API calls. Works normally when Mendix Strict Mode is enabled, since Strict Mode only restricts `mx.data.get()` and similar client APIs.

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
7. Click **PDF** to export a shareable report
8. Press **ESC** to close the Data Inspector

### Keyboard Shortcuts
- `Esc` — close Data Inspector
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

- **Only tested on Mendix 10 React client.** Should work on any React-based Mendix version, but not verified yet on Mendix 11 or on late Mendix 9 apps running React. If you run it on those versions, let me know what you see.
- **Not tested against the Dojo client (Mendix 7–9).** The codebase still has Dojo fallback paths from earlier versions but I haven't recently exercised them. Expect rough edges.
- **Mendix 10 microflow names are opaque.** The React client uses runtime operation IDs over the wire — real microflow names aren't resolvable client-side. The Data Sources section shows the hash + inferred shape instead.
- **Input widgets** — click events sometimes intercepted by tooltip libraries.
- **List items** — may show first item instead of clicked item in some edge cases.
- **Doc-endpoint probe** fires 4 HEAD requests to your own app on click; gated behind an explicit button so nothing goes out automatically.

---

## Roadmap

### v0.3.0
- **Firefox support** — port to Firefox's WebExtensions flavor of Manifest V3 (second manifest, `browser_specific_settings`, event-page background instead of service worker). Requires Firefox 128+ for `world: 'MAIN'`. Submit to AMO
- **Edge Add-ons Store listing** — the existing build already runs unpacked in Edge (it's Chromium); this is just the store submission so Edge users get one-click install
- **Accessibility simulator** — overlay the page through color-blindness (protanopia, deuteranopia, tritanopia) and other visual-impairment filters (low vision, cataract simulation) so you can see what non-sighted-ideal users would see
- **Enhanced CSS Inspector** — show CSS variables with computed values (e.g. `color: #FF5A5A` from `var(--brand-danger)`)
- **Association deep inspection** — click to fetch and display associated object's attributes
- **Widget Performance Profiler** — measure render time per widget, identify slowest widgets
- **Conditional visibility reasons** — show which elements are hidden and why
- **Export to JSON** — alongside PDF
- **Mendix 11 + Mendix 7–9 Dojo verification** — test, document, fix

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
│   │   ├── inspector.js              # Main UI — panel shell, sections, PDF export (~4,975 lines)
│   │   ├── mx-data-extractor.js      # React Fiber + Dojo data extraction (~1,029 lines)
│   │   ├── mxi-layer-stack.js        # Layer-stack module (currently dormant — click-through behaviour didn't land cleanly, kept for future reference)
│   │   ├── mxi-data-panel.js         # Data Inspector (search, drill, pulse highlight) (~2,522 lines)
│   │   ├── mxi-security.js           # Security scanner (secret patterns, CVEs, endpoint probe) (~563 lines)
│   │   └── perf-tracker.js           # document_start perf + network hook + SPA nav detection (~857 lines)
│   └── icons/
├── releases/
│   └── mendix-inspector-v0.2.0-beta.zip
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
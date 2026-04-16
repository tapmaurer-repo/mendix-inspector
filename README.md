# Mendix Inspector

> Chrome DevTools for Mendix — inspect widgets, view object data, examine associations, and debug page structure.

A Chrome extension that lets you hover over any widget in a running Mendix app to see its entity, attributes, associations, and parent context. Click to expand full details. Works with Mendix 10+ React client and Mendix 7-9 Dojo client. No server calls — reads directly from the client-side React Fiber tree.

![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Mendix 10+](https://img.shields.io/badge/Mendix-10+-0595DB)
![Mendix 7-9](https://img.shields.io/badge/Mendix-7--9-0595DB)
![Status](https://img.shields.io/badge/Status-Beta-orange)
![License](https://img.shields.io/badge/license-MIT-green)

<!-- 
![Mendix Inspector Demo](./docs/screenshots/inspector-demo.gif)
Uncomment when demo GIF is added
-->

---

## Features

### Widget Inspector
Hover over any widget to see a tooltip with entity name, object count, and attribute preview. Click to open an expanded panel with full attribute and association details. The panel is draggable and resizable. Press ESC to close the panel or exit inspect mode.

### Data Extraction
Extracts data directly from React Fiber (`memoizedProps`) for Mendix 10+, with Dojo fallback for Mendix 7-9. Uses the `Symbol(mxObject)` pattern to retrieve actual MxObject data from list items. Handles Mendix's nested value wrappers — Big.js decimals, wrapped primitives, `displayValue` patterns.

### Association Highlighting
Click the eye icon next to any association to highlight the associated element on the page. Shows "Not on page" if the associated object isn't rendered. Works with both reference (single) and reference set (multiple) associations.

### Parent Context
Shows which DataView, ListView, or DataGrid contains the current widget. Displays the parent's entity and object count. Helps you understand the data flow on complex pages.

### Page Analysis
Widget counts for DataViews, ListViews, DataGrids, TemplateGrids. Nesting depth warnings for deeply nested data containers. Conditional visibility detection. Data source type breakdown (database, microflow, nanoflow, association).

### Strict Mode Compatible
Reads data from the client-side React Fiber tree — no server API calls. Works normally when Mendix Strict Mode is enabled, since Strict Mode only restricts `mx.data.get()` and similar client APIs.

---

## Installation

1. Download the latest release ZIP from [Releases](../../releases)
2. Unzip to a local folder
3. Open Chrome → `chrome://extensions/`
4. Enable **Developer mode** (toggle in top-right)
5. Click **Load unpacked**
6. Select the `src` folder from the unzipped release

---

## Usage

1. Navigate to any Mendix application
2. Click the **Mendix Inspector** icon in your Chrome toolbar
3. The inspector panel opens at the bottom of the page
4. Click **Inspect** (magnifying glass) to enter widget inspection mode
5. Hover over widgets to see data tooltips
6. Click a widget to open the full detail panel
7. Press **ESC** to close

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
```

---

## Known Limitations (Beta)

- **Page parameters** — detection not fully working in React client (returns empty)
- **Input widgets** — click events sometimes intercepted by tooltip libraries
- **List items** — may show first item instead of clicked item in some edge cases
- **Parent context** — sometimes shows null incorrectly

---

## Roadmap

### High Priority (v0.2.0)
- **X-Ray Mode** — overlay dimming the page, showing colored overlays on all data containers with entity labels
- **Data Panel** — persistent tree view of page params, DataViews, ListViews, DataGrids with object counts and attribute preview
- **Bidirectional highlighting** — click panel → highlight on page, click page → highlight in panel
- **Improved list item detection** — fix showing first item instead of clicked item
- **Page parameter fixes** — proper detection in React client
- **Input widget click fixes** — handle tooltip library event interception
- **Parent context fixes** — currently shows null incorrectly

### Medium Priority (v0.3.0)
- **Enhanced CSS Inspector** — show CSS variables with computed values (e.g. `color: #FF5A5A` from `var(--brand-danger)`)
- **Association deep inspection** — click to fetch and display associated object's attributes
- **Search/filter in Data Panel** — find entities or attributes by name
- **Copy buttons** — copy GUID, entity name, attribute values to clipboard
- **Conditional visibility indicator** — show which elements are hidden and why
- **Widget Performance Profiler** — measure render time per widget, identify slowest widgets

### Lower Priority (v0.4.0+)
- **Pixel Measure Tool** — crosshair icon, drag to measure X/Y coordinates and distances
- **Color Picker Tool** — hover with zoomed-in view (Figma-style), click to pick, shows hex + CSS variable name, lists all page colors
- **Compare/Snapshot Mode** — save page state, compare before/after, show diff ("DOM increased by 200 nodes")
- **Dark Mode Toggle** — switch inspector UI between dark and light theme, persist preference
- **Custom Thresholds** — configure warning levels ("Warn at 1500 DOM nodes instead of 2000")
- **Export to JSON** — copy full inspection data as JSON
- **Minimize Mode** — collapse inspector to floating button, expand on click
- **Page History** — track metrics across page navigations ("This page was faster last time")
- **Settings persistence** — remember panel position and preferences via `chrome.storage`

### Future (v1.0.0+)
- **Chrome Web Store release**
- **DevTools panel integration** — dedicated tab in Chrome DevTools instead of overlay
- **Network request monitoring** — show Mendix XAS calls with request/response data
- **Performance profiling** — track which widgets cause re-renders
- **Entity relationship diagram** — visualize associations between entities on page

### Experimental Ideas
- **Microflow tracer** — highlight which microflows were triggered by an action
- **Access rule checker** — show which access rules apply to current user for displayed entities
- **Widget dependency tree** — show which widgets depend on which data sources
- **Time travel debugging** — record state changes and step through them
- **Strict Mode detector** — detect and display if Strict Mode is enabled

---

## Changelog

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
│   ├── background.js
│   ├── content/
│   │   ├── inspector.js          # Main UI (~2,800 lines)
│   │   ├── mx-data-extractor.js  # Data extraction (~850 lines)
│   │   └── perf-tracker.js       # Performance monitoring
│   └── icons/
├── releases/
│   └── mendix-inspector-v0.1.0-beta.zip
└── docs/
    └── screenshots/
```

---

## Development

### Making Changes
| What Changed | How to Reload |
|--------------|---------------|
| `inspector.js` | Click 🔄 on `chrome://extensions/`, refresh page |
| `mx-data-extractor.js` | Click 🔄 on `chrome://extensions/`, refresh page |
| `background.js` | Click 🔄 on `chrome://extensions/` |
| `manifest.json` | Click 🔄 on `chrome://extensions/` |

### Debugging
Open DevTools on the Mendix page (F12) and check Console for `[MxInspector]` prefixed logs. The inspector runs in page context via `world: 'MAIN'` — full access to `window.mx` and React internals.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

Built by [Tim Maurer](https://timothymaurer.nl)
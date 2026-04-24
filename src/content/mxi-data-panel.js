/*!
 * MxInspector - Data Panel v2 (v0.2.0)
 *
 * Self-contained enhanced Data Panel with:
 *   - Search across entities / attribute names / attribute values
 *   - Progressive drill: Entities → Objects → Attributes
 *   - Bidirectional highlighting (hover panel -> pulse page element)
 *   - Refresh button (re-scans without reopen)
 *   - Bridge hook: focus(element) unfolds the matching entry
 *
 * Exposes window.__MxDataPanel with:
 *   open(), close(), toggle(), isOpen(), refresh(), focus(el), setQuery(q)
 *
 * Does NOT depend on inspector.js closure-scoped state.
 * Depends on: window.__MxDataExtractor.
 */
(function () {
  'use strict';
  if (window.__MxDataPanel) return;

  var PANEL_ID           = 'mxi-data-panel-v2';
  var STYLE_ID           = 'mxi-data-panel-v2-styles';
  var HIGHLIGHT_CLASS    = 'mxi-dp2-pulse';
  var HIGHLIGHT_STYLE_ID = 'mxi-dp2-highlight-styles';

  var TYPE_COLORS = {
    DataView:     '#3B99FC',
    ListView:     '#3DDC97',
    DataGrid2:    '#9333EA',
    DataGrid:     '#9333EA',
    TemplateGrid: '#FF7A50',
    Gallery:      '#EC4899',
    Unknown:      '#666'
  };

  var state = {
    open:           false,
    panel:          null,
    mountTarget:    null, // v0.2.29 — when embedded, the parent we slide into
    query:          '',
    entries:        [],   // on-page entity entries with element refs
    pageParams:     [],   // objects in cache likely to be page params
    cached:         [],   // other cached context objects
    guidIndex:      null, // Map<guid, element> for reliable highlighting
    showHidden:     false,// show system entities that are filtered by default
    expandedEntity: null, // entity name currently expanded
    expandedObject: null, // 'entityName:objectIdx' currently expanded
    expandedParam:  null, // page parameter name currently expanded
    activeHighlight: [],  // current transient (hover) highlighted elements
    // v0.2.25 — persistent highlight for the currently expanded/selected object.
    // Stays lit while the Data Inspector is open and that object is selected,
    // even when the user hovers elsewhere. Mouse leave from a hover row
    // restores this instead of fully clearing the page.
    persistentHighlight: null  // { elements: [el...], color, label } or null
  };

  // ------------------------------------------------------------
  // Utilities
  // ------------------------------------------------------------

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getClassString(el) {
    if (!el || !el.className) return '';
    return typeof el.className === 'string' ? el.className : (el.className.baseVal || '');
  }

  function detectContainerType(el) {
    var cn = getClassString(el);
    if (cn.indexOf('mx-dataview') > -1 && cn.indexOf('mx-dataview-content') === -1) return 'DataView';
    if (cn.indexOf('mx-listview') > -1)      return 'ListView';
    if (cn.indexOf('widget-datagrid') > -1)  return 'DataGrid2';
    if (cn.indexOf('widget-gallery') > -1)   return 'Gallery';
    if (cn.indexOf('mx-templategrid') > -1)  return 'TemplateGrid';
    return 'Unknown';
  }

  // ------------------------------------------------------------
  // Page parameter scanner — walks React fiber tree from #root
  // looking for MxObjects attached to component props.
  // Heuristic: page params live near the top of the fiber tree.
  // ------------------------------------------------------------

  // ------------------------------------------------------------
  // GUID extraction + DOM element indexer
  // Walks rendered rows/widgets, reads their fiber to get MxObject,
  // builds a Map<guid, element> for precise highlighting.
  // ------------------------------------------------------------

  function getMxObjectFromElement(el) {
    if (!el) return null;
    // Find fiber key (React may use __reactFiber$xxx or __reactInternalInstance$xxx)
    var fk = null;
    try {
      var keys = Object.keys(el);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf('__reactFiber') === 0 ||
            keys[i].indexOf('__reactInternalInstance') === 0) {
          fk = keys[i];
          break;
        }
      }
    } catch (e) { return null; }
    if (!fk) return null;

    var fiber = el[fk];
    var depth = 0;
    while (fiber && depth < 8) {
      var p = fiber.memoizedProps;
      if (p && typeof p === 'object') {
        // Direct props.item with Symbol(mxObject)
        if (p.item) {
          var mx = readMxSymbol(p.item);
          if (mx) return mx;
        }
        // datasource.items[i] pattern — we don't have the index here,
        // but we'd find it already via the row's own fiber props
        // Direct Symbol(mxObject) on props
        var direct = readMxSymbol(p);
        if (direct) return direct;
        // object.value pattern (DataView single-object)
        if (p.object && p.object.value) {
          var ov = readMxSymbol(p.object.value);
          if (ov) return ov;
        }
      }
      fiber = fiber.return;
      depth++;
    }
    return null;
  }

  function readMxSymbol(val) {
    if (!val || typeof val !== 'object') return null;
    if (typeof val.getEntity === 'function' && typeof val.getGuid === 'function') return val;
    try {
      var syms = Object.getOwnPropertySymbols(val);
      for (var i = 0; i < syms.length; i++) {
        if (syms[i].toString().indexOf('mxObject') > -1) {
          var m = val[syms[i]];
          if (m && typeof m.getGuid === 'function') return m;
        }
      }
    } catch (e) {}
    return null;
  }

  /**
   * v0.2.15 — Read the dirty/new state flags from an MxObject.
   * Dojo client exposes isNew() and isChanged() as methods.
   * Modern client exposes them as properties. Fall back to reading
   * internal _jsonData flags if neither works.
   */
  function readMxObjectState(mxObj) {
    if (!mxObj) return { isNew: false, isChanged: false };
    var isNew = false, isChanged = false;
    try {
      isNew = typeof mxObj.isNew === 'function' ? !!mxObj.isNew()
            : typeof mxObj.isNew === 'boolean' ? mxObj.isNew
            : !!(mxObj._jsonData && mxObj._jsonData.isNew);
    } catch (e) {}
    try {
      isChanged = typeof mxObj.isChanged === 'function' ? !!mxObj.isChanged()
                : typeof mxObj.isChanged === 'boolean' ? mxObj.isChanged
                : !!(mxObj._jsonData && mxObj._jsonData.changed);
    } catch (e) {}
    return { isNew: isNew, isChanged: isChanged };
  }

  /**
   * Build a Map<guid, element> by walking every descendant of containers.
   * For each rendered row element, if its fiber tree has an MxObject, map it.
   */
  /**
   * v0.2.16 — Find the rendered row DOM elements inside a list/grid container,
   * in render order. Handles nested listviews where inner row containers may be
   * wrapped in several single-child divs before the actual row list.
   *
   * Strategy:
   *   1. Try known class-based row selectors at any depth within this container.
   *      Use :scope and guard against matching rows of a NESTED inner container.
   *   2. Walk down through single-child wrappers to find the node that actually
   *      holds the row siblings, then return its direct element children.
   */
  function findRowElementsForContainer(container, type) {
    if (!container) return null;

    // v0.2.1 — DataGrid2 fast-path. In Mendix 11 every data row carries
    // `aria-selected` (true/false) while header rows don't — the single
    // most reliable disambiguator in the DOM. Query directly, scoped to
    // this container, and return if we got any hits. This sidesteps the
    // Strategy 1 filter loop entirely for the common case, avoiding any
    // closest()-based nested-container checks that were mis-behaving
    // against the `widget-datagrid-grid-body` rowgroup wrapper.
    if (type === 'DataGrid2') {
      var ariaRows = container.querySelectorAll('[role="row"][aria-selected]');
      if (ariaRows.length > 0) {
        return Array.prototype.slice.call(ariaRows);
      }
    }

    // Strategy 1 — class-based row selectors, at any depth within this container.
    // Guard: if a row-like element is inside a DEEPER data container, it belongs
    // to that inner container, not this one. Skip it.
    // v0.2.21 — Modern Mendix listviews render as <ul><li class="mx-name-index-N">.
    // `.mx-listview-item` was the old Mendix 6-7 class; current apps use mx-name-index.
    //
    // v0.2.1 — DataGrid2 legacy fallback. The fast-path above handles
    // Mendix 11+. This keeps Mendix 9/10 working via the `widget-datagrid-row`
    // class token (tilde-equals exact-token match). Broader `[role="row"]`
    // fallback also included as a safety net.
    var selectorsByType = {
      ListView:     'li[class*="mx-name-index-"], .mx-listview-item, [class*="widget-listview-item"]',
      Gallery:      'li[class*="mx-name-index-"], [class*="widget-gallery-item"]',
      TemplateGrid: 'li[class*="mx-name-index-"], .mx-templategrid-item',
      DataGrid2:    '[class~="widget-datagrid-row"], ' +
                    '[class*="grid-body"] [role="row"], [class*="table-content"] [role="row"]'
    };
    var sel = selectorsByType[type];
    if (sel) {
      var matched = container.querySelectorAll(sel);
      var filtered = [];
      for (var m = 0; m < matched.length; m++) {
        var el = matched[m];

        // Reject chrome rows (header/filter/rowgroup/pagination/paging word tokens)
        if (type === 'DataGrid2') {
          var cls = (el.className && typeof el.className === 'string') ? el.className : '';
          if (/\b(header|filter|rowgroup|pagination|paging)\b/i.test(cls)) continue;
        }

        filtered.push(el);
      }
      if (filtered.length > 0) return filtered;
    }

    // Strategy 2 — dig through single-child wrappers until we find a node that
    // has multiple children; return those. Also bail if we hit another container.
    var probe = container;
    var maxDepth = 6;
    while (probe && maxDepth-- > 0) {
      var children = probe.children;
      if (!children || children.length === 0) return null;

      if (children.length === 1) {
        // Single wrapper → descend
        probe = children[0];
        continue;
      }

      // Multiple children — candidate row list. Filter out obvious non-rows.
      var rows = [];
      for (var j = 0; j < children.length; j++) {
        var ch = children[j];
        var cn = (ch.className && typeof ch.className === 'string') ? ch.className : '';
        if (cn.indexOf('loader') > -1 || cn.indexOf('empty') > -1 ||
            cn.indexOf('header') > -1 || cn.indexOf('footer') > -1 ||
            cn.indexOf('paging') > -1 || cn.indexOf('pagination') > -1) continue;
        rows.push(ch);
      }
      if (rows.length > 1) return rows;

      // Only 1 real child after filtering → keep descending
      if (rows.length === 1) {
        probe = rows[0];
        continue;
      }
      return null;
    }
    return null;
  }

  function buildGuidElementIndex() {
    var index = new Map();
    var stats = { rowsFound: 0, rowsWithMxObject: 0, dataViewsWithMxObject: 0 };

    // Candidate row elements: anything that looks like a rendered list/grid row
    var rowSelectors = [
      '[class*="mx-name-index-"]',
      '.mx-listview-item',
      '[class*="widget-gallery-item"]',
      '.mx-templategrid-item',
      '[role="row"]',
      // v0.2.13 — DataGrid2 row patterns (virtualized grid uses different structure)
      '[class*="widget-datagrid-row"]',
      '[class*="table-row"][role]',
      '.widget-datagrid-cell-wrapper [data-row-index]'
    ].join(',');

    var rows = document.querySelectorAll(rowSelectors);
    stats.rowsFound = rows.length;

    rows.forEach(function (row) {
      var mx = getMxObjectFromElement(row);
      if (mx) {
        stats.rowsWithMxObject++;
        try {
          var g = mx.getGuid();
          if (g && !index.has(g)) index.set(g, row);
        } catch (e) {}
      }
    });

    // Also map DataView container elements to their single object
    var dataViews = document.querySelectorAll('.mx-dataview:not(.mx-dataview-content)');
    dataViews.forEach(function (dv) {
      var mx = getMxObjectFromElement(dv);
      if (mx) {
        stats.dataViewsWithMxObject++;
        try {
          var g = mx.getGuid();
          if (g && !index.has(g)) index.set(g, dv);
        } catch (e) {}
      }
    });

    // v0.2.13 — fallback: walk ALL descendants of known listview/grid containers.
    // For DataGrid2 specifically, row markup may not match any selector above.
    // Walk every element inside the container and check the fiber tree.
    if (stats.rowsWithMxObject === 0) {
      var containers = document.querySelectorAll(
        '.mx-listview, [class*="widget-datagrid"], [class*="mx-datagrid"], [class*="widget-gallery"]'
      );
      containers.forEach(function (container) {
        // Walk only direct & shallow descendants to avoid performance hit
        var candidates = container.querySelectorAll('*');
        // Cap the walk for performance (large grids can have thousands of nodes)
        var max = Math.min(candidates.length, 5000);
        for (var i = 0; i < max; i++) {
          var el = candidates[i];
          var mx = getMxObjectFromElement(el);
          if (mx) {
            try {
              var g = mx.getGuid();
              if (g && !index.has(g)) {
                index.set(g, el);
                stats.rowsWithMxObject++;
              }
            } catch (e) {}
          }
        }
      });
    }

    // Stash stats for diagnostic use
    index._stats = stats;
    return index;
  }

  // v0.2.13 — Diagnostic helper the user can call in the console:
  //   window.__MxDataPanel.diagnose()
  // Prints which rows were found, how many had MxObjects, and sample fiber paths.
  function diagnose() {
    console.group('[MXI Diagnostic v0.2.19]');
    var idx = buildGuidElementIndex();
    console.log('GUID→element index size:', idx.size);
    console.log('Row scan stats:', idx._stats);

    // v0.2.22 — report elements[] counts so we can see when objects render in
    // multiple listviews. "25/25 objects with 1+ el, 12 with 2+" means 12 of the
    // 25 objects are rendered in BOTH listviews (titles + values).
    if (state.entries && state.entries.length) {
      console.group('Current state.entries (obj.elements populated?):');
      state.entries.forEach(function (e) {
        var withOne = 0, withMulti = 0, maxEls = 0;
        e.objects.forEach(function (o) {
          var n = (o.elements && o.elements.length) ? o.elements.length : (o.element ? 1 : 0);
          if (n >= 1) withOne++;
          if (n >= 2) withMulti++;
          if (n > maxEls) maxEls = n;
        });
        console.log('  ' + e.entity + ': ' + withOne + '/' + e.objects.length +
                    ' have ≥1 DOM node, ' + withMulti + ' have ≥2 (max ' + maxEls + ').');
      });
      console.groupEnd();
    }

    // v0.2.18 — probe every data container found by the extractor, showing
    // how many items it has AND how many row-elements findRowElementsForContainer finds
    if (window.__MxDataExtractor && window.__MxDataExtractor.scanAllDataContainers) {
      var scan = window.__MxDataExtractor.scanAllDataContainers();
      console.log('Scanner found', scan.containers.length, 'data containers:');
      scan.containers.forEach(function (c, i) {
        var type = detectContainerType(c.element);
        var data = null;
        try { data = window.__MxDataExtractor.extractDataFromElement(c.element); } catch (e) {}
        var itemCount = (data && data.items) ? data.items.length : (data && data.mxObject ? 1 : 0);
        var rowElements = findRowElementsForContainer(c.element, type);
        var rowCount = rowElements ? rowElements.length : 0;

        console.group(
          '#' + i + ' [' + type + '] ' + (c.name || '(unnamed)') +
          ' — ' + itemCount + ' items, ' + rowCount + ' row elements'
        );
        console.log('Container el:', c.element);
        console.log('Entity:', c.entity);
        if (rowElements && rowElements.length > 0) {
          console.log('First 3 row elements:');
          for (var r = 0; r < Math.min(rowElements.length, 3); r++) {
            console.log('  ['+r+']', rowElements[r].tagName, '.'+(rowElements[r].className||'').substring(0,60));
          }
        } else {
          console.warn('NO row elements found — object highlighting will not work for this container.');
          console.log('Container direct children:');
          for (var ch = 0; ch < Math.min(c.element.children.length, 5); ch++) {
            var cel = c.element.children[ch];
            console.log('  ['+ch+']', cel.tagName, '.'+(cel.className||'').substring(0,80),
                        'childCount:', cel.children.length);
          }
        }
        if (itemCount !== rowCount && itemCount > 0 && rowCount > 0) {
          console.warn('MISMATCH — ' + itemCount + ' items but ' + rowCount + ' rows. Pairing by index will be wrong.');
        }
        console.groupEnd();
      });
    }

    console.groupEnd();
    return idx;
  }

  // ------------------------------------------------------------
  // mx.data.objectCache enumeration
  // Returns { entities: Map<entityName, [mxObjects]>, total }
  // ------------------------------------------------------------

  function enumerateObjectCache() {
    var out = { entities: new Map(), total: 0 };
    var cache = window.mx && mx.data && mx.data.objectCache;
    if (!cache) return out;

    // cache is an MxObjectCache — inspect has an inner 'objectCache' Map
    var innerCache = cache.objectCache;
    if (!innerCache) return out;

    // innerCache could be a Map, WeakMap, or plain object
    var processEntry = function (val) {
      if (!val) return;
      // val might be the MxObject directly, or wrapped (val.obj, val.value)
      var mxObj = null;
      if (typeof val.getEntity === 'function' && typeof val.getGuid === 'function') {
        mxObj = val;
      } else if (val.obj && typeof val.obj.getEntity === 'function') {
        mxObj = val.obj;
      } else if (val.value && typeof val.value.getEntity === 'function') {
        mxObj = val.value;
      }
      if (!mxObj) return;

      try {
        var entity = mxObj.getEntity();
        if (!entity) return;
        if (!out.entities.has(entity)) out.entities.set(entity, []);
        out.entities.get(entity).push(mxObj);
        out.total++;
      } catch (e) {}
    };

    if (typeof innerCache.forEach === 'function') {
      try { innerCache.forEach(function (v) { processEntry(v); }); }
      catch (e) {}
    } else {
      try {
        Object.keys(innerCache).forEach(function (k) { processEntry(innerCache[k]); });
      } catch (e) {}
    }

    return out;
  }

  // Classify an entity: 'system' = hide by default, 'page' = normal
  function isSystemEntity(entityName) {
    if (!entityName) return true;
    if (entityName.indexOf('System.') === 0) return true;
    if (entityName.indexOf('Administration.Account') === 0) return true;
    if (entityName === 'Data.DataSyncRun') return true;
    return false;
  }

  // Build { onPage: [entries], pageParams: [entries], cached: [entries] }
  function classifyEntries(cacheData, onPageEntries) {
    // Collect GUIDs already shown on-page, and entities that appear on page
    var onPageGuids = {};
    var onPageEntities = {};
    onPageEntries.forEach(function (e) {
      onPageEntities[e.entity] = true;
      e.objects.forEach(function (o) { if (o.guid) onPageGuids[o.guid] = true; });
    });

    var pageParams = [];
    var cached = [];

    cacheData.entities.forEach(function (mxObjs, entityName) {
      if (isSystemEntity(entityName)) return; // filter per user preference

      var parts = entityName.split('.');
      var entry = {
        entity:      entityName,
        module:      parts.length > 1 ? parts[0] : '',
        shortName:   parts[parts.length - 1],
        type:        'Context',
        color:       '#FFB800',
        objectCount: mxObjs.length,
        containers:  [],          // populated below if also on page
        objects:     [],
        category:    'context',   // default
        alsoOnPage:  false        // will be set to true below if duplicated in on-page entries
      };

      // If the entity is ALSO on page, link the containers so hover highlighting
      // still pulses the right DOM elements.
      if (onPageEntities[entityName]) {
        var onPageEntry = onPageEntries.find(function (e) { return e.entity === entityName; });
        if (onPageEntry) {
          entry.containers = onPageEntry.containers.slice();
          entry.alsoOnPage = true;
        }
      }

      // Extract attributes for each cached object (cap 20)
      mxObjs.slice(0, 20).forEach(function (mxObj) {
        var sf = readMxObjectState(mxObj);
        var obj = {
          guid:       null,
          attributes: {},
          element:    null,
          isNew:      sf.isNew,
          isChanged:  sf.isChanged
        };
        try { obj.guid = mxObj.getGuid ? mxObj.getGuid() : null; } catch (e) {}
        try {
          if (window.__MxDataExtractor && window.__MxDataExtractor.getObjectAttributes) {
            var ad = window.__MxDataExtractor.getObjectAttributes(mxObj);
            if (ad && ad.attributes) {
              if (!obj.attributeTypes) obj.attributeTypes = {};
              ad.attributes.forEach(function (a) {
                obj.attributes[a.name] = a.value;
                if (a.type) obj.attributeTypes[a.name] = a.type;
              });
            }
          }
        } catch (e) {}
        // If we have a guidIndex and this object has a rendered element, reuse it
        if (obj.guid && state.guidIndex && state.guidIndex.has(obj.guid)) {
          obj.element = state.guidIndex.get(obj.guid);
        }
        // v0.2.17 — system members
        if (window.__MxDataExtractor && window.__MxDataExtractor.getSystemMembers) {
          try { obj.systemMembers = window.__MxDataExtractor.getSystemMembers(mxObj); }
          catch (e) { obj.systemMembers = []; }
        } else {
          obj.systemMembers = [];
        }
        entry.objects.push(obj);
      });

      // Heuristic: singleton or referenced-by-association → page param.
      // Multi-instance orphan → cached context.
      var isSingleton = mxObjs.length === 1;
      var isReferenced = false;
      onPageEntries.forEach(function (e) {
        e.objects.forEach(function (o) {
          if (isReferenced) return;
          Object.keys(o.attributes || {}).forEach(function (k) {
            var v = o.attributes[k];
            if (v && entry.objects[0] && entry.objects[0].guid &&
                String(v) === entry.objects[0].guid) {
              isReferenced = true;
            }
          });
        });
      });

      if (isSingleton || isReferenced) {
        entry.category = 'pageParam';
        pageParams.push(entry);
      } else {
        entry.category = 'cached';
        cached.push(entry);
      }
    });

    pageParams.sort(function (a, b) { return a.entity.localeCompare(b.entity); });
    cached.sort(function (a, b) {
      if (b.objectCount !== a.objectCount) return b.objectCount - a.objectCount;
      return a.entity.localeCompare(b.entity);
    });

    return { pageParams: pageParams, cached: cached };
  }


  // ------------------------------------------------------------
  // Highlight / pulse on page (independent of inspector.js system)
  // ------------------------------------------------------------

  // ---------------------------------------------------------------
  // v0.2.28 — Portal-based overlay highlighting
  //
  // The previous approach (adding a class to the target element and using
  // outline / inset box-shadow) ran into too many Mendix layout constraints:
  // ancestor overflow:hidden, transforms that create new containing blocks,
  // flex clipping, etc. No in-place technique works reliably.
  //
  // Instead we now render a separate <div> overlay appended to document.body
  // for each highlighted element. The overlay is position:fixed with coords
  // derived from the target's getBoundingClientRect(). Being at body level
  // and fixed-positioned, it escapes almost every kind of ancestor clipping.
  //
  // Positions are kept in sync with scroll + resize events (capture phase so
  // we catch scroll on any nested scroll container).
  // ---------------------------------------------------------------

  var OVERLAY_ROOT_ID = 'mxi-dp2-overlay-root';

  function getOverlayRoot() {
    var root = document.getElementById(OVERLAY_ROOT_ID);
    if (root) return root;
    root = document.createElement('div');
    root.id = OVERLAY_ROOT_ID;
    // Root itself takes no space and doesn't intercept clicks. Individual
    // overlays inside are pointer-events:none too.
    // v0.2.31 — z-index 999990 sits above page content and all Mendix wrappers,
    // but BELOW the main MxInspector panel (999999) so the panel stays readable
    // when overlays are painted on top of content behind it.
    root.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;' +
      'pointer-events:none;z-index:999990;';
    document.body.appendChild(root);
    return root;
  }

  function ensureHighlightStyles() {
    if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = HIGHLIGHT_STYLE_ID;
    s.textContent =
      '.mxi-dp2-ol{' +
        'position:fixed;pointer-events:none;box-sizing:border-box;' +
        'border:3px solid var(--mxi-dp2-color,#FFB800);' +
        'background:color-mix(in srgb, var(--mxi-dp2-color,#FFB800) 20%, transparent);' +
        'box-shadow:0 0 0 1px color-mix(in srgb, var(--mxi-dp2-color,#FFB800) 45%, transparent),' +
                  ' 0 0 12px 2px color-mix(in srgb, var(--mxi-dp2-color,#FFB800) 30%, transparent);' +
        'border-radius:2px;transition:opacity .12s;' +
      '}' +
      '.mxi-dp2-ol-label{' +
        'position:absolute;top:-22px;left:-3px;' +
        'background:var(--mxi-dp2-color,#FFB800);color:#0A0A0A;' +
        'padding:3px 8px;border-radius:4px 4px 4px 0;' +
        'font:700 11px Inter,-apple-system,system-ui,sans-serif;' +
        'letter-spacing:.2px;white-space:nowrap;' +
        'box-shadow:0 2px 8px rgba(0,0,0,.4);' +
        'max-width:80vw;overflow:hidden;text-overflow:ellipsis;' +
      '}' +
      // If label would go above the viewport, flip it below instead
      '.mxi-dp2-ol[data-flip="below"] .mxi-dp2-ol-label{' +
        'top:auto;bottom:-22px;border-radius:0 4px 4px 4px;' +
      '}';
    document.head.appendChild(s);
  }

  // Create a single overlay <div> for a given target element.
  // Returns the overlay node + a function to reposition it.
  function createOverlay(target, color, label) {
    var overlay = document.createElement('div');
    overlay.className = 'mxi-dp2-ol';
    overlay.style.setProperty('--mxi-dp2-color', color);
    if (label) {
      var chip = document.createElement('div');
      chip.className = 'mxi-dp2-ol-label';
      chip.textContent = label;
      overlay.appendChild(chip);
    }

    // v0.2.1 — Mendix 11 DataGrid2 sets `display: contents` on `.tr` rows
    // (see _datagrid.scss → `.table .tr { display: contents }`). This means
    // the row element itself generates NO box — the cells lay out as direct
    // children of the grid. getBoundingClientRect() on a display:contents
    // element returns 0×0, so our overlay would hide itself. Workaround:
    // if the target's own rect is empty, union the rects of its children.
    // The resulting box visually matches the row the user sees.
    function measureTarget() {
      var r = target.getBoundingClientRect();
      if (r.width > 0 || r.height > 0) return r;

      // Zero-size — walk immediate children and union their rects
      var kids = target.children;
      if (!kids || kids.length === 0) return r;

      var left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
      var any = false;
      for (var k = 0; k < kids.length; k++) {
        var kr = kids[k].getBoundingClientRect();
        if (kr.width === 0 && kr.height === 0) continue;
        if (kr.left   < left)   left   = kr.left;
        if (kr.top    < top)    top    = kr.top;
        if (kr.right  > right)  right  = kr.right;
        if (kr.bottom > bottom) bottom = kr.bottom;
        any = true;
      }
      if (!any) return r;
      return { left: left, top: top, right: right, bottom: bottom,
               width: right - left, height: bottom - top };
    }

    function reposition() {
      if (!target || !target.getBoundingClientRect) return;
      var r = measureTarget();
      // If element is entirely off-screen or has zero size, hide
      if (r.width === 0 && r.height === 0) {
        overlay.style.opacity = '0';
        return;
      }
      overlay.style.opacity = '1';
      overlay.style.left   = r.left   + 'px';
      overlay.style.top    = r.top    + 'px';
      overlay.style.width  = r.width  + 'px';
      overlay.style.height = r.height + 'px';
      // Flip label below if the label would go above the viewport top
      overlay.setAttribute('data-flip', r.top < 26 ? 'below' : 'above');
    }
    reposition();
    getOverlayRoot().appendChild(overlay);
    return { node: overlay, reposition: reposition, target: target };
  }

  // Global listeners refresh ALL active overlays on scroll/resize.
  var _overlayListenersBound = false;
  function bindOverlayListeners() {
    if (_overlayListenersBound) return;
    _overlayListenersBound = true;
    function refreshAll() {
      state.activeHighlight.forEach(function (o)   { if (o && o.reposition) o.reposition(); });
      if (state.persistentHighlight && state.persistentHighlight.overlays) {
        state.persistentHighlight.overlays.forEach(function (o) { if (o && o.reposition) o.reposition(); });
      }
    }
    // capture:true so we catch scroll on ANY scroll container, not just window
    window.addEventListener('scroll', refreshAll, true);
    window.addEventListener('resize', refreshAll, true);
    // RAF loop as a belt-and-suspenders fallback: some layout changes don't
    // fire scroll/resize (e.g. JS-driven transforms, dynamic height changes).
    // Runs only while something is highlighted.
    function tick() {
      var anyActive = state.activeHighlight.length > 0 ||
                      (state.persistentHighlight && state.persistentHighlight.overlays &&
                       state.persistentHighlight.overlays.length > 0);
      if (anyActive) refreshAll();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function destroyOverlay(o) {
    if (o && o.node && o.node.parentNode) o.node.parentNode.removeChild(o.node);
  }

  function clearPageHighlight() {
    ensureHighlightStyles();
    state.activeHighlight.forEach(destroyOverlay);
    state.activeHighlight = [];
    // Persistent highlight is re-rendered (it's own overlays persist)
  }

  function highlightElements(elements, color, label) {
    ensureHighlightStyles();
    bindOverlayListeners();
    clearPageHighlight();
    if (!elements || !elements.length) return;

    elements.forEach(function (el) {
      if (!el || !el.getBoundingClientRect) return;
      var overlay = createOverlay(el, color, label);
      state.activeHighlight.push(overlay);
    });

    // Scroll first element into view if off-screen
    var first = elements[0];
    if (first && first.getBoundingClientRect) {
      var r = first.getBoundingClientRect();
      var offscreen = r.bottom < 0 || r.top > window.innerHeight ||
                      r.right < 0 || r.left > window.innerWidth;
      if (offscreen) {
        first.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }

  // v0.2.25 — Persistent (pinned) highlight for the currently expanded object.
  function pinPersistentHighlight(elements, color, label) {
    ensureHighlightStyles();
    bindOverlayListeners();
    unpinPersistentHighlight();
    if (!elements || !elements.length) return;
    var overlays = [];
    elements.forEach(function (el) {
      if (!el || !el.getBoundingClientRect) return;
      overlays.push(createOverlay(el, color, label));
    });
    if (overlays.length) {
      state.persistentHighlight = {
        overlays: overlays, color: color, label: label,
        elements: elements.slice()
      };
    }
  }
  function unpinPersistentHighlight() {
    if (!state.persistentHighlight) return;
    (state.persistentHighlight.overlays || []).forEach(destroyOverlay);
    state.persistentHighlight = null;
  }

  // v0.2.1 — Fade out the pinned (persistent) highlight when the user's mouse
  // moves on to a DIFFERENT entity/object row. Keeps the pin when hovering the
  // same object (no-op). The fade is ~250ms of opacity transition so it feels
  // like the previous selection is politely stepping aside — it doesn't snap
  // away. Called BEFORE the new transient highlight is created so both happen
  // concurrently.
  function fadePersistentHighlightIfDifferent(newElements) {
    if (!state.persistentHighlight) return;
    var pinnedEls = state.persistentHighlight.elements || [];
    // Same-set check — keep the pin if the hover targets the exact same
    // elements as the pin (e.g. user hovers back over their own expanded row).
    if (pinnedEls.length && newElements && pinnedEls.length === newElements.length) {
      var allMatch = true;
      for (var i = 0; i < pinnedEls.length; i++) {
        if (newElements.indexOf(pinnedEls[i]) === -1) { allMatch = false; break; }
      }
      if (allMatch) return;
    }
    // Different target → fade out and unpin.
    var pinned = state.persistentHighlight;
    state.persistentHighlight = null;   // unpin eagerly so the RAF tick stops
    (pinned.overlays || []).forEach(function (o) {
      if (o && o.node) {
        o.node.style.transition = 'opacity .25s ease-out';
        o.node.style.opacity = '0';
      }
    });
    setTimeout(function () {
      (pinned.overlays || []).forEach(destroyOverlay);
    }, 260);
  }

  // ------------------------------------------------------------
  // Page scan — builds entries with element refs
  // ------------------------------------------------------------

  function scanPage() {
    var entries = [];
    if (!window.__MxDataExtractor || !window.__MxDataExtractor.scanAllDataContainers) {
      return entries;
    }

    // Build GUID→element index ONCE per scan for reliable object highlighting
    var guidIndex = buildGuidElementIndex();
    state.guidIndex = guidIndex;

    var scan = window.__MxDataExtractor.scanAllDataContainers();
    if (!scan || !scan.containers) return entries;

    // v0.2.27 — helper for elements[] merging. Avoids nested duplicates (e.g.
    // both a listview <li> AND its inner <div class="mx-dataview"> getting
    // highlighted — that causes stacked labels and overlapping inset rings).
    // Rule: keep the OUTERMOST element. Siblings in different lists stay.
    function addElementUnique(arr, el) {
      if (!el || !arr) return;
      for (var i = 0; i < arr.length; i++) {
        var ex = arr[i];
        if (!ex) continue;
        if (ex === el) return;                   // already present
        if (ex.contains && ex.contains(el)) return;  // existing is ancestor → keep existing
        if (el.contains && el.contains(ex)) {   // new is ancestor → replace existing
          arr[i] = el;
          return;
        }
      }
      arr.push(el);
    }

    scan.containers.forEach(function (c) {
      var type = detectContainerType(c.element);
      var color = TYPE_COLORS[type] || TYPE_COLORS.Unknown;

      // v0.2.23 — Only treat a container as a LIST (with items[]) when its type
      // is actually list-like. Even with the extractor's fiber-walk boundary fix,
      // DataViews with no own-fiber object prop can still bleed in an ancestor
      // listview's items[]. If we index-pair those bled items to a DataView's
      // internal children (container26, textBox11, textBox12...), we get the
      // chaotic horizontal-row highlight bug seen in v0.2.22.
      var isRealList = (type === 'ListView' || type === 'Gallery' ||
                        type === 'TemplateGrid' || type === 'DataGrid2');

      // Only find row elements for real lists.
      var rowElements = isRealList ? findRowElementsForContainer(c.element, type) : null;

      var objects = [];
      try {
        var data = window.__MxDataExtractor.extractDataFromElement(c.element);

        // v0.2.23 — Decide what to extract based on container type.
        // REAL LISTS: iterate items[] (with index-pairing to row elements).
        // DATAVIEWS / OTHER: use data.mxObject if present (ignore any bled items[]).
        if (isRealList && data && data.items && data.items.length) {
          data.items.slice(0, 50).forEach(function (item, idx) {
            var mxObj = window.__MxDataExtractor.getMxObjectFromItem(item);
            var guid  = item.id || (mxObj && mxObj.getGuid ? mxObj.getGuid() : null);
            var state_flags = readMxObjectState(mxObj);
            var obj   = { guid: guid, attributes: {}, element: null, elements: [],
                          idx: idx, isNew: state_flags.isNew, isChanged: state_flags.isChanged };

            // GUID-based lookup — works with virtualized lists
            if (guid && guidIndex.has(guid)) {
              obj.element = guidIndex.get(guid);
              addElementUnique(obj.elements, obj.element);
            }

            // Pair by index to the container's DOM children
            if (!obj.element && rowElements && rowElements[idx]) {
              obj.element = rowElements[idx];
              addElementUnique(obj.elements, rowElements[idx]);
              if (guid) guidIndex.set(guid, rowElements[idx]);
            } else if (rowElements && rowElements[idx] && obj.element !== rowElements[idx]) {
              // Object rendered in multiple lists — add this list's row too
              addElementUnique(obj.elements, rowElements[idx]);
            }

            if (mxObj) {
              // Prefer the full extractor which returns {attributes, associations}
              try {
                if (window.__MxDataExtractor && window.__MxDataExtractor.getObjectAttributes) {
                  var ad = window.__MxDataExtractor.getObjectAttributes(mxObj);
                  if (ad && ad.attributes) {
                    if (!obj.attributeTypes) obj.attributeTypes = {};
                    ad.attributes.forEach(function (a) {
                      obj.attributes[a.name] = a.value;
                      if (a.type) obj.attributeTypes[a.name] = a.type;
                    });
                  }
                  if (ad && ad.associations) {
                    obj.associations = ad.associations;
                  }
                }
              } catch (e) {}
              // Fallback to direct getAttributes() if extractor returned nothing
              if (Object.keys(obj.attributes).length === 0) {
                try {
                  var attrs = mxObj.getAttributes ? mxObj.getAttributes() : [];
                  attrs.forEach(function (a) {
                    try { obj.attributes[a] = mxObj.get(a); } catch (e) {}
                  });
                } catch (e) {}
                if (mxObj._jsonData && mxObj._jsonData.attributes) {
                  Object.keys(mxObj._jsonData.attributes).forEach(function (a) {
                    if (obj.attributes[a] == null) obj.attributes[a] = mxObj._jsonData.attributes[a];
                  });
                }
              }
            }
            // v0.2.5 — stash the parent container info on the object too
            obj.parentContainer = { name: c.name, type: type, element: c.element };
            // v0.2.17 — capture system members (createdDate, changedDate, owner, etc.)
            if (mxObj && window.__MxDataExtractor.getSystemMembers) {
              try { obj.systemMembers = window.__MxDataExtractor.getSystemMembers(mxObj); }
              catch (e) { obj.systemMembers = []; }
            } else {
              obj.systemMembers = [];
            }
            objects.push(obj);
          });
        } else if (data && data.mxObject) {
          // Single-object DataView
          var mxObj = data.mxObject;
          var sf = readMxObjectState(mxObj);
          var obj = { guid: null, attributes: {}, associations: [],
                      element: c.element, elements: [c.element], idx: 0,
                      isNew: sf.isNew, isChanged: sf.isChanged };
          try { obj.guid = window.__MxDataExtractor.getObjectGuid(mxObj); } catch (e) {}
          try {
            var attrData = window.__MxDataExtractor.getObjectAttributes(mxObj);
            if (attrData && attrData.attributes) {
              if (!obj.attributeTypes) obj.attributeTypes = {};
              attrData.attributes.forEach(function (a) {
                obj.attributes[a.name] = a.value;
                if (a.type) obj.attributeTypes[a.name] = a.type;
              });
            }
            if (attrData && attrData.associations) {
              obj.associations = attrData.associations;
            }
          } catch (e) {}
          obj.parentContainer = { name: c.name, type: type, element: c.element };
          if (mxObj && window.__MxDataExtractor.getSystemMembers) {
            try { obj.systemMembers = window.__MxDataExtractor.getSystemMembers(mxObj); }
            catch (e) { obj.systemMembers = []; }
          } else {
            obj.systemMembers = [];
          }
          objects.push(obj);
        }
      } catch (e) {}

      // Find or create entity entry; merge multiple containers using same entity
      var entityName = c.entity || '(untyped)';
      var existing = entries.find(function (e) { return e.entity === entityName; });

      if (existing) {
        existing.containers.push({ element: c.element, name: c.name, type: type, color: color });
        // v0.2.22 — dedupe by GUID: if we already have this object, MERGE its
        // elements[] (since the same object can render in multiple listviews,
        // e.g. a "titles" listview and a "values" listview displaying the same
        // MRPRunPlanningPeriod objects). Don't just skip the duplicate.
        var existingByGuid = {};
        existing.objects.forEach(function (o) {
          if (o.guid) existingByGuid[o.guid] = o;
        });
        objects.forEach(function (o) {
          if (o.guid && existingByGuid[o.guid]) {
            // Merge this duplicate's elements into the existing object
            var existingObj = existingByGuid[o.guid];
            existingObj.elements = existingObj.elements || (existingObj.element ? [existingObj.element] : []);
            (o.elements || (o.element ? [o.element] : [])).forEach(function (el) {
              addElementUnique(existingObj.elements, el);
            });
            // v0.2.27 — obj.element should track elements[0] since addElementUnique
            // may have REPLACED the original with a more outer element. Resync.
            if (existingObj.elements.length) {
              existingObj.element = existingObj.elements[0];
            }
            return;
          }
          if (o.guid) existingByGuid[o.guid] = o;
          existing.objects.push(o);
        });
        existing.objectCount = existing.objects.length;
      } else {
        var parts = entityName.split('.');
        // Dedupe within the newly-collected objects (merging elements[])
        var seen2 = {};
        var deduped = [];
        objects.forEach(function (o) {
          if (o.guid && seen2[o.guid]) {
            var prev = seen2[o.guid];
            prev.elements = prev.elements || (prev.element ? [prev.element] : []);
            (o.elements || (o.element ? [o.element] : [])).forEach(function (el) {
              addElementUnique(prev.elements, el);
            });
            if (prev.elements.length) prev.element = prev.elements[0];
            return;
          }
          if (o.guid) seen2[o.guid] = o;
          deduped.push(o);
        });
        entries.push({
          entity:      entityName,
          module:      parts.length > 1 ? parts[0] : '',
          shortName:   parts[parts.length - 1],
          type:        type,
          color:       color,
          objectCount: deduped.length,
          containers:  [{ element: c.element, name: c.name, type: type, color: color }],
          objects:     deduped,
          category:    'onPage'
        });
      }
    });

    // Filter out fully-empty untyped entries (DataView with no entity resolved
    // AND no objects — likely a conditionally-rendered/hidden DataView).
    entries = entries.filter(function (e) {
      if (e.entity === '(untyped)' && e.objectCount === 0) return false;
      return true;
    });

    // Sort: highest object count first, then alphabetical
    entries.sort(function (a, b) {
      if (b.objectCount !== a.objectCount) return b.objectCount - a.objectCount;
      return a.entity.localeCompare(b.entity);
    });

    return entries;
  }

  // ------------------------------------------------------------
  // Filtering — search matches entity name, widget name,
  //             attribute name, or attribute value
  // ------------------------------------------------------------

  function matchesQuery(entry, q) {
    if (!q) return true;
    q = q.toLowerCase();

    if (entry.entity.toLowerCase().indexOf(q) > -1) return true;
    if (entry.shortName.toLowerCase().indexOf(q) > -1) return true;

    var i;
    for (i = 0; i < entry.containers.length; i++) {
      if (entry.containers[i].name &&
          entry.containers[i].name.toLowerCase().indexOf(q) > -1) return true;
    }
    for (i = 0; i < entry.objects.length; i++) {
      var obj = entry.objects[i];
      if (obj.guid && obj.guid.toLowerCase().indexOf(q) > -1) return true;
      var keys = Object.keys(obj.attributes || {});
      for (var j = 0; j < keys.length; j++) {
        if (keys[j].toLowerCase().indexOf(q) > -1) return true;
        var val = obj.attributes[keys[j]];
        if (val != null && String(val).toLowerCase().indexOf(q) > -1) return true;
      }
    }
    return false;
  }

  // ------------------------------------------------------------
  // Value rendering
  // ------------------------------------------------------------

  /* v0.2.46 — format datetime attributes as readable ISO, stop truncating
   * GUIDs (the user asked for full values since there's room in the panel),
   * and accept an optional { type, name } hint so we can tell
   * DateTime attributes apart from regular Long/Integer values. */
  function formatDateValue(v) {
    try {
      var d = (v instanceof Date) ? v : new Date(typeof v === 'number' ? v : Number(v));
      if (isNaN(d.getTime())) return null;
      // Sanity check: treat timestamps outside ~1970..2099 as not-a-date
      var y = d.getUTCFullYear();
      if (y < 1970 || y > 2100) return null;
      var pad = function (n) { return n < 10 ? '0' + n : String(n); };
      return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) +
             ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC';
    } catch (e) { return null; }
  }

  function isDateTimeType(type) {
    if (!type) return false;
    return /datetime|timestamp|\bdate\b/i.test(String(type));
  }

  function renderValue(v, hint) {
    hint = hint || {};
    if (v === null || v === undefined) {
      return '<span style="color:#555;font-style:italic">null</span>';
    }

    // DateTime — formatted ISO, via explicit type hint or strong name match
    if ((isDateTimeType(hint.type) || (hint.name && /(^|[_.])(created|changed)Date$|Date$|DateTime$|Timestamp$/i.test(hint.name)))
        && (typeof v === 'number' || v instanceof Date)) {
      var fmt = formatDateValue(v);
      if (fmt) {
        return '<span style="color:#3B99FC" title="raw: ' + esc(String(v.valueOf ? v.valueOf() : v)) + '">' + esc(fmt) + '</span>';
      }
    }

    if (typeof v === 'boolean') {
      return '<span style="color:' + (v ? '#3DDC97' : '#FF5A5A') + ';font-weight:600">' + v + '</span>';
    }
    if (typeof v === 'number') {
      return '<span style="color:#3B99FC">' + v + '</span>';
    }
    if (typeof v === 'string') {
      // GUID-looking strings: show in full (v0.2.46 — plenty of room in the panel)
      if (/^\d{15,}$/.test(v) || /^[0-9a-f]{36}$/i.test(v)) {
        return '<span style="color:#FFB800;font-family:"Geist Mono",monospace;font-size:11px;word-break:break-all">' + esc(v) + '</span>';
      }
      if (v.length > 60) {
        return '<span style="color:#fff" title="' + esc(v) + '">"' +
               esc(v.substring(0, 60)) + '…"</span>';
      }
      return '<span style="color:#fff">"' + esc(v) + '"</span>';
    }
    if (v && typeof v === 'object') {
      // Date object (edge case — usually we get ms numbers)
      if (v instanceof Date) {
        var fmt2 = formatDateValue(v);
        if (fmt2) return '<span style="color:#3B99FC">' + esc(fmt2) + '</span>';
      }
      // Big.js decimal
      if (typeof v.toFixed === 'function' && typeof v.s !== 'undefined' && Array.isArray(v.c)) {
        return '<span style="color:#3B99FC">' + v.toString() + '</span>';
      }
      return '<span style="color:#9333EA">[' + (Array.isArray(v) ? 'Array ' + v.length : 'Object') + ']</span>';
    }
    return esc(String(v));
  }

  // ------------------------------------------------------------
  // Render panel
  // ------------------------------------------------------------

  function buildHtml() {
    var filtered       = state.entries.filter(function (e) { return matchesQuery(e, state.query); });
    var filteredParams = state.pageParams.filter(function (e) { return matchesQuery(e, state.query); });
    var filteredCached = state.cached.filter(function (e) { return matchesQuery(e, state.query); });
    var totalObjects = 0;
    state.entries.forEach(function (e) { totalObjects += e.objectCount || 0; });

    var html = '';

    // Header
    html +=
      '<div class="mxi-dp2-header">' +
        '<div class="mxi-dp2-title">' +
          '<span class="mxi-dp2-dot"></span>' +
          '<span>Data Inspector</span>' +
        '</div>' +
        '<div class="mxi-dp2-actions">' +
          '<button class="mxi-dp2-iconbtn" id="mxi-dp2-refresh" title="Refresh scan">⟳</button>' +
          '<button class="mxi-dp2-iconbtn" id="mxi-dp2-close" title="Close">✕</button>' +
        '</div>' +
      '</div>';

    // Search + summary row
    html +=
      '<div class="mxi-dp2-subheader">' +
        '<div class="mxi-dp2-search">' +
          '<span class="mxi-dp2-search-icon">⌕</span>' +
          '<input type="text" id="mxi-dp2-search-input" ' +
            'placeholder="Search entities, attributes, values…" ' +
            'value="' + esc(state.query) + '" autocomplete="off" spellcheck="false" />' +
          (state.query ? '<button class="mxi-dp2-search-clear" id="mxi-dp2-search-clear">✕</button>' : '') +
        '</div>' +
        '<div class="mxi-dp2-summary">' +
          (state.pageParams.length ?
            '<span class="mxi-dp2-pill"><b>' + state.pageParams.length + '</b> context</span>' : '') +
          '<span class="mxi-dp2-pill"><b>' + state.entries.length + '</b> on page</span>' +
          (state.cached.length ?
            '<span class="mxi-dp2-pill"><b>' + state.cached.length + '</b> cached</span>' : '') +
          '<span class="mxi-dp2-pill"><b>' + totalObjects + '</b> objects</span>' +
        '</div>' +
      '</div>';

    // Body
    html += '<div class="mxi-dp2-body">';

    var totalFiltered = filtered.length + filteredParams.length + filteredCached.length;

    if (totalFiltered === 0) {
      if (state.query) {
        html +=
          '<div class="mxi-dp2-empty">' +
            '<div class="mxi-dp2-empty-icon">⌕</div>' +
            '<div class="mxi-dp2-empty-title">No matches for "' + esc(state.query) + '"</div>' +
            '<div class="mxi-dp2-empty-sub">Try a shorter query or an attribute value.</div>' +
          '</div>';
      } else {
        html +=
          '<div class="mxi-dp2-empty">' +
            '<div class="mxi-dp2-empty-icon">⌘</div>' +
            '<div class="mxi-dp2-empty-title">No data found</div>' +
            '<div class="mxi-dp2-empty-sub">DataViews, ListViews, DataGrids and Galleries<br>' +
            'will appear here once their data has loaded.</div>' +
          '</div>';
      }
    } else {
      // Helper — tiny inline SVG icon, 14x14, currentColor
      var iconSvg = {
        stack: '<svg class="mxi-dp2-sec-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M224.47,104,130.93,50.8a5.94,5.94,0,0,0-5.86,0L31.53,104a6,6,0,0,0,0,10.43l93.54,53.22a5.94,5.94,0,0,0,5.86,0l93.54-53.22A6,6,0,0,0,224.47,104Zm9.29,37-11.33-6.44L131,186.77a17.6,17.6,0,0,1-17.56,0L22.57,134.6,11.24,141a6,6,0,0,0,0,10.43l113.83,64.77a5.94,5.94,0,0,0,5.86,0L244.76,151.46A6,6,0,0,0,233.76,141.07Zm0,40-11.33-6.44L131,226.77a17.6,17.6,0,0,1-17.56,0L22.57,174.6,11.24,181a6,6,0,0,0,0,10.43l113.83,64.77a5.94,5.94,0,0,0,5.86,0L244.76,191.46A6,6,0,0,0,233.76,181.07Z"/></svg>',
        db:    '<svg class="mxi-dp2-sec-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,13,46.23,20.64,80,20.64s62.94-7.68,80-20.64Zm-21.61,74.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,13,46.23,20.64,80,20.64s62.94-7.68,80-20.64V176C208,185.62,200.12,195.43,186.39,202.92Z"/></svg>',
        archive: '<svg class="mxi-dp2-sec-icon" viewBox="0 0 256 256" fill="currentColor"><path d="M216,56H40A16,16,0,0,0,24,72V96a16,16,0,0,0,16,16v88a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V112a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM200,200H56V112H200ZM216,96H40V72H216ZM104,144a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,144Z"/></svg>'
      };

      // Section 1 — Context Objects
      if (filteredParams.length) {
        html += '<div class="mxi-dp2-section-header">' +
                  iconSvg.stack +
                  '<span class="mxi-dp2-section-title">Context Objects</span>' +
                  '<span class="mxi-dp2-section-hint">page parameters, dependencies &amp; optimizations Mendix loaded</span>' +
                '</div>';
        filteredParams.forEach(function (entry) { html += renderEntity(entry); });
      }

      // Section 2 — On Page
      if (filtered.length) {
        html += '<div class="mxi-dp2-section-header">' +
                  iconSvg.db +
                  '<span class="mxi-dp2-section-title">On Page</span>' +
                  '<span class="mxi-dp2-section-hint">data visible in containers</span>' +
                '</div>';
        filtered.forEach(function (entry) { html += renderEntity(entry); });
      }

      // Section 3 — Cached
      if (filteredCached.length) {
        html += '<div class="mxi-dp2-section-header">' +
                  iconSvg.archive +
                  '<span class="mxi-dp2-section-title">Other Cached</span>' +
                  '<span class="mxi-dp2-section-hint">other objects Mendix has in memory</span>' +
                '</div>';
        filteredCached.forEach(function (entry) { html += renderEntity(entry); });
      }
    }

    html += '</div>'; // body
    return html;
  }

  function paramMatchesQuery(p, q) {
    if (!q) return true;
    q = q.toLowerCase();
    if (p.name && p.name.toLowerCase().indexOf(q) > -1) return true;
    if (p.entity && p.entity.toLowerCase().indexOf(q) > -1) return true;
    if (p.guid && p.guid.toLowerCase().indexOf(q) > -1) return true;
    var keys = Object.keys(p.attributes || {});
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase().indexOf(q) > -1) return true;
      var v = p.attributes[keys[i]];
      if (v != null && String(v).toLowerCase().indexOf(q) > -1) return true;
    }
    return false;
  }

  function renderPageParam(p) {
    var isExpanded = (state.expandedParam === p.name);
    var shortEntity = p.entity ? p.entity.split('.').pop() : 'unknown';
    var module = p.entity && p.entity.indexOf('.') > -1 ? p.entity.split('.')[0] : '';
    var attrKeys = Object.keys(p.attributes || {});
    var color = '#FFB800'; // page params get our brand yellow

    var html = '<div class="mxi-dp2-param' + (isExpanded ? ' expanded' : '') + '" ' +
               'data-param="' + esc(p.name) + '">';

    html +=
      '<div class="mxi-dp2-param-row" data-action="toggle-param">' +
        '<div class="mxi-dp2-param-marker" style="background:' + color + '"></div>' +
        '<div class="mxi-dp2-param-main">' +
          '<div class="mxi-dp2-param-name">' +
            '<span class="mxi-dp2-param-pname">' + esc(p.name) + '</span>' +
            '<span class="mxi-dp2-param-arrow">→</span>' +
            '<span class="mxi-dp2-param-entity">' + esc(shortEntity) + '</span>' +
            (module ? '<span class="mxi-dp2-entity-module">' + esc(module) + '</span>' : '') +
          '</div>' +
          '<div class="mxi-dp2-entity-meta">' +
            (p.isList ?
              '<span class="mxi-dp2-chip mxi-dp2-chip-count">list · ' + (p.count || 0) + '</span>' :
              '<span class="mxi-dp2-chip mxi-dp2-chip-count">' + attrKeys.length + ' attr</span>') +
            '<span class="mxi-dp2-chip" style="color:' + color + ';border-color:' + color + '44">PARAM</span>' +
          '</div>' +
        '</div>' +
        '<div class="mxi-dp2-chevron">' + (isExpanded ? '▾' : '▸') + '</div>' +
      '</div>';

    if (isExpanded && !p.isList) {
      html += '<div class="mxi-dp2-entity-body">';
      if (attrKeys.length) {
        html += '<div class="mxi-dp2-attrs">';
        attrKeys.forEach(function (name) {
          var val = p.attributes[name];
          var hint = { name: name, type: p.attributeTypes && p.attributeTypes[name] };
          html +=
            '<div class="mxi-dp2-attr" data-action="copy-param-attr" data-attr-name="' + esc(name) +
              '" data-attr-value="' + esc(String(val == null ? '' : val)) + '">' +
              '<span class="mxi-dp2-aname">' + esc(name) + '</span>' +
              '<span class="mxi-dp2-aval">' + renderValue(val, hint) + '</span>' +
            '</div>';
        });
        html += '</div>';
      } else {
        html += '<div class="mxi-dp2-attr-empty">No attributes available for this page parameter.</div>';
      }
      if (p.guid) {
        html += '<div class="mxi-dp2-param-footer">' +
                  '<span>GUID</span>' +
                  '<code class="mxi-dp2-param-guid">' + esc(p.guid) + '</code>' +
                '</div>';
      }
      html += '</div>';
    }
    if (isExpanded && p.isList) {
      html += '<div class="mxi-dp2-entity-body">' +
                '<div class="mxi-dp2-attr-empty">' +
                  'List page parameter — ' + p.count + ' object' + (p.count === 1 ? '' : 's') +
                  '. Expand the matching entity below to see items.' +
                '</div>' +
              '</div>';
    }

    html += '</div>';
    return html;
  }

  // v0.2.8 — composite key so same-entity entries in different sections
  // (e.g. On Page MRPRunPlanningPeriod vs Cached MRPRunPlanningPeriod)
  // have independent expansion state.
  function entryKey(entry) {
    return (entry.category || 'onPage') + '::' + entry.entity;
  }

  function renderEntity(entry) {
    var key = entryKey(entry);
    var isExpanded = (state.expandedEntity === key);
    var widgetNames = entry.containers.map(function (c) { return c.name; }).filter(Boolean);

    var html = '<div class="mxi-dp2-entity' + (isExpanded ? ' expanded' : '') + '" ' +
               'data-entity="' + esc(entry.entity) + '" ' +
               'data-category="' + esc(entry.category || 'onPage') + '" ' +
               // v0.2.28 — color inherits down to objects so pills match entity color
               'style="--mxi-dp2-entity-color:' + entry.color + '">';

    // Entity header row
    html +=
      '<div class="mxi-dp2-entity-row" data-action="toggle-entity">' +
        '<div class="mxi-dp2-entity-marker" style="background:' + entry.color + '"></div>' +
        '<div class="mxi-dp2-entity-main">' +
          '<div class="mxi-dp2-entity-name">' +
            esc(entry.shortName) +
            (entry.module ? '<span class="mxi-dp2-entity-module">' + esc(entry.module) + '</span>' : '') +
          '</div>' +
          '<div class="mxi-dp2-entity-meta">' +
            '<span class="mxi-dp2-chip" style="color:' + entry.color + ';border-color:' + entry.color + '44">' +
              entry.type +
            '</span>' +
            '<span class="mxi-dp2-chip mxi-dp2-chip-count">' + entry.objectCount + ' obj</span>' +
            (entry.alsoOnPage ?
              '<span class="mxi-dp2-chip" style="color:#3B99FC;border-color:#3B99FC55" ' +
              'title="This entity is also rendered in a container on the page">also on page</span>' : '') +
            (widgetNames.length ?
              '<span class="mxi-dp2-chip mxi-dp2-chip-widget" data-action="highlight-widgets" ' +
              'title="Highlight all containers on page">' +
              widgetNames.length + ' widget' + (widgetNames.length === 1 ? '' : 's') +
              '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="mxi-dp2-chevron">' + (isExpanded ? '▾' : '▸') + '</div>' +
      '</div>';

    // Expanded body
    if (isExpanded) {
      html += '<div class="mxi-dp2-entity-body">';

      // Objects list
      if (entry.objects.length) {
        html += '<div class="mxi-dp2-objects">';
        entry.objects.forEach(function (obj, oi) {
          var key = entryKey(entry) + ':' + oi;
          var objExpanded = (state.expandedObject === key);
          var attrKeys = Object.keys(obj.attributes || {});

          // v0.2.15 — show isNew/isChanged state badges instead of a random attr preview
          var stateBadges = '';
          if (obj.isNew) {
            stateBadges += '<span class="mxi-dp2-state-badge mxi-dp2-state-new" ' +
                              'title="This object is new and has not been committed yet">NEW</span>';
          }
          if (obj.isChanged) {
            stateBadges += '<span class="mxi-dp2-state-badge mxi-dp2-state-changed" ' +
                              'title="This object has uncommitted changes">CHANGED</span>';
          }

          html +=
            '<div class="mxi-dp2-object' + (objExpanded ? ' expanded' : '') + '" data-object-idx="' + oi + '">' +
              '<div class="mxi-dp2-object-row" data-action="toggle-object">' +
                '<span class="mxi-dp2-oidx">#' + (oi + 1) + '</span>' +
                (obj.guid ?
                  '<span class="mxi-dp2-oguid" data-action="copy-guid" ' +
                    'data-attr-value="' + esc(obj.guid) + '" ' +
                    'title="Click to copy GUID">' + esc(obj.guid) + '</span>' :
                  '<span class="mxi-dp2-oguid mxi-dp2-oguid-empty"><i>no-guid</i></span>') +
                stateBadges +
                '<span class="mxi-dp2-ocount">' + attrKeys.length + ' attr</span>' +
                '<span class="mxi-dp2-chevron-sm">' + (objExpanded ? '▾' : '▸') + '</span>' +
              '</div>';

          if (objExpanded) {
            html += '<div class="mxi-dp2-attrs">';

            // v0.2.7 — Parent container context (GUID lives in the row header now)
            if (obj.parentContainer && obj.parentContainer.name) {
              html += '<div class="mxi-dp2-obj-meta">' +
                        '<div class="mxi-dp2-obj-meta-row">' +
                          '<span class="mxi-dp2-meta-label">Container</span>' +
                          '<span class="mxi-dp2-meta-value">' +
                            esc(obj.parentContainer.name) +
                            ' <span style="color:#555">(' + obj.parentContainer.type + ')</span>' +
                          '</span>' +
                        '</div>' +
                      '</div>';
            }

            // v0.2.12 — Associations section, ported 1:1 from old widget panel:
            //   - full GUID shown (no truncation per user request)
            //   - checkmark ✓ when value is present
            //   - clickable eye icon to highlight the associated element on page
            //   - PAGE PARAM badge when association matches a known context entity
            //   - 'empty' when no value and not a page param
            if (obj.associations && obj.associations.length) {
              html += '<div class="mxi-dp2-subsec-assoc">' +
                        '<div class="mxi-dp2-subsec-label">' +
                          'Associations <span class="mxi-dp2-subsec-count">' + obj.associations.length + '</span>' +
                        '</div>';

              // Build a list of context entity short names for matching
              var ctxNames = state.pageParams.map(function (e) { return e.shortName; })
                              .concat(state.pageParams.map(function (e) { return e.entity; }));

              obj.associations.forEach(function (assoc) {
                var hasValue  = assoc.value && assoc.value !== '' && assoc.value !== 'null';
                // v0.2.16 — Keep the FULL association name after the module prefix,
                // so role suffixes like _Previous / _Next / _SecondaryOwner remain visible.
                // "MRPRun.MRPRunPlanningPeriod_Previous" → "MRPRunPlanningPeriod_Previous"
                var displayName = String(assoc.name).split('.').pop();
                // For page-param matching we still need the base entity name (without role)
                var baseEntityName = displayName.split('_')[0];
                var isPageParam = ctxNames.indexOf(baseEntityName) > -1;

                html +=
                  '<div class="mxi-dp2-assoc" data-action="highlight-assoc" ' +
                       'data-assoc-name="' + esc(assoc.name) + '" ' +
                       'data-assoc-value="' + esc(String(assoc.value || '')) + '" ' +
                       'title="Click to highlight on page">' +
                    '<span class="mxi-dp2-assoc-name">' + esc(displayName) + '</span>' +
                    '<span class="mxi-dp2-assoc-right">';

                if (hasValue) {
                  html += '<span class="mxi-dp2-assoc-check"><svg viewBox="0 0 256 256" fill="currentColor" width="10" height="10" style="vertical-align:middle"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg></span>' +
                          '<span class="mxi-dp2-assoc-val">' + esc(String(assoc.value)) + '</span>' +
                          '<span class="mxi-dp2-assoc-eye" aria-hidden="true">' +
                            '<svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">' +
                              '<path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>' +
                            '</svg>' +
                          '</span>';
                } else if (isPageParam) {
                  html += '<span class="mxi-dp2-assoc-badge" title="Value comes from a page parameter">PAGE PARAM</span>' +
                          '<span class="mxi-dp2-assoc-eye mxi-dp2-assoc-eye-pp" aria-hidden="true">' +
                            '<svg width="12" height="12" viewBox="0 0 256 256" fill="currentColor">' +
                              '<path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>' +
                            '</svg>' +
                          '</span>';
                } else {
                  html += '<span class="mxi-dp2-assoc-empty">empty</span>';
                }

                html += '</span></div>';
              });
              html += '</div>';
            }

            // Attributes section
            if (attrKeys.length === 0) {
              html += '<div class="mxi-dp2-attr-empty">No attributes extracted</div>';
            } else {
              html += '<div class="mxi-dp2-subsec-label">' +
                        'Attributes <span class="mxi-dp2-subsec-count">' + attrKeys.length + '</span>' +
                      '</div>';
              attrKeys.forEach(function (name) {
                var val = obj.attributes[name];
                var hint = { name: name, type: obj.attributeTypes && obj.attributeTypes[name] };
                html +=
                  '<div class="mxi-dp2-attr" data-action="copy-attr" data-attr-name="' + esc(name) +
                    '" data-attr-value="' + esc(String(val == null ? '' : val)) + '">' +
                    '<span class="mxi-dp2-aname">' + esc(name) + '</span>' +
                    '<span class="mxi-dp2-aval">' + renderValue(val, hint) + '</span>' +
                  '</div>';
              });
            }

            // v0.2.17 — System Members section (Owner, CreatedDate, ChangedDate, etc.)
            if (obj.systemMembers && obj.systemMembers.length) {
              html += '<div class="mxi-dp2-subsec-label mxi-dp2-subsec-system">' +
                        'System Members <span class="mxi-dp2-subsec-count">' +
                        obj.systemMembers.length + '</span>' +
                      '</div>';
              obj.systemMembers.forEach(function (sm) {
                html +=
                  '<div class="mxi-dp2-attr mxi-dp2-sysattr" data-action="copy-attr" ' +
                       'data-attr-name="' + esc(sm.name) + '" ' +
                       'data-attr-value="' + esc(String(sm.value == null ? '' : sm.value)) + '">' +
                    '<span class="mxi-dp2-aname">' + esc(sm.name) + '</span>' +
                    '<span class="mxi-dp2-aval mxi-dp2-sysval">' + esc(String(sm.value)) + '</span>' +
                  '</div>';
              });
            }
            html += '</div>';
          }

          html += '</div>';
        });
        html += '</div>';
      }

      html += '</div>'; // entity-body
    }

    html += '</div>'; // entity
    return html;
  }

  // ------------------------------------------------------------
  // Render / re-render
  // ------------------------------------------------------------

  function render() {
    if (!state.panel) return;
    var scrollY = state.panel.querySelector('.mxi-dp2-body');
    var savedScroll = scrollY ? scrollY.scrollTop : 0;

    state.panel.innerHTML = buildHtml();
    wireEvents();

    // v0.2.4 — innerHTML wipe removed the resize handle; re-add it + re-wire drag
    // v0.2.29 — skip drag + corner resize when embedded; the main panel owns those.
    var isEmbedded = state.panel.classList.contains('mxi-dp2-embedded');
    if (!isEmbedded) {
      var existingResize = state.panel.querySelector('.mxi-dp2-resize');
      if (!existingResize) {
        var handle = document.createElement('div');
        handle.className = 'mxi-dp2-resize';
        handle.setAttribute('aria-label', 'Resize');
        state.panel.appendChild(handle);
        setupResize(state.panel, handle);
      }
      setupDrag(state.panel);
    } else {
      // v0.2.30 — when embedded, the header acts as a drag-down handle to close
      setupDragToClose(state.panel);
    }

    // Restore scroll
    var newBody = state.panel.querySelector('.mxi-dp2-body');
    if (newBody) newBody.scrollTop = savedScroll;

    // Auto-focus search if query active
    var input = document.getElementById('mxi-dp2-search-input');
    if (input && state.query) {
      var len = input.value.length;
      input.focus();
      try { input.setSelectionRange(len, len); } catch (e) {}
    }
  }

  // ------------------------------------------------------------
  // Event wiring (delegated)
  // ------------------------------------------------------------

  function wireEvents() {
    if (!state.panel) return;

    var closeBtn = document.getElementById('mxi-dp2-close');
    if (closeBtn) closeBtn.onclick = close;

    var refreshBtn = document.getElementById('mxi-dp2-refresh');
    if (refreshBtn) refreshBtn.onclick = function () {
      refreshBtn.classList.add('spinning');
      refresh();
      setTimeout(function () { refreshBtn.classList.remove('spinning'); }, 400);
    };

    // v0.2.21 — Widget Inspect button removed from the Data Inspector header.
    // Click-through-to-specific-object is parked on the future roadmap; the
    // Data Inspector's primary job is showing correct data + highlighting from
    // panel interactions (hover/click rows, not reverse-direction from page).
    // Widget inspect mode still exists in inspector.js for anyone who triggers
    // it externally, but there is no UI button for it on the Data Inspector.

    var searchInput = document.getElementById('mxi-dp2-search-input');
    if (searchInput) {
      searchInput.oninput = function () {
        state.query = searchInput.value;
        render();
      };
    }

    var searchClear = document.getElementById('mxi-dp2-search-clear');
    if (searchClear) searchClear.onclick = function () {
      state.query = '';
      render();
    };

    // Delegated clicks on entity / object / container / attr rows
    state.panel.querySelectorAll('[data-action]').forEach(function (el) {
      el.onclick = function (e) {
        e.stopPropagation();
        var action = el.getAttribute('data-action');
        var entityEl = el.closest('[data-entity]');
        var entity = entityEl ? entityEl.getAttribute('data-entity') : null;
        var category = entityEl ? (entityEl.getAttribute('data-category') || 'onPage') : 'onPage';
        // v0.2.8 — look up entry across all three sections (was previously on-page only)
        var lookup = (category === 'pageParam') ? state.pageParams
                   : (category === 'cached')   ? state.cached
                                               : state.entries;
        var entry = lookup.find(function (x) { return x.entity === entity; });
        var compositeKey = category + '::' + entity;

        if (action === 'toggle-entity') {
          state.expandedEntity = (state.expandedEntity === compositeKey) ? null : compositeKey;
          state.expandedObject = null;
          render();
        } else if (action === 'toggle-object') {
          var oIdx = parseInt(el.closest('.mxi-dp2-object').getAttribute('data-object-idx'), 10);
          var key = compositeKey + ':' + oIdx;
          var wasExpanded = (state.expandedObject === key);
          state.expandedObject = wasExpanded ? null : key;
          render();
          // v0.2.25 — pin the highlight so it persists until the user clicks
          // this object again (collapse), clicks a different object, or
          // closes the Data Inspector.
          if (wasExpanded) {
            // Collapsed this one → remove its pin
            unpinPersistentHighlight();
          } else if (entry && entry.objects[oIdx]) {
            var oToHi = entry.objects[oIdx];
            var elsToHi = (oToHi.elements && oToHi.elements.length) ? oToHi.elements.filter(Boolean)
                                                                     : (oToHi.element ? [oToHi.element] : []);
            if (elsToHi.length) {
              pinPersistentHighlight(elsToHi, entry.color, entry.shortName + ' #' + (oIdx + 1));
              // Scroll first element into view if off-screen (matching
              // the behaviour highlightElements used to provide)
              var firstEl = elsToHi[0];
              if (firstEl && firstEl.getBoundingClientRect) {
                var rr = firstEl.getBoundingClientRect();
                var off = rr.bottom < 0 || rr.top > window.innerHeight ||
                          rr.right < 0 || rr.left > window.innerWidth;
                if (off) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              }
            }
          }
        } else if (action === 'highlight-widgets') {
          if (entry) {
            var els = entry.containers.map(function (c) { return c.element; }).filter(Boolean);
            highlightElements(els, entry.color, entry.shortName + ' (' + els.length + ')');
          }
        } else if (action === 'highlight-container') {
          var cIdx = parseInt(el.getAttribute('data-container-idx'), 10);
          if (entry && entry.containers[cIdx]) {
            highlightElements([entry.containers[cIdx].element], entry.color,
              entry.containers[cIdx].name || entry.shortName);
          }
        } else if (action === 'copy-attr') {
          var attrName = el.getAttribute('data-attr-name');
          var attrValue = el.getAttribute('data-attr-value');
          copyToClipboard(attrValue);
          flashCopied(el, attrName);
        } else if (action === 'copy-guid') {
          var guidVal = el.getAttribute('data-attr-value');
          copyToClipboard(guidVal);
          // Visual feedback — works for either the inline oguid span or the meta row
          var target = el.querySelector('code') || el;
          var orig = target.textContent;
          var origColor = target.style.color;
          target.innerHTML = '<svg viewBox="0 0 256 256" fill="currentColor" width="10" height="10" style="vertical-align:middle"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg> copied GUID';
          target.style.color = '#3DDC97';
          setTimeout(function () {
            target.textContent = orig;
            target.style.color = origColor;
          }, 900);
        } else if (action === 'highlight-assoc') {
          // v0.2.12 — Reuse the old panel's exact logic (exposed on window.__mxi*)
          var assocName  = el.getAttribute('data-assoc-name');
          var assocValue = el.getAttribute('data-assoc-value');
          var shortName  = String(assocName).split('.').pop().split('_').pop();

          if (typeof window.__mxiFindAssociatedElement === 'function' &&
              typeof window.__mxiToggleHighlight === 'function') {
            var found = window.__mxiFindAssociatedElement(assocName, assocValue);
            if (found) {
              window.__mxiToggleHighlight(found, '#3B99FC', shortName);
            } else if (typeof window.__mxiShowToast === 'function') {
              window.__mxiShowToast('Not visible on page');
            }
          } else {
            console.warn('[MXI] Association highlight helpers not available');
          }
        } else if (action === 'toggle-param') {
          var paramEl = el.closest('[data-param]');
          var paramName = paramEl ? paramEl.getAttribute('data-param') : null;
          state.expandedParam = (state.expandedParam === paramName) ? null : paramName;
          render();
        } else if (action === 'copy-param-attr') {
          var pname = el.getAttribute('data-attr-name');
          var pval  = el.getAttribute('data-attr-value');
          copyToClipboard(pval);
          flashCopied(el, pname);
        }
      };
    });

    // Hover highlight on entity row
    state.panel.querySelectorAll('.mxi-dp2-entity-row').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var entityEl = row.closest('[data-entity]');
        var entity = entityEl.getAttribute('data-entity');
        var category = entityEl.getAttribute('data-category') || 'onPage';
        var lookup = (category === 'pageParam') ? state.pageParams
                   : (category === 'cached')   ? state.cached
                                               : state.entries;
        var entry = lookup.find(function (x) { return x.entity === entity; });
        if (entry && entry.containers.length) {
          var els = entry.containers.map(function (c) { return c.element; }).filter(Boolean);
          fadePersistentHighlightIfDifferent(els);
          highlightElements(els, entry.color, entry.shortName);
        }
      });
      row.addEventListener('mouseleave', clearPageHighlight);
    });

    // Hover on object row
    state.panel.querySelectorAll('.mxi-dp2-object-row').forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var entityEl = row.closest('[data-entity]');
        var entity = entityEl.getAttribute('data-entity');
        var category = entityEl.getAttribute('data-category') || 'onPage';
        var lookup = (category === 'pageParam') ? state.pageParams
                   : (category === 'cached')   ? state.cached
                                               : state.entries;
        var entry = lookup.find(function (x) { return x.entity === entity; });
        var oIdx = parseInt(row.closest('.mxi-dp2-object').getAttribute('data-object-idx'), 10);
        if (entry && entry.objects[oIdx]) {
          // v0.2.22 — highlight ALL DOM nodes an object renders in. When the
          // same MxObject is rendered in multiple listviews (e.g. a "titles"
          // listview + a "values" listview), elements[] has both.
          var o = entry.objects[oIdx];
          var els = (o.elements && o.elements.length) ? o.elements.filter(Boolean)
                                                       : (o.element ? [o.element] : []);
          if (els.length) {
            fadePersistentHighlightIfDifferent(els);
            highlightElements(els, entry.color, entry.shortName + ' #' + (oIdx + 1));
          }
        }
      });
      row.addEventListener('mouseleave', clearPageHighlight);
    });
  }

  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (e) {}
  }

  function flashCopied(el, attrName) {
    var originalTitle = el.querySelector('.mxi-dp2-aname');
    if (!originalTitle) return;
    var orig = originalTitle.textContent;
    originalTitle.innerHTML = '<svg viewBox="0 0 256 256" fill="currentColor" width="10" height="10" style="vertical-align:middle"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg> copied ' + esc(attrName);
    originalTitle.style.color = '#3DDC97';
    setTimeout(function () {
      originalTitle.textContent = orig;
      originalTitle.style.color = '';
    }, 900);
  }

  // ------------------------------------------------------------
  // Bridge — called by inspector.js when an element is clicked
  // ------------------------------------------------------------

  function focusElement(element) {
    if (!state.open || !element || !state.entries.length) return;

    // Find which entry contains this element
    var targetEntry = null;
    var targetObjectIdx = -1;

    // v0.2.20 — Find the INNERMOST matching entry/object, not the first match.
    // The clicked element may be contained by nested DataViews (e.g. Input
    // inside PlanningPeriod's DataView inside MRPRunPlanning's DataView).
    // We want the CLOSEST ancestor container, which gives the most specific object.

    // Helper: depth from element up to ancestor (number of .parentElement hops)
    function ancestorDepth(ancestor, el) {
      if (!ancestor || !el) return -1;
      var d = 0, n = el;
      while (n) {
        if (n === ancestor) return d;
        n = n.parentElement;
        d++;
        if (d > 200) return -1;
      }
      return -1;
    }

    // Walk up from the clicked element collecting every MxObject the fiber
    // offers along the way. INNERMOST first. This gives priority to the
    // closest-object (PlanningPeriod) over the outermost (MRPRunPlanning).
    var objectsAlongPath = []; // [{mxObj, guid, depth}]
    var walker = element;
    var walkSteps = 0;
    var seenGuids = {};
    while (walker && walkSteps < 30) {
      try {
        var mx = getMxObjectFromElement(walker);
        if (mx) {
          var g = null;
          try { g = mx.getGuid(); } catch (e) {}
          if (g && !seenGuids[g]) {
            seenGuids[g] = true;
            objectsAlongPath.push({ mxObj: mx, guid: g, depth: walkSteps });
          }
        }
      } catch (e) {}
      walker = walker.parentElement;
      walkSteps++;
    }

    // Strategy A — innermost-first GUID match across all entries
    for (var p = 0; p < objectsAlongPath.length && !targetEntry; p++) {
      var clickedGuid = objectsAlongPath[p].guid;
      for (var i = 0; i < state.entries.length && !targetEntry; i++) {
        var entry = state.entries[i];
        for (var o = 0; o < entry.objects.length; o++) {
          if (entry.objects[o].guid === clickedGuid) {
            targetEntry = entry;
            targetObjectIdx = o;
            break;
          }
        }
      }
    }

    // Strategy B — INNERMOST containment check. Pick the entry whose container
    // is deepest (i.e., whose element is the closest ancestor of `element`).
    if (!targetEntry) {
      var bestDepth = Infinity;
      for (var i2 = 0; i2 < state.entries.length; i2++) {
        var entry2 = state.entries[i2];
        for (var c = 0; c < entry2.containers.length; c++) {
          var cEl = entry2.containers[c].element;
          if (!cEl) continue;
          if (cEl === element || cEl.contains(element)) {
            var d = ancestorDepth(cEl, element);
            if (d >= 0 && d < bestDepth) {
              bestDepth = d;
              targetEntry = entry2;
              targetObjectIdx = -1;
              // Find matching object within this container
              for (var o2 = 0; o2 < entry2.objects.length; o2++) {
                var oEl = entry2.objects[o2].element;
                if (oEl && (oEl === element || oEl.contains(element) || element.contains(oEl))) {
                  targetObjectIdx = o2;
                  break;
                }
              }
            }
          }
        }
      }
    }

    if (!targetEntry) return false;

    // v0.2.18 — If we matched by GUID but the object has no DOM element yet
    // (e.g. findRowElementsForContainer didn't find this row), backfill it
    // with the clicked element's nearest data-container-row ancestor so future
    // hover / re-focus works. Walk up from element but STOP at the container
    // so we don't grab the whole listview.
    if (targetObjectIdx >= 0) {
      var tObj = targetEntry.objects[targetObjectIdx];
      if (!tObj.element) {
        var containerEl = targetEntry.containers[0] && targetEntry.containers[0].element;
        var candidate = element;
        var bestAncestor = element;
        while (candidate && candidate !== containerEl && candidate !== document.body) {
          // Prefer ancestors that are direct children of the container
          if (candidate.parentElement === containerEl) {
            bestAncestor = candidate;
            break;
          }
          bestAncestor = candidate;
          candidate = candidate.parentElement;
        }
        tObj.element = bestAncestor;
      }
    }

    state.expandedEntity = entryKey(targetEntry);
    if (targetObjectIdx >= 0) {
      state.expandedObject = entryKey(targetEntry) + ':' + targetObjectIdx;
    }
    render();

    // Scroll panel to the entity (use category to disambiguate same-named entries)
    setTimeout(function () {
      var cat = targetEntry.category || 'onPage';
      var entityEl = state.panel.querySelector(
        '[data-entity="' + targetEntry.entity + '"][data-category="' + cat + '"]'
      );
      if (entityEl) {
        entityEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        entityEl.classList.add('mxi-dp2-flash');
        setTimeout(function () { entityEl.classList.remove('mxi-dp2-flash'); }, 1200);
      }

      // v0.2.18 — also scroll the specific OBJECT row into view + highlight
      // its rendered DOM element on the page so user sees the link visually.
      if (targetObjectIdx >= 0) {
        var objRow = state.panel.querySelector(
          '[data-entity="' + targetEntry.entity + '"][data-category="' + cat + '"] ' +
          '.mxi-dp2-object[data-object-idx="' + targetObjectIdx + '"]'
        );
        if (objRow) {
          objRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        var tObj3 = targetEntry.objects[targetObjectIdx];
        if (tObj3) {
          var pageEls = (tObj3.elements && tObj3.elements.length) ? tObj3.elements.filter(Boolean)
                                                                   : (tObj3.element ? [tObj3.element] : []);
          if (pageEls.length) {
            highlightElements(
              pageEls,
              targetEntry.color,
              targetEntry.shortName + ' #' + (targetObjectIdx + 1)
            );
          }
        }
      }
    }, 50);

    return true;
  }

  // ------------------------------------------------------------
  // Styles
  // ------------------------------------------------------------

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      '#' + PANEL_ID + '{',
        'position:fixed;top:20px;left:20px;width:432px;max-height:calc(100vh - 40px);',
        'background:#101010;border-radius:16px;',
        'box-shadow:0 0 0 1px #2A2A2A,0 30px 80px rgba(0,0,0,.7);',
        'font:13px/1.4 Inter,system-ui,-apple-system,sans-serif;color:#E0E0E0;',
        'z-index:999998;overflow:hidden;display:flex;flex-direction:column;',
        'animation:mxi-dp2-in .22s cubic-bezier(.2,.9,.3,1);',
      '}',
      '@keyframes mxi-dp2-in{from{opacity:0;transform:translateX(-16px) scale(.98)}to{opacity:1;transform:none}}',

      /* v0.2.29 — Embedded mode: drawer inside main panel body. */
      '#' + PANEL_ID + '.mxi-dp2-embedded{',
        'position:absolute;inset:0;top:0;left:0;right:0;bottom:0;',
        'width:auto;max-height:none;height:100%;',
        'border-radius:0;box-shadow:none;',
        'z-index:10;',
        'animation:none;',
        'transition:transform .24s cubic-bezier(.2,.9,.3,1);',
      '}',
      '#' + PANEL_ID + '.mxi-dp2-embedded .mxi-dp2-header{cursor:grab;position:relative;padding-top:18px}',
      '#' + PANEL_ID + '.mxi-dp2-embedded .mxi-dp2-header:active{cursor:grabbing}',
      /* v0.2.30 — drag grip hint. Visible pill at top-center of the drawer
       * hinting that the user can drag the drawer down to close. */
      '#' + PANEL_ID + '.mxi-dp2-embedded .mxi-dp2-header::before{',
        'content:"";position:absolute;top:6px;left:50%;transform:translateX(-50%);',
        'width:36px;height:4px;border-radius:2px;background:#3A3A3A;',
        'transition:background .15s,width .15s',
      '}',
      '#' + PANEL_ID + '.mxi-dp2-embedded .mxi-dp2-header:hover::before{background:#666;width:44px}',
      '#' + PANEL_ID + '.mxi-dp2-embedded.dragging{transition:none}',

      /* Header */
      '.mxi-dp2-header{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;',
                      'background:#0A0A0A;border-bottom:1px solid #1F1F1F}',
      '.mxi-dp2-title{display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px;color:#fff;',
                     'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.mxi-dp2-dot{width:10px;height:10px;border-radius:50%;background:#FFB800;flex-shrink:0;',
                   'box-shadow:0 0 0 3px rgba(255,184,0,.2),0 0 10px rgba(255,184,0,.6);',
                   'animation:mxi-dp2-dot 2.4s ease-in-out infinite}',
      '@keyframes mxi-dp2-dot{0%,100%{opacity:1}50%{opacity:.55}}',
      '.mxi-dp2-version{font-size:10px;color:#555;font-weight:400;letter-spacing:.5px;flex-shrink:0}',
      '.mxi-dp2-actions{display:flex;gap:4px;flex-shrink:0}',
      '.mxi-dp2-iconbtn{background:transparent;border:1px solid #2A2A2A;color:#999;',
                        'width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;',
                        'display:flex;align-items:center;justify-content:center;',
                        'transition:all .15s;padding:0;font-family:inherit}',
      '.mxi-dp2-iconbtn:hover{background:#1E1E1E;color:#fff;border-color:#3A3A3A}',
      '.mxi-dp2-iconbtn.spinning{animation:mxi-dp2-spin .5s ease-out}',
      /* v0.2.4 — active state for the Inspect button */
      '.mxi-dp2-iconbtn.active{background:#FFB800;color:#0A0A0A;border-color:#FFB800;',
                               'box-shadow:0 0 0 3px rgba(255,184,0,.2)}',
      '.mxi-dp2-iconbtn.active:hover{background:#FFC833;color:#0A0A0A;border-color:#FFC833}',
      /* v0.2.4 — resize handle at bottom-right corner */
      '.mxi-dp2-resize{position:absolute;right:0;bottom:0;width:16px;height:16px;',
                       'cursor:nwse-resize;z-index:10;',
                       'background:linear-gradient(135deg,transparent 50%,#3A3A3A 50%,#3A3A3A 60%,',
                                                'transparent 60%,transparent 70%,#3A3A3A 70%,#3A3A3A 80%,transparent 80%);',
                       'border-bottom-right-radius:16px;opacity:.6;transition:opacity .15s}',
      '.mxi-dp2-resize:hover{opacity:1}',
      '@keyframes mxi-dp2-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',

      /* Subheader: search + summary */
      '.mxi-dp2-subheader{padding:12px 16px;background:#0D0D0D;border-bottom:1px solid #1F1F1F;',
                         'display:flex;flex-direction:column;gap:10px}',
      '.mxi-dp2-search{position:relative;display:flex;align-items:center;',
                      'background:#1A1A1A;border:1px solid #2A2A2A;border-radius:10px;',
                      'transition:border-color .15s}',
      '.mxi-dp2-search:focus-within{border-color:#FFB800;box-shadow:0 0 0 3px rgba(255,184,0,.1)}',
      '.mxi-dp2-search-icon{padding:0 10px;color:#555;font-size:14px}',
      '#mxi-dp2-search-input{flex:1;background:transparent;border:none;outline:none;',
                              'color:#fff;font:13px/1.4 Inter,system-ui,sans-serif;',
                              'padding:9px 4px 9px 0}',
      '#mxi-dp2-search-input::placeholder{color:#555}',
      '.mxi-dp2-search-clear{background:transparent;border:none;color:#666;cursor:pointer;',
                            'padding:4px 10px;font-size:12px}',
      '.mxi-dp2-search-clear:hover{color:#fff}',
      '.mxi-dp2-summary{display:flex;gap:6px;flex-wrap:wrap}',
      '.mxi-dp2-pill{background:#1A1A1A;border:1px solid #242424;border-radius:6px;',
                    'padding:4px 10px;font-size:11px;color:#888;white-space:nowrap}',
      '.mxi-dp2-pill b{color:#fff;font-weight:600}',
      /* v0.2.30 — narrow panel: tighten pills and clip labels */
      '@container (max-width: 360px){',
        '.mxi-dp2-pill{padding:3px 7px;font-size:10px}',
      '}',

      /* Body */
      '.mxi-dp2-body{flex:1;overflow-y:auto;padding:8px;min-height:200px}',

      /* Empty state */
      '.mxi-dp2-empty{text-align:center;padding:60px 24px;color:#555}',
      '.mxi-dp2-empty-icon{font-size:36px;color:#2A2A2A;margin-bottom:12px}',
      '.mxi-dp2-empty-title{font-size:13px;color:#888;font-weight:500;margin-bottom:6px}',
      '.mxi-dp2-empty-sub{font-size:11px;color:#444;line-height:1.6}',

      /* Entity */
      '.mxi-dp2-entity{background:#141414;border:1px solid #1F1F1F;border-radius:10px;',
                      'margin-bottom:6px;overflow:hidden;transition:border-color .15s}',
      '.mxi-dp2-entity:hover{border-color:#2A2A2A}',
      '.mxi-dp2-entity.expanded{border-color:#2E2E2E;background:#161616}',
      '.mxi-dp2-entity.mxi-dp2-flash{animation:mxi-dp2-flash .9s ease-out}',
      '@keyframes mxi-dp2-flash{0%{background:#FFB80033}100%{background:#161616}}',

      '.mxi-dp2-entity-row{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;',
                           'transition:background .12s}',
      '.mxi-dp2-entity-row:hover{background:#1A1A1A}',
      '.mxi-dp2-entity-marker{width:3px;align-self:stretch;border-radius:2px;min-height:28px}',
      '.mxi-dp2-entity-main{flex:1;min-width:0}',
      '.mxi-dp2-entity-name{font-weight:600;color:#fff;font-size:13px;',
                           'display:flex;align-items:baseline;gap:8px}',
      '.mxi-dp2-entity-module{font-size:10px;color:#555;font-weight:400}',
      '.mxi-dp2-entity-meta{display:flex;gap:6px;margin-top:4px;flex-wrap:wrap}',
      '.mxi-dp2-chip{font-size:10px;padding:2px 8px;border-radius:10px;',
                    'background:#1F1F1F;border:1px solid #2A2A2A;color:#9A9A9A;',
                    'text-transform:uppercase;letter-spacing:.3px;font-weight:500}',
      '.mxi-dp2-chip-count{color:#FFB800;border-color:#FFB80033}',
      '.mxi-dp2-chip-widget{color:#3B99FC;border-color:#3B99FC33;cursor:pointer}',
      '.mxi-dp2-chip-widget:hover{background:#3B99FC22}',
      '.mxi-dp2-chevron{color:#444;font-size:14px;padding:0 4px}',

      /* Entity body */
      '.mxi-dp2-entity-body{padding:6px 12px 12px 12px;border-top:1px solid #1F1F1F}',
      '.mxi-dp2-subsec-title{font-size:10px;color:#555;text-transform:uppercase;',
                            'letter-spacing:.7px;margin:10px 0 6px 0;font-weight:600;',
                            'display:flex;align-items:center;gap:6px}',
      '.mxi-dp2-subsec-count{background:#1A1A1A;color:#888;padding:1px 6px;border-radius:4px;',
                            'font-size:10px;letter-spacing:0}',

      /* Containers list */
      '.mxi-dp2-containers{display:flex;flex-direction:column;gap:3px}',
      '.mxi-dp2-container{display:flex;align-items:center;gap:8px;padding:6px 8px;',
                          'background:#0D0D0D;border-radius:6px;cursor:pointer;',
                          'border:1px solid transparent;transition:all .12s}',
      '.mxi-dp2-container:hover{background:#161616;border-color:#2A2A2A}',
      '.mxi-dp2-cdot{width:6px;height:6px;border-radius:50%;flex-shrink:0}',
      '.mxi-dp2-cname{flex:1;font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#D0D0D0;',
                     'overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.mxi-dp2-ctype{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.3px}',

      /* Objects list */
      '.mxi-dp2-objects{display:flex;flex-direction:column;gap:3px}',
      '.mxi-dp2-object{background:#0D0D0D;border-radius:6px;border:1px solid transparent;',
                      'transition:border-color .12s;overflow:hidden}',
      '.mxi-dp2-object:hover{border-color:#2A2A2A}',
      '.mxi-dp2-object.expanded{border-color:#2E2E2E;background:#0A0A0A}',
      '.mxi-dp2-object-row{display:flex;align-items:center;gap:8px;padding:6px 8px;cursor:pointer}',
      '.mxi-dp2-object-row:hover{background:#161616}',
      '.mxi-dp2-oidx{color:var(--mxi-dp2-entity-color,#FFB800);font-weight:600;font-size:11px;min-width:26px}',
      '.mxi-dp2-oguid{font-family:ui-monospace,Menlo,monospace;font-size:10px;',
                      'color:var(--mxi-dp2-entity-color,#FFB800);',
                      'white-space:nowrap;cursor:pointer;padding:2px 6px;border-radius:4px;',
                      'background:color-mix(in srgb, var(--mxi-dp2-entity-color,#FFB800) 8%, #141410);',
                      'border:1px solid color-mix(in srgb, var(--mxi-dp2-entity-color,#FFB800) 25%, #2A2418);',
                      'transition:all .12s}',
      '.mxi-dp2-oguid:hover{background:color-mix(in srgb, var(--mxi-dp2-entity-color,#FFB800) 14%, #1A1608);',
                            'border-color:color-mix(in srgb, var(--mxi-dp2-entity-color,#FFB800) 40%, transparent);',
                            'filter:brightness(1.15)}',
      '.mxi-dp2-oguid-empty{color:#444;background:transparent;border:none;cursor:default}',
      '.mxi-dp2-oguid-empty:hover{background:transparent;border:none;color:#444}',
      /* v0.2.15 — Object state badges (isNew / isChanged) */
      '.mxi-dp2-state-badge{font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;',
                             'letter-spacing:.5px;text-transform:uppercase;white-space:nowrap;',
                             'flex-shrink:0}',
      '.mxi-dp2-state-new{color:#0A0A0A;background:#FFB800;border:1px solid #FFB800}',
      '.mxi-dp2-state-changed{color:#FF7A50;background:#FF7A5022;border:1px solid #FF7A5055}',
      '.mxi-dp2-ocount{font-size:9px;color:#555;text-transform:uppercase;letter-spacing:.3px;margin-left:auto}',
      '.mxi-dp2-chevron-sm{color:#444;font-size:11px}',

      /* Attrs */
      '.mxi-dp2-attrs{padding:6px 8px 8px 8px;border-top:1px solid #1A1A1A;',
                      'display:flex;flex-direction:column;gap:2px}',
      '.mxi-dp2-attr{display:flex;justify-content:space-between;align-items:baseline;gap:12px;',
                    'padding:4px 6px;border-radius:4px;cursor:pointer;transition:background .1s}',
      '.mxi-dp2-attr:hover{background:#161616}',
      '.mxi-dp2-aname{color:#9A9A9A;font-family:ui-monospace,Menlo,monospace;font-size:11px;',
                      'flex-shrink:0}',
      '.mxi-dp2-aval{font-family:ui-monospace,Menlo,monospace;font-size:11px;',
                     'text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
                     'min-width:0}',
      '.mxi-dp2-attr-empty{color:#555;font-style:italic;font-size:11px;padding:8px;text-align:center}',

      /* v0.2.5 — Object metadata (GUID + container) */
      '.mxi-dp2-obj-meta{margin:4px 0 10px 0;padding:6px 8px;background:#0A0A0A;',
                         'border-radius:6px;display:flex;flex-direction:column;gap:4px}',
      '.mxi-dp2-obj-meta-row{display:flex;align-items:center;gap:10px;padding:3px 0;',
                              'font-size:10px;cursor:default}',
      '.mxi-dp2-obj-meta-row[data-action="copy-guid"]{cursor:pointer;border-radius:4px;padding:3px 4px}',
      '.mxi-dp2-obj-meta-row[data-action="copy-guid"]:hover{background:#141414}',
      '.mxi-dp2-meta-label{color:#555;text-transform:uppercase;letter-spacing:.5px;',
                            'font-weight:600;min-width:64px;font-size:9px}',
      '.mxi-dp2-meta-value{color:#D0D0D0;font-family:ui-monospace,Menlo,monospace;',
                            'font-size:10px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.mxi-dp2-obj-meta-row code.mxi-dp2-meta-value{color:#FFB800;background:transparent;padding:0}',

      /* v0.2.5 — Subsection label (Associations / Attributes heading) */
      '.mxi-dp2-subsec-label{font-size:9px;color:#555;text-transform:uppercase;',
                              'letter-spacing:1px;margin:6px 0 4px 0;font-weight:600;',
                              'display:flex;align-items:center;gap:6px}',
      /* v0.2.17 — System Members subsection — slightly stronger visual break */
      '.mxi-dp2-subsec-system{margin-top:10px;padding-top:8px;border-top:1px dashed #1F1F1F}',
      '.mxi-dp2-sysattr{opacity:.75}',
      '.mxi-dp2-sysattr:hover{opacity:1}',
      '.mxi-dp2-sysval{color:#888;font-style:italic}',

      /* v0.2.12 — Associations section (1:1 port from old widget panel) */
      '.mxi-dp2-subsec-assoc{margin-bottom:8px;background:#1A1A1A;border-radius:6px;overflow:hidden}',
      '.mxi-dp2-subsec-assoc .mxi-dp2-subsec-label{padding:6px 10px 0 10px;margin:0}',
      '.mxi-dp2-assoc{display:flex;justify-content:space-between;align-items:center;',
                      'padding:6px 10px;border-bottom:1px solid #252525;font-size:11px;',
                      'cursor:pointer;transition:background .1s;gap:12px}',
      '.mxi-dp2-assoc:last-child{border-bottom:none}',
      '.mxi-dp2-assoc:hover{background:#242424}',
      '.mxi-dp2-assoc-name{color:#3B99FC;font-family:ui-monospace,Menlo,monospace;',
                            'flex-shrink:0;font-size:10px}',
      '.mxi-dp2-assoc-right{display:flex;align-items:center;gap:6px;',
                             'min-width:0;justify-content:flex-end}',
      '.mxi-dp2-assoc-check{color:#3DDC97;font-size:10px;flex-shrink:0}',
      /* Full value — no truncation, monospace, yellow to match GUID pill style */
      '.mxi-dp2-assoc-val{color:#FFB800;font-family:ui-monospace,Menlo,monospace;',
                           'font-size:10px;white-space:nowrap}',
      '.mxi-dp2-assoc-eye{color:#3B99FC;display:flex;align-items:center;opacity:.6;',
                           'flex-shrink:0;transition:opacity .15s}',
      '.mxi-dp2-assoc:hover .mxi-dp2-assoc-eye{opacity:1}',
      '.mxi-dp2-assoc-eye-pp{color:#FFB800}',
      '.mxi-dp2-assoc-badge{color:#FFB800;font-size:8px;background:#FFB80022;',
                             'padding:2px 6px;border-radius:3px;font-weight:600;',
                             'letter-spacing:.5px;flex-shrink:0}',
      '.mxi-dp2-assoc-empty{color:#444;font-size:9px;font-style:italic}',


      /* v0.2.16 — Section headers: match main panel style (white icon + text).
       * Title stays on one line; hint truncates gracefully. */
      '.mxi-dp2-section-header{display:flex;align-items:center;gap:8px;',
                                'padding:14px 4px 8px 4px;margin-top:4px;',
                                'font-size:12px;font-weight:500;color:#FFFFFF;',
                                'letter-spacing:-.2px;min-width:0}',
      '.mxi-dp2-section-header:first-child{margin-top:0;padding-top:4px}',
      '.mxi-dp2-sec-icon{width:14px;height:14px;flex-shrink:0;color:#FFFFFF;',
                          'display:inline-block;vertical-align:middle}',
      '.mxi-dp2-section-title{color:#FFFFFF;font-weight:500;flex-shrink:0;white-space:nowrap}',
      '.mxi-dp2-section-hint{font-size:10px;color:#666;font-weight:400;margin-left:4px;',
                              'min-width:0;overflow:hidden;text-overflow:ellipsis;',
                              'white-space:nowrap;flex:1}',

      /* v0.2.1 — Page parameter cards */
      '.mxi-dp2-param{background:#141414;border:1px solid #FFB80033;border-radius:10px;',
                      'margin-bottom:6px;overflow:hidden;transition:border-color .15s}',
      '.mxi-dp2-param:hover{border-color:#FFB80066}',
      '.mxi-dp2-param.expanded{border-color:#FFB80088;background:#161410}',
      '.mxi-dp2-param-row{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;',
                          'transition:background .12s}',
      '.mxi-dp2-param-row:hover{background:#1A1814}',
      '.mxi-dp2-param-marker{width:3px;align-self:stretch;border-radius:2px;min-height:28px}',
      '.mxi-dp2-param-main{flex:1;min-width:0}',
      '.mxi-dp2-param-name{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}',
      '.mxi-dp2-param-pname{font-family:ui-monospace,Menlo,monospace;font-weight:600;',
                            'color:#FFB800;font-size:12px}',
      '.mxi-dp2-param-arrow{color:#555;font-size:11px}',
      '.mxi-dp2-param-entity{font-weight:600;color:#fff;font-size:13px}',
      '.mxi-dp2-param-footer{display:flex;align-items:center;gap:8px;margin-top:8px;',
                              'padding:6px 8px;background:#0A0A0A;border-radius:6px;',
                              'font-size:10px;color:#555;text-transform:uppercase;letter-spacing:.5px}',
      '.mxi-dp2-param-guid{flex:1;font-family:ui-monospace,Menlo,monospace;font-size:10px;',
                            'color:#888;text-transform:none;letter-spacing:0;',
                            'background:transparent;padding:0;overflow:hidden;text-overflow:ellipsis}',

      /* Scrollbar */
      /* v0.2.10 — Scrollbar (matches main panel style, !important to beat browser defaults) */
      '#' + PANEL_ID + ' ::-webkit-scrollbar{width:6px!important;height:6px!important}',
      '#' + PANEL_ID + ' ::-webkit-scrollbar-track{background:#141414!important}',
      '#' + PANEL_ID + ' ::-webkit-scrollbar-thumb{background:#2E2E2E!important;border-radius:3px!important}',
      '#' + PANEL_ID + ' ::-webkit-scrollbar-thumb:hover{background:#666666!important}',
      '#' + PANEL_ID + ' .mxi-dp2-body::-webkit-scrollbar{width:6px!important;height:6px!important}',
      '#' + PANEL_ID + ' .mxi-dp2-body::-webkit-scrollbar-track{background:#141414!important}',
      '#' + PANEL_ID + ' .mxi-dp2-body::-webkit-scrollbar-thumb{background:#2E2E2E!important;border-radius:3px!important}',
      '#' + PANEL_ID + ' .mxi-dp2-body::-webkit-scrollbar-thumb:hover{background:#666666!important}',
      '#' + PANEL_ID + ' *{scrollbar-width:thin!important;scrollbar-color:#2E2E2E #141414!important}'
    ].join('');
    document.head.appendChild(s);
  }

  // ------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------

  function runScan() {
    state.entries = scanPage();
    var cacheData = enumerateObjectCache();
    var classified = classifyEntries(cacheData, state.entries);
    state.pageParams = classified.pageParams;
    state.cached     = classified.cached;

    // v0.2.1 — When the current page has NO on-page data containers and NO
    // page params, suppress the "cached" section too. Otherwise the Mendix
    // client-side object cache keeps showing leftover objects from a
    // previous page (the cache doesn't get invalidated on navigation),
    // which reads as "stuck with old data" when the user expected the
    // empty-state placeholder. Cached is supplementary context — it's
    // useful alongside actual page data, not on its own.
    if (state.entries.length === 0 && state.pageParams.length === 0) {
      state.cached = [];
    }
  }

  function open(mountTarget) {
    if (state.open) return;
    injectStyles();
    state.panel = document.createElement('div');
    state.panel.id = PANEL_ID;
    // v0.2.30 — remember that drawer was opened this session, so after a page
    // navigation / main-panel rebuild we can auto-reopen it.
    try { sessionStorage.setItem('mxi_dp_open', '1'); } catch (e) {}
    // v0.2.29 — when mounted inline (inside main panel body), skip the floating
    // panel chrome: no fixed positioning, no drag, no corner resize, no custom
    // width/height. Instead the panel fills its container as an absolute
    // drawer and slides up from the bottom.
    if (mountTarget) {
      state.panel.classList.add('mxi-dp2-embedded');
      state.mountTarget = mountTarget;

      // v0.2.49 — Don't mutate scrollTop. Previously we reset it to 0 so the
      // drawer (position:absolute; inset:0) would anchor at the visible top
      // of the mountTarget. That caused a visible "snap to top" when opening
      // and a bounce-back on close. New approach: anchor the drawer in the
      // visible viewport by setting explicit top/height based on the current
      // scroll position, so the scrollTop never needs to change.
      state.savedOverflow        = mountTarget.style.overflow || '';
      var currentScroll          = mountTarget.scrollTop || 0;
      var visibleHeight          = mountTarget.clientHeight;
      mountTarget.style.overflow = 'hidden';
      state.panel.style.top      = currentScroll + 'px';
      state.panel.style.height   = visibleHeight + 'px';
      /* Don't need inset-based bottom when we pin top + height explicitly. */
      state.panel.style.bottom   = 'auto';

      // start below viewport, animate in
      state.panel.style.transform = 'translateY(100%)';
      mountTarget.appendChild(state.panel);
      // force a reflow so the transform transition applies
      // eslint-disable-next-line no-unused-expressions
      state.panel.getBoundingClientRect();
      state.panel.style.transform = 'translateY(0)';
    } else {
      state.mountTarget = null;
      document.body.appendChild(state.panel);
    }
    runScan();
    state.open = true;
    render(); // render() sets up drag + resize

    // v0.2.1 — On a fresh page load the panel auto-reopens via the session
    // flag before Mendix has necessarily finished fetching data (slow
    // microflows, heavy datasources). Schedule a deferred re-scan so the
    // initial stale/empty state self-heals without the user hitting ↻.
    try { if (window.__MxDataPanel && window.__MxDataPanel._scheduleRefresh) window.__MxDataPanel._scheduleRefresh(); } catch (e) {}
  }

  // ------------------------------------------------------------
  // Drag (by header) + Resize (bottom-right corner)
  // ------------------------------------------------------------

  function setupDrag(panel) {
    var header = panel.querySelector('.mxi-dp2-header');
    if (!header) return;
    header.style.cursor = 'move';
    header.addEventListener('mousedown', function (e) {
      // Ignore drags that start on header buttons/controls
      if (e.target.closest('button,input,.mxi-dp2-iconbtn')) return;
      e.preventDefault();
      var startX = e.clientX, startY = e.clientY;
      var rect   = panel.getBoundingClientRect();
      var startL = rect.left, startT = rect.top;

      // Switch positioning from top/left defaults to explicit coords
      panel.style.left  = startL + 'px';
      panel.style.top   = startT + 'px';
      panel.style.right = 'auto';

      function onMove(ev) {
        var dx = ev.clientX - startX;
        var dy = ev.clientY - startY;
        var nx = Math.max(4, Math.min(window.innerWidth  - 80, startL + dx));
        var ny = Math.max(4, Math.min(window.innerHeight - 40, startT + dy));
        panel.style.left = nx + 'px';
        panel.style.top  = ny + 'px';
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('mouseup',   onUp,   true);
      }
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('mouseup',   onUp,   true);
    });
  }

  // v0.2.30 — Drag-down gesture to close the embedded drawer. User grabs the
  // header, drags down past a threshold → close with existing slide-out anim.
  // If released before threshold, spring back into place.
  function setupDragToClose(panel) {
    var header = panel.querySelector('.mxi-dp2-header');
    if (!header) return;
    // Avoid double-binding if render() fires multiple times
    if (header._mxiDragToCloseBound) return;
    header._mxiDragToCloseBound = true;

    header.addEventListener('mousedown', function (e) {
      // Ignore drags that start on buttons/input
      if (e.target.closest('button,input,.mxi-dp2-iconbtn')) return;
      e.preventDefault();
      var startY = e.clientY;
      panel.classList.add('dragging');

      function onMove(ev) {
        var dy = ev.clientY - startY;
        if (dy < 0) dy = 0;
        panel.style.transform = 'translateY(' + dy + 'px)';
      }
      function onUp(ev) {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('mouseup',   onUp,   true);
        panel.classList.remove('dragging');
        var dy = ev.clientY - startY;
        var threshold = Math.min(140, panel.offsetHeight * 0.25);
        if (dy > threshold) {
          close();
        } else {
          panel.style.transform = 'translateY(0)';
        }
      }
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('mouseup',   onUp,   true);
    });
  }

  function setupResize(panel, handle) {
    handle.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var rect = panel.getBoundingClientRect();
      var startX = e.clientX, startY = e.clientY;
      var startW = rect.width, startH = rect.height;

      function onMove(ev) {
        var nw = Math.max(320, Math.min(window.innerWidth  - 20, startW + (ev.clientX - startX)));
        var nh = Math.max(240, Math.min(window.innerHeight - 20, startH + (ev.clientY - startY)));
        panel.style.width     = nw + 'px';
        panel.style.maxHeight = nh + 'px';
        panel.style.height    = nh + 'px';
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('mouseup',   onUp,   true);
      }
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('mouseup',   onUp,   true);
    });
  }

  function close() {
    _closeInternal({ keepSessionFlag: false });
  }

  // v0.2.30 — used by the main-panel refresh path in inspector.js: tears down
  // the panel DOM without clearing the "was open" flag, so after the main
  // panel rebuilds we can re-open the drawer automatically.
  function closeForRefresh() {
    _closeInternal({ keepSessionFlag: true });
  }

  function _closeInternal(opts) {
    opts = opts || {};
    unpinPersistentHighlight();
    clearPageHighlight();
    if (!opts.keepSessionFlag) {
      try { sessionStorage.removeItem('mxi_dp_open'); } catch (e) {}
    }
    var panelToRemove = state.panel;
    var wasEmbedded = panelToRemove && panelToRemove.classList.contains('mxi-dp2-embedded');
    var mountTarget = state.mountTarget;
    state.panel = null;
    state.mountTarget = null;
    state.open = false;
    state.query = '';
    state.expandedEntity = null;
    state.expandedObject = null;
    state.expandedParam = null;

    if (panelToRemove) {
      if (wasEmbedded) {
        panelToRemove.style.transform = 'translateY(100%)';
        // v0.2.49 — we no longer mutate scrollTop on open, so there's nothing
        // to restore. Just put overflow back to its pre-open value.
        var savedOverflow  = state.savedOverflow;
        setTimeout(function () {
          if (panelToRemove.parentNode) panelToRemove.parentNode.removeChild(panelToRemove);
          if (mountTarget && mountTarget.style) {
            mountTarget.style.overflow = (typeof savedOverflow === 'string') ? savedOverflow : '';
          }
        }, 240);
      } else {
        panelToRemove.remove();
      }
    }
    state.savedScrollTop = undefined;
    state.savedOverflow  = undefined;

    var dataBtn = document.getElementById('mxi-data-panel-btn');
    if (dataBtn) {
      dataBtn.classList.remove('mxi-btn-active');
      dataBtn.style.background = '';
      dataBtn.style.color = '';
    }
  }

  function toggle(mountTarget) { state.open ? close() : open(mountTarget); }

  function refresh() {
    if (!state.open) return;
    // v0.2.25 — clear pinned highlight; element references may be stale after
    // a fresh scan. User can re-click the object to re-pin.
    unpinPersistentHighlight();
    runScan();
    render();
  }

  function setQuery(q) {
    state.query = q || '';
    if (state.open) render();
  }

  /**
   * v0.2.10 — Expose a clean list of context entity names for the main panel
   * to render its "Context Objects" chips. Runs the cache scan fresh, independent
   * of whether the Data Inspector panel is open.
   */
  function getContextEntityNames() {
    try {
      var cacheData   = enumerateObjectCache();
      var onPageScan  = scanPage();
      var classified  = classifyEntries(cacheData, onPageScan);
      var names = [];
      // Put page params first, then any cached
      classified.pageParams.forEach(function (e) { names.push(e.entity); });
      classified.cached.forEach(function (e) {
        if (names.indexOf(e.entity) === -1) names.push(e.entity);
      });
      return names;
    } catch (e) {
      console.warn('[MXI] getContextEntityNames error:', e);
      return [];
    }
  }

  // v0.2.30 — session "was open" flag utilities (used by inspector.js so the
  // main panel can auto-reopen the drawer after a rebuild).
  function wasOpenInSession() {
    try { return sessionStorage.getItem('mxi_dp_open') === '1'; }
    catch (e) { return false; }
  }

  window.__MxDataPanel = {
    open:    open,
    close:   close,
    closeForRefresh: closeForRefresh,
    toggle:  toggle,
    isOpen:  function () { return state.open; },
    wasOpenInSession: wasOpenInSession,
    refresh: refresh,
    focus:   focusElement,
    setQuery: setQuery,
    getContextEntityNames: getContextEntityNames,
    diagnose: diagnose,
    /* v0.2.59 — inspector.js calls this to tear down drawer-owned highlights
     * when the main panel is about to paint its own overlays, avoiding the
     * double-overlay stacking bug where both systems would paint on the
     * same element. */
    clearAllHighlights: function () {
      try { clearPageHighlight(); } catch (e) {}
      try { unpinPersistentHighlight(); } catch (e) {}
    }
  };

  // v0.2.1 — Auto-refresh the Data Inspector on SPA navigation so users don't
  // have to click ↻ after switching pages. Multiple triggers funnel into one
  // two-phase refresh:
  //   1. hashchange                  — Mendix classic client / deep-link URLs
  //   2. popstate                    — browser back/forward + some pushState routers
  //   3. 1.5s poll on mx.ui.getContentForm().path — safety net for
  //      navigations that don't fire either event (React-router-style
  //      pushState, microflow-driven routes)
  //   4. MutationObserver on the Mendix page container — catches nav events
  //      where the URL/content-form path DOESN'T change but the content
  //      does (same-path re-renders, tab switchers, popups that swap
  //      content, context changes that leave the route alone)
  //
  // Two-phase refresh (500ms + 1500ms) — the first catches fast pages; the
  // second catches pages where Mendix is still fetching data at the 500ms
  // mark (slow microflows, heavy datasources). If nothing has changed, the
  // second scan is a cheap no-op visually.
  function _getMxPath() {
    try {
      if (window.mx && mx.ui && mx.ui.getContentForm) {
        var f = mx.ui.getContentForm();
        if (f && f.path) return f.path;
      }
    } catch (e) {}
    return location.href;
  }
  var _lastContentPath = _getMxPath();
  var _navRefreshTimer = null;
  var _navRefreshTimer2 = null;
  var _navRefreshTimer3 = null;

  function _scheduleRefresh() {
    if (!state.open) return;
    if (_navRefreshTimer)  clearTimeout(_navRefreshTimer);
    if (_navRefreshTimer2) clearTimeout(_navRefreshTimer2);
    if (_navRefreshTimer3) clearTimeout(_navRefreshTimer3);
    _navRefreshTimer = setTimeout(function () {
      _navRefreshTimer = null;
      if (!state.open) return;
      try {
        clearPageHighlight();   // transient overlays now point at stale DOM
        refresh();              // unpin + re-scan + re-render
      } catch (e) {
        console.warn('[MXI] Data Inspector nav refresh failed:', e);
      }
    }, 500);
    _navRefreshTimer2 = setTimeout(function () {
      _navRefreshTimer2 = null;
      if (!state.open) return;
      try { refresh(); } catch (e) {}
    }, 1500);
    // v0.2.1 — Third phase for slow-rendering pages. When the user returns
    // to a data-rich page from an empty one, Mendix may still be fetching
    // datasources at 1500ms — the 3500ms retry catches that window so the
    // inspector doesn't get stuck showing the empty placeholder from the
    // previous page after a nav.
    _navRefreshTimer3 = setTimeout(function () {
      _navRefreshTimer3 = null;
      if (!state.open) return;
      try { refresh(); } catch (e) {}
    }, 3500);
  }

  function _checkForNavChange() {
    if (!state.open) return;
    var p = _getMxPath();
    if (!p || p === _lastContentPath) return;
    _lastContentPath = p;
    _scheduleRefresh();
  }

  // Events may fire a beat before mx.ui.getContentForm() catches up — 50ms
  // breather before we read the path.
  window.addEventListener('hashchange', function () { setTimeout(_checkForNavChange, 50); });
  window.addEventListener('popstate',   function () { setTimeout(_checkForNavChange, 50); });
  setInterval(_checkForNavChange, 1500);

  // MutationObserver safety net — catches nav where the URL doesn't change
  // but the page content does. Debounced 400ms so normal per-widget updates
  // don't trigger a refresh storm, and the 15-node threshold filters out
  // fine-grained incremental updates.
  var _domRefreshDebounce = null;
  try {
    var _pageTarget = document.querySelector('.mx-page, [class*="mx-name-page"], #content');
    if (_pageTarget) {
      new MutationObserver(function (mutations) {
        if (!state.open) return;
        // Only react to substantial DOM churn — sum added+removed across
        // this batch, require ≥15 to filter out incremental widget updates
        var total = 0;
        for (var i = 0; i < mutations.length; i++) {
          total += mutations[i].addedNodes.length + mutations[i].removedNodes.length;
          if (total >= 15) break;
        }
        if (total < 15) return;
        if (_domRefreshDebounce) clearTimeout(_domRefreshDebounce);
        _domRefreshDebounce = setTimeout(function () {
          _domRefreshDebounce = null;
          if (state.open) _scheduleRefresh();
        }, 400);
      }).observe(_pageTarget, { childList: true, subtree: true });
    }
  } catch (e) {}

  // v0.2.1 — Expose _scheduleRefresh so open() can trigger a delayed re-scan
  // after the panel opens. The initial scan inside open() runs synchronously,
  // but when the panel auto-opens right after a full page load, Mendix may
  // still be fetching data — the 500ms/1500ms re-scan catches that.
  window.__MxDataPanel._scheduleRefresh = _scheduleRefresh;

  console.log('[MXI] Data Panel v2 loaded');
})();

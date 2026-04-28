/*!
 * MxInspector - Layer Stack Module (v0.2.0)
 *
 * Solves the "too many wrapper divs" problem in Mendix DOM by surfacing
 * only the meaningful Mendix layers at a given element position.
 *
 * Exposes window.__MxLayerStack with:
 *   getStack(el)           -> [{element, type, name, entity, ...}]  innermost first
 *   getDefaultLevel(stack) -> index of best-guess level for initial selection
 *   renderBreadcrumb(stack, currentIdx) -> HTML string (pointer-events:auto chips)
 *   classifyElement(el)    -> {type, name} | null
 *   LEVEL_COLORS, LEVEL_ICONS
 *
 * Requires mx-data-extractor.js to be loaded first (optional; degrades gracefully).
 */
(function () {
  'use strict';
  if (window.__MxLayerStack) return;

  // Keep palette aligned with existing MxInspector Data Panel colors
  var LEVEL_COLORS = {
    DataView:     '#3B99FC',
    ListView:     '#2D9C5E',
    DataGrid2:    '#9333EA',
    DataGrid:     '#9333EA',
    TemplateGrid: '#FF7A50',
    Gallery:      '#EC4899',
    ListItem:     '#FFB800',
    Widget:       '#FFB800',
    Input:        '#9A9A9A'
  };

  var LEVEL_ICONS = {
    DataView:     '▤',
    ListView:     '☰',
    DataGrid2:    '▦',
    DataGrid:     '▦',
    TemplateGrid: '◰',
    Gallery:      '▥',
    ListItem:     '▸',
    Widget:       '▪',
    Input:        '▭'
  };

  function getClassString(el) {
    if (!el || !el.className) return '';
    return typeof el.className === 'string' ? el.className : (el.className.baseVal || '');
  }

  function getWidgetName(el) {
    var cn = getClassString(el);
    var m = cn.match(/mx-name-([^\s]+)/);
    return m ? m[1] : null;
  }

  /**
   * Classify an element: is it a meaningful Mendix layer? If so, what kind?
   * Returns { type, name } or null for pure wrappers.
   */
  function classifyElement(el) {
    if (!el || el.nodeType !== 1) return null;
    var cn = getClassString(el);
    var name = getWidgetName(el);

    // Data containers — most specific, check first
    if (el.classList && el.classList.contains('mx-dataview') &&
        !el.classList.contains('mx-dataview-content')) {
      return { type: 'DataView', name: name };
    }
    if (el.classList && el.classList.contains('mx-listview')) {
      return { type: 'ListView', name: name };
    }
    if (cn.indexOf('widget-datagrid') > -1 && cn.indexOf('-cell') === -1) {
      return { type: 'DataGrid2', name: name };
    }
    if (cn.indexOf('widget-gallery') > -1 && cn.indexOf('-item') === -1) {
      return { type: 'Gallery', name: name };
    }
    if (el.classList && el.classList.contains('mx-templategrid')) {
      return { type: 'TemplateGrid', name: name };
    }

    // List items
    if (cn.match(/\bmx-name-index-\d+\b/) ||
        cn.indexOf('mx-listview-item') > -1 ||
        cn.indexOf('widget-gallery-item') > -1 ||
        cn.indexOf('mx-templategrid-item') > -1 ||
        (el.getAttribute && el.getAttribute('role') === 'row' &&
         el.closest && el.closest('[class*="widget-datagrid"]'))) {
      return { type: 'ListItem', name: name };
    }

    // Input widgets (native form elements)
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
      return { type: 'Input', name: name };
    }

    // Named widget (generic)
    if (name) {
      if (cn.indexOf('mx-textbox') > -1 ||
          cn.indexOf('mx-textarea') > -1 ||
          cn.indexOf('mx-dropdown') > -1 ||
          cn.indexOf('mx-datepicker') > -1 ||
          cn.indexOf('mx-checkbox') > -1 ||
          cn.indexOf('mx-radiobutton') > -1) {
        return { type: 'Input', name: name };
      }
      return { type: 'Widget', name: name };
    }

    return null;
  }

  /**
   * Build the meaningful Mendix ancestor stack, walking up from fromElement.
   * Returns array innermost-first (stack[0] is deepest). Caps at body.
   */
  function getStack(fromElement) {
    var stack = [];
    if (!fromElement || fromElement === document.body) return stack;

    var el = fromElement;
    var maxDepth = 60;

    while (el && el !== document.body && el !== document.documentElement && maxDepth-- > 0) {
      var info = classifyElement(el);
      if (info) {
        var entry = {
          element:     el,
          type:        info.type,
          name:        info.name,
          entity:      null,
          objectCount: 0,
          hasData:     false,
          color:       LEVEL_COLORS[info.type] || '#666',
          icon:        LEVEL_ICONS[info.type] || '◆'
        };

        // Enrich with Mendix data where possible
        var isDataContainer =
          info.type === 'DataView' || info.type === 'ListView' ||
          info.type === 'DataGrid2' || info.type === 'Gallery' ||
          info.type === 'TemplateGrid';

        if (isDataContainer && window.__MxDataExtractor) {
          try {
            var data = window.__MxDataExtractor.extractDataFromElement(el);
            if (data) {
              entry.entity      = data.entity || null;
              entry.objectCount = data.objectCount || 0;
              entry.hasData     = !!data.entity || entry.objectCount > 0;
            }
          } catch (e) {}
        } else if (info.type === 'ListItem') {
          entry.hasData = true;
        } else if (info.type === 'Widget' || info.type === 'Input') {
          entry.hasData = !!info.name;
        }

        // Dedup: don't push same element twice in a row
        if (stack.length === 0 || stack[stack.length - 1].element !== el) {
          stack.push(entry);
        }
      }
      el = el.parentElement;
    }

    return stack;
  }

  /**
   * Best-guess starting level when the user clicks.
   * Priority:
   *   1. Deepest entry that has both a widget name AND data attached
   *   2. Deepest named widget
   *   3. Deepest data container
   *   4. Innermost meaningful element
   */
  function getDefaultLevel(stack) {
    if (!stack || !stack.length) return -1;
    for (var i = 0; i < stack.length; i++) {
      if (stack[i].name && stack[i].hasData) return i;
    }
    for (var j = 0; j < stack.length; j++) {
      if (stack[j].name) return j;
    }
    for (var k = 0; k < stack.length; k++) {
      if (stack[k].type !== 'Widget' && stack[k].type !== 'Input') return k;
    }
    return 0;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Render the breadcrumb as HTML. Chips are pointer-events:auto so clicks
   * on them work even if the surrounding tooltip is pointer-events:none.
   */
  function renderBreadcrumb(stack, currentIdx) {
    if (!stack || !stack.length) return '';

    var html = '' +
      '<div class="mxi-stack-breadcrumb" style="' +
        'pointer-events:auto;' +
        'display:flex;gap:4px;margin-top:10px;padding-top:10px;' +
        'border-top:1px solid #2E2E2E;flex-wrap:wrap;align-items:center;' +
      '">' +
      '<div style="font-size:9px;color:#555;text-transform:uppercase;' +
        'letter-spacing:.5px;margin-right:4px;width:100%">' +
        '▸ Layer stack <span style="color:#333">·</span> ' +
        '<span style="color:#888">alt+click to cycle</span>' +
      '</div>';

    // Display OUTER-MOST → INNER-MOST (reads naturally L→R as drilling in)
    for (var i = stack.length - 1; i >= 0; i--) {
      var level = stack[i];
      var isCurrent = (i === currentIdx);
      var label = level.name || level.type;
      if (label.length > 20) label = label.substring(0, 18) + '…';

      var chipCss = [
        'display:inline-flex', 'align-items:center', 'gap:5px',
        'padding:3px 8px', 'border-radius:10px',
        'font-size:10px', 'font-family:Inter,system-ui,sans-serif',
        'cursor:pointer', 'transition:all .12s', 'user-select:none'
      ];

      if (isCurrent) {
        chipCss.push('background:' + level.color);
        chipCss.push('color:#0A0A0A');
        chipCss.push('font-weight:700');
        chipCss.push('transform:scale(1.08)');
        chipCss.push('box-shadow:0 0 0 2px #0A0A0A,0 0 0 4px ' + level.color + ',0 4px 14px ' + level.color + '88');
        chipCss.push('z-index:2');
        chipCss.push('position:relative');
      } else {
        chipCss.push('background:#242424');
        chipCss.push('color:#9A9A9A');
        chipCss.push('border:1px solid #2E2E2E');
      }

      var title = level.type + (level.entity ? ' · ' + level.entity : '') +
                  (level.objectCount ? ' · ' + level.objectCount + ' obj' : '');

      html += '<span class="mxi-stack-chip" data-level-idx="' + i + '" ' +
              'style="' + chipCss.join(';') + '" title="' + esc(title) + '">' +
              '<span style="opacity:.75">' + level.icon + '</span>' +
              '<span>' + esc(label) + '</span>' +
              '</span>';

      if (i > 0) html += '<span style="color:#3A3A3A;font-size:11px">›</span>';
    }

    html += '</div>';
    return html;
  }

  window.__MxLayerStack = {
    getStack:         getStack,
    getDefaultLevel:  getDefaultLevel,
    renderBreadcrumb: renderBreadcrumb,
    classifyElement:  classifyElement,
    LEVEL_COLORS:     LEVEL_COLORS,
    LEVEL_ICONS:      LEVEL_ICONS,

    // Tracks the currently selected element so alt+click cycling
    // works correctly across consecutive clicks.
    _selection: null,
    setSelection: function (el) { this._selection = el; },
    getSelection: function () { return this._selection; },

    /**
     * Given a click event and current selection, return the NEXT layer
     * to select when the user alt+clicks. Direction: +1 = outward (default),
     * -1 = inward (when shift held).
     * Returns the element to select, or null if no cycling possible.
     */
    nextLevel: function (clickTarget, direction) {
      var stack = getStack(clickTarget);
      if (!stack || stack.length < 2) return null;

      // If our tracked selection is in this stack, cycle from it.
      // Otherwise, start from the default level.
      var startIdx = -1;
      if (this._selection) {
        for (var i = 0; i < stack.length; i++) {
          if (stack[i].element === this._selection) { startIdx = i; break; }
        }
      }
      if (startIdx < 0) startIdx = getDefaultLevel(stack);

      var dir = direction || 1;
      var nextIdx = startIdx + dir;

      // Clamp at both ends
      if (nextIdx < 0) nextIdx = 0;
      if (nextIdx >= stack.length) nextIdx = stack.length - 1;

      if (nextIdx === startIdx) return null; // already at boundary
      return stack[nextIdx].element;
    },

    /**
     * Re-render the breadcrumb inside a container element to reflect a new
     * current-index selection. Used after alt+click cycling so chips update
     * their highlight without a fresh hover event. Returns the new breadcrumb
     * element, or null if no existing breadcrumb was found in containerEl.
     *
     * onChipClick, if provided, is called as (levelEntry, levelIndex, event)
     * when a chip is clicked.
     */
    refreshBreadcrumb: function (containerEl, stack, currentIdx, onChipClick) {
      if (!containerEl) return null;
      var existing = containerEl.querySelector('.mxi-stack-breadcrumb');
      if (!existing) return null;

      var tmp = document.createElement('div');
      tmp.innerHTML = renderBreadcrumb(stack, currentIdx);
      var fresh = tmp.querySelector('.mxi-stack-breadcrumb');
      if (!fresh) return null;

      existing.parentNode.replaceChild(fresh, existing);

      if (typeof onChipClick === 'function') {
        var chips = fresh.querySelectorAll('.mxi-stack-chip');
        for (var i = 0; i < chips.length; i++) {
          (function (chip) {
            chip.addEventListener('click', function (ev) {
              ev.preventDefault();
              ev.stopPropagation();
              ev.stopImmediatePropagation();
              var idx = parseInt(chip.getAttribute('data-level-idx'), 10);
              if (!isNaN(idx) && stack[idx]) onChipClick(stack[idx], idx, ev);
            }, true);
          })(chips[i]);
        }
      }

      return fresh;
    }
  };

  /* v0.2.5 — startup chatter removed (was leaking on non-Mendix sites). */
})();

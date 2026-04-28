/**
 * MxInspector Performance Tracker v1.2
 * Injected at document_start to capture REAL page load metrics
 * This runs BEFORE the page loads, giving us accurate timings
 * Now with per-navigation tracking for Mendix React SPA
 */
(function() {
  'use strict';
  
  // Prevent multiple injections
  if (window.__mxiPerf) return;
  
  // Initialize performance data store
  var perf = window.__mxiPerf = {
    version: '1.7',
    trackerStart: performance.now(),
    isRecording: true,  // Recording state
    
    // Core timestamps (initial page load)
    timestamps: {
      trackerInjected: performance.now(),
      domContentLoaded: null,
      domComplete: null,
      windowLoad: null,
      mxClientReady: null,
      mxPageRendered: null,
      firstWidget: null,
      lastWidget: null,
      allWidgetsStable: null
    },
    
    // Per-navigation timestamps (reset on each SPA navigation)
    navigation: {
      startTime: performance.now(),
      firstWidget: null,
      lastWidget: null,
      widgetCount: 0,
      renderDuration: 0
    },
    
    // Core Web Vitals (using PerformanceObserver - accurate!)
    vitals: {
      fcp: null,    // First Contentful Paint
      lcp: null,    // Largest Contentful Paint
      cls: 0,       // Cumulative Layout Shift
      fid: null,    // First Input Delay
      ttfb: null,   // Time to First Byte
      inp: null     // Interaction to Next Paint
    },
    
    // Mendix-specific
    mendix: {
      detected: false,
      version: null,
      client: null,
      page: null,
      module: null
    },
    
    // Widget tracking
    widgets: {
      timeline: [],      // When each widget appeared
      byName: {},        // Lookup by name
      totalCount: 0,
      dataContainers: 0,
      renderDuration: 0  // Time from first to last widget
    },
    
    // Network tracking
    network: {
      requests: [],
      xhrCalls: [],
      fetchCalls: [],
      slowRequests: [],  // >1s
      failedRequests: [],
      totalTransferred: 0,
      totalRequests: 0
    },

    // v1.3 — Data source tracking. Parses /xas/ request bodies to
    // extract the microflows, XPath retrieves, and associations that
    // actually fire on each page load. This is the real answer to
    // "what's powering this page" — far more useful than inferring
    // from DOM classes.
    //
    // v1.5 — Mendix 10 React client support. The new protocol replaced
    // `executeaction` with opaque `runtimeOperation` calls that carry
    // only an operationId hash (no microflow name). We can still count
    // repeats per operationId, classify by shape (list vs single vs
    // committed write), and attempt best-effort name resolution.
    dataSources: {
      microflows: {},           // classic: { "Mod.DS_Name": {count, totalDuration, lastStatus} }
      xpathRetrieves: 0,        // direct DB retrieve_by_xpath calls
      associationRetrieves: 0,  // retrieve_by_association calls
      commits: 0,               // commit/update calls
      otherActions: {},         // non-DS microflow actions (user-triggered)
      operations: {},           // v1.5: Mendix 10 runtimeOperation bucket, keyed by operationId
      sessionInits: 0           // v1.5: get_session_data calls (usually 1 per page)
    },

    // v1.4 — Debug ring buffer. When the data source parser doesn't
    // catch anything, this captures enough about observed requests to
    // figure out why. The inspector can surface this as a collapsible
    // diagnostic panel. Samples are trimmed to keep memory bounded.
    dsDebug: {
      sampleUrls: [],            // last N unique URL patterns observed on POST/XHR with body
      sampleBodies: [],          // last 5 raw body heads (truncated to 300 chars)
      postCount: 0,              // total POSTs with bodies
      parsedOk: 0,               // bodies that JSON-parsed successfully
      parsedFail: 0,             // bodies that didn't parse
      hadActionField: 0,         // parsed bodies with action or actions keys
      unknownActionTypes: {}     // action types seen but not classified: { "someAction": count }
    },

    // Errors captured
    errors: [],

    // SPA navigation tracking
    navigations: [],
    currentNavigation: 0
  };
  
  // ===== RECORDING CONTROL =====
  perf.startRecording = function() {
    perf.isRecording = true;
    console.log('%c[MxInspector] Recording started', 'color: #2D9C5E; font-weight: bold');
  };
  
  perf.stopRecording = function() {
    perf.isRecording = false;
    console.log('%c[MxInspector] Recording stopped', 'color: #FF5A5A; font-weight: bold');
  };
  
  perf.toggleRecording = function() {
    if (perf.isRecording) perf.stopRecording();
    else perf.startRecording();
    return perf.isRecording;
  };
  
  // Reset navigation metrics (for SPA page changes)
  perf.resetNavigation = function() {
    perf.navigation = {
      startTime: performance.now(),
      firstWidget: null,
      lastWidget: null,
      widgetCount: 0,
      renderDuration: 0
    };
    perf.currentNavigation++;
    // IMPORTANT: Reset the byName cache so widgets can be tracked again on new navigation
    perf.widgets.byName = {};
    // v1.6 — Reset dataSources too. Previously the DS_ microflow /
    // runtimeOperation buckets accumulated across SPA navigations, so
    // the Data Sources section would show calls from all pages visited
    // since the extension loaded — misleading. Now each navigation
    // starts with a clean slate, matching the current-page framing used
    // throughout the rest of the inspector.
    perf.dataSources = {
      microflows: {},
      xpathRetrieves: 0,
      associationRetrieves: 0,
      commits: 0,
      otherActions: {},
      operations: {},
      sessionInits: 0
    };
    // Also clear debug ring buffer so it reflects only this page's traffic
    perf.dsDebug = {
      sampleUrls: [],
      sampleBodies: [],
      postCount: 0,
      parsedOk: 0,
      parsedFail: 0,
      hadActionField: 0,
      unknownActionTypes: {}
    };
    /* v0.2.5 — navigation-reset log removed. resetNavigation fires on
     * every URL/hashchange/popstate, including on non-Mendix sites with
     * SPA routing — was leaking "Navigation #N - metrics reset" into
     * those sites' consoles. Reset bookkeeping is internal; user
     * doesn't need narration. perf.currentNavigation is still readable
     * via window.__mxiPerf.getSummary() if anyone needs to verify. */
  };
  
  // ===== CORE WEB VITALS via PerformanceObserver =====
  if (typeof PerformanceObserver !== 'undefined') {
    
    // FCP - First Contentful Paint
    try {
      new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(entry) {
          if (entry.name === 'first-contentful-paint') {
            perf.vitals.fcp = Math.round(entry.startTime);
          }
        });
      }).observe({ type: 'paint', buffered: true });
    } catch (e) {}
    
    // LCP - Largest Contentful Paint
    try {
      new PerformanceObserver(function(list) {
        var entries = list.getEntries();
        if (entries.length > 0) {
          perf.vitals.lcp = Math.round(entries[entries.length - 1].startTime);
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {}
    
    // CLS - Cumulative Layout Shift
    try {
      new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(entry) {
          if (!entry.hadRecentInput) {
            perf.vitals.cls += entry.value;
          }
        });
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
    
    // FID - First Input Delay
    try {
      new PerformanceObserver(function(list) {
        var entries = list.getEntries();
        if (entries.length > 0 && perf.vitals.fid === null) {
          perf.vitals.fid = Math.round(entries[0].processingStart - entries[0].startTime);
        }
      }).observe({ type: 'first-input', buffered: true });
    } catch (e) {}
    
    // Resource timing - track ALL network requests
    try {
      new PerformanceObserver(function(list) {
        if (!perf.isRecording) return;
        list.getEntries().forEach(function(entry) {
          var req = {
            url: entry.name,
            shortName: entry.name.split('/').pop().split('?')[0].substring(0, 40) || 'resource',
            type: entry.initiatorType,
            duration: Math.round(entry.duration),
            size: entry.transferSize || 0,
            startTime: Math.round(entry.startTime),
            endTime: Math.round(entry.responseEnd),
            ttfb: Math.round((entry.responseStart || 0) - (entry.requestStart || 0)),
            navigation: perf.currentNavigation
          };
          
          perf.network.requests.push(req);
          perf.network.totalRequests++;
          perf.network.totalTransferred += req.size;
          
          // Categorize
          if (entry.initiatorType === 'xmlhttprequest') {
            perf.network.xhrCalls.push(req);
          } else if (entry.initiatorType === 'fetch') {
            perf.network.fetchCalls.push(req);
          }
          
          // Track slow requests (>1s)
          if (req.duration > 1000) {
            perf.network.slowRequests.push(req);
          }
        });
      }).observe({ type: 'resource', buffered: true });
    } catch (e) {}
    
    // Navigation timing for TTFB
    try {
      new PerformanceObserver(function(list) {
        var entries = list.getEntries();
        if (entries.length > 0) {
          var nav = entries[0];
          perf.vitals.ttfb = Math.round(nav.responseStart - nav.requestStart);
          perf.timestamps.domContentLoaded = Math.round(nav.domContentLoadedEventEnd);
          perf.timestamps.domComplete = Math.round(nav.domComplete);
          perf.timestamps.windowLoad = Math.round(nav.loadEventEnd);
        }
      }).observe({ type: 'navigation', buffered: true });
    } catch (e) {}
  }
  
  // ===== DOM EVENT LISTENERS =====
  
  document.addEventListener('DOMContentLoaded', function() {
    if (!perf.timestamps.domContentLoaded) {
      perf.timestamps.domContentLoaded = performance.now();
    }
  });
  
  window.addEventListener('load', function() {
    if (!perf.timestamps.windowLoad) {
      perf.timestamps.windowLoad = performance.now();
    }
  });
  
  // ===== ERROR TRACKING =====
  
  window.addEventListener('error', function(e) {
    if (perf.errors.length < 50) {
      perf.errors.push({
        type: 'error',
        message: e.message,
        filename: e.filename,
        line: e.lineno,
        time: performance.now()
      });
    }
  });
  
  // ===== MENDIX DETECTION =====
  
  var mxCheckCount = 0;
  var mxCheckInterval = setInterval(function() {
    mxCheckCount++;
    
    if (window.mx) {
      if (!perf.timestamps.mxClientReady) {
        perf.timestamps.mxClientReady = performance.now();
        perf.mendix.detected = true;
        perf.mendix.version = window.mx.version || '?';
        
        // Detect client type
        var hasReact = !!document.getElementById('root');
        var hasDojo = !!(window.dijit && window.dijit.registry);
        perf.mendix.client = hasReact && !hasDojo ? 'React' : hasDojo ? 'Dojo' : hasReact ? 'React' : 'Unknown';
        
        // Try to get current page
        try {
          if (mx.ui && mx.ui.getContentForm) {
            var form = mx.ui.getContentForm();
            if (form && form.path) {
              var path = form.path.replace('.page.xml', '');
              var parts = path.split('/');
              perf.mendix.module = parts[0] || '';
              perf.mendix.page = parts[parts.length - 1] || '';
            }
          }
        } catch (e) {}

        /* v0.2.4 — Form-open tracking
         * Goldmine: mx.ui.openForm2(formName, ...) carries the page path as
         * its first argument for every page that opens — including popups.
         * mx.ui.getContentForm() only returns the underlying content page,
         * so popups are invisible to it. We track every openForm call into
         * a chronological stack; inspector.js reads the tail when it sees
         * a .modal-dialog and uses that as the popup's page name.
         * 'openForm2' is the React client API; 'openForm' covers the older
         * Dojo path. Both are wrapped — they delegate to the original. */
        try {
          if (mx.ui && !window.__mxiFormStack) {
            window.__mxiFormStack = [];
            var hookOpen = function(name) {
              var orig = mx.ui[name];
              if (typeof orig !== 'function') return;
              mx.ui[name] = function(formName) {
                try {
                  if (typeof formName === 'string' && formName.indexOf('.page.xml') > -1) {
                    window.__mxiFormStack.push({ path: formName, openedAt: Date.now() });
                    if (window.__mxiFormStack.length > 20) {
                      window.__mxiFormStack.shift();
                    }
                  }
                } catch (e) {}
                return orig.apply(this, arguments);
              };
            };
            hookOpen('openForm2');
            hookOpen('openForm');
          }
        } catch (e) {}
      }
    }
    
    // Stop after 30 seconds
    if (mxCheckCount > 600) {
      clearInterval(mxCheckInterval);
    }
  }, 50);
  
  // ===== WIDGET RENDER TRACKING =====
  
  function getWidgetName(el) {
    var cn = el.className;
    if (typeof cn !== 'string') cn = cn.baseVal || '';
    var match = cn.match(/mx-name-([^\s]+)/);
    return match ? match[1] : null;
  }
  
  function isDataContainer(el) {
    var cn = el.className;
    if (typeof cn !== 'string') cn = cn.baseVal || '';
    return cn.indexOf('mx-dataview') > -1 || 
           cn.indexOf('mx-listview') > -1 || 
           cn.indexOf('mx-templategrid') > -1 ||
           cn.indexOf('widget-datagrid') > -1 ||
           cn.indexOf('widget-gallery') > -1;
  }
  
  // Track widgets as they appear
  var widgetObserver = new MutationObserver(function(mutations) {
    if (!perf.isRecording) return;
    var now = performance.now();
    
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        
        // Check the node itself
        var name = getWidgetName(node);
        if (name && !perf.widgets.byName[name]) {
          recordWidget(node, name, now);
        }
        
        // Check children
        if (node.querySelectorAll) {
          node.querySelectorAll('[class*="mx-name-"]').forEach(function(child) {
            var childName = getWidgetName(child);
            if (childName && !perf.widgets.byName[childName]) {
              recordWidget(child, childName, now);
            }
          });
        }
      });
    });
  });
  
  function recordWidget(el, name, now) {
    var navTime = now - perf.navigation.startTime;
    var entry = {
      name: name,
      renderedAt: now,
      timeSinceStart: Math.round(now),
      timeSinceNavigation: Math.round(navTime),
      isDataContainer: isDataContainer(el),
      navigation: perf.currentNavigation
    };
    
    perf.widgets.timeline.push(entry);
    perf.widgets.byName[name] = entry;
    perf.widgets.totalCount++;
    
    if (entry.isDataContainer) {
      perf.widgets.dataContainers++;
    }
    
    // Global timestamps
    if (!perf.timestamps.firstWidget) {
      perf.timestamps.firstWidget = now;
    }
    perf.timestamps.lastWidget = now;
    
    // Per-navigation timestamps
    if (!perf.navigation.firstWidget) {
      perf.navigation.firstWidget = now;
    }
    perf.navigation.lastWidget = now;
    perf.navigation.widgetCount++;
    
    // Update render duration (per-navigation)
    if (perf.navigation.firstWidget) {
      perf.navigation.renderDuration = Math.round(now - perf.navigation.firstWidget);
    }
    
    // Update global render duration
    if (perf.timestamps.firstWidget) {
      perf.widgets.renderDuration = Math.round(now - perf.timestamps.firstWidget);
    }
  }
  
  // Start observing once DOM is ready
  if (document.body) {
    widgetObserver.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      widgetObserver.observe(document.body, { childList: true, subtree: true });
    });
  }
  
  // ===== XHR/FETCH INTERCEPTION for Mendix API calls =====

  // v1.4 — Classify a single Mendix action entry. Now tracks unknown
  // action types so we can surface what newer Mendix versions send.
  // v1.5 — Mendix 10 runtimeOperation support added. Since the protocol
  // no longer carries microflow names, we classify operations by the
  // shape of their `options` payload (list retrieve, paginated, sorted,
  // filtered, single).
  function inferOperationShape(options) {
    // Returns a short human-readable kind string for a runtimeOperation's
    // options. Helps the UI say something useful even without names.
    if (!options || typeof options !== 'object') return 'call';
    if (typeof options.amount === 'number' && typeof options.offset === 'number') {
      var parts = ['list'];
      parts.push('×' + options.amount);
      if (Array.isArray(options.sort) && options.sort.length) parts.push('sorted');
      if (options.extraXpath) parts.push('filtered');
      if (options.wantCount) parts.push('+count');
      return parts.join(' ');
    }
    if (Array.isArray(options.sort) && options.sort.length) return 'sorted call';
    return 'call';
  }

  function classifyMxAction(action, entryMeta) {
    if (!action || typeof action !== 'object') return;
    var actType = action.action;
    var params = action.params || {};
    if (!actType) return;

    if (actType === 'executeaction') {
      var name = params.actionname || '(unknown)';
      var lastSeg = name.split('.').pop() || '';
      var isDS = lastSeg.indexOf('DS_') === 0;
      var bucket = isDS ? perf.dataSources.microflows : perf.dataSources.otherActions;
      if (!bucket[name]) {
        bucket[name] = { count: 0, totalDuration: 0, lastStatus: 0, firstSeen: entryMeta.time };
      }
      bucket[name].count++;
      bucket[name].totalDuration += (entryMeta.duration || 0);
      bucket[name].lastStatus = entryMeta.status || 0;
    } else if (actType === 'retrieve_by_xpath' || actType === 'retrieveByXPath') {
      perf.dataSources.xpathRetrieves++;
    } else if (actType === 'retrieve_by_association' || actType === 'retrieveByAssociation') {
      perf.dataSources.associationRetrieves++;
    } else if (actType === 'commit' || actType === 'update' || actType === 'create') {
      perf.dataSources.commits++;
    } else if (actType === 'runtimeOperation') {
      // v1.5 — Mendix 10 React client. operationId is an opaque hash;
      // we can't resolve to a microflow name client-side. We bucket by
      // operationId so repeats (the nested-call fingerprint) still
      // surface, and classify by options shape to give the UI something
      // meaningful to show. Commits/changes inside options bump those
      // counters too.
      var opId = action.operationId || '(unknown)';
      var op = perf.dataSources.operations[opId];
      if (!op) {
        op = perf.dataSources.operations[opId] = {
          opId: opId,
          count: 0,
          totalDuration: 0,
          lastStatus: 0,
          shape: inferOperationShape(action.options),
          hasChanges: false,
          firstSeen: entryMeta.time
        };
      }
      op.count++;
      op.totalDuration += (entryMeta.duration || 0);
      op.lastStatus = entryMeta.status || 0;
      // If the action carries changes/objects, it's writing data too
      if (action.changes && Object.keys(action.changes).length > 0) {
        op.hasChanges = true;
        perf.dataSources.commits++;
      }
    } else if (actType === 'get_session_data') {
      perf.dataSources.sessionInits++;
    } else {
      // Unknown action type — track so we know what to add to the classifier
      perf.dsDebug.unknownActionTypes[actType] = (perf.dsDebug.unknownActionTypes[actType] || 0) + 1;
    }
  }

  // v1.4 — More forgiving body parser. Mendix /xas/ bodies are typically
  // {action, params} or {actions: [...]} but newer clients may wrap them
  // differently. We try a few common shapes before giving up.
  function parseMxRequestBody(bodyStr, entryMeta) {
    if (!bodyStr || typeof bodyStr !== 'string') return false;
    var parsed;
    try { parsed = JSON.parse(bodyStr); } catch (e) { perf.dsDebug.parsedFail++; return false; }
    perf.dsDebug.parsedOk++;
    if (!parsed || typeof parsed !== 'object') return false;
    var matched = false;
    if (Array.isArray(parsed.actions)) {
      perf.dsDebug.hadActionField++;
      parsed.actions.forEach(function(a) { classifyMxAction(a, entryMeta); });
      matched = true;
    } else if (parsed.action) {
      perf.dsDebug.hadActionField++;
      classifyMxAction(parsed, entryMeta);
      matched = true;
    }
    // v1.4 — some newer Mendix 10 calls send a bare array of actions
    else if (Array.isArray(parsed) && parsed.length && parsed[0] && parsed[0].action) {
      perf.dsDebug.hadActionField++;
      parsed.forEach(function(a) { classifyMxAction(a, entryMeta); });
      matched = true;
    }
    return matched;
  }

  // v1.4 — Decide if an observed request looks like a Mendix data call.
  // Broader than just /xas/ URL matching — also accepts anything with a
  // JSON body containing an action/actions field. This covers Mendix 10
  // clients that route through /_mxprotocol/, /runtime/, or custom paths.
  function looksLikeMxCall(url, body) {
    if (!url) return false;
    // v0.2.3 — defensive string coercion. `url` is expected to be a string
    // but some sites / polyfills pass URL objects, Request-like objects with
    // non-string `.url` properties, etc. Without this guard we throw
    // "url.indexOf is not a function" and the error gets stack-attributed
    // to the extension even though the real culprit is the site's fetch
    // arguments. Observed in the wild on eu.eastpak.com product pages.
    if (typeof url !== 'string') {
      try { url = String(url); } catch (e) { return false; }
    }
    // Classic: URL contains /xas
    if (url.indexOf('xas') > -1) return true;
    // Mendix 10 candidates
    if (url.indexOf('_mxprotocol') > -1) return true;
    if (url.indexOf('/runtime/') > -1) return true;
    // JSON body with action field — catches anything else
    if (body && typeof body === 'string' && body.length < 100000) {
      try {
        var p = JSON.parse(body);
        if (p && (p.action || p.actions || (Array.isArray(p) && p.length && p[0] && p[0].action))) {
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  // v1.4 — Capture a URL pattern + body sample for debug visibility.
  // Only keeps a bounded ring buffer, so long sessions don't leak memory.
  function recordDsDebug(url, body) {
    if (!url) return;
    perf.dsDebug.postCount++;
    // Strip query string for URL pattern — reduces noise
    var urlPattern = url.split('?')[0];
    // Take only the last 3 path segments to keep patterns readable
    var parts = urlPattern.split('/');
    var shortPattern = parts.length > 4 ? '.../' + parts.slice(-3).join('/') : urlPattern;
    if (perf.dsDebug.sampleUrls.indexOf(shortPattern) === -1 && perf.dsDebug.sampleUrls.length < 8) {
      perf.dsDebug.sampleUrls.push(shortPattern);
    }
    if (body && typeof body === 'string' && perf.dsDebug.sampleBodies.length < 5) {
      perf.dsDebug.sampleBodies.push(body.length > 300 ? body.substring(0, 300) + '…' : body);
    }
  }

  // Intercept XHR
  var origXHROpen = XMLHttpRequest.prototype.open;
  var origXHRSend = XMLHttpRequest.prototype.send;

  // v0.2.1 — Mendix-site gating. perf-tracker runs on <all_urls> because we
  // can't know ahead of time whether a tab is serving a Mendix app (custom
  // domains exist) and we need to catch Mendix bootstrap traffic. Problem:
  // on pure non-Mendix pages, the wrapper still sat in every XHR stack
  // frame — so third-party error trackers (Sentry et al.) on unrelated
  // sites blamed the extension for CSP violations and network errors that
  // had nothing to do with it.
  //
  // Mitigation: install the wrappers immediately (Mendix bootstrap XHR
  // still gets caught), but UNHOOK them after a detection window if no
  // Mendix signature has appeared. Any one of these promotes the page to
  // "confirmed Mendix" and pins the wrappers indefinitely:
  //   - a looksLikeMxCall() XHR or fetch (the primary signal)
  //   - window.mx / window.mxui / window.MxApp global appears
  //   - a <script src="…mxclientsystem…"> shows up in the DOM
  // After 3s with none of those, the wrappers are restored to their
  // originals so subsequent XHR/fetch calls run with clean native stacks.
  var _mxSiteConfirmed = false;
  var _myXHROpen, _myXHRSend, _myFetch, origFetch = null;

  _myXHROpen = XMLHttpRequest.prototype.open = function(method, url) {
    this._mxiUrl = url;
    this._mxiMethod = method;
    this._mxiStart = null;
    this._mxiBody = null;
    return origXHROpen.apply(this, arguments);
  };

  _myXHRSend = XMLHttpRequest.prototype.send = function(body) {
    var xhr = this;
    xhr._mxiStart = performance.now();
    xhr._mxiBody = body;

    xhr.addEventListener('loadend', function() {
      if (!perf.isRecording) return;
      var url = xhr._mxiUrl || '';
      var bodyStr = (typeof xhr._mxiBody === 'string') ? xhr._mxiBody : null;
      var isMx = looksLikeMxCall(url, bodyStr);
      if (isMx) {
        _mxSiteConfirmed = true;
        var duration = performance.now() - xhr._mxiStart;
        var entry = {
          url: url,
          method: xhr._mxiMethod,
          duration: Math.round(duration),
          status: xhr.status,
          time: xhr._mxiStart,
          isMendixApi: true,
          navigation: perf.currentNavigation
        };
        perf.network.xhrCalls.push(entry);

        if (duration > 1000) {
          perf.network.slowRequests.push(entry);
        }
        if (xhr.status >= 400) {
          perf.network.failedRequests.push(entry);
        }

        // Debug: always record this call so we can see what's flowing
        recordDsDebug(url, bodyStr);
        parseMxRequestBody(bodyStr, entry);
      }
    });

    return origXHRSend.apply(this, arguments);
  };

  // v1.4 — fetch interception with the same looser matching as XHR.
  if (typeof window.fetch === 'function') {
    origFetch = window.fetch;
    _myFetch = window.fetch = function(resource, init) {
      var url = typeof resource === 'string' ? resource : (resource && resource.url) || '';
      // v0.2.3 — belt-and-braces: some Request-like shapes or URL objects
      // end up here with a non-string url, which would crash looksLikeMxCall.
      // Coerce defensively; fall back to empty string if String() itself fails.
      if (typeof url !== 'string') {
        try { url = String(url); } catch (e) { url = ''; }
      }
      var bodyStr = null;
      if (init && typeof init.body === 'string') bodyStr = init.body;
      var isMx = looksLikeMxCall(url, bodyStr);
      if (isMx) _mxSiteConfirmed = true;
      var start = performance.now();
      var p = origFetch.apply(this, arguments);
      if (isMx) {
        p.then(function(res) {
          if (!perf.isRecording) return res;
          var duration = performance.now() - start;
          var entry = {
            url: url,
            method: (init && init.method) || 'POST',
            duration: Math.round(duration),
            status: res.status,
            time: start,
            isMendixApi: true,
            navigation: perf.currentNavigation
          };
          perf.network.fetchCalls.push(entry);
          recordDsDebug(url, bodyStr);
          parseMxRequestBody(bodyStr, entry);
          return res;
        }).catch(function() { /* swallow — don't break consumer */ });
      }
      return p;
    };
  }

  // v0.2.1 — Detection poll + unhook (see Mendix-site gating comment above).
  // Unhook only if OUR wrapper is still the active one on the prototype —
  // if something else wrapped on top of us, we leave it alone rather than
  // reaching past their wrapper and removing it.
  function _sniffMendixSignals() {
    try {
      if (window.mx || window.mxui || window.MxApp) return true;
      if (document.querySelector('script[src*="mxclientsystem"]')) return true;
    } catch (e) {}
    return false;
  }
  function _unhookTrackers() {
    try { if (XMLHttpRequest.prototype.open === _myXHROpen) XMLHttpRequest.prototype.open = origXHROpen; } catch (e) {}
    try { if (XMLHttpRequest.prototype.send === _myXHRSend) XMLHttpRequest.prototype.send = origXHRSend; } catch (e) {}
    try { if (origFetch && window.fetch === _myFetch)        window.fetch              = origFetch;    } catch (e) {}
  }
  (function () {
    var detectStart = performance.now();
    var detectTimer = setInterval(function () {
      if (_mxSiteConfirmed || _sniffMendixSignals()) {
        _mxSiteConfirmed = true;
        clearInterval(detectTimer);
        return;
      }
      // v0.2.3 — halved detection window from 3000ms to 1500ms. The longer
      // window was producing a noisy stream of "Uncaught (in promise)
      // TypeError: Failed to fetch" errors stack-attributed to our fetch
      // wrapper on CSP-strict non-Mendix sites (Google AI Studio, PayPal,
      // GitHub, TransIP, etc). The errors aren't CAUSED by us — the sites'
      // own ad/analytics fetches get blocked by CSP and reject — but our
      // wrapper frame appears in the rejection's stack trace and looks
      // guilty. Faster unhook halves the exposure window. 1500ms is still
      // plenty for any Mendix runtime to boot — mxclientsystem script tag
      // lands well before that even on cold cache + slow network.
      if (performance.now() - detectStart > 1500) {
        clearInterval(detectTimer);
        if (!_mxSiteConfirmed) _unhookTrackers();
      }
    }, 200);
  })();
  
  // ===== SPA NAVIGATION TRACKING =====
  
  /* v0.2.71 — Navigation detection rewritten.
   *
   * Old logic reset on URL OR title OR mxPage change. Title fires
   * CONSTANTLY on a live Mendix page (notification updates, DataView
   * re-renders), wiping the per-navigation buckets so 20 calls showed
   * as 1 a second later. New rule: reset only on Mendix page PATH
   * change, falling back to URL pathname (explicitly excluding ?query
   * and #hash) when Mendix isn't initialized yet. */
  var lastPagePath = '';
  var lastMxPage = '';

  function getMxPageName() {
    try {
      if (window.mx && mx.ui && mx.ui.getContentForm) {
        var form = mx.ui.getContentForm();
        if (form && form.path) return form.path;
      }
    } catch(e) {}
    return '';
  }

  function getCurrentPageSignature() {
    var mxPage = getMxPageName();
    if (mxPage) return 'mx:' + mxPage;
    return 'path:' + (location.pathname || '');
  }

  lastPagePath = getCurrentPageSignature();
  lastMxPage   = getMxPageName();

  function checkNavigation() {
    var currentSig    = getCurrentPageSignature();
    var currentMxPage = getMxPageName();

    if (currentSig === lastPagePath) return;

    // If Mendix just became available, upgrade silently without reset
    var upgradedFromFallback = lastPagePath.indexOf('path:') === 0
                            && currentSig.indexOf('mx:') === 0
                            && currentMxPage && !lastMxPage;
    if (upgradedFromFallback) {
      lastPagePath = currentSig;
      lastMxPage   = currentMxPage;
      return;
    }

    perf.navigations.push({
      from: lastPagePath,
      to: currentSig,
      mxPage: currentMxPage,
      time: performance.now()
    });

    perf.resetNavigation();

    lastPagePath = currentSig;
    lastMxPage   = currentMxPage;
  }
  
  window.addEventListener('popstate', checkNavigation);
  window.addEventListener('hashchange', checkNavigation);
  
  // Also check periodically (for pushState and title changes)
  setInterval(checkNavigation, 300);
  
  // ===== HELPER: Get summary for inspector =====
  
  window.__mxiPerf.getSummary = function() {
    var now = performance.now();
    
    // Get widgets for current navigation only
    var currentNavWidgets = perf.widgets.timeline.filter(function(w) {
      return w.navigation === perf.currentNavigation;
    });
    
    return {
      // Recording state
      isRecording: perf.isRecording,
      
      // Timing summary (initial page load)
      totalTime: Math.round(now - perf.trackerStart),
      domContentLoaded: perf.timestamps.domContentLoaded ? Math.round(perf.timestamps.domContentLoaded) : null,
      windowLoad: perf.timestamps.windowLoad ? Math.round(perf.timestamps.windowLoad) : null,
      mxClientReady: perf.timestamps.mxClientReady ? Math.round(perf.timestamps.mxClientReady) : null,
      
      // Global widget timing
      firstWidget: perf.timestamps.firstWidget ? Math.round(perf.timestamps.firstWidget) : null,
      lastWidget: perf.timestamps.lastWidget ? Math.round(perf.timestamps.lastWidget) : null,
      widgetRenderTime: perf.widgets.renderDuration,
      
      // Per-navigation timing (more useful for SPA)
      navigation: {
        startTime: perf.navigation.startTime,
        firstWidget: perf.navigation.firstWidget ? Math.round(perf.navigation.firstWidget - perf.navigation.startTime) : null,
        lastWidget: perf.navigation.lastWidget ? Math.round(perf.navigation.lastWidget - perf.navigation.startTime) : null,
        renderDuration: perf.navigation.renderDuration,
        widgetCount: perf.navigation.widgetCount
      },
      
      // Web Vitals
      fcp: perf.vitals.fcp,
      lcp: perf.vitals.lcp,
      cls: Math.round(perf.vitals.cls * 1000) / 1000,
      fid: perf.vitals.fid,
      ttfb: perf.vitals.ttfb,
      
      // Mendix
      mendix: perf.mendix,
      
      // Widgets
      widgetCount: perf.widgets.totalCount,
      dataContainers: perf.widgets.dataContainers,
      widgetTimeline: currentNavWidgets.slice(-20), // Last 20 for current nav
      slowestWidgets: currentNavWidgets
        .filter(function(w) { return w.timeSinceNavigation > 500; })
        .sort(function(a, b) { return b.timeSinceNavigation - a.timeSinceNavigation; })
        .slice(0, 10),
      
      // Network
      totalRequests: perf.network.totalRequests,
      xhrCount: perf.network.xhrCalls.length,
      totalTransferred: perf.network.totalTransferred,
      slowRequests: perf.network.slowRequests.slice(0, 10),
      failedRequests: perf.network.failedRequests,

      // v1.3 — Data source calls captured from /xas/ request bodies.
      // v1.5 — Added operations (Mendix 10) and sessionInits.
      // v1.6 — navigationNumber marks which navigation the data is from
      // so the inspector can show "current page only" scope clearly.
      // Copied (not referenced) so the inspector doesn't mutate tracker state.
      dataSourceCalls: {
        microflows: Object.keys(perf.dataSources.microflows).map(function(name) {
          var e = perf.dataSources.microflows[name];
          return { name: name, count: e.count, totalDuration: e.totalDuration, lastStatus: e.lastStatus };
        }),
        otherActions: Object.keys(perf.dataSources.otherActions).map(function(name) {
          var e = perf.dataSources.otherActions[name];
          return { name: name, count: e.count, totalDuration: e.totalDuration };
        }),
        operations: Object.keys(perf.dataSources.operations).map(function(opId) {
          var e = perf.dataSources.operations[opId];
          return { opId: opId, count: e.count, totalDuration: e.totalDuration, shape: e.shape, hasChanges: e.hasChanges, lastStatus: e.lastStatus };
        }),
        xpathRetrieves: perf.dataSources.xpathRetrieves,
        associationRetrieves: perf.dataSources.associationRetrieves,
        commits: perf.dataSources.commits,
        sessionInits: perf.dataSources.sessionInits,
        navigationNumber: perf.currentNavigation
      },

      // v1.4 — Debug info for when capture misses everything. Surfaced
      // in the Data Sources section when no calls were classified, so the
      // user can see exactly what URLs and bodies we observed.
      dsDebug: {
        sampleUrls: perf.dsDebug.sampleUrls.slice(),
        sampleBodies: perf.dsDebug.sampleBodies.slice(),
        postCount: perf.dsDebug.postCount,
        parsedOk: perf.dsDebug.parsedOk,
        parsedFail: perf.dsDebug.parsedFail,
        hadActionField: perf.dsDebug.hadActionField,
        unknownActionTypes: Object.keys(perf.dsDebug.unknownActionTypes).map(function(t) {
          return { type: t, count: perf.dsDebug.unknownActionTypes[t] };
        })
      },

      // Errors
      errorCount: perf.errors.length,
      errors: perf.errors.slice(0, 10),
      
      // Navigations
      navigationCount: perf.navigations.length,
      currentNavigation: perf.currentNavigation,
      navigations: perf.navigations.slice(-5)
    };
  };

  /* v0.2.5 — startup chatter removed. The "Performance tracker v1.6 active"
   * console.log used to fire on every page load including non-Mendix sites,
   * leaking the extension's name to third-party error trackers and adding
   * pointless noise. The tracker's presence is detectable via window.__mxiPerf
   * for anyone who actually needs to verify it loaded. */

})();

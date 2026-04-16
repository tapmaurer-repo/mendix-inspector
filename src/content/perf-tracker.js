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
    version: '1.2',
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
    console.log('%c[MxInspector] Navigation #' + perf.currentNavigation + ' - metrics reset', 'color: #FFB800');
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
  
  // Intercept XHR
  var origXHROpen = XMLHttpRequest.prototype.open;
  var origXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url) {
    this._mxiUrl = url;
    this._mxiMethod = method;
    this._mxiStart = null;
    return origXHROpen.apply(this, arguments);
  };
  
  XMLHttpRequest.prototype.send = function() {
    var xhr = this;
    xhr._mxiStart = performance.now();
    
    xhr.addEventListener('loadend', function() {
      if (!perf.isRecording) return;
      if (xhr._mxiUrl && xhr._mxiUrl.indexOf('xas') > -1) {
        var duration = performance.now() - xhr._mxiStart;
        var entry = {
          url: xhr._mxiUrl,
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
      }
    });
    
    return origXHRSend.apply(this, arguments);
  };
  
  // ===== SPA NAVIGATION TRACKING =====
  
  var lastUrl = location.href;
  var lastPageTitle = document.title;
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
  
  function checkNavigation() {
    var currentUrl = location.href;
    var currentTitle = document.title;
    var currentMxPage = getMxPageName();
    
    // Check for URL change OR title change OR Mendix page change
    var hasNavigated = (currentUrl !== lastUrl) || 
                       (currentTitle !== lastPageTitle && currentTitle.length > 0) ||
                       (currentMxPage !== lastMxPage && currentMxPage.length > 0);
    
    if (hasNavigated) {
      perf.navigations.push({
        from: lastUrl,
        to: currentUrl,
        fromTitle: lastPageTitle,
        toTitle: currentTitle,
        mxPage: currentMxPage,
        time: performance.now()
      });
      
      // Reset per-navigation metrics
      perf.resetNavigation();
      
      lastUrl = currentUrl;
      lastPageTitle = currentTitle;
      lastMxPage = currentMxPage;
    }
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
      
      // Errors
      errorCount: perf.errors.length,
      errors: perf.errors.slice(0, 10),
      
      // Navigations
      navigationCount: perf.navigations.length,
      currentNavigation: perf.currentNavigation,
      navigations: perf.navigations.slice(-5)
    };
  };
  
  console.log('%c[MxInspector] Performance tracker v1.2 active (React SPA support)', 'color: #FFB800; font-weight: bold');
  
})();

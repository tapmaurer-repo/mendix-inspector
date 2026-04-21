/*!
 * MxInspector — Security Module (v0.2.43)
 *
 * Passive security posture detection for Mendix applications.
 * Reads only what the frontend already exposes. No auth tampering,
 * no active scanning, no backdoors. Endpoint probe is explicit/opt-in.
 *
 * Coverage (based on Mendix security docs + common web security checks):
 *   Auto-detect (sync):
 *     • Mendix constants with secret-pattern matching + entropy
 *     • Demo users exposed in session data
 *     • Anonymous session detection
 *     • Development mode indicators
 *     • Sensitive-entity writability (System.User / Administration.Account
 *       / System.FileDocument) using the domain-model metadata
 *   Opt-in (async, button-gated):
 *     • HEAD probe of /rest-doc/, /odata-doc/, /ws-doc/, /debugger/
 *
 * Exposes window.__MxSecurity with:
 *   .detect()             → sync posture report { constants, demoUsers,
 *                             anonymous, devMode, writableSensitiveEntities }
 *   .probeEndpoints()     → async → { '/rest-doc/': {status, reachable}, ... }
 *   .NEW_CVES             → array of CVEs to merge into inspector list
 *   .SECRET_PATTERNS      → pattern library (exposed so UI can badge)
 *   .SENSITIVE_ENTITIES   → list of canonical entity names to watch
 *
 * Standalone. Does not depend on other MxInspector modules.
 */
(function () {
  'use strict';
  if (window.__MxSecurity) return;

  // =======================================================================
  // REFERENCE DATA
  // =======================================================================

  /*
   * Additional CVEs to track. These are NOT duplicates of the five CVEs
   * already in inspector.js — we add them in addition. The affectsVersion
   * predicates are conservative: return true only when we're confident,
   * null when we can't determine (inspector.js will treat null as "maybe,
   * check advisory"), false when we know it doesn't apply.
   */
  var NEW_CVES = [
    {
      id: 'CVE-2023-30548',
      desc: 'Bypass of entity access rules for specific entities',
      severity: 'high',
      affected: function (M, m, p) {
        // Affects versions before late-2023 advisory wave
        if (M < 9) return true;
        if (M === 9 && m < 24) return true;
        return null;
      }
    },
    {
      id: 'CVE-2023-46170',
      desc: 'Information disclosure through error messages',
      severity: 'medium',
      affected: function (M, m, p) {
        if (M < 9) return true;
        if (M === 9 && m < 24) return true;
        return null;
      }
    },
    {
      id: 'CVE-2023-49069',
      desc: 'Bypass of entity access control rules',
      severity: 'high',
      affected: function (M, m, p) {
        if (M < 9) return true;
        if (M === 9 && m < 24) return true;
        return null;
      }
    },
    {
      id: 'CVE-2024-21681',
      desc: 'Remote code execution via crafted expressions',
      severity: 'critical',
      affected: function (M, m, p) {
        if (M < 9) return true;
        if (M === 9 && m < 24) return true;
        if (M === 10 && m < 6)  return true;
        return null;
      }
    }
  ];

  /*
   * Secret-pattern library. Each entry is { name, test(val), reason }.
   * Ordering matters — more specific patterns first so a JWT isn't
   * reclassified as "high entropy string".
   */
  var SECRET_PATTERNS = [
    { name: 'JWT token',
      test: function (v) { return /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(v); },
      reason: 'JSON Web Token format' },
    { name: 'AWS access key',
      test: function (v) { return /\b(AKIA|ASIA)[0-9A-Z]{16}\b/.test(v); },
      reason: 'AWS access key ID format' },
    { name: 'GitHub token',
      test: function (v) { return /\b(gh[pousr]_[A-Za-z0-9]{30,})\b/.test(v); },
      reason: 'GitHub personal/OAuth/app token format' },
    { name: 'Slack token',
      test: function (v) { return /\bxox[baprs]-[A-Za-z0-9-]+\b/.test(v); },
      reason: 'Slack API token format' },
    { name: 'Stripe key',
      test: function (v) { return /\b(sk|pk|rk)_(live|test)_[A-Za-z0-9]{16,}\b/.test(v); },
      reason: 'Stripe API key format' },
    { name: 'Google API key',
      test: function (v) { return /\bAIza[0-9A-Za-z_-]{35}\b/.test(v); },
      reason: 'Google API key format' },
    { name: 'OpenAI/Anthropic key',
      test: function (v) { return /\bsk-(ant-)?[A-Za-z0-9_-]{20,}\b/.test(v); },
      reason: 'OpenAI or Anthropic API key format' },
    { name: 'Private key (PEM)',
      test: function (v) { return /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(v); },
      reason: 'PEM private key block' },
    { name: 'Connection string',
      test: function (v) {
        if (v.length > 400) return false;
        var low = v.toLowerCase();
        // Must contain at least two connection-string fragments
        var hits = 0;
        ['server=', 'host=', 'password=', 'pwd=', 'user id=', 'uid=', 'database=', 'initial catalog='].forEach(
          function (k) { if (low.indexOf(k) > -1) hits++; }
        );
        return hits >= 2;
      },
      reason: 'Database connection string fragments' },
    { name: 'URL with embedded credential',
      test: function (v) { return /https?:\/\/[^\s@/]+:[^\s@/]+@/.test(v); },
      reason: 'URL contains user:password@host' },
    { name: 'URL with token in query',
      test: function (v) { return /[?&](token|apikey|api_key|auth|access_token|secret)=[^&\s]{8,}/i.test(v); },
      reason: 'URL contains token-like query parameter' }
  ];

  // Entity names commonly called out as sensitive in Mendix security reviews
  var SENSITIVE_ENTITIES = ['System.User', 'Administration.Account', 'System.FileDocument'];

  // Endpoint-probe targets
  var DOC_ENDPOINTS = ['/rest-doc/', '/odata-doc/', '/ws-doc/', '/debugger/'];

  // =======================================================================
  // UTILITIES
  // =======================================================================

  /* Shannon entropy in bits/char. ~4.5+ on a 32+-char string suggests
   * base64/hex random data rather than natural text. */
  function shannonEntropy(s) {
    if (!s || s.length < 1) return 0;
    var counts = Object.create(null);
    for (var i = 0; i < s.length; i++) counts[s[i]] = (counts[s[i]] || 0) + 1;
    var H = 0, len = s.length;
    Object.keys(counts).forEach(function (c) {
      var p = counts[c] / len;
      H -= p * (Math.log(p) / Math.log(2));
    });
    return H;
  }

  /* Classify a constant value. Returns:
   *   { level: 'secret' | 'sensitive' | 'plain', reason: string }
   * 'secret'    = matched a known secret pattern (high confidence)
   * 'sensitive'= looks high-entropy, could be a token
   * 'plain'    = low-risk looking
   */
  function classifyValue(v) {
    if (v == null) return { level: 'plain', reason: 'null' };
    var s = String(v);
    if (!s) return { level: 'plain', reason: 'empty' };

    // Pattern match — short-circuit on first hit
    for (var i = 0; i < SECRET_PATTERNS.length; i++) {
      if (SECRET_PATTERNS[i].test(s)) {
        return { level: 'secret', reason: SECRET_PATTERNS[i].reason, pattern: SECRET_PATTERNS[i].name };
      }
    }
    // Entropy fallback — only trigger on strings long enough to matter
    if (s.length >= 32 && s.length <= 512) {
      var H = shannonEntropy(s);
      if (H >= 4.5) {
        return { level: 'sensitive', reason: 'High entropy (' + H.toFixed(2) + ' bits/char)' };
      }
    }
    return { level: 'plain', reason: '' };
  }

  /* Redact a value for display. Shows the first 2 and last 2 chars
   * with the middle as a mask. Used when level !== 'plain'. */
  function redactValue(v) {
    var s = String(v == null ? '' : v);
    if (s.length <= 4) return '•'.repeat(s.length);
    if (s.length <= 16) return s.slice(0, 2) + '•'.repeat(s.length - 4) + s.slice(-2);
    return s.slice(0, 4) + '•••••••• [' + (s.length - 8) + ' chars] ••••••••' + s.slice(-4);
  }

  /* Safely try something, returning fallback on throw. */
  function tryOr(fn, fallback) {
    try { return fn(); } catch (e) { return fallback; }
  }

  // =======================================================================
  // DETECTORS
  // =======================================================================

  /*
   * CONSTANTS — the big one. Mendix exposes runtime constants in
   * mx.session.sessionData.constants. Each entry is typically:
   *   { Name: 'ModuleName.ConstantName', Value: '...', DataType: '...' }
   * We scan every constant and apply classifyValue() to decide severity.
   */
  function detectMendixConstants() {
    return tryOr(function () {
      var mx = window.mx;
      if (!mx || !mx.session) return { available: false, reason: 'mx.session unavailable' };
      var sd = mx.session.sessionData || mx.session.getSessionData && mx.session.getSessionData();
      if (!sd || !sd.constants) return { available: false, reason: 'sessionData.constants unavailable' };

      var results = [];
      // sessionData.constants is usually an array of {Name, Value, DataType}
      // but can also be keyed by name on some older versions — handle both.
      var entries = Array.isArray(sd.constants)
        ? sd.constants
        : Object.keys(sd.constants).map(function (k) { return { Name: k, Value: sd.constants[k] }; });

      entries.forEach(function (c) {
        if (!c) return;
        var name = c.Name || c.name || '(unnamed)';
        /* v0.2.56 — Mendix runtimes use inconsistent value keys across
         * versions and client types. Try all the common ones in order
         * of specificity. Unwrap nested { value: ... } wrappers too. */
        function unwrap(v, depth) {
          depth = depth || 0;
          if (depth > 3) return v;
          if (v == null) return v;
          if (typeof v === 'object' && !Array.isArray(v)) {
            if ('value' in v) return unwrap(v.value, depth + 1);
            if ('defaultValue' in v) return unwrap(v.defaultValue, depth + 1);
          }
          return v;
        }
        var rawVal = c.Value;
        if (rawVal == null) rawVal = c.value;
        if (rawVal == null) rawVal = c.DefaultValue;
        if (rawVal == null) rawVal = c.defaultValue;
        rawVal = unwrap(rawVal);
        var cls = classifyValue(rawVal);
        var stringVal = rawVal == null ? '' :
                        (typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal));
        results.push({
          name:      name,
          dataType:  c.DataType || c.dataType || '',
          rawValue:  stringVal,
          level:     cls.level,           // 'secret' | 'sensitive' | 'plain'
          reason:    cls.reason,
          pattern:   cls.pattern || null,
          valueLen:  stringVal.length
        });
      });

      // Sort: secrets first, then sensitive, then plain alphabetically
      var order = { secret: 0, sensitive: 1, plain: 2 };
      results.sort(function (a, b) {
        if (order[a.level] !== order[b.level]) return order[a.level] - order[b.level];
        return a.name.localeCompare(b.name);
      });

      return {
        available: true,
        count:     results.length,
        secrets:   results.filter(function (r) { return r.level === 'secret'; }).length,
        sensitive: results.filter(function (r) { return r.level === 'sensitive'; }).length,
        items:     results
      };
    }, { available: false, reason: 'exception' });
  }

  /*
   * DEMO USERS — Mendix surfaces these in sessionData.authenticatedAsDemoUser
   * or sessionData.demoUsers on some versions. Also look for any telltale
   * client fixtures (mx.session.sessionData may carry guest demo context).
   *
   * v0.2.44: Mendix exposes demo user passwords in the client-side session
   * data — on a dev environment this is expected, on production it's a
   * catastrophic credential leak. We surface them. The inspector UI is
   * responsible for flashing the red alarm when envType is production.
   */
  function detectDemoUsers() {
    return tryOr(function () {
      var mx = window.mx;
      if (!mx || !mx.session) return { available: false };
      var sd = mx.session.sessionData || (mx.session.getSessionData && mx.session.getSessionData());
      if (!sd) return { available: false };

      var users = [];

      // Shape 1: sessionData.demoUsers — array of { username, password, roles, ... }
      if (Array.isArray(sd.demoUsers)) {
        sd.demoUsers.forEach(function (u) {
          users.push({
            username: u.username || u.name || '(unknown)',
            password: u.password || u.pwd || u.pass || null,
            roles:    Array.isArray(u.roles) ? u.roles.join(', ')
                     : (u.role || u.userRole || '')
          });
        });
      }

      // Shape 2: config-level demo user block (older clients)
      if (!users.length && sd.config && Array.isArray(sd.config.demoUsers)) {
        sd.config.demoUsers.forEach(function (u) {
          users.push({
            username: u.username || u.name || '(unknown)',
            password: u.password || u.pwd || u.pass || null,
            roles:    Array.isArray(u.roles) ? u.roles.join(', ') : ''
          });
        });
      }

      // Shape 3: window-level mendix demo flag + roles list
      if (!users.length && sd.isDemoUser === true) {
        users.push({
          username: sd.currentUser || '(current session)',
          password: null,
          roles:    (sd.userRoles || []).join(', ')
        });
      }

      return {
        available: true,
        count:     users.length,
        items:     users
      };
    }, { available: false });
  }

  /*
   * ANONYMOUS — is the current session authenticated as a guest / anonymous
   * user? We already have `i.guest` in inspector.js, but here we compute it
   * independently to give the security module a self-contained signal.
   */
  function detectAnonymous() {
    return tryOr(function () {
      var mx = window.mx;
      if (!mx || !mx.session) return { available: false };
      var sd = mx.session.sessionData || (mx.session.getSessionData && mx.session.getSessionData());
      if (!sd) return { available: false };

      var isGuest = sd.isAnonymous === true ||
                    sd.guest === true ||
                    /anonymous|guest/i.test(String(sd.userName || sd.currentUser || ''));

      return {
        available:  true,
        anonymous:  !!isGuest,
        username:   sd.userName || sd.currentUser || null,
        roles:      sd.userRoles || []
      };
    }, { available: false });
  }

  /*
   * DEV MODE — heuristics. Mendix doesn't always expose this cleanly, but
   * several signals correlate strongly: mx.logger.level, presence of
   * verbose debug objects, dev-only bundles. We report signals with
   * confidence rather than a binary yes/no.
   */
  function detectDevMode() {
    return tryOr(function () {
      var signals = [];

      // Signal 1: mx.logger level — DEBUG or TRACE indicates dev
      try {
        var lvl = window.mx && window.mx.logger && window.mx.logger.level;
        if (typeof lvl === 'function') lvl = lvl.call(window.mx.logger);
        var name = (typeof lvl === 'string' ? lvl
                   : lvl && lvl.name ? lvl.name
                   : lvl != null ? String(lvl) : '');
        if (/debug|trace/i.test(name)) {
          signals.push({ source: 'mx.logger.level', value: name, weight: 'high' });
        }
      } catch (e) {}

      // Signal 2: window.logger (some clients duplicate it at root)
      try {
        if (window.logger && window.logger.level && /debug|trace/i.test(String(window.logger.level))) {
          signals.push({ source: 'window.logger.level', value: String(window.logger.level), weight: 'medium' });
        }
      } catch (e) {}

      // Signal 3: un-minified script tags (Mendix prod tends to use .min bundles)
      try {
        var srcList = [];
        document.querySelectorAll('script[src*="mxclientsystem"]').forEach(function (s) { srcList.push(s.src); });
        var unminified = srcList.filter(function (u) { return u.indexOf('.min.') === -1 && /\.js(\?|$)/.test(u); });
        if (unminified.length >= 2) {
          signals.push({ source: 'mxclientsystem bundles', value: unminified.length + ' non-min scripts', weight: 'low' });
        }
      } catch (e) {}

      // Signal 4: common dev globals
      try {
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && !window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers) {
          // Unused hook = dev build of React injected hook
          signals.push({ source: 'React', value: 'devtools hook present', weight: 'low' });
        }
      } catch (e) {}

      return {
        available:  true,
        signals:    signals,
        // Confidence: "high" if any high-weight signal, etc.
        confidence: signals.some(function (s) { return s.weight === 'high'; }) ? 'high'
                   : signals.some(function (s) { return s.weight === 'medium'; }) ? 'medium'
                   : signals.length ? 'low'
                   : 'none'
      };
    }, { available: false });
  }

  /*
   * WRITABLE SENSITIVE ENTITIES — iterate the Mendix metadata and check
   * whether the current session can write to any attribute of a sensitive
   * entity. mx.meta (or sessionData.entityAccess in some builds) carries
   * per-attribute R/W info once the object type is known.
   *
   * This is a best-effort probe. If the metadata isn't available (which
   * happens on locked-down prod apps), we return `available: false`
   * rather than a misleading "nothing found".
   */
  function detectWritableSensitiveEntities() {
    return tryOr(function () {
      var mx = window.mx;
      if (!mx) return { available: false, reason: 'mx not available' };

      var results = [];
      var anyProbed = false;

      SENSITIVE_ENTITIES.forEach(function (entityName) {
        // Try mx.meta.getEntity(entityName) — Mendix 8+ exposes a meta
        // service after page load. May throw / return null when the
        // session can't see this entity (which is itself useful info).
        var meta = null;
        try { meta = mx.meta && mx.meta.getEntity && mx.meta.getEntity(entityName); }
        catch (e) { meta = null; }

        if (!meta) {
          results.push({ entity: entityName, available: false, reason: 'entity not in session metadata' });
          return;
        }
        anyProbed = true;

        var writableAttrs = [];
        try {
          var attrs = meta.getAttributes ? meta.getAttributes() : (meta.attributes || {});
          var attrNames = Array.isArray(attrs) ? attrs.map(function (a) { return a.name || a; })
                                                : Object.keys(attrs);
          attrNames.forEach(function (a) {
            var attrMeta = meta.getAttribute ? meta.getAttribute(a) : attrs[a];
            var isWritable = false;
            try {
              isWritable = attrMeta && (
                (attrMeta.isWritable && attrMeta.isWritable()) ||
                attrMeta.writable === true ||
                (attrMeta.access && attrMeta.access.indexOf('w') > -1)
              );
            } catch (e) {}
            if (isWritable) writableAttrs.push(a);
          });
        } catch (e) {}

        results.push({
          entity: entityName,
          available: true,
          writableAttrs: writableAttrs,
          writableCount: writableAttrs.length
        });
      });

      return {
        available:   anyProbed,
        probed:      SENSITIVE_ENTITIES.length,
        withWrites:  results.filter(function (r) { return r.writableCount > 0; }).length,
        items:       results
      };
    }, { available: false, reason: 'exception' });
  }

  /*
   * ENDPOINT PROBE (Tier 3, opt-in, async).
   * HEADs the four doc/debug endpoints. Treats any 2xx/3xx as reachable.
   * 401/403 = reachable but auth-gated (still useful info — the route exists).
   * 404/500+ = not reachable. Network failure = unknown.
   *
   * Uses `method: 'HEAD'` to avoid pulling big bodies. Falls back to a
   * tiny GET if the server rejects HEAD (some configurations do).
   */
  function probeEndpoints() {
    var origin = location.origin;
    var probes = DOC_ENDPOINTS.map(function (path) {
      var url = origin + path;
      return fetch(url, { method: 'HEAD', credentials: 'same-origin', cache: 'no-store' })
        .then(function (r) {
          return { path: path, status: r.status, reachable: r.status < 400, method: 'HEAD' };
        })
        .catch(function () {
          // Retry with GET in case HEAD is blocked by the server
          return fetch(url, { method: 'GET', credentials: 'same-origin', cache: 'no-store' })
            .then(function (r) {
              return { path: path, status: r.status, reachable: r.status < 400, method: 'GET' };
            })
            .catch(function (err) {
              return { path: path, status: 0, reachable: false, error: String(err && err.message || err), method: 'GET' };
            });
        });
    });
    return Promise.all(probes).then(function (results) {
      var byPath = {};
      results.forEach(function (r) { byPath[r.path] = r; });
      return {
        probedAt:     new Date().toISOString(),
        results:      results,
        byPath:       byPath,
        reachableCount: results.filter(function (r) { return r.reachable; }).length
      };
    });
  }

  // =======================================================================
  // AGGREGATOR
  // =======================================================================

  function detect() {
    return {
      generatedAt:                new Date().toISOString(),
      constants:                  detectMendixConstants(),
      demoUsers:                  detectDemoUsers(),
      anonymous:                  detectAnonymous(),
      devMode:                    detectDevMode(),
      writableSensitiveEntities:  detectWritableSensitiveEntities()
    };
  }

  // =======================================================================
  // EXPORT
  // =======================================================================

  window.__MxSecurity = {
    detect:              detect,
    probeEndpoints:      probeEndpoints,
    classifyValue:       classifyValue,
    redactValue:         redactValue,
    shannonEntropy:      shannonEntropy,
    NEW_CVES:            NEW_CVES,
    SECRET_PATTERNS:     SECRET_PATTERNS,
    SENSITIVE_ENTITIES:  SENSITIVE_ENTITIES,
    DOC_ENDPOINTS:       DOC_ENDPOINTS
  };

  console.log('[MXI] Security module v0.2.43 loaded');
})();

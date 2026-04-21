/*! 
 * MxInspector v1.3 - Mendix Page Inspector & Debugger
 * Created with ❤️ by Tim Maurer (https://github.com/timmaurer)
 * 
 * MIT License - Free for personal and commercial use
 * Attribution required: Please keep this header intact
 * 
 * Support the creator: https://paypal.me/tapmaurer
 */

/**
 * MENDIX DATA EXTRACTION MODULE
 * Supports both React (Mendix 10+) and Dojo (Mendix 7-9) clients
 */
(function() {
  'use strict';
  
  // Guard against multiple execution
  if (window.__MxDataExtractor) {
    return;
  }
  
  var MxDataExtractor = {};
  
  /**
   * Detect which Mendix client is running
   */
  MxDataExtractor.detectClient = function() {
    var hasReact = !!document.getElementById('root');
    var hasDojo = !!(window.dijit && window.dijit.registry);
    
    if (hasReact && !hasDojo) return 'React';
    if (hasDojo) return 'Dojo';
    return 'Unknown';
  };
  
  /**
   * Get MxObject from React list item via Symbol(mxObject)
   */
  MxDataExtractor.getMxObjectFromItem = function(item) {
    if (!item) return null;
    
    var symbols = Object.getOwnPropertySymbols(item);
    var mxSym = null;
    for (var i = 0; i < symbols.length; i++) {
      if (symbols[i].toString().indexOf('mxObject') > -1) {
        mxSym = symbols[i];
        break;
      }
    }
    
    return mxSym ? item[mxSym] : null;
  };
  
  /**
   * Extract entity name from a React list item
   */
  MxDataExtractor.getEntityFromItem = function(item) {
    var mxObj = MxDataExtractor.getMxObjectFromItem(item);
    if (!mxObj) return null;
    
    if (mxObj.getEntity && typeof mxObj.getEntity === 'function') {
      try { return mxObj.getEntity(); } catch(e) {}
    }
    if (mxObj.metaData && mxObj.metaData.name) {
      return mxObj.metaData.name;
    }
    if (mxObj._jsonData && mxObj._jsonData.objectType) {
      return mxObj._jsonData.objectType;
    }
    
    return null;
  };
  
  /**
   * Unwrap a Mendix attribute value (may be deeply nested)
   */
  function unwrapValue(val, depth) {
    depth = depth || 0;
    if (depth > 5) return val; // Prevent infinite recursion
    if (val === null || val === undefined) return val;
    
    // If it's not an object, return as-is
    if (typeof val !== 'object') return val;
    
    // If it's an array, return length info
    if (Array.isArray(val)) return val;
    
    // Handle Big decimal objects (Mendix uses big.js for precision)
    if (val.constructor && val.constructor.name === 'Big' && typeof val.toNumber === 'function') {
      return val.toNumber();
    }
    
    // Also check for Big-like objects (s, e, c properties)
    if ('s' in val && 'e' in val && 'c' in val && typeof val.toString === 'function') {
      return val.toString();
    }
    
    // Try common Mendix wrapper patterns
    if ('value' in val) {
      return unwrapValue(val.value, depth + 1);
    }
    
    // Check for displayValue (Mendix sometimes uses this)
    if ('displayValue' in val) {
      return val.displayValue;
    }
    
    // Check for primitiveValue
    if ('primitiveValue' in val) {
      return val.primitiveValue;
    }
    
    return val;
  }

  /**
   * v0.2.46 — Resolve a Mendix attribute's logical type ("DateTime", "String",
   * "Integer", "Decimal", "Boolean", "AutoNumber", "Long", "Enum", etc.).
   * Returns "" when the type cannot be determined. Tries (in order):
   *   1. Dojo client's mxObj.getAttributeType(name)
   *   2. _jsonData.attributes[name].type / .metaType
   *   3. A heuristic from the attribute name + value for common patterns
   */
  function getAttributeType(mxObj, name, value) {
    try {
      if (mxObj && typeof mxObj.getAttributeType === 'function') {
        var t = mxObj.getAttributeType(name);
        if (t) return String(t);
      }
    } catch (e) {}
    try {
      var j = mxObj && (mxObj._jsonData || mxObj.jsonData);
      if (j && j.attributes && j.attributes[name]) {
        var a = j.attributes[name];
        if (a.type) return String(a.type);
        if (a.metaType) return String(a.metaType);
        if (a.$type) return String(a.$type);
      }
    } catch (e) {}
    // Heuristic fallback — only for names that strongly signal DateTime.
    // We intentionally DON'T guess based on a value like 1776689202634
    // alone, because a Long/AutoNumber could share that shape.
    try {
      if (typeof name === 'string') {
        if (/(^|[_.])(created|changed)Date$/i.test(name)) return 'DateTime';
        if (/Date$|DateTime$|Timestamp$|At$/i.test(name) && typeof value === 'number' && value > 0) return 'DateTime';
      }
    } catch (e) {}
    return '';
  }
  MxDataExtractor.getAttributeType = getAttributeType;
  
  /**
   * Extract ALL attributes and their values from an MxObject
   */
  MxDataExtractor.getObjectAttributes = function(mxObj) {
    if (!mxObj) return { attributes: [], associations: [] };
    
    var attributes = [];
    var associations = [];
    
    // Debug: log the mxObj structure once
    if (!window.__mxiLoggedOnce) {
      window.__mxiLoggedOnce = true;
      console.log('[MxInspector] MxObject structure:', mxObj);
      if (mxObj._jsonData) console.log('[MxInspector] _jsonData:', mxObj._jsonData);
    }
    
    try {
      // Method 1: Try getAttributes() method (Mendix 7-9)
      if (mxObj.getAttributes && typeof mxObj.getAttributes === 'function') {
        var attrNames = mxObj.getAttributes();
        if (attrNames && attrNames.length) {
          attrNames.forEach(function(name) {
            try {
              var value = mxObj.get ? mxObj.get(name) : null;
              var unwrapped = unwrapValue(value);
              attributes.push({ name: name, value: unwrapped, type: getAttributeType(mxObj, name, unwrapped) });
            } catch(e) {}
          });
        }
      }
      
      // Method 2: Try _jsonData (React client)
      if (mxObj._jsonData && mxObj._jsonData.attributes) {
        var jsonAttrs = mxObj._jsonData.attributes;
        Object.keys(jsonAttrs).forEach(function(name) {
          // Check if already added
          var exists = attributes.some(function(a) { return a.name === name; });
          if (!exists) {
            var rawVal = jsonAttrs[name];
            var unwrapped = unwrapValue(rawVal);
            attributes.push({ name: name, value: unwrapped, type: getAttributeType(mxObj, name, unwrapped) });
          }
        });
      }
      
      // Method 3: Try jsonData (alternative property name)
      if (mxObj.jsonData && mxObj.jsonData.attributes) {
        var jsonAttrs2 = mxObj.jsonData.attributes;
        Object.keys(jsonAttrs2).forEach(function(name) {
          var exists = attributes.some(function(a) { return a.name === name; });
          if (!exists) {
            var rawVal2 = jsonAttrs2[name];
            var val2 = (rawVal2 && typeof rawVal2 === 'object' && 'value' in rawVal2) ? rawVal2.value : rawVal2;
            var unwrapped = unwrapValue(val2);
            attributes.push({ name: name, value: unwrapped, type: getAttributeType(mxObj, name, unwrapped) });
          }
        });
      }
      
      // Method 4: Look for _attributes property
      if (mxObj._attributes) {
        Object.keys(mxObj._attributes).forEach(function(name) {
          var exists = attributes.some(function(a) { return a.name === name; });
          if (!exists) {
            var unwrapped = unwrapValue(mxObj._attributes[name]);
            attributes.push({ name: name, value: unwrapped, type: getAttributeType(mxObj, name, unwrapped) });
          }
        });
      }
      
      // Extract associations/references
      if (mxObj.getReferences && typeof mxObj.getReferences === 'function') {
        try {
          var refs = mxObj.getReferences();
          if (refs && refs.length) {
            refs.forEach(function(refName) {
              try {
                var refValue = mxObj.getReference ? mxObj.getReference(refName) : null;
                associations.push({ name: refName, value: refValue, isEmpty: !refValue });
              } catch(e) {}
            });
          }
        } catch(e) {}
      }
      
      // Try _jsonData.references for React client
      if (mxObj._jsonData && mxObj._jsonData.references) {
        Object.keys(mxObj._jsonData.references).forEach(function(refName) {
          var exists = associations.some(function(a) { return a.name === refName; });
          if (!exists) {
            var refData = mxObj._jsonData.references[refName];
            var refValue = refData && refData.value ? refData.value : null;
            associations.push({ name: refName, value: refValue, isEmpty: !refValue });
          }
        });
      }
      
      // Also check attributes for association patterns (they look like Module.Entity_AssocName)
      // Move these from attributes to associations
      var assocPattern = /^[A-Z][a-zA-Z0-9]*\.[A-Z][a-zA-Z0-9]*_[A-Z]/;
      var attrsToRemove = [];
      attributes.forEach(function(attr, idx) {
        if (assocPattern.test(attr.name)) {
          var exists = associations.some(function(a) { return a.name === attr.name; });
          if (!exists) {
            associations.push({ name: attr.name, value: attr.value, isEmpty: !attr.value });
          }
          attrsToRemove.push(idx);
        }
      });
      // Remove associations from attributes array (reverse order to preserve indices)
      for (var i = attrsToRemove.length - 1; i >= 0; i--) {
        attributes.splice(attrsToRemove[i], 1);
      }
      
    } catch(e) {
      console.warn('MxDataExtractor: Error extracting attributes', e);
    }
    
    return { attributes: attributes, associations: associations };
  };
  
  /**
   * v0.2.17 — Read Mendix system members (createdDate, changedDate, owner,
   * createdBy, changedBy) from an MxObject. These live outside the regular
   * attributes array — on the object itself or on _jsonData. Different client
   * versions expose them differently, so we try multiple paths.
   *
   * Returns an array of { name, value, raw } entries for whichever members
   * are actually present. Missing members are omitted (no empty rows).
   */
  MxDataExtractor.getSystemMembers = function(mxObj) {
    if (!mxObj) return [];
    var out = [];
    var seen = {};

    function push(name, raw, formatted) {
      if (seen[name]) return;
      if (raw === null || raw === undefined || raw === '') return;
      seen[name] = true;
      out.push({ name: name, value: formatted, raw: raw });
    }

    function fmtDate(v) {
      if (v === null || v === undefined || v === '') return null;
      // Mendix returns unix ms timestamps as numbers or numeric strings
      var n = typeof v === 'number' ? v : parseInt(v, 10);
      if (isNaN(n)) return String(v);
      try {
        var d = new Date(n);
        if (isNaN(d.getTime())) return String(v);
        return d.toISOString().replace('T', ' ').replace(/\.\d+Z$/, 'Z');
      } catch (e) { return String(v); }
    }

    try {
      // --- Method 1: Dojo-style getter methods (Mendix 7-9) ---
      if (typeof mxObj.getCreatedDate === 'function') {
        try { var cd = mxObj.getCreatedDate(); push('createdDate', cd, fmtDate(cd)); } catch (e) {}
      }
      if (typeof mxObj.getChangedDate === 'function') {
        try { var ch = mxObj.getChangedDate(); push('changedDate', ch, fmtDate(ch)); } catch (e) {}
      }
      if (typeof mxObj.getOwnerGUID === 'function') {
        try { var og = mxObj.getOwnerGUID(); push('owner', og, String(og)); } catch (e) {}
      }

      // --- Method 1b: v0.2.19 — Mendix 10 React client exposes system members
      //     via mxObj.get('System.createdDate') etc. ---
      if (typeof mxObj.get === 'function') {
        ['System.createdDate', 'System.changedDate', 'System.owner', 'System.createdBy', 'System.changedBy']
          .forEach(function (key) {
            try {
              var v = mxObj.get(key);
              if (v !== undefined && v !== null) {
                var short = key.split('.').pop();
                var isDate = short === 'createdDate' || short === 'changedDate';
                push(short, v, isDate ? fmtDate(v) : String(v));
              }
            } catch (e) {}
          });
      }

      // --- Method 2: _jsonData fields (modern client) ---
      var j = mxObj._jsonData;
      if (j) {
        if ('createdDate' in j)   push('createdDate',   j.createdDate,   fmtDate(j.createdDate));
        if ('changedDate' in j)   push('changedDate',   j.changedDate,   fmtDate(j.changedDate));
        if ('owner' in j)         push('owner',         j.owner,         String(j.owner));
        if ('ownerGUID' in j)     push('owner',         j.ownerGUID,     String(j.ownerGUID));
        if ('createdBy' in j)     push('createdBy',     j.createdBy,     String(j.createdBy));
        if ('changedBy' in j)     push('changedBy',     j.changedBy,     String(j.changedBy));
        // Some clients store these under attributes too with System.* prefix
        if (j.attributes) {
          if ('System.createdDate' in j.attributes)
            push('createdDate', j.attributes['System.createdDate'],
                 fmtDate(unwrapValue(j.attributes['System.createdDate'])));
          if ('System.changedDate' in j.attributes)
            push('changedDate', j.attributes['System.changedDate'],
                 fmtDate(unwrapValue(j.attributes['System.changedDate'])));
          if ('System.owner' in j.attributes)
            push('owner', j.attributes['System.owner'],
                 String(unwrapValue(j.attributes['System.owner'])));
        }
      }

      // --- Method 3: direct properties on mxObj ---
      if (mxObj.createdDate != null && !seen.createdDate)
        push('createdDate', mxObj.createdDate, fmtDate(mxObj.createdDate));
      if (mxObj.changedDate != null && !seen.changedDate)
        push('changedDate', mxObj.changedDate, fmtDate(mxObj.changedDate));
      if (mxObj.ownerGUID != null && !seen.owner)
        push('owner', mxObj.ownerGUID, String(mxObj.ownerGUID));
    } catch (e) {
      console.warn('[MxInspector] getSystemMembers error:', e);
    }

    return out;
  };

  /**
   * Get the GUID of an MxObject
   */
  MxDataExtractor.getObjectGuid = function(mxObj) {
    if (!mxObj) return null;
    
    try {
      if (mxObj.getGuid && typeof mxObj.getGuid === 'function') {
        return mxObj.getGuid();
      }
      if (mxObj._guid) return mxObj._guid;
      if (mxObj.guid) return mxObj.guid;
      if (mxObj._jsonData && mxObj._jsonData.guid) return mxObj._jsonData.guid;
    } catch(e) {}
    
    return null;
  };
  
  /**
   * Find React Fiber key on an element
   */
  function getFiberKey(element) {
    if (!element) return null;
    var keys = Object.keys(element);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('__reactFiber') === 0 || keys[i].indexOf('__reactInternalInstance') === 0) {
        return keys[i];
      }
    }
    return null;
  }
  
  /**
   * Find the specific list item that was clicked by matching element to item
   */
  function findClickedListItem(element, items) {
    if (!element || !items || items.length === 0) return null;
    
    try {
      // Walk up from the clicked element to find a list item container
      var current = element;
      var maxWalk = 20;
      var walk = 0;
      
      while (current && walk < maxWalk) {
        // Check if this element has fiber data with an item reference
        var fiberKey = getFiberKey(current);
        if (fiberKey && current[fiberKey]) {
          var fiber = current[fiberKey];
          
          // Check memoizedProps for item reference
          if (fiber.memoizedProps) {
            var props = fiber.memoizedProps;
            
            // Check for 'item' prop (common in list item templates)
            if (props.item) {
              var itemMxObj = MxDataExtractor.getMxObjectFromItem(props.item);
              if (itemMxObj) return itemMxObj;
            }
            
            // Check for 'value' that might be a list item
            if (props.value && typeof props.value === 'object') {
              var valueMxObj = MxDataExtractor.getMxObjectFromItem(props.value);
              if (valueMxObj) {
                // Verify this is one of the items in our list
                var valueGuid = MxDataExtractor.getObjectGuid(valueMxObj);
                for (var i = 0; i < items.length; i++) {
                  var listItemMxObj = MxDataExtractor.getMxObjectFromItem(items[i]);
                  if (listItemMxObj) {
                    var listItemGuid = MxDataExtractor.getObjectGuid(listItemMxObj);
                    if (valueGuid && listItemGuid && valueGuid === listItemGuid) {
                      return valueMxObj;
                    }
                  }
                }
              }
            }
            
            // Check for object prop in nested dataviews
            if (props.object && props.object.value) {
              var objMxObj = MxDataExtractor.getMxObjectFromItem(props.object.value);
              if (objMxObj) return objMxObj;
            }
          }
        }
        
        // Check for list item index in class name (e.g., mx-name-index-5)
        var cn = current.className || '';
        if (typeof cn === 'string') {
          var indexMatch = cn.match(/mx-name-index-(\d+)/);
          if (indexMatch) {
            var idx = parseInt(indexMatch[1], 10);
            if (idx >= 0 && idx < items.length) {
              var indexedMxObj = MxDataExtractor.getMxObjectFromItem(items[idx]);
              if (indexedMxObj) return indexedMxObj;
            }
          }
        }
        
        current = current.parentElement;
        walk++;
      }
    } catch (e) {
      console.warn('MxDataExtractor: Error finding clicked list item', e);
    }
    
    return null;
  }
  
  /**
   * Walk React Fiber tree to extract Mendix data
   */
  MxDataExtractor.extractDataFromElement = function(element) {
    if (!element) return null;
    
    var client = MxDataExtractor.detectClient();
    
    if (client === 'React') {
      return extractFiberData(element);
    } else if (client === 'Dojo') {
      return extractDojoData(element);
    }
    
    return null;
  };
  
  function extractFiberData(element) {
    var fiberKey = getFiberKey(element);
    if (!fiberKey) return null;
    
    var fiber = element[fiberKey];
    var data = {
      entity: null,
      objectCount: 0,
      datasourceStatus: null,
      datasourceType: null,
      widgetId: null,
      items: [],
      mxObject: null,
      attributes: [],
      associations: []
    };
    
    // v0.2.19 — Determine what kind of data this element holds so we can stop
    // the fiber walk at the right boundary. Critical: a DataView inside a
    // ListView's row template must NOT inherit the listview's items[]; we
    // must only read the DataView's own mxObject.
    var cn = element.className || '';
    if (typeof cn !== 'string') cn = cn.baseVal || '';
    var isSingleObjectContainer = /\bmx-dataview\b/.test(cn);
    var isListContainer = /\bmx-listview\b|\bmx-templategrid\b|widget-datagrid|widget-gallery/.test(cn);
    
    var depth = 0;
    var maxDepth = 40;
    
    while (fiber && depth < maxDepth) {
      if (fiber.memoizedProps) {
        var props = fiber.memoizedProps;
        
        // Widget ID
        if (props.widgetId && !data.widgetId) {
          data.widgetId = props.widgetId;
        }
        if (props.$widgetId && !data.widgetId) {
          data.widgetId = props.$widgetId;
        }
        
        // Try to extract datasource type
        if (!data.datasourceType) {
          if (props.$dataSource && typeof props.$dataSource === 'string') {
            var ds = props.$dataSource.toLowerCase();
            if (ds.indexOf('microflow') > -1) data.datasourceType = 'microflow';
            else if (ds.indexOf('nanoflow') > -1) data.datasourceType = 'nanoflow';
            else if (ds.indexOf('xpath') > -1 || ds.indexOf('database') > -1) data.datasourceType = 'database';
            else if (ds.indexOf('association') > -1) data.datasourceType = 'association';
          }
          if (props.datasource && props.datasource.type) {
            data.datasourceType = props.datasource.type;
          }
        }
        
        // Object prop (DataView - single object)
        if (props.object && props.object.status) {
          data.datasourceStatus = props.object.status;
          if (!data.datasourceType) data.datasourceType = 'context';
          if (props.object.value) {
            data.objectCount = 1;
            
            // The value is a wrapper - get actual MxObject via Symbol(mxObject)
            var actualMxObj = MxDataExtractor.getMxObjectFromItem(props.object.value);
            if (actualMxObj) {
              data.mxObject = actualMxObj;
              
              // Get entity name from actual MxObject
              if (actualMxObj.metaData && actualMxObj.metaData.name) {
                data.entity = actualMxObj.metaData.name;
              } else if (actualMxObj._jsonData && actualMxObj._jsonData.objectType) {
                data.entity = actualMxObj._jsonData.objectType;
              } else if (actualMxObj.getEntity) {
                try { data.entity = actualMxObj.getEntity(); } catch(e) {}
              }
              
              // Extract attributes and associations from actual MxObject
              var objData = MxDataExtractor.getObjectAttributes(actualMxObj);
              data.attributes = objData.attributes;
              data.associations = objData.associations;
            } else {
              // Fallback: maybe it's already the MxObject
              data.mxObject = props.object.value;
              if (props.object.value.getEntity) {
                try { data.entity = props.object.value.getEntity(); } catch(e) {}
              }
              var objData2 = MxDataExtractor.getObjectAttributes(props.object.value);
              data.attributes = objData2.attributes;
              data.associations = objData2.associations;
            }
          }
        }
        
        // listValue prop (ListView - array)
        if (props.listValue && props.listValue.items) {
          data.datasourceStatus = props.listValue.status || 'unknown';
          if (!data.datasourceType) data.datasourceType = 'database';
          data.objectCount = props.listValue.items.length;
          
          if (props.listValue.items.length > 0) {
            var firstItem = props.listValue.items[0];
            var entityName = MxDataExtractor.getEntityFromItem(firstItem);
            if (entityName) data.entity = entityName;
            data.items = props.listValue.items;
            
            // Try to find the specific item that was clicked
            var clickedMxObj = findClickedListItem(element, props.listValue.items);
            if (clickedMxObj) {
              data.mxObject = clickedMxObj;
              var listObjData = MxDataExtractor.getObjectAttributes(clickedMxObj);
              data.attributes = listObjData.attributes;
              data.associations = listObjData.associations;
            } else {
              // Fallback to first item
              var firstMxObj = MxDataExtractor.getMxObjectFromItem(firstItem);
              if (firstMxObj) {
                data.mxObject = firstMxObj;
                var listObjData = MxDataExtractor.getObjectAttributes(firstMxObj);
                data.attributes = listObjData.attributes;
                data.associations = listObjData.associations;
              }
            }
          }
        }
        
        // datasource prop (Pluggable widgets like DataGrid2)
        if (props.datasource && props.datasource.items) {
          data.datasourceStatus = props.datasource.status || 'unknown';
          data.objectCount = props.datasource.items.length;
          
          if (props.datasource.items.length > 0) {
            var ent = MxDataExtractor.getEntityFromItem(props.datasource.items[0]);
            if (ent) data.entity = ent;
            data.items = props.datasource.items;
            
            // Try to find the specific item that was clicked
            var clickedPlugMxObj = findClickedListItem(element, props.datasource.items);
            if (clickedPlugMxObj) {
              data.mxObject = clickedPlugMxObj;
              var dsObjData = MxDataExtractor.getObjectAttributes(clickedPlugMxObj);
              data.attributes = dsObjData.attributes;
              data.associations = dsObjData.associations;
            } else {
              // Fallback to first item
              var plugMxObj = MxDataExtractor.getMxObjectFromItem(props.datasource.items[0]);
              if (plugMxObj) {
                data.mxObject = plugMxObj;
                var dsObjData = MxDataExtractor.getObjectAttributes(plugMxObj);
                data.attributes = dsObjData.attributes;
                data.associations = dsObjData.associations;
              }
            }
          }
        }
      }
      
      // v0.2.19 — Stop walking up once we've satisfied what this element holds:
      //   - If it's a DataView and we have a single mxObject → done
      //   - If it's a ListView/Gallery/Grid and we have items[] → done
      //   - If it's an unknown container and we have EITHER → done (prefer single-obj)
      // This prevents a DataView inside a ListView row from inheriting the
      // listview's 25 items[] when it only has 1 specific mxObject.
      if (isSingleObjectContainer && data.mxObject) {
        break;
      }
      if (isListContainer && data.items && data.items.length > 0) {
        break;
      }
      if (!isSingleObjectContainer && !isListContainer && (data.mxObject || (data.items && data.items.length > 0))) {
        break;
      }

      fiber = fiber.return;
      depth++;
    }
    
    return data;
  }
  
  function extractDojoData(element) {
    if (!window.dijit || !window.dijit.registry) return null;
    
    var data = {
      entity: null,
      objectCount: 0,
      datasourceStatus: 'available',
      widgetId: null,
      items: [],
      mxObject: null,
      attributes: [],
      associations: []
    };
    
    var widgetId = element.getAttribute('widgetid') || element.id;
    if (!widgetId) return null;
    
    var widget = dijit.registry.byId(widgetId);
    if (!widget) return null;
    
    data.widgetId = widgetId;
    
    if (widget._mxObject) {
      data.objectCount = 1;
      data.mxObject = widget._mxObject;
      try {
        data.entity = widget._mxObject.getEntity();
      } catch(e) {}
      
      // Extract attributes and associations
      var objData = MxDataExtractor.getObjectAttributes(widget._mxObject);
      data.attributes = objData.attributes;
      data.associations = objData.associations;
    }
    
    if (widget._datasource) {
      try {
        var ds = widget._datasource;
        if (ds._objects) {
          data.objectCount = ds._objects.length;
          if (ds._objects.length > 0) {
            data.entity = ds._objects[0].getEntity();
            data.mxObject = ds._objects[0];
          }
        }
      } catch(e) {}
    }
    
    return data;
  }
  
  /**
   * Find parent data container of an element
   */
  MxDataExtractor.findParentDataContainer = function(element) {
    if (!element) return null;
    
    var current = element.parentElement;
    var maxDepth = 50;
    var depth = 0;
    
    while (current && depth < maxDepth) {
      try {
        var cn = current.className || '';
        if (typeof cn !== 'string') cn = cn.baseVal || '';
        
        // Skip mx-dataview-content (it's a child wrapper, not the actual dataview)
        if (cn.indexOf('mx-dataview-content') > -1) {
          current = current.parentElement;
          depth++;
          continue;
        }
        
        // Check if this is a data container
        var isDataContainer = false;
        var containerType = 'Unknown';
        
        if (cn.indexOf('mx-dataview') > -1 && cn.indexOf('mx-dataview-content') === -1) {
          isDataContainer = true;
          containerType = 'DataView';
        } else if (cn.indexOf('mx-listview') > -1) {
          isDataContainer = true;
          containerType = 'ListView';
        } else if (cn.indexOf('mx-templategrid') > -1) {
          isDataContainer = true;
          containerType = 'TemplateGrid';
        } else if (cn.indexOf('widget-datagrid') > -1) {
          isDataContainer = true;
          containerType = 'DataGrid2';
        } else if (cn.indexOf('widget-gallery') > -1) {
          isDataContainer = true;
          containerType = 'Gallery';
        }
        
        if (isDataContainer) {
          var nameMatch = cn.match(/mx-name-([^\s]+)/);
          var widgetName = nameMatch ? nameMatch[1] : null;
          
          // Get data from this container
          var data = MxDataExtractor.extractDataFromElement(current);
          
          return {
            element: current,
            type: containerType,
            name: widgetName,
            entity: data ? data.entity : null,
            objectCount: data ? data.objectCount : 0
          };
        }
      } catch(e) {}
      
      current = current.parentElement;
      depth++;
    }
    
    return null;
  };
  
  /**
   * Scan all data containers on the page
   */
  MxDataExtractor.scanAllDataContainers = function() {
    var containers = document.querySelectorAll(
      '.mx-dataview:not(.mx-dataview-content), .mx-listview, ' +
      '[class*="widget-datagrid"], [class*="widget-gallery"], ' +
      '.mx-templategrid, .widget-tree-node, .mx-treeview'
    );
    
    var results = {
      containers: [],
      entities: {},
      totalObjects: 0
    };
    
    containers.forEach(function(el) {
      var className = el.className || '';
      var nameMatch = className.match(/mx-name-([^\s]+)/);
      var widgetName = nameMatch ? nameMatch[1] : null;
      
      var data = MxDataExtractor.extractDataFromElement(el);
      
      if (data) {
        var entry = {
          name: widgetName,
          element: el,
          entity: data.entity,
          objectCount: data.objectCount,
          status: data.datasourceStatus
        };
        
        results.containers.push(entry);
        
        if (data.entity) {
          if (!results.entities[data.entity]) {
            results.entities[data.entity] = 0;
          }
          results.entities[data.entity] += data.objectCount;
        }
        
        results.totalObjects += data.objectCount;
      }
    });
    
    return results;
  };
  
  /**
   * Get entity metadata from Mendix session
   */
  MxDataExtractor.getEntityMetadata = function() {
    if (!window.mx || !mx.session || !mx.session.sessionData) return [];
    
    var metadata = mx.session.sessionData.metadata || [];
    return metadata.map(function(m) {
      return {
        entity: m.objectType,
        entityId: m.entityId,
        attributes: Object.keys(m.attributes || {}),
        persistable: m.persistable
      };
    });
  };
  
  /**
   * Get page parameters from current page
   * These are objects passed to the page that may not have visible dataviews
   */
  MxDataExtractor.getPageParameters = function() {
    var params = [];
    
    try {
      // Method 1: Check mx.ui.getContentForm() for Dojo client
      if (window.mx && mx.ui && mx.ui.getContentForm) {
        var form = null;
        try { form = mx.ui.getContentForm(); } catch(e) {}
        if (form) {
          // Check for context
          if (form.context) {
            var ctx = form.context;
            if (ctx._guid) {
              params.push({
                name: ctx._entity || 'PageContext',
                guid: ctx._guid,
                entity: ctx._entity,
                type: 'context'
              });
            }
          }
          // Check for path to determine page parameters from form config
          if (form.path) {
            // Form path might hint at parameters
          }
        }
      }
      
      // Method 2: Parse URL for object GUIDs (Mendix pattern: /p/pagename/GUID)
      var urlMatch = window.location.pathname.match(/\/p\/[^\/]+\/(\d{10,})/);
      if (urlMatch && urlMatch[1]) {
        params.push({
          name: 'URLObject',
          guid: urlMatch[1],
          type: 'url'
        });
      }
      
      // Method 3: Check history state
      if (history.state) {
        if (history.state.objectId) {
          params.push({
            name: 'HistoryObject',
            guid: history.state.objectId,
            type: 'history'
          });
        }
        if (history.state.params) {
          Object.keys(history.state.params).forEach(function(key) {
            params.push({
              name: key,
              value: history.state.params[key],
              type: 'historyParam'
            });
          });
        }
      }
      
      // Method 4: Look for __MENDIX_PARAMS__ or similar global
      if (window.__MENDIX_PARAMS__) {
        Object.keys(window.__MENDIX_PARAMS__).forEach(function(key) {
          params.push({
            name: key,
            value: window.__MENDIX_PARAMS__[key],
            type: 'global'
          });
        });
      }
      
      // Method 5: Scan dataviews for their source objects to infer page params
      var dataviews = document.querySelectorAll('.mx-dataview');
      var seenEntities = {};
      dataviews.forEach(function(dv) {
        var data = MxDataExtractor.extractDataFromElement(dv);
        if (data && data.entity && !seenEntities[data.entity]) {
          seenEntities[data.entity] = true;
          // Check if this might be a page parameter (top-level dataview)
          var isTopLevel = !dv.closest('.mx-dataview .mx-dataview');
          if (isTopLevel && data.mxObject) {
            var guid = MxDataExtractor.getObjectGuid(data.mxObject);
            params.push({
              name: data.entity,
              entity: data.entity,
              guid: guid,
              type: 'topLevelDataview'
            });
          }
        }
      });
      
      // Method 6: Check for React context with page props
      var rootEl = document.getElementById('root');
      if (rootEl) {
        var fiberKey = Object.keys(rootEl).find(function(k) { 
          return k.indexOf('__reactFiber') === 0 || k.indexOf('__reactContainer') === 0;
        });
        if (fiberKey && rootEl[fiberKey]) {
          var fiber = rootEl[fiberKey];
          var visited = new Set();
          var queue = [fiber];
          var maxIter = 1000;
          var iter = 0;
          
          while (queue.length > 0 && iter < maxIter) {
            iter++;
            var current = queue.shift();
            if (!current || visited.has(current)) continue;
            visited.add(current);
            
            // Look for props with object data
            if (current.memoizedProps) {
              var props = current.memoizedProps;
              
              // Check for 'object' prop (common Mendix pattern)
              if (props.object && props.object.objectType) {
                var exists = params.some(function(p) { return p.entity === props.object.objectType; });
                if (!exists) {
                  params.push({
                    name: props.object.objectType.split('.').pop(),
                    entity: props.object.objectType,
                    guid: props.object.guid,
                    type: 'reactObject'
                  });
                }
              }
              
              // Check for pageParams in props
              if (props.pageParams && typeof props.pageParams === 'object') {
                Object.keys(props.pageParams).forEach(function(key) {
                  var val = props.pageParams[key];
                  params.push({
                    name: key,
                    value: val,
                    type: 'pageParams'
                  });
                });
              }
            }
            
            if (current.child) queue.push(current.child);
            if (current.sibling) queue.push(current.sibling);
            if (current.return && !visited.has(current.return)) queue.push(current.return);
          }
        }
      }
      
    } catch(e) {
      console.warn('MxDataExtractor: Error getting page parameters', e);
    }
    
    // Dedupe by entity or name
    var seen = {};
    return params.filter(function(p) {
      var key = p.entity || p.name || p.guid;
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  };
  
  // Expose globally
  window.__MxDataExtractor = MxDataExtractor;
  
})();

/*! 
 * MxInspector v0.2.5-beta - Mendix Page Inspector & Debugger
 * Created with ❤️ by Tim Maurer (https://github.com/timmaurer)
 * 
 * MIT License - Free for personal and commercial use
 * Attribution required: Please keep this header intact
 * 
 * v1.3: Enhanced Object Inspector with attributes & associations
 * v1.2: React client support (Mendix 10+) via Symbol(mxObject)
 * 
 * Support the creator: https://paypal.me/tapmaurer
 */!function e(){"use strict";window.__mxInspectorRun=e;

/* v0.2.5 — Mendix detection guard. The inspector only injects when the user
 * clicks the toolbar icon, but a click on a non-Mendix tab (github.com,
 * docs.mendix.com, etc.) would render the panel whose CSS contains an
 * @import url("fonts.googleapis.com/...") rule — that import is blocked by
 * the strict Content Security Policies many sites ship, producing a
 * confusing console error attributed to inspector.js. Bail SILENTLY (no
 * console output) so error-tracking tools and CSP-strict pages stay clean.
 * If the user clicked the icon on a non-Mendix tab and nothing visibly
 * happens, that's the intended behaviour — they'll figure it out. */
if (!(window.mx || window.mxui || window.MxApp ||
      document.querySelector('script[src*="mxclientsystem"]') ||
      document.querySelector('[class*="mx-name-"]'))) {
  return;
}

/* ===== ICONS ===== */
var IC={info:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/></svg>',
copy:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/></svg>',
check:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>',
x:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>',
lightning:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M215.79,118.17a8,8,0,0,0-5-5.66L153.18,90.9l14.66-73.33a8,8,0,0,0-13.69-7l-112,120a8,8,0,0,0,3,13l57.63,21.61L88.16,238.43a8,8,0,0,0,13.69,7l112-120A8,8,0,0,0,215.79,118.17ZM109.37,214l10.47-52.38a8,8,0,0,0-5-9.06L62,132.71l84.62-90.66L136.16,94.43a8,8,0,0,0,5,9.06l52.8,19.8Z"/></svg>',
cube:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,120,47.65,76l33.9-18.56,80.35,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"/></svg>',
pkg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M223.68,66.15,135.68,18h0a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44Z"/></svg>',
page:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-45.54-48.85a36.05,36.05,0,1,0-11.31,11.31l11.19,11.2a8,8,0,0,0,11.32-11.32ZM112,148a20,20,0,1,1,20,20A20,20,0,0,1,112,148Z"/></svg>',
refresh:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L168.4,59.72a80,80,0,0,0-110.12,1.1,8,8,0,0,1-11.32-11.32,96,96,0,0,1,131.72-1.3L208,77.64V48a8,8,0,0,1,16,0Zm-40.73,145.5a80,80,0,0,1-110.12-1.1L44.86,164H73.54a8,8,0,0,0,0-16H25.54a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V175.35l29.07,29.07a96,96,0,0,0,131.72,1.3,8,8,0,0,0-11.06-11.22Z"/></svg>',
db:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64Zm-80-24c-42.81,0-80-17.31-80-24s37.19-24,80-24,80,17.31,80,24S170.81,104,128,104Z"/></svg>',
plug:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M237.66,18.34a8,8,0,0,0-11.32,0l-52.4,52.41-5.37-5.38a32.05,32.05,0,0,0-45.26,0L100,88.69l-6.34-6.35a8,8,0,0,0-11.32,11.32L88.69,100,65.37,123.31a32,32,0,0,0,0,45.26l5.38,5.37-52.41,52.4a8,8,0,0,0,11.32,11.32l52.4-52.41,5.37,5.38a32,32,0,0,0,45.26,0L156,167.31l6.34,6.35a8,8,0,0,0,11.32-11.32L167.31,156l23.32-23.31a32,32,0,0,0,0-45.26l-5.38-5.37,52.41-52.4A8,8,0,0,0,237.66,18.34Z"/></svg>',
eye:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/></svg>',
tree:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M176,152h-48V120h32a8,8,0,0,0,8-8V80a8,8,0,0,0-8-8H128V40a8,8,0,0,0-16,0V72H80a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8h32v32H80a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8h32v24a8,8,0,0,0,16,0V200h48a8,8,0,0,0,8-8V160A8,8,0,0,0,176,152Zm-88-64h80v16H88Zm80,96H88V168h80Z"/></svg>',
a11y:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,64a40,40,0,1,0-40-40A40,40,0,0,0,128,64Zm0-64a24,24,0,1,1-24,24A24,24,0,0,1,128,0Zm104,112a8,8,0,0,1-8,8H176v20.69l26.34,26.35a8,8,0,0,1-11.32,11.32L168,155.31V120a8,8,0,0,1,8-8h48A8,8,0,0,1,232,112ZM80,112a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16H72A8,8,0,0,1,80,112Zm16,32v11.31L64.66,186.66a8,8,0,0,1-11.32-11.32L80,148.69V120a8,8,0,0,1,16,0Zm32,64a8,8,0,0,1-8,8H104a8,8,0,0,1,0-16h16A8,8,0,0,1,128,208Z"/></svg>',
globe:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,168,55.12V40.37A88.11,88.11,0,0,1,216,128Z"/></svg>',
user:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/></svg>',
users:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"/></svg>',
terminal:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M120,137,48,201a8,8,0,1,1-10-12.49L107.19,128,38,67.49A8,8,0,0,1,48,55l72,64a8,8,0,0,1,0,12.49ZM216,184H120a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Z"/></svg>',
pdf:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,152a8,8,0,0,1-8,8H192v16h16a8,8,0,0,1,0,16H192v16a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8h32A8,8,0,0,1,224,152ZM92,172a28,28,0,0,1-28,28H56v8a8,8,0,0,1-16,0V152a8,8,0,0,1,8-8H64A28,28,0,0,1,92,172Zm-16,0a12,12,0,0,0-12-12H56v24h8A12,12,0,0,0,76,172Zm88,8a36,36,0,0,1-36,36H112a8,8,0,0,1-8-8V152a8,8,0,0,1,8-8h16A36,36,0,0,1,164,180Zm-16,0a20,20,0,0,0-20-20h-8v40h8A20,20,0,0,0,148,180ZM40,112V40A16,16,0,0,1,56,24h96a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,216,88v24a8,8,0,0,1-16,0V96H152a8,8,0,0,1-8-8V40H56v72a8,8,0,0,1-16,0ZM160,80h28.69L160,51.31Z"/></svg>',
question:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Z"/></svg>',
heart:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z"/></svg>',
cursor:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,201,174.21,161.5l28.18-14.09a16,16,0,0,0-.83-29L73.32,60.12A16,16,0,0,0,52.8,80.64l58.32,128.24a15.94,15.94,0,0,0,14.41,9.12h.26a15.93,15.93,0,0,0,14.33-10l14.09-28.18L193,219.31a16,16,0,0,0,22.63,0l-1.95-18.34ZM140.12,163.37l-18.13,36.27L68.79,75.75,192.14,129,156,147.08a16,16,0,0,0-6.67,6.67Z"/></svg>',
bulb:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.64,71.64,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h24V147.31L90.34,117.66a8,8,0,0,1,11.32-11.32L128,132.69l26.34-26.35a8,8,0,0,1,11.32,11.32L136,147.31V192h24v-6a32.12,32.12,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Z"/></svg>',
type:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,56V88a8,8,0,0,1-16,0V64H136V192h24a8,8,0,0,1,0,16H96a8,8,0,0,1,0-16h24V64H64V88a8,8,0,0,1-16,0V56a8,8,0,0,1,8-8H200A8,8,0,0,1,208,56Z"/></svg>',
inspect:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M227.81,229.19a8,8,0,0,1-11.31,11.31l-52.4-52.41A80,80,0,1,1,229.66,122.66,79.16,79.16,0,0,1,175.4,176.8ZM112,176a64,64,0,1,0-64-64A64.07,64.07,0,0,0,112,176Z"/></svg>',
css:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M48,180c0,11,7.18,20,16,20a14.24,14.24,0,0,0,10.22-4.66,8,8,0,0,1,11.56,11.06A30.06,30.06,0,0,1,64,216c-17.65,0-32-16.15-32-36s14.35-36,32-36a30.06,30.06,0,0,1,21.78,9.6,8,8,0,0,1-11.56,11.06A14.24,14.24,0,0,0,64,160C55.18,160,48,169,48,180Zm79.6-8.69c-4-1.16-8.14-2.35-10.45-3.84-1.26-.81-1.23-1-1.12-1.9a4.54,4.54,0,0,1,2-3.67c4.6-3.12,15.34-1.73,19.82-.56a8,8,0,0,0,4.07-15.48c-2.12-.55-21-5.22-32.83,2.76a20.58,20.58,0,0,0-9,14.95c-2,15.88,13.65,20.41,23,23.11,12.06,3.49,13.12,4.92,12.78,7.59-.31,2.41-1.26,3.34-2.14,3.93-4.6,3.06-15.17,1.56-19.55.36a8,8,0,0,0-4.3,15.41,61.23,61.23,0,0,0,15.18,2c5.83,0,12.3-1,17.49-4.46a20.82,20.82,0,0,0,9.19-15.23C154,179,137.49,174.17,127.6,171.31Zm64,0c-4-1.16-8.14-2.35-10.45-3.84-1.25-.81-1.23-1-1.12-1.9a4.54,4.54,0,0,1,2-3.67c4.6-3.12,15.34-1.73,19.82-.56a8,8,0,0,0,4.07-15.48c-2.11-.55-21-5.22-32.83,2.76a20.58,20.58,0,0,0-8.95,14.95c-2,15.88,13.65,20.41,23,23.11,12.06,3.49,13.12,4.92,12.78,7.59-.31,2.41-1.26,3.34-2.15,3.93-4.6,3.06-15.16,1.56-19.54.36a8,8,0,0,0-4.3,15.41,60.38,60.38,0,0,0,15.17,2c5.83,0,12.3-1,17.49-4.46a20.82,20.82,0,0,0,9.19-15.23C218,179,201.49,174.17,191.6,171.31ZM40,112V40A16,16,0,0,1,56,24h96a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,216,88v24a8,8,0,0,1-16,0V96H152a8,8,0,0,1-8-8V40H56v72a8,8,0,0,1-16,0ZM160,80h28.69L160,51.31Z"/></svg>',
coffee:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.59,96.59,0,0,1-27,40.09H208a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16H56.54A96.3,96.3,0,0,1,24,136V88a8,8,0,0,1,8-8H208A40,40,0,0,1,248,120ZM200,96H40v40a80.27,80.27,0,0,0,45.12,72h69.76A80.27,80.27,0,0,0,200,136Zm32,24a24,24,0,0,0-16-22.62V136a95.78,95.78,0,0,1-1.2,15A24,24,0,0,0,232,128Z"/></svg>',
shield:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.27,47,25.53a8,8,0,0,0,4.2,0c1-.26,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm0,72c0,37.07-13.66,67.16-40.6,89.42A129.43,129.43,0,0,1,128,223.62a128.24,128.24,0,0,1-39.4-22.2C61.66,179.16,48,149.07,48,112V56H208Z"/></svg>',
warning:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"/></svg>',
stack:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"/></svg>',
crosshair:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M232,120h-24.41A80.12,80.12,0,0,0,136,48.41V24a8,8,0,0,0-16,0V48.41A80.12,80.12,0,0,0,48.41,120H24a8,8,0,0,0,0,16H48.41A80.12,80.12,0,0,0,120,207.59V232a8,8,0,0,0,16,0V207.59A80.12,80.12,0,0,0,207.59,136H232a8,8,0,0,0,0-16Zm-96,72a64,64,0,1,1,64-64A64.07,64.07,0,0,1,136,192Zm0-96a32,32,0,1,0,32,32A32,32,0,0,0,136,96Z"/></svg>',
link:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140a40,40,0,0,1-54.85,1.63,8,8,0,1,0-10.64,12,56,56,0,0,0,76.81-2.63l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z"/></svg>',
timer:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM173.66,90.34a8,8,0,0,1,0,11.32l-40,40a8,8,0,0,1-11.32-11.32l40-40A8,8,0,0,1,173.66,90.34ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z"/></svg>',
clock:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/></svg>',
tabs:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M256,168a8,8,0,0,1-8,8H192a8,8,0,0,1-8-8V96H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8H96a8,8,0,0,1,8,8V72H200a8,8,0,0,1,8,8v72h40A8,8,0,0,1,256,168ZM216,192H8a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></svg>',
grid:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,80H136V56h64ZM120,56v64H56V56ZM56,136h64v64H56Zm144,64H136V136h64v64Z"/></svg>',
table:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM216,64V96H40V64ZM40,160H80v32H40Zm176,32H96V160H216v32Z"/></svg>',
list:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"/></svg>',
image:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z"/></svg>',
cursor:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,201,201,213.66a8,8,0,0,1-11.31,0L140,164l-26.34,26.35a8,8,0,0,1-13.45-4.23L72.38,55.27a8,8,0,0,1,10.06-9.39l130.42,35.22a8,8,0,0,1,4.9,12.75L191.32,120l49.68,49.66A8,8,0,0,1,213.66,201Z"/></svg>',
textcursor:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M184,208a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h40V56H80a8,8,0,0,1,0-16h96a8,8,0,0,1,0,16H136V200h40A8,8,0,0,1,184,208Z"/></svg>',
edit:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120Z"/></svg>'
};


/* ===== TOOLTIPS ===== */
/* v0.2.47 — Structured tooltip content. Each entry carries what/aim so users
 * know what they're measuring AND what a good target value is. */
var TIPS = {
  load: {
    what: "Total page load time from navigation start to fully loaded.",
    aim:  "Under 2s is good. 2-4s is fair. Over 4s is poor.",
    details: ["Measured via <code>performance.timing</code>", "Includes all network requests, CSS, JS, and render time"]
  },
  dom: {
    what: "Total number of DOM nodes rendered on the page.",
    aim:  "Under 1500 is healthy. 1500-2500 is fair. Over 2500 hurts rendering & interaction time.",
    details: ["Deep trees compound the cost", "Mendix list/datagrid rows multiply fast — virtualise when possible"]
  },
  requests: {
    what: "Total HTTP requests made during page load (XHR, CSS, JS, images, fonts).",
    aim:  "Under 50 is good, 50-100 is fair, over 100 is heavy.",
    details: ["Each request costs round-trip time", "Combine assets and lazy-load images where possible"]
  },
  memory: {
    what: "JavaScript heap size currently used by the page.",
    aim:  "Under 50MB is healthy, 50-100MB is fair, over 100MB risks slowdowns on lower-end devices.",
    details: ["Only exposed in Chromium browsers", "Memory leaks usually show up after navigation, not at load"]
  },
  fcp: {
    what: "First Contentful Paint — time until the first text or image paints.",
    aim:  "Under 1.8s is good, 1.8-3.0s is fair, over 3.0s is poor (Google Core Web Vitals).",
    details: ["Strong correlation with perceived load speed", "Improve by reducing render-blocking CSS/JS"]
  },
  lcp: {
    what: "Largest Contentful Paint — time until the largest above-the-fold element finishes painting.",
    aim:  "Under 2.5s is good, 2.5-4.0s is fair, over 4.0s is poor (Google Core Web Vitals).",
    details: ["Usually the hero image or main heading", "Optimise hero images, preload key resources"]
  },
  ttfb: {
    what: "Time To First Byte — time from navigation start until the first byte of the response arrives.",
    aim:  "Under 600ms is good, 600-1500ms is fair, over 1500ms suggests server or network delay.",
    details: ["Measures server response + network latency", "Slow TTFB often means backend microflow or cold start", "Mendix Cloud Acceptance is typically slower than Production"]
  },
  cls: {
    what: "Cumulative Layout Shift — how much the page jumps around while loading. Lower is better.",
    aim:  "Under 0.1 is good, 0.1-0.25 is fair, over 0.25 is poor (Google Core Web Vitals).",
    details: ["Caused by images without dimensions, late-loading fonts, injected content", "Reserve space for dynamic content"]
  },
  transfer: {
    what: "Total bytes transferred over the network during page load.",
    aim:  "Under 2MB is healthy, 2-5MB is fair, over 5MB is heavy — especially on mobile.",
    details: ["Includes compressed size (gzip/brotli)", "Images and JS bundles are usually the biggest contributors"]
  },
  depth: {
    what: "Maximum DOM nesting depth from the body down to the deepest leaf.",
    aim:  "Under 15 levels is healthy, 15-25 is fair, over 25 slows layout & reflow significantly.",
    details: ["Mendix layouts can nest deeply — flatten where possible", "Deep trees hurt CSS selector performance"]
  },
  dataviews: {
    what: "Number of DataView containers on the page — single-object data contexts.",
    aim:  "No hard limit, but each adds a server call. Keep it reasonable per page.",
    details: ["Nesting DataViews multiplies requests", "Combine data-fetch flows where possible"]
  },
  listviews: {
    what: "Number of ListView containers — paginated lists of objects.",
    aim:  "1-3 per page is typical. Watch pagination size.",
    details: ["Large pages load slowly; prefer pagination ≤ 50", "Nesting in a DataView multiplies the pain"]
  },
  templategrid: {
    what: "TemplateGrid containers — grid layouts with custom cell templates.",
    aim:  "Use sparingly; each cell multiplies rendering like a ListView.",
    details: ["Behaves like ListView internally", "Expensive templates × many cells = slow"]
  },
  datagrid2: {
    what: "DataGrid 2 containers — modern, virtualised data grids.",
    aim:  "Preferred for large data — virtualisation means row count matters less than column complexity.",
    details: ["Scales better than legacy DataGrid / ListView", "Keep row templates simple"]
  },
  galleries: {
    what: "Gallery widgets — card/image grid containers.",
    aim:  "Fine to use; watch image payload and lazy-loading.",
    details: ["Add alt text for accessibility", "Use responsive image sizes"]
  },
  treenode: {
    what: "TreeNode widgets — hierarchical, recursive data rendering.",
    aim:  "Use cautiously. Recursion multiplies server calls at each level.",
    details: ["Deep trees can compound dozens of roundtrips", "Prefer flat representations when possible"]
  },
  nesting: {
    what: "Nested data containers — a ListView inside a DataView inside another ListView, etc.",
    aim:  "Zero if possible. Every nested level multiplies database queries.",
    details: ["A ListView of 20 rows inside a DataView = 20× queries", "Flatten with associations or single microflow data sources"]
  },
  nestingNormal: {
    what: "Data containers nested one level inside another — typical building pattern in Mendix.",
    aim:  "Normal unless page is slow. If load is slow, these nested sources are likely the cause.",
    details: ["Color is white when load is fast; turns yellow when load is slow", "Click the eye to highlight all nested containers on the page"]
  },
  nestingDeep: {
    what: "Data containers nested 3+ levels deep — often a code smell.",
    aim:  "Avoid. Query count grows geometrically with depth (rows × rows × rows).",
    details: ["Orange when load is fast (still a concern)", "Red when load is slow (actively hurting performance)", "Refactor with associations, denormalized entities, or microflow aggregation"]
  },
  dsMicroflows: {
    what: "Unique DS_-prefixed microflows that actually fired on /xas/ during page load.",
    aim:  "Minimise repeats. Each call = one round-trip to the server.",
    details: ["Count badge ×2+ means the microflow was called multiple times on this load — usually because it sits inside a ListView/DataView that repeats per row", "Click the copy icon to grab the full qualified name (paste into Studio Pro Ctrl+Q)", "Captures calls only from the time the extension was active — reload for full page-load view"]
  },
  dsOperations: {
    what: "Unique Mendix 10 runtimeOperation calls fired during page load. Each operation is identified by an opaque hash — the React client no longer sends microflow names over the wire.",
    aim:  "Same as DS_ microflows: minimise repeats. Each call is still a server round-trip.",
    details: ["×2+ on the same opId is the nested-data-source fingerprint — same as classic Mendix", "Shape badges (\"list ×50 sorted\") are inferred from the options payload each call carries", "The Edit flag means the operation also wrote data (changes/objects in the request)"]
  },
  dsXpath: {
    what: "Direct database retrieves (retrieve_by_xpath) fired on /xas/.",
    aim:  "Low is fine. Above ~10 suggests many DataViews or widgets each fetching their own data slice.",
    details: ["Associations are cheaper than xpath retrieves", "Watch for the same entity being retrieved multiple times — could be consolidated into one microflow"]
  },
  dsAssociations: {
    what: "Association lookups (retrieve_by_association) — following a relationship between entities.",
    aim:  "These are generally cheap. High counts usually just mean the page has many related objects loaded.",
    details: ["Not typically a performance concern unless chained across very large collections"]
  },
  snippets: {
    what: "Reusable page fragments — shared UI blocks.",
    aim:  "Use liberally. Each snippet lowers maintenance cost across pages.",
    details: ["No real performance penalty", "Makes large apps manageable"]
  },
  microflows: {
    what: "Server-side microflow actions exposed on this page.",
    aim:  "Under 15 per page. Each microflow means a potential server round-trip.",
    details: ["Combine repeated queries into single microflows", "Use sub-microflows for shared logic"]
  },
  nanoflows: {
    what: "Client-side nanoflow actions — run in the browser without a server call.",
    aim:  "Prefer nanoflows over microflows for pure UI logic.",
    details: ["No network cost", "Watch for complex logic that belongs server-side"]
  },
  datasources: {
    what: "Number of data-fetch calls (database/microflow/nanoflow) triggered by this page.",
    aim:  "Fewer is better. Reuse context objects via associations where possible.",
    details: ["Database calls are the most expensive", "Microflow data sources can be cached"]
  },
  conditional: {
    what: "Elements with conditional visibility that still render (hidden via display:none).",
    aim:  "Under 30 is fine; over 100 bloats the initial DOM even for hidden states.",
    details: ["Mendix renders hidden widgets upfront — this is normal", "Use conditional rendering in nanoflows for expensive widgets"]
  },
  a11yScore: {
    what: "Overall accessibility score (0-100) based on WCAG 2.1 checks.",
    aim:  "90+ targets WCAG AA compliance. 80-89 is acceptable. Below 80 has real barriers.",
    details: ["Combines multiple sub-checks", "Improve by addressing the Insights below"]
  },
  altText: {
    what: "Images without <code>alt</code> attributes.",
    aim:  "Zero. Every image needs alt text (empty <code>alt=\"\"</code> is OK for decorative).",
    details: ["Screen readers rely on alt text", "WCAG 1.1.1"]
  },
  formLabels: {
    what: "Form inputs without an associated <code>&lt;label&gt;</code> element.",
    aim:  "Zero. Every input must have a label (or aria-label).",
    details: ["Keyboard and screen-reader users depend on this", "WCAG 1.3.1 & 3.3.2"]
  },
  headings: {
    what: "Heading hierarchy issues — missing <code>&lt;h1&gt;</code> or skipped levels (h2 → h4 without h3).",
    aim:  "Zero skips. Exactly one h1 per page.",
    details: ["Helps screen-reader users navigate", "WCAG 1.3.1 & 2.4.6"]
  },
  emptyLinks: {
    what: "Links with no accessible text (empty <code>&lt;a&gt;</code> or icon-only without aria-label).",
    aim:  "Zero. Every link needs readable text.",
    details: ["WCAG 2.4.4 — link purpose", "For icon links, add <code>aria-label</code>"]
  },
  duplicateIds: {
    what: "Elements sharing the same <code>id</code> attribute.",
    aim:  "Zero. IDs must be unique per page.",
    details: ["Breaks labels, scripts, and accessibility", "WCAG 4.1.1 — parsing"]
  },
  userRoles: {
    what: "User roles granted to the current session.",
    aim:  "Follow least-privilege. Production users shouldn't have admin roles.",
    details: ["Mendix applies access rules per role", "Test with the lowest-privilege role regularly"]
  },
  xhr: {
    what: "XHR / fetch calls made to the Mendix runtime (<code>/xas/</code>).",
    aim:  "Minimise on initial load; many calls mean heavy data contexts.",
    details: ["Each is a backend round-trip", "Batch retrievals with combined microflows"]
  },
  static: {
    what: "Static asset requests — CSS, JS bundles, images, fonts.",
    aim:  "Combine and cache where possible.",
    details: ["Mendix serves these from <code>/mxclientsystem/</code>", "Custom widgets and themes add here"]
  },
  contrast: {
    what: "Text/background colour combinations that fail WCAG contrast ratios.",
    aim:  "Zero. WCAG AA requires 4.5:1 for normal text and 3:1 for large text (≥18pt or ≥14pt bold).",
    details: ["WCAG 1.4.3", "Use design tokens to enforce contrast app-wide"]
  },
  smallFont: {
    what: "Text elements with font-size below 12px.",
    aim:  "Zero. 12px is the lower limit for readability; body text should be 14-16px.",
    details: ["Small fonts fail low-vision users", "Not strictly WCAG but a strong usability signal"]
  },
  touchTargets: {
    what: "Clickable elements smaller than 44×44px — too small for comfortable tapping.",
    aim:  "Zero on mobile-profiled apps. WCAG AAA suggests 44×44 CSS pixels.",
    details: ["WCAG 2.5.5 (AAA)", "Add padding to buttons, don't just bump font-size"]
  },
  targetSize: {
    what: "Interactive targets (buttons, links, inputs) smaller than 24×24 CSS pixels.",
    aim:  "Zero. WCAG 2.2 2.5.8 Target Size (Minimum) is a Level AA requirement.",
    details: ["Inline links inside paragraphs are exempt", "Add padding/min-height rather than bumping font size"]
  },
  accessibleName: {
    what: "Buttons or links with no text, no aria-label, no aria-labelledby, no title, and no descriptive image alt.",
    aim:  "Zero. Screen reader users can't identify unnamed controls.",
    details: ["WCAG 4.1.2 Name, Role, Value (Level A)", "Icon-only buttons need aria-label='Close' or similar"]
  },
  iframeTitle: {
    what: "<code>&lt;iframe&gt;</code> elements without a title attribute.",
    aim:  "Zero. Every iframe must announce its purpose to assistive tech.",
    details: ["WCAG 2.4.1 / 4.1.2", "Applies to embedded videos, maps, widgets — anything in an iframe"]
  },
  focusVisible: {
    what: "Interactive elements where :focus has no visible indicator (outline removed, no box-shadow replacement).",
    aim:  "Zero. Keyboard users need to see where focus is.",
    details: ["WCAG 2.4.7 (AA), 2.4.13 (AAA — Focus Appearance)", "Check is heuristic — some false positives possible when focus styles come from parent selectors"]
  },
  cssStylesheets: {
    what: "Number of stylesheets loaded on the page (external files + inline <code>&lt;style&gt;</code> blocks).",
    aim:  "Under 10 is typical. Fewer means less HTTP overhead; more means higher paint cost.",
    details: ["Mendix usually loads theme.compiled.css, widgets.css, and a handful of inline blocks", "Custom widgets may add their own stylesheets"]
  },
  cssRules: {
    what: "Total number of CSS rules parsed from all stylesheets.",
    aim:  "Under 10,000 is healthy for a typical business app. Large design systems can push higher.",
    details: ["Each rule is evaluated on every style recalculation", "Tree-shake unused theme rules in production builds"]
  },
  cssInlineStyles: {
    what: "Elements with a <code>style=\"\"</code> attribute applied directly in the DOM.",
    aim:  "Under 20. Lots of inline styles usually means JS is computing styles instead of using CSS classes.",
    details: ["Inline styles win specificity battles, making themes hard to override", "Mendix widgets sometimes use them for dynamic positioning — that's OK"]
  },
  cssImportant: {
    what: "Number of declarations using <code>!important</code>.",
    aim:  "Under 20 is healthy, 20-50 is a code smell, over 50 suggests structural issues in the theme.",
    details: ["Each <code>!important</code> makes future overrides harder", "Mendix's own theme uses some — the concern is custom theme additions"]
  },
  cssVars: {
    what: "Number of CSS custom properties defined (<code>--variable</code>).",
    aim:  "More is generally better — they're the basis of design tokens.",
    details: ["Atlas UI defines dozens out of the box", "Custom design systems add their own"]
  },
  cssMediaQ: {
    what: "Number of media queries in the stylesheets (responsive breakpoints, print, prefers-*).",
    aim:  "No hard limit. 50+ is normal for responsive apps; very high counts suggest fragmented breakpoints.",
    details: ["Includes all @media rules", "Consolidate breakpoints where possible"]
  },
  secConstants: {
    what: "Total count of constants exposed to the browser — Mendix runtime constants (<code>mx.session.sessionData</code>) plus suspicious <code>window.*</code> globals.",
    aim:  "Zero flagged as secrets. Plain constants are fine; secrets (JWTs, API keys, connection strings) are not.",
    details: ["Colour reflects worst level present", "Move secrets to backend constants or a secret manager"]
  },
  secForms: {
    what: "Form-input security issues — password autocomplete not disabled, sensitive-named inputs without maxlength, or hidden inputs with sensitive-named fields containing data.",
    aim:  "Zero, especially on login and payment forms.",
    details: ["Password autocomplete check is the strongest signal", "Hidden-field check flags potential data leaks"]
  },
  secUrl: {
    what: "URL query parameters matching sensitive keywords (token, apikey, password, etc.).",
    aim:  "Zero. URLs leak to server logs, referrer headers, and browser history.",
    details: ["Move credentials into POST bodies or headers", "Finding one is a real issue, not a false positive"]
  },
  secCve: {
    what: "Known Mendix runtime CVEs that may affect the detected version.",
    aim:  "Zero. Update to the latest LTS or the version noted in the advisory.",
    details: ["Cross-references <code>docs.mendix.com</code> advisories", "Some flags are conservative — verify against the advisory"]
  }
};

/* ===== HELPERS ===== */
function getClassName(el){if(!el)return"";var cn=el.className;if(!cn)return"";if(typeof cn==="string")return cn;if(cn.baseVal!==undefined)return cn.baseVal;return""}
var t={loadTime:{warning:2e3,error:4e3},domNodes:{warning:2e3,error:4e3}};

/* ===== DATA OBJECT ===== */
var i={timestamp:new Date().toISOString(),url:location.href,version:"?",client:"Unknown",module:"Unknown",page:"Unknown",popup:!1,env:"",envType:"Unknown",user:"",roles:"",guest:!1,offline:!1,loadTime:0,firstContentfulPaint:0,largestContentfulPaint:0,ttfb:0,cls:0,fid:null,widgetRenderTime:0,firstWidgetTime:null,lastWidgetTime:null,widgetTimeline:[],slowestWidgets:[],perfTrackerActive:false,isRecording:true,navigationRenderDuration:0,navigationFirstWidget:null,navigationLastWidget:null,navigationWidgetCount:0,domNodes:0,jsHeap:0,totalRequests:0,xhrRequests:0,staticRequests:0,slowRequests:[],largeAssets:[],totalTransferred:0,totalWidgets:0,dataViews:0,listViews:0,dataGrids:0,dataGrid2s:0,galleries:0,templateGrids:0,treeNodes:0,nestedDataViewsWarning:[],nestedDataViewsCritical:[],maxDataViewDepth:0,maxNestingDepth:0,formFields:0,images:0,lazyImages:0,dataViewEntities:[],pageParameters:[],consoleErrors:0,
snippets:[],snippetCount:0,conditionalElements:0,
dataSources:{database:0,microflow:0,nanoflow:0},
/* v0.2.64 — Runtime data source call log, populated from perf-tracker.
 * Keyed by empty defaults so rendering code can assume the shape.
 * v0.2.67 — Added operations[] and sessionInits for Mendix 10 React client. */
dataSourceCalls:{microflows:[],otherActions:[],operations:[],xpathRetrieves:0,associationRetrieves:0,commits:0,sessionInits:0},
/* v0.2.65 — Debug snapshot from perf-tracker for diagnosing zero-capture. */
dsDebug:{sampleUrls:[],sampleBodies:[],postCount:0,parsedOk:0,parsedFail:0,hadActionField:0,unknownActionTypes:[]},
widgetTree:null,
/* v0.2.42 — sourced from mx.session.sessionData.uiconfig + sessionData.locale */
mxProfile:{kind:"",name:"",title:""},mxLocale:"",mxTranslations:[],
a11y:{totalImages:0,missingAltText:0,totalFormFields:0,missingLabels:0,totalHeadings:0,h1Count:0,headingSkips:0,missingH1:!1,totalLinks:0,emptyLinks:0,duplicateIds:0,missingLang:!1,pageLang:"",missingTitle:!1,contrastIssues:0,smallFontSize:0,focusIssues:0,smallTouchTargets:0,targetSizeIssues:0,noAccessibleName:0,iframeTitleMissing:0,ariaUsage:0,landmarks:0,hasSkipLink:!1,hasMainLandmark:!1,positiveTabindex:0,score:100,wcagLevel:"Unknown",deductions:[],improvements:[]},
typography:{fonts:[],fontCounts:{},sizes:[],weights:[],primaryFont:"Unknown",fontCount:0,sizeCount:0},
security:{exposedConstants:[],sensitiveEntities:[],revealingMicroflows:[],formIssues:[],urlParams:[],inputValidation:[],cveWarnings:[],mixedContent:[],externalScripts:[],localStorageSensitive:[],insecureProtocol:false,mendixConstants:null,demoUsers:null,anonymous:null,devMode:null,writableSensitive:null,endpointProbe:null,score:100},
warnings:[],score:100,highlightTargets:{}};

function n(e,d){try{return e()}catch(x){return d}}
function s(e){if(0===e)return"0 B";var t=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,t)).toFixed(1))+" "+["B","KB","MB","GB"][t]}
function o(e){return e<1e3?e+"ms":(e/1e3).toFixed(2)+"s"}
function a(e,t,n,s){i.warnings.push({type:e,msg:t,impact:n||0,highlightKey:s||null});i.score-=n||0}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}

/* v0.2.63 — A11y awareness data. When an insight has a matching
 * highlightKey in this table, the rendered row gets an info button that
 * expands an inline panel explaining *who* the issue affects, *why* it
 * matters, and the *WCAG reference*. The point is to turn score
 * deductions into learning moments — a lot of Mendix devs have never
 * heard of most of these criteria, and a one-click explainer pairs
 * naturally with WCAG's own "understanding" docs.
 *
 * Content is written for developers unfamiliar with a11y. Kept short so
 * the expanded panel doesn't feel like reading a spec. Tone: honest and
 * direct, not preachy. */
var A11Y_AWARENESS = {
  missingAlt: {
    who:  "Blind and low-vision users relying on screen readers; anyone whose images don't load.",
    why:  "Screen readers announce only \"image\" or the filename. Users miss icons, product photos, charts — everything visual. Alt text is also a fallback when images fail to load and helps SEO.",
    wcag: "WCAG 1.1.1 Non-text Content (Level A)"
  },
  missingLabels: {
    who:  "Screen reader users and voice-control users (Dragon, Voice Control, macOS Voice Control).",
    why:  "Without a label, screen readers announce \"edit\" or \"combo box\" with no indication of what the field is for. Voice users can't say \"click first name\" because the field has no accessible name to target.",
    wcag: "WCAG 1.3.1 Info and Relationships / 3.3.2 Labels or Instructions (Level A)"
  },
  contrastIssues: {
    who:  "Low-vision users, older adults, people with color-vision deficiencies, anyone reading in bright sunlight.",
    why:  "Body text needs a 4.5:1 contrast ratio against its background (3:1 for large text). Below that, a meaningful percentage of users literally cannot read the content. It's the single most common WCAG failure on the web.",
    wcag: "WCAG 1.4.3 Contrast (Minimum) (Level AA)"
  },
  targetSizeIssues: {
    who:  "Users with motor impairments (tremor, limited fine motor control), touch-screen users, older adults.",
    why:  "Small targets are hard to hit accurately — missed taps cause frustration, and on critical controls (submit, delete) lead to wrong outcomes. WCAG 2.2 made 24×24 a Level AA requirement in 2023; EU EAA enforces this since June 2025 for products sold in the EU.",
    wcag: "WCAG 2.5.8 Target Size (Minimum) (Level AA, WCAG 2.2)"
  },
  noAccessibleName: {
    who:  "Screen reader users, voice-control users.",
    why:  "Icon-only buttons with no aria-label announce only their role (\"button\", \"link\") — users have no idea what they do. A common pattern is wrapping an image widget as a button without any text or label.",
    wcag: "WCAG 4.1.2 Name, Role, Value (Level A)"
  },
  iframeTitleMissing: {
    who:  "Screen reader users.",
    why:  "Without a title attribute, screen readers announce \"frame\" with no context. Users can't tell if it's a map, video, ad, or external widget — so they either skip it or get lost in its content.",
    wcag: "WCAG 2.4.1 Bypass Blocks / 4.1.2 Name, Role, Value (Level A)"
  },
  smallFontSize: {
    who:  "Low-vision users, older adults, anyone on smaller screens.",
    why:  "Below 12px becomes a readability barrier. Users have to zoom, and not every Mendix layout handles zoom gracefully — text often gets clipped or reflows badly.",
    wcag: "Not a strict WCAG criterion at minimum sizes, but WCAG 1.4.4 Resize Text (AA) and 1.4.12 Text Spacing (AA) cover related concerns."
  },
  emptyLinks: {
    who:  "Screen reader users, SEO, anyone with images disabled.",
    why:  "Links with no text announce as \"link\" with no destination. Usually caused by icon-only links missing aria-label or images inside links missing alt text.",
    wcag: "WCAG 2.4.4 Link Purpose (In Context) / 4.1.2 Name, Role, Value (Level A)"
  },
  headingSkips: {
    who:  "Screen reader users who navigate by heading shortcut (one of the most-used navigation patterns).",
    why:  "Screen readers let users jump between headings (H1 → H2 → H3). Skipping from H1 straight to H3 breaks the document outline. Users can't form a mental map of the page.",
    wcag: "WCAG 1.3.1 Info and Relationships (Level A)"
  },
  focusIssues: {
    who:  "Keyboard-only users (motor impairments, tremor, power users), screen reader users, anyone using a keyboard shortcut.",
    why:  "When outline is stripped (common in custom themes) without a replacement, keyboard users can't see where focus is. Tabbing through a form becomes guesswork — press Tab and hope.",
    wcag: "WCAG 2.4.7 Focus Visible (Level AA) / 2.4.13 Focus Appearance (Level AAA, WCAG 2.2)"
  },
  duplicateIds: {
    who:  "Assistive tech in general — screen readers, label associations, scripts.",
    why:  "Duplicate IDs break label-for-field associations, aria-labelledby references, and scripted DOM lookups. Behavior becomes unpredictable — labels may announce the wrong field, or clicks go nowhere.",
    wcag: "WCAG 4.1.1 Parsing was removed from WCAG 2.2, but duplicate IDs still cause real problems in practice and should be fixed."
  },
  positiveTabindex: {
    who:  "Keyboard users.",
    why:  "Positive tabindex values (tabindex=\"2\", \"3\") override natural tab order, making focus jump around the page unpredictably. Users lose their place. The right values are 0 (focusable in natural order) or -1 (focusable only via script).",
    wcag: "WCAG 2.4.3 Focus Order (Level A)"
  },
  smallTargets: {
    who:  "Touch users, users with motor impairments.",
    why:  "On touch screens, targets smaller than 44×44 CSS pixels are hard to hit accurately. This is the stricter AAA spec — the AA minimum is 24×24 (see Target Size above).",
    wcag: "WCAG 2.5.5 Target Size (Enhanced) (Level AAA)"
  }
};

var c=!!window.mx;

function isAnyDataView(el){return el&&el.classList&&el.classList.contains("mx-dataview")&&!el.classList.contains("mx-dataview-content")}
function isNamedDataView(el){return isAnyDataView(el)&&getClassName(el).indexOf("mx-name-")>-1}
function countDataViewParents(el){var c=0,p=el.parentElement;while(p){if(isAnyDataView(p))c++;p=p.parentElement}return c}
function getWidgetName(el){var m=getClassName(el).match(/mx-name-(\S+)/);return m?m[1]:null}

/* ===== DETECTORS ===== */
function detectSnippets(){var sn=[],els=[],snipSet=new Set();
/* v0.2.35 — Snippets don't render with a wrapper element. We have to infer them
 * from Mendix's internal widget path, which appears in:
 *   - `data-button-id` on action buttons: "p.Module.SNP_Name.actionButton1"
 *   - `id` on inputs:                     "p.Module.SNIP_Name.textBox11_ltq_828"
 *   - class `mx-name-SNP_*` (rare — only when the snippet widget itself is named)
 *
 * The snippet-name prefix in customer code varies: SNP_, SNIP_, Snp_, Snip_, snp_,
 * snip_ are the common conventions. Alternation (NOT optional chars) is required:
 * `SNIP?` would match "SNI" or "SNIP" but NOT "SNP" (different letters). */
var SNIP_RE = /\b((?:SNP|SNIP|Snp|Snip|snp|snip)_[A-Za-z0-9_]+)/;
/* Method 1: Class-based snippets (widget directly named mx-name-SNP_* / SNIP_*) */
document.querySelectorAll('[class*="mx-name-"]').forEach(function(el){
  var cn=getClassName(el);
  var m=cn.match(/mx-name-((?:SNP|SNIP|Snp|Snip|snp|snip)_[^\s]+)/);
  if(m&&!snipSet.has(m[1])){snipSet.add(m[1]);sn.push(m[1]);els.push(el)}
});
/* Method 2: data-button-id on interactive elements inside a snippet */
document.querySelectorAll('[data-button-id]').forEach(function(el){
  var bid=el.getAttribute("data-button-id")||"";
  var m=bid.match(SNIP_RE);
  if(m&&!snipSet.has(m[1])){snipSet.add(m[1]);sn.push(m[1]);els.push(el)}
});
/* Method 3: id on inputs/checkboxes/textboxes inside a snippet */
document.querySelectorAll('[id*="."]').forEach(function(el){
  var eid=el.id||"";
  /* Mendix internal ids follow "p.Module.SnippetOrPage.widget_..." so filter
   * for the leading "p." to avoid matching arbitrary dotted ids in the page. */
  if(eid.indexOf("p.")!==0)return;
  var m=eid.match(SNIP_RE);
  if(m&&!snipSet.has(m[1])){snipSet.add(m[1]);sn.push(m[1]);els.push(el)}
});
/* Method 4: Legacy data-mendix-id (Dojo client) */
document.querySelectorAll('[data-mendix-id]').forEach(function(el){
  var mid=el.getAttribute("data-mendix-id")||"";
  var m=mid.match(SNIP_RE);
  if(m&&!snipSet.has(m[1])){snipSet.add(m[1]);sn.push(m[1]);els.push(el)}
});
i.snippets=sn;i.snippetCount=sn.length;if(els.length)i.highlightTargets.snippets=els}

function detectConditionalVisibility(){var c=0;
document.querySelectorAll('[class*="mx-name-"]').forEach(function(el){try{var st=getComputedStyle(el);if(st.display==="none"||st.visibility==="hidden")c++}catch(x){}});
i.conditionalElements=c}

function detectDataSources(){
var src={database:0,microflow:0,nanoflow:0,association:0,unknown:0};
var containers=document.querySelectorAll('.mx-dataview:not(.mx-dataview-content)[class*="mx-name-"],.mx-listview[class*="mx-name-"],.mx-templategrid[class*="mx-name-"],.widget-datagrid[class*="mx-name-"],.widget-gallery[class*="mx-name-"]');

containers.forEach(function(el){
var dsType="unknown";

/* Method 1: Try React Fiber extraction */
if(window.__MxDataExtractor){
var fiberKey=Object.keys(el).find(function(k){return k.startsWith("__reactFiber")||k.startsWith("__reactInternalInstance")});
if(fiberKey){
var fiber=el[fiberKey];
var depth=0;
while(fiber&&depth<30){
if(fiber.memoizedProps){
var props=fiber.memoizedProps;
/* Check datasource prop (pluggable widgets) */
if(props.datasource&&props.datasource.type){
dsType=props.datasource.type;break;
}
/* Check object prop (DataView) */
if(props.object&&typeof props.object==="object"){
if(props.object.type)dsType=props.object.type;
else dsType="context";
break;
}
/* Check listValue prop (ListView) */
if(props.listValue){
dsType="database";break;
}
/* Check for $dataSource property */
if(props.$dataSource){
var ds=props.$dataSource;
if(typeof ds==="string"){
if(ds.indexOf("microflow")>-1||ds.indexOf("Microflow")>-1)dsType="microflow";
else if(ds.indexOf("nanoflow")>-1||ds.indexOf("Nanoflow")>-1)dsType="nanoflow";
else if(ds.indexOf("xpath")>-1||ds.indexOf("database")>-1)dsType="database";
else if(ds.indexOf("association")>-1)dsType="association";
}
break;
}
}
fiber=fiber.return;depth++;
}
}
}

/* Method 2: Dojo fallback */
if(dsType==="unknown"&&window.dijit&&dijit.registry){
var widgetId=el.getAttribute("widgetid")||el.id;
if(widgetId){
var widget=dijit.registry.byId(widgetId);
if(widget){
if(widget._datasource||widget.datasource){
var ds=widget._datasource||widget.datasource;
if(ds.type==="microflow"||ds._type==="microflow")dsType="microflow";
else if(ds.type==="nanoflow"||ds._type==="nanoflow")dsType="nanoflow";
else if(ds.type==="xpath"||ds.type==="database")dsType="database";
else if(ds.type==="association")dsType="association";
}
}
}
}

/* Count by type */
if(dsType==="microflow")src.microflow++;
else if(dsType==="nanoflow")src.nanoflow++;
else if(dsType==="association")src.database++;  /* Association is still DB-backed */
else if(dsType==="database"||dsType==="xpath"||dsType==="context")src.database++;
else src.unknown++;
});

/* If we couldn't detect any, at least count containers as having some datasource */
if(src.database===0&&src.microflow===0&&src.nanoflow===0&&src.unknown>0){
src.database=src.unknown;
src.unknown=0;
}

i.dataSources=src;
}

/* v0.2.42 — Mendix page metadata: profile (Responsive/PWA/etc.), locale,
 * configured translations. Read from mx.session once per extraction. */
function detectMendixMeta(){
try {
  var sd=window.mx&&window.mx.session&&window.mx.session.sessionData;
  if(!sd)return;
  var ui=sd.uiconfig||{};
  if(ui.profile&&typeof ui.profile==="object"){
    i.mxProfile={
      kind: ui.profile.kind||"",
      name: ui.profile.name||"",
      title: ui.profile.title||""
    };
  }
  if(sd.locale){
    /* sessionData.locale can be a string ("en_US") or an object with a
     * `code` / `languageCode` field depending on Mendix version. Handle both. */
    if(typeof sd.locale==="string") i.mxLocale=sd.locale;
    else if(typeof sd.locale==="object") i.mxLocale=sd.locale.code||sd.locale.languageCode||sd.locale.name||"";
  }
  /* Translations: in this app uiconfig.translations was null (single-language).
   * When multilingual, expected to be either an array of language codes or
   * an object keyed by language code. Handle both defensively. */
  if(ui.translations){
    if(Array.isArray(ui.translations)){
      i.mxTranslations=ui.translations.slice();
    } else if(typeof ui.translations==="object"){
      i.mxTranslations=Object.keys(ui.translations);
    }
  }
} catch(e){ console.warn("[MXI] mx meta read failed:",e); }
}

function buildWidgetTree(){var maxD=4,maxC=8;
function build(el,d){if(d>maxD||!el)return null;var nm=getWidgetName(el);if(!nm)return null;
var node={name:nm,type:getType(el),children:[]},cc=0;
for(var j=0;j<el.children.length&&cc<maxC;j++){var ch=build(el.children[j],d+1);if(ch){node.children.push(ch);cc++}}
return node}
function getType(el){var cn=getClassName(el);if(cn.indexOf("mx-dataview")>-1)return"dv";if(cn.indexOf("mx-listview")>-1)return"lv";if(cn.indexOf("widget-datagrid")>-1)return"dg";if(cn.indexOf("snip")>-1)return"sn";return"w"}
var root=document.querySelector('.mx-page,[class*="mx-name-page"]');
i.widgetTree=root?build(root,0):null}

/* ===== MAIN COLLECTION ===== */
try{
!function(){var e=!!document.getElementById("root"),t=!(!window.dijit||!window.dijit.registry);i.client=e&&!t?"React":t?"Dojo":"Unknown";window.mx&&(i.version=n(function(){return mx.version},"?"),i.env=n(function(){return mx.remoteUrl},""),i.offline=n(function(){return mx.isOffline()},!1),mx.session&&(i.user=n(function(){return mx.session.getUserName()||""},""),i.roles=n(function(){return mx.session.getUserRoleNames().join(", ")||""},""),i.guest=n(function(){return mx.session.isGuest()},!1)));
/* Try alternative user detection methods */
if(!i.user||i.user===""){i.user=n(function(){return mx.session.getUser&&mx.session.getUser().get("Name")},"");if(!i.user)i.user=n(function(){var u=mx.session.getUserObject&&mx.session.getUserObject();return u?u.get("Name")||u.get("FullName")||u.get("Email"):""},"");if(!i.user)i.user=n(function(){return mx.session.getUserId?mx.session.getUserId():""},"")}
if(i.guest)i.user="Anonymous"}();

!function(){if(performance&&performance.timing){var e=performance.timing;i.loadTime=e.loadEventEnd-e.navigationStart}if(performance&&performance.getEntriesByType){performance.getEntriesByType("paint").forEach(function(e){"first-contentful-paint"===e.name&&(i.firstContentfulPaint=Math.round(e.startTime))})}if(performance&&performance.memory)i.jsHeap=Math.round(performance.memory.usedJSHeapSize/1048576);

/* Use perf tracker data if available (more accurate!) */
if(window.__mxiPerf){
var pt=window.__mxiPerf;
var summary=pt.getSummary?pt.getSummary():null;
if(summary){
/* Override with more accurate vitals from PerformanceObserver */
if(summary.fcp)i.firstContentfulPaint=summary.fcp;
if(summary.lcp)i.largestContentfulPaint=summary.lcp;
if(summary.ttfb)i.ttfb=summary.ttfb;
/* Store additional metrics */
i.cls=summary.cls||0;
i.fid=summary.fid;
i.widgetRenderTime=summary.widgetRenderTime||0;
i.firstWidgetTime=summary.firstWidget;
i.lastWidgetTime=summary.lastWidget;
/* Per-navigation timing for SPA */
i.isRecording=summary.isRecording!==false;
if(summary.navigation){
i.navigationRenderDuration=summary.navigation.renderDuration||0;
i.navigationFirstWidget=summary.navigation.firstWidget;
i.navigationLastWidget=summary.navigation.lastWidget;
i.navigationWidgetCount=summary.navigation.widgetCount||0;
}
/* Widget timeline for granular analysis */
i.widgetTimeline=summary.widgetTimeline||[];
i.slowestWidgets=summary.slowestWidgets||[];
/* Use window load if available and better */
if(summary.windowLoad&&summary.windowLoad>0){
i.loadTime=summary.windowLoad;
}
/* Network from tracker */
if(summary.slowRequests&&summary.slowRequests.length>i.slowRequests.length){
i.slowRequests=summary.slowRequests.map(function(r){return{url:r.shortName||r.url,duration:r.duration}}).slice(0,5);
}
/* v0.2.64 — pull runtime data source calls from the tracker. This is
 * what actually fired on /xas/ — far more useful than inferring types
 * from DOM classes. The fiber-based detectDataSources() still runs, but
 * we prefer this runtime view when available. */
if(summary.dataSourceCalls){
  i.dataSourceCalls=summary.dataSourceCalls;
  /* Sort DS_ microflows by count desc (repeat-callers surface first) */
  i.dataSourceCalls.microflows.sort(function(a,b){return b.count-a.count});
  i.dataSourceCalls.otherActions.sort(function(a,b){return b.count-a.count});
  /* v0.2.67 — Same for Mendix 10 runtime operations */
  if(i.dataSourceCalls.operations){
    i.dataSourceCalls.operations.sort(function(a,b){return b.count-a.count});
  }
}
/* v0.2.65 — pick up the debug buffer too, used as a diagnostic panel
 * when the classifier caught nothing. */
if(summary.dsDebug){
  i.dsDebug=summary.dsDebug;
}
}
i.perfTrackerActive=true;
}else{
i.perfTrackerActive=false;
}}();

!function(){if(performance&&performance.getEntriesByType){var e=performance.getEntriesByType("resource");i.totalRequests=e.length;e.forEach(function(r){"xmlhttprequest"===r.initiatorType||"fetch"===r.initiatorType?i.xhrRequests++:i.staticRequests++;r.transferSize&&(i.totalTransferred+=r.transferSize);var dur=r.responseEnd-r.startTime;if(dur>1e3)i.slowRequests.push({url:r.name.split("?")[0].split("/").pop()||r.name.substring(0,50),duration:Math.round(dur)});if(r.transferSize>5e5)i.largeAssets.push({url:r.name.split("/").pop()||"asset",size:r.transferSize})});i.slowRequests.sort(function(a,b){return b.duration-a.duration}).splice(5);i.largeAssets.sort(function(a,b){return b.size-a.size}).splice(5)}}();

!function(){var els=document.querySelectorAll('[class*="mx-name-"]');i.totalWidgets=els.length;

/* Count actual DATA CONTAINERS by their container class + mx-name (not by name pattern!) */
/* A ListView has both "mx-listview" class AND "mx-name-xxx" class */
i.dataViews=document.querySelectorAll('.mx-dataview:not(.mx-dataview-content)[class*="mx-name-"]').length;
i.listViews=document.querySelectorAll('.mx-listview[class*="mx-name-"]').length;
i.templateGrids=document.querySelectorAll('.mx-templategrid[class*="mx-name-"]').length;
i.dataGrid2s=document.querySelectorAll('.widget-datagrid[class*="mx-name-"]').length;
i.galleries=document.querySelectorAll('.widget-gallery[class*="mx-name-"]').length;
i.treeNodes=document.querySelectorAll('.widget-tree-node[class*="mx-name-"],.mx-treeview[class*="mx-name-"]').length;
i.dataGrids=document.querySelectorAll(".mx-datagrid:not(.widget-datagrid)[class*='mx-name-']").length;

/* Enhanced nesting detection - catches all data container combinations */
var allDvs=document.querySelectorAll(".mx-dataview:not(.mx-dataview-content)");
var allLvs=document.querySelectorAll(".mx-listview");
var allTgs=document.querySelectorAll(".mx-templategrid");
var allTrees=document.querySelectorAll('.widget-tree-node,.mx-treeview');
var namedDvs=[];allDvs.forEach(function(el){if(isNamedDataView(el))namedDvs.push(el)});
var critEls=[],warnEls=[];

/* Count data container nesting (any container inside any other container) */
function countContainerDepth(el){var depth=0,cur=el.parentElement;while(cur){var cn=getClassName(cur);if(cn.indexOf("mx-dataview")>-1&&cn.indexOf("mx-dataview-content")===-1)depth++;else if(cn.indexOf("mx-listview")>-1)depth++;else if(cn.indexOf("mx-templategrid")>-1)depth++;else if(cn.indexOf("widget-tree-node")>-1||cn.indexOf("mx-treeview")>-1)depth++;else if(cn.indexOf("widget-gallery")>-1)depth++;cur=cur.parentElement}return depth}

/* Check DataViews */
namedDvs.forEach(function(el){var depth=countContainerDepth(el);if(depth>i.maxDataViewDepth)i.maxDataViewDepth=depth;var nm=getWidgetName(el)||"dataView";if(depth>=3){i.nestedDataViewsCritical.push(nm+" (depth "+depth+")");critEls.push(el)}else if(depth>=2){i.nestedDataViewsWarning.push(nm);warnEls.push(el)}});

/* Check ListViews for nesting issues */
allLvs.forEach(function(el){var nm=getWidgetName(el)||"listView";var depth=countContainerDepth(el);if(depth>=2){i.nestedDataViewsCritical.push(nm+" in container (depth "+depth+")");critEls.push(el)}else if(depth>=1){i.nestedDataViewsWarning.push(nm+" (nested)");warnEls.push(el)}});

/* Check TemplateGrids */
allTgs.forEach(function(el){var nm=getWidgetName(el)||"templateGrid";var depth=countContainerDepth(el);if(depth>=2){i.nestedDataViewsCritical.push(nm+" in container");critEls.push(el)}else if(depth>=1){i.nestedDataViewsWarning.push(nm+" (nested)");warnEls.push(el)}});

if(critEls.length)i.highlightTargets.nestedDataViewsCritical=critEls;
if(warnEls.length)i.highlightTargets.nestedDataViewsWarning=warnEls;

/* Enhanced entity extraction - works with both React and Dojo */
namedDvs.forEach(function(el){
  var entity=null;
  /* Method 1: React Fiber extraction via Symbol(mxObject) */
  if(window.__MxDataExtractor){
    var data=window.__MxDataExtractor.extractDataFromElement(el);
    if(data&&data.entity)entity=data.entity;
  }
  /* Method 2: Fallback to DOM-based extraction for Dojo */
  if(!entity){
    var idEl=el.querySelector("[id]");
    if(idEl){var parts=idEl.id.split(".");if(parts.length>=2)entity=parts[1]}
  }
  if(entity&&i.dataViewEntities.indexOf(entity)===-1)i.dataViewEntities.push(entity)
});
/* Also scan lists and grids for entities */
var dataContainers=document.querySelectorAll('.mx-listview,[class*="widget-datagrid"],[class*="widget-gallery"]');
dataContainers.forEach(function(el){
  if(window.__MxDataExtractor){
    var data=window.__MxDataExtractor.extractDataFromElement(el);
    if(data&&data.entity&&i.dataViewEntities.indexOf(data.entity)===-1)i.dataViewEntities.push(data.entity);
  }
});

/* Collect actual page parameters
 * v0.2.10 — prefer the Data Panel's cache-based enumeration (same as Data Inspector),
 * fall back to the legacy scraper if Data Panel isn't loaded yet. */
if (window.__MxDataPanel && typeof window.__MxDataPanel.getContextEntityNames === 'function') {
  var ctxNames = window.__MxDataPanel.getContextEntityNames();
  ctxNames.forEach(function (name) {
    if (name && i.pageParameters.indexOf(name) === -1) i.pageParameters.push(name);
  });
} else if(window.__MxDataExtractor&&window.__MxDataExtractor.getPageParameters){
  var params=window.__MxDataExtractor.getPageParameters();
  params.forEach(function(p){
    var paramName=p.entity?p.entity:(p.name||'Unknown');
    /* Clean up the name - just show entity short name */
    if(paramName.indexOf('.')>-1)paramName=paramName.split('.').pop();
    if(p.name&&p.name.indexOf('.')>-1){
      /* Use the association name pattern like MRPRun.MRPRunPlanning */
      paramName=p.name;
    }
    if(paramName&&i.pageParameters.indexOf(paramName)===-1){
      i.pageParameters.push(paramName);
    }
  });
}

var modal=document.querySelector(".modal-dialog");
if(modal){
  i.popup=true;
  var popupPath="";

  /* v0.2.4 — Goldmine 1: form stack from mx.ui.openForm2 hook in perf-tracker.
   * The most recent open is overwhelmingly the popup we're looking at. */
  try {
    var stk=window.__mxiFormStack;
    if(stk&&stk.length){popupPath=stk[stk.length-1].path||"";}
  } catch(e){}

  /* v0.2.4 — Goldmine 2: React Fiber walk inside the modal.
   * Mendix's Form/Page React component carries `path` in memoizedProps and
   * ends in .page.xml. BFS through the fiber tree until we hit it.
   * Handles popups opened via routing, shared dialogs, or anything that
   * bypassed mx.ui.openForm2. */
  if(!popupPath){
    try {
      var fk=null,keys=Object.keys(modal);
      for(var fi=0;fi<keys.length;fi++){
        if(keys[fi].indexOf("__reactFiber")===0||keys[fi].indexOf("__reactInternalInstance")===0){fk=keys[fi];break;}
      }
      var startFiber=fk?modal[fk]:null;
      if(startFiber){
        var queue=[startFiber],seen=0;
        while(queue.length&&seen<200){
          var f=queue.shift();seen++;
          var props=f&&f.memoizedProps;
          if(props){
            if(typeof props.path==="string"&&props.path.indexOf(".page.xml")>-1){popupPath=props.path;break;}
            if(typeof props.formPath==="string"&&props.formPath.indexOf(".page.xml")>-1){popupPath=props.formPath;break;}
            if(typeof props.pageName==="string"&&props.pageName.indexOf(".page.xml")>-1){popupPath=props.pageName;break;}
            if(props.mxform&&typeof props.mxform.path==="string"&&props.mxform.path){popupPath=props.mxform.path;break;}
          }
          if(f.child)queue.push(f.child);
          if(f.sibling)queue.push(f.sibling);
        }
      }
    } catch(e){}
  }

  if(popupPath){
    var pp=popupPath.replace(".page.xml","").replace(/\//g,".");
    var pd=pp.indexOf(".");
    if(pd>-1){i.module=pp.substring(0,pd);i.page=pp.substring(pd+1);} else {i.page=pp;}
  } else {
    /* Final fallback: original ID heuristic, kept verbatim for backwards compat */
    var ids=modal.querySelectorAll("[id]");
    for(var j=0;j<ids.length;j++){
      var parts=ids[j].id.split(".");
      if(parts.length>=3){i.module=parts[1];i.page=parts[2].split("$")[0];break;}
    }
  }
}else{var path="";if(window.mx&&mx.ui&&mx.ui.getContentForm){var form=n(function(){return mx.ui.getContentForm()},null);if(form)path=form.path||""}if(!path&&history.state&&history.state.pageName)path=history.state.pageName;if(path){path=path.replace(".page.xml","").replace(/\//g,".");var dot=path.indexOf(".");if(dot>-1){i.module=path.substring(0,dot);i.page=path.substring(dot+1)}else i.page=path}}

if(i.env){var u=i.env.toLowerCase();if(u.indexOf("localhost")>-1||u.indexOf(":8080")>-1)i.envType="Local";else if(u.indexOf("-sandbox")>-1||u.indexOf("mxapps.io")>-1)i.envType="Sandbox";else if(u.indexOf("-accp")>-1)i.envType="Acceptance";else if(u.indexOf("-test")>-1)i.envType="Test";else i.envType="Production"}}();

!function(){i.domNodes=document.querySelectorAll("*").length;i.formFields=document.querySelectorAll("input,select,textarea").length;i.images=document.querySelectorAll("img").length;i.lazyImages=document.querySelectorAll('img[loading="lazy"]').length;
var nonLazy=document.querySelectorAll('img:not([loading="lazy"])');if(nonLazy.length>10)i.highlightTargets.nonLazyImages=Array.from(nonLazy);
i.maxNestingDepth=function calc(el,d){if(!el||!el.children||!el.children.length)return d;var max=d;for(var j=0;j<Math.min(el.children.length,50);j++){var cd=calc(el.children[j],d+1);if(cd>max)max=cd}return max}(document.body,0)}();

i.consoleErrors=document.querySelectorAll('.mx-toast-error,.alert-danger,[class*="error"]').length;

detectSnippets();detectConditionalVisibility();detectDataSources();detectMendixMeta();buildWidgetTree();

/* ===== A11Y ANALYSIS ===== */
!function(){var e=i.a11y;
e.totalImages=document.querySelectorAll("img").length;
var noAlt=document.querySelectorAll("img:not([alt])");e.missingAltText=noAlt.length;
if(noAlt.length)i.highlightTargets.missingAlt=Array.from(noAlt);

var inputs=document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]),textarea,select');
var missingL=0,missingEls=[];
inputs.forEach(function(el){var id=el.id;var hasLabel=id&&document.querySelector('label[for="'+id+'"]');var hasAria=el.getAttribute("aria-label")||el.getAttribute("aria-labelledby");if(!hasLabel&&!hasAria&&!el.closest("label")){missingL++;missingEls.push(el)}});
e.totalFormFields=inputs.length;e.missingLabels=missingL;
if(missingEls.length)i.highlightTargets.missingLabels=missingEls;

var headings=document.querySelectorAll("h1,h2,h3,h4,h5,h6");
var levels=[],h1s=0,skips=0,skipEls=[];
headings.forEach(function(h){var lvl=parseInt(h.tagName.charAt(1));if(lvl===1)h1s++;if(levels.length&&lvl>levels[levels.length-1]+1){skips++;skipEls.push(h)}levels.push(lvl)});
e.totalHeadings=headings.length;e.h1Count=h1s;e.headingSkips=skips;e.missingH1=h1s===0;
if(skipEls.length)i.highlightTargets.headingSkips=skipEls;

e.missingTitle=!document.title||document.title.length<2;
e.missingLang=!document.documentElement.lang;e.pageLang=document.documentElement.lang||"";

var emptyL=0,emptyEls=[];
document.querySelectorAll("a").forEach(function(a){var txt=(a.textContent||"").trim();if(!txt&&!a.getAttribute("aria-label")&&!a.querySelector("img[alt]")){emptyL++;emptyEls.push(a)}});
e.totalLinks=document.querySelectorAll("a").length;e.emptyLinks=emptyL;
if(emptyEls.length)i.highlightTargets.emptyLinks=emptyEls;

var dupIds=0,dupEls=[],idMap={};
document.querySelectorAll("[id]").forEach(function(el){var id=el.id;if(id){if(idMap[id]){dupIds++;dupEls.push(el)}else idMap[id]=el}});
e.duplicateIds=dupIds;if(dupEls.length)i.highlightTargets.duplicateIds=dupEls;

/* ===== CONTRAST CHECKING ===== */
function getLuminance(r,g,b){var a=[r,g,b].map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return a[0]*0.2126+a[1]*0.7152+a[2]*0.0722}
function getContrastRatio(l1,l2){var lighter=Math.max(l1,l2),darker=Math.min(l1,l2);return(lighter+0.05)/(darker+0.05)}
function parseColor(color){
  if(!color||color==="transparent"||color==="rgba(0, 0, 0, 0)"||color==="inherit")return null;
  /* rgb() / rgba() — legacy format */
  var match=color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if(match){
    var alpha=match[4]?parseFloat(match[4]):1;
    if(alpha<0.1)return null;
    return{r:parseInt(match[1]),g:parseInt(match[2]),b:parseInt(match[3]),a:alpha};
  }
  /* v0.2.2 — CSS Color Level 4 color() notation, e.g. `color(srgb 0.119 0.232 0.718)` or `color(srgb 0.1 0.2 0.3 / 0.5)`.
   * Modern browsers return this format for any color declared in a wide-gamut
   * or srgb color space. Values are 0-1 floats (or `none` → 0).
   * Previously we returned null for this format, which in turn made the
   * contrast check fall back to "white background" and falsely flag any
   * element whose theme defined colors this way (most Atlas primary buttons,
   * Tailwind 4, many modern themes). */
  var cm=color.match(/^color\(\s*(srgb|srgb-linear|display-p3)\s+([^\/\)]+?)(?:\s*\/\s*([\d.]+|none))?\s*\)$/i);
  if(cm){
    var parts=cm[2].trim().split(/\s+/);
    if(parts.length>=3){
      var toByte=function(v){
        if(v==="none")return 0;
        var f=parseFloat(v);
        if(isNaN(f))return 0;
        if(f<0)f=0;
        if(f>1)f=1;
        return Math.round(f*255);
      };
      var alpha2=cm[3]?(cm[3]==="none"?0:parseFloat(cm[3])):1;
      if(isNaN(alpha2))alpha2=1;
      if(alpha2<0.1)return null;
      /* srgb-linear and display-p3 aren't strictly sRGB but for contrast
       * classification they're close enough that the small error is dwarfed
       * by the WCAG thresholds' own tolerance. */
      return{r:toByte(parts[0]),g:toByte(parts[1]),b:toByte(parts[2]),a:alpha2};
    }
  }
  /* #rgb / #rrggbb hex — occasionally returned by browsers, cheap to support */
  var hx=color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if(hx){
    var h=hx[1];
    if(h.length===3){
      return{r:parseInt(h[0]+h[0],16),g:parseInt(h[1]+h[1],16),b:parseInt(h[2]+h[2],16),a:1};
    }
    return{r:parseInt(h.substring(0,2),16),g:parseInt(h.substring(2,4),16),b:parseInt(h.substring(4,6),16),a:1};
  }
  return null;
}
/* v0.2.1 — getEffectiveBg rewritten. Previously walked up the DOM looking for
 * an opaque `background-color`. Three failure modes this missed, all producing
 * false-positive "low contrast" flags on perfectly readable elements:
 *
 *   (1) Gradient backgrounds. An element with `background: linear-gradient(...)`
 *       but no solid `background-color` reports `backgroundColor: rgba(0,0,0,0)`
 *       to getComputedStyle. The walk-up then passed through the element,
 *       found the page's white bg, and reported the foreground against WHITE
 *       — regardless of the gradient's actual colors. Result: white button
 *       text on a blue gradient = 1:1 ratio = FAIL. Now: if any ancestor
 *       (including the element itself) has a non-`none` backgroundImage, we
 *       can't reliably compute a contrast ratio against a gradient or pattern,
 *       so we return null and the caller skips the element entirely (better
 *       to miss a real issue than flag a false positive on an obviously-OK
 *       element).
 *
 *   (2) Alpha compositing. An element with rgba(100, 100, 100, 0.6) sitting
 *       on a white page should be composited with the white before measuring
 *       contrast. Previously we either accepted (alpha >= 0.5) and ignored
 *       the transparency, or rejected (alpha < 0.5) and walked past. Now:
 *       if we find a translucent bg above another color, we alpha-blend them
 *       and return the composite.
 *
 *   (3) Pseudo-element backgrounds. Some themes paint the button via `::before`
 *       with a full-size absolute-positioned element. We can't detect that
 *       from the DOM side — but if the button itself has a non-`none`
 *       background-image, that's the tell and we bail via (1).
 *
 * Returns null when the background is unreliable (gradient, image, pattern).
 * Caller treats null as "don't flag — we can't be sure". */
function getEffectiveBg(el){
  var composite=null;
  var current=el;
  var maxDepth=10;
  while(current && current!==document.body && maxDepth-->0){
    var style=getComputedStyle(current);
    /* (1) Bail on gradients / background-images — contrast is indeterminate */
    var bgImg=style.backgroundImage;
    if(bgImg && bgImg!=="none" && bgImg!=="initial"){
      return null;
    }
    var bgColor=parseColor(style.backgroundColor);
    if(bgColor){
      if(bgColor.a>=0.95){
        /* Fully (or nearly-fully) opaque — blend with any translucent layer
         * we've accumulated so far, then we're done. */
        if(composite){
          var a=composite.a;
          composite={
            r:Math.round(composite.r*a + bgColor.r*(1-a)),
            g:Math.round(composite.g*a + bgColor.g*(1-a)),
            b:Math.round(composite.b*a + bgColor.b*(1-a)),
            a:1
          };
        }else{
          composite={r:bgColor.r,g:bgColor.g,b:bgColor.b,a:1};
        }
        return composite;
      }else if(bgColor.a>=0.05){
        /* Translucent — accumulate and keep walking to find what's beneath */
        if(composite){
          /* two translucent layers stack: out = src*src.a + dst*(1-src.a) */
          var srcA=composite.a;
          var dstA=bgColor.a;
          /* composite is on TOP of bgColor (child is above parent) */
          composite={
            r:Math.round(composite.r*srcA + bgColor.r*dstA*(1-srcA)),
            g:Math.round(composite.g*srcA + bgColor.g*dstA*(1-srcA)),
            b:Math.round(composite.b*srcA + bgColor.b*dstA*(1-srcA)),
            a:srcA + dstA*(1-srcA)
          };
        }else{
          composite={r:bgColor.r,g:bgColor.g,b:bgColor.b,a:bgColor.a};
        }
      }
    }
    current=current.parentElement;
  }
  /* Fell through to body without finding an opaque layer — composite over white */
  if(composite){
    var a=composite.a;
    return {r:Math.round(composite.r*a + 255*(1-a)),
            g:Math.round(composite.g*a + 255*(1-a)),
            b:Math.round(composite.b*a + 255*(1-a)),
            a:1};
  }
  return {r:255,g:255,b:255,a:1};
}
function isElementVisible(el){try{var rect=el.getBoundingClientRect();if(rect.width===0||rect.height===0)return false;var style=getComputedStyle(el);if(style.display==="none"||style.visibility==="hidden"||style.opacity==="0")return false;if(rect.top>window.innerHeight||rect.bottom<0||rect.left>window.innerWidth||rect.right<0)return false;return true}catch(e){return false}}

var contrastEls=[],smallFontEls=[];
var textEls=document.querySelectorAll("p,span,a,li,td,th,label,h1,h2,h3,h4,h5,h6,button");
textEls.forEach(function(el){try{if(!isElementVisible(el))return;
/* v0.2.1 — Skip elements whose text is wholly contained in child elements
 * that will be tested separately. Previously both the button AND its inner
 * span were visited, and if either had a different effective bg we'd get
 * duplicate/inconsistent results. Now: if the element's direct text-node
 * content is empty (text lives in children), skip — the children handle
 * their own check. Exception: <button> with a text node is common and
 * should still be measured against the button's own bg. */
var hasDirectText=false;
for(var n=0;n<el.childNodes.length;n++){
  var nd=el.childNodes[n];
  if(nd.nodeType===3 && nd.nodeValue && nd.nodeValue.trim().length>=2){hasDirectText=true;break}
}
if(!hasDirectText)return;
var text=(el.textContent||"").trim();if(!text||text.length<2)return;var style=getComputedStyle(el);var fontSize=parseFloat(style.fontSize);
/* Check for small font size - WCAG recommends minimum 12px */
if(fontSize<12&&smallFontEls.length<15)smallFontEls.push(el);
/* Check contrast */
var fg=parseColor(style.color);if(!fg)return;var bg=getEffectiveBg(el);
/* v0.2.1 — null bg means gradient/image/unknown — don't flag, can't be sure */
if(!bg)return;
var fgLum=getLuminance(fg.r,fg.g,fg.b);var bgLum=getLuminance(bg.r,bg.g,bg.b);var ratio=getContrastRatio(fgLum,bgLum);var isBold=parseInt(style.fontWeight)>=700;var isLargeText=(fontSize>=18.66)||(fontSize>=14&&isBold);var minRatio=isLargeText?3:4.5;
/* v0.2.1 — 0.1 tolerance on the ratio. WCAG defines 4.5:1 as the minimum,
 * but floating-point rounding in luminance math routinely produces values
 * like 4.497 for a visually-identical color pair that should read as 4.5.
 * A 0.1 tolerance keeps us from flagging borderline-passing cases while
 * still catching true failures (which typically clock in at 3.x or lower). */
if(ratio<(minRatio-0.1)&&contrastEls.length<15)contrastEls.push(el)}catch(ex){}});
e.contrastIssues=contrastEls.length;
e.smallFontSize=smallFontEls.length;
if(contrastEls.length)i.highlightTargets.contrastIssues=contrastEls;
if(smallFontEls.length)i.highlightTargets.smallFontSize=smallFontEls;

/* ===== FOCUS & KEYBOARD (v0.2.61 rewrite)
 * WCAG 2.4.7 Focus Visible (AA) + 2.4.13 Focus Appearance (AAA).
 * Previous implementation flagged every element with `outline:0` which
 * included virtually every styled element → massive false positive rate.
 *
 * New approach: an element is flagged only when BOTH
 *   (a) outline is effectively absent (none / 0 / invisible) AND
 *   (b) there's no `box-shadow` that likely serves as a focus replacement
 *       AND no :focus rule we can detect via element className heuristics.
 * Still imperfect (we can't see pseudo-class rules at runtime without
 * parsing stylesheets), but much closer to signal. */
var focusIssues=0,focusEls=[];
document.querySelectorAll("a[href],button,input:not([type='hidden']),select,textarea,[tabindex]:not([tabindex='-1'])").forEach(function(el){
  try{
    var style=getComputedStyle(el);
    var outlineGone=(style.outlineStyle==="none"||parseFloat(style.outlineWidth)===0);
    if(!outlineGone)return;
    /* If element has any box-shadow, assume it's the focus replacement. */
    if(style.boxShadow&&style.boxShadow!=="none")return;
    /* Mendix widgets often have focus styles on parent containers. Only
     * flag elements that are NOT inside a known Mendix widget wrapper. */
    focusIssues++;
    if(focusEls.length<10)focusEls.push(el);
  }catch(ex){}
});
e.focusIssues=focusIssues;
if(focusEls.length)i.highlightTargets.focusIssues=focusEls;

/* ===== TARGET SIZE (WCAG 2.2 — 2.5.8 Target Size Minimum, Level AA)
 * All interactive targets should be at least 24×24 CSS pixels. The spec
 * has exceptions for inline targets (links in paragraphs) and targets
 * with sufficient spacing from neighbors. We apply the core check and
 * skip inline <a> inside block text. Mobile viewports also track the
 * stricter 44×44 (WCAG 2.5.5 Target Size Enhanced, AAA) separately. */
var targetSizeIssues=0,targetSizeEls=[];
var smallTargets=0,smallEls=[];
var isMobileViewport=window.innerWidth<=1024;
document.querySelectorAll("a[href],button,input:not([type='hidden']),select,textarea,[role='button'],[role='link'],[role='checkbox'],[role='radio']").forEach(function(el){
  try{
    var rect=el.getBoundingClientRect();
    if(rect.width===0||rect.height===0)return;
    /* Skip inline <a> inside a block-level text parent (WCAG 2.5.8 exception) */
    if(el.tagName==="A"){
      var parent=el.parentElement;
      if(parent){
        var pTag=parent.tagName;
        if(pTag==="P"||pTag==="LI"||pTag==="SPAN"||pTag==="TD"){
          /* Probably inline — skip target-size check */
          return;
        }
      }
    }
    if(rect.width<24||rect.height<24){
      targetSizeIssues++;
      if(targetSizeEls.length<15)targetSizeEls.push(el);
    }
    /* Mobile-only stricter 44px check (tracked separately, backwards compat) */
    if(isMobileViewport&&(rect.width<44||rect.height<44)){
      smallTargets++;
      if(smallEls.length<15)smallEls.push(el);
    }
  }catch(ex){}
});
e.targetSizeIssues=targetSizeIssues;
e.smallTouchTargets=smallTargets;
if(targetSizeEls.length)i.highlightTargets.targetSizeIssues=targetSizeEls;
if(smallEls.length)i.highlightTargets.smallTargets=smallEls;

/* ===== ACCESSIBLE NAMES (WCAG 4.1.2 Name, Role, Value — Level A)
 * Interactive elements need a programmatically-determinable name. Check
 * buttons, links and inputs for having EITHER text content, aria-label,
 * aria-labelledby, title, or an image child with non-empty alt. */
function hasAccessibleName(el){
  if(!el)return true;
  var text=(el.textContent||"").trim();
  if(text.length>0)return true;
  if(el.getAttribute("aria-label"))return true;
  if(el.getAttribute("aria-labelledby"))return true;
  if(el.getAttribute("title"))return true;
  var valAttr=el.getAttribute("value");
  if(el.tagName==="INPUT"&&(el.type==="submit"||el.type==="button")&&valAttr)return true;
  var img=el.querySelector("img[alt]:not([alt=''])");
  if(img)return true;
  var svgWithTitle=el.querySelector("svg title");
  if(svgWithTitle&&(svgWithTitle.textContent||"").trim())return true;
  return false;
}
var noAccNameCount=0,noAccNameEls=[];
document.querySelectorAll("button,a[href],[role='button'],[role='link']").forEach(function(el){
  try{
    if(!hasAccessibleName(el)){
      noAccNameCount++;
      if(noAccNameEls.length<15)noAccNameEls.push(el);
    }
  }catch(ex){}
});
e.noAccessibleName=noAccNameCount;
if(noAccNameEls.length)i.highlightTargets.noAccessibleName=noAccNameEls;

/* ===== IFRAME TITLES (WCAG 2.4.1 Bypass Blocks / 4.1.2 Name, Role, Value)
 * Every <iframe> must have a title attribute describing its content so
 * screen readers announce it meaningfully. */
var iframesNoTitle=0,iframesNoTitleEls=[];
document.querySelectorAll("iframe").forEach(function(el){
  try{
    var t=(el.getAttribute("title")||"").trim();
    if(!t){
      iframesNoTitle++;
      if(iframesNoTitleEls.length<10)iframesNoTitleEls.push(el);
    }
  }catch(ex){}
});
e.iframeTitleMissing=iframesNoTitle;
if(iframesNoTitleEls.length)i.highlightTargets.iframeTitleMissing=iframesNoTitleEls;

/* ===== ARIA & LANDMARKS ===== */
e.ariaUsage=document.querySelectorAll("[role],[aria-label],[aria-labelledby],[aria-describedby],[aria-hidden]").length;
e.landmarks=document.querySelectorAll("main,nav,header,footer,aside,section[aria-label],[role='main'],[role='navigation'],[role='banner'],[role='contentinfo'],[role='complementary']").length;
e.hasSkipLink=!!document.querySelector('a[href="#main"],a[href="#content"],[class*="skip"]');
e.hasMainLandmark=!!document.querySelector("main,[role='main']");

/* ===== TAB ORDER ===== */
var positiveTabindex=document.querySelectorAll('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])');
e.positiveTabindex=positiveTabindex.length;
if(positiveTabindex.length)i.highlightTargets.positiveTabindex=Array.from(positiveTabindex);

/* ===== CALCULATE SCORE ===== */
var score=100,deductions=[],improvements=[];
if(e.missingAltText>0){var pts=Math.min(e.missingAltText*3,15);score-=pts;deductions.push({issue:"Missing alt text",count:e.missingAltText,pts:pts});improvements.push("Add alt text to "+e.missingAltText+" image(s)")}
if(e.missingLabels>0){var pts=Math.min(e.missingLabels*3,10);score-=pts;deductions.push({issue:"Missing form labels",count:e.missingLabels,pts:pts});improvements.push("Add labels to "+e.missingLabels+" form field(s)")}
if(e.contrastIssues>0){var pts=Math.min(e.contrastIssues*2,12);score-=pts;deductions.push({issue:"Low contrast text",count:e.contrastIssues,pts:pts});improvements.push("Fix "+e.contrastIssues+" contrast issue(s) - ratio should be 4.5:1 minimum")}
if(e.smallFontSize>0){var pts=Math.min(e.smallFontSize,8);score-=pts;deductions.push({issue:"Font too small (<12px)",count:e.smallFontSize,pts:pts});improvements.push("Increase font size on "+e.smallFontSize+" element(s) to at least 12px")}
if(e.missingLang){score-=8;deductions.push({issue:"Missing lang attribute",count:1,pts:8});improvements.push("Add lang attribute to <html> tag")}
if(e.missingTitle){score-=5;deductions.push({issue:"Missing page title",count:1,pts:5});improvements.push("Add a descriptive <title> tag")}
if(e.missingH1){score-=5;deductions.push({issue:"Missing H1 heading",count:1,pts:5});improvements.push("Add an H1 heading to the page")}
if(e.headingSkips>0){var pts=Math.min(e.headingSkips*2,8);score-=pts;deductions.push({issue:"Heading level skips",count:e.headingSkips,pts:pts});improvements.push("Fix heading hierarchy (don't skip levels)")}
if(e.emptyLinks>0){var pts=Math.min(e.emptyLinks*2,8);score-=pts;deductions.push({issue:"Empty links",count:e.emptyLinks,pts:pts});improvements.push("Add text or aria-label to "+e.emptyLinks+" empty link(s)")}
if(e.duplicateIds>0){var pts=Math.min(e.duplicateIds*2,8);score-=pts;deductions.push({issue:"Duplicate IDs",count:e.duplicateIds,pts:pts});improvements.push("Fix "+e.duplicateIds+" duplicate ID(s)")}
/* v0.2.61 — new WCAG 2.2 / EAA-relevant checks */
if(e.targetSizeIssues>0){var pts=Math.min(e.targetSizeIssues,10);score-=pts;deductions.push({issue:"Small targets (<24×24 CSS px)",count:e.targetSizeIssues,pts:pts});improvements.push("Enlarge "+e.targetSizeIssues+" target(s) to at least 24×24 px (WCAG 2.2 2.5.8)")}
if(e.noAccessibleName>0){var pts=Math.min(e.noAccessibleName*3,12);score-=pts;deductions.push({issue:"Interactive elements without accessible name",count:e.noAccessibleName,pts:pts});improvements.push("Add text, aria-label, or title to "+e.noAccessibleName+" button(s)/link(s)")}
if(e.iframeTitleMissing>0){var pts=Math.min(e.iframeTitleMissing*2,6);score-=pts;deductions.push({issue:"Iframes missing title",count:e.iframeTitleMissing,pts:pts});improvements.push("Add title attribute to "+e.iframeTitleMissing+" iframe(s)")}
if(e.focusIssues>0){var pts=Math.min(e.focusIssues,6);score-=pts;deductions.push({issue:"No visible focus indicator",count:e.focusIssues,pts:pts});improvements.push("Add visible :focus styles to "+e.focusIssues+" interactive element(s)")}
/* Mobile-only 44px penalty kept for backwards compat; lighter weight
 * since 24px is already penalized above. */
if(e.smallTouchTargets>5&&window.innerWidth<=1024){var pts=Math.min(Math.floor(e.smallTouchTargets/2),4);score-=pts;deductions.push({issue:"Small mobile touch targets (<44px)",count:e.smallTouchTargets,pts:pts});improvements.push("Increase mobile target size to 44×44 on "+e.smallTouchTargets+" element(s)")}
if(!e.hasSkipLink){score-=3;deductions.push({issue:"No skip link",count:1,pts:3});improvements.push("Add a skip-to-content link")}
if(!e.hasMainLandmark){score-=3;deductions.push({issue:"No main landmark",count:1,pts:3});improvements.push("Add a <main> element or role='main'")}
if(e.positiveTabindex>0){var pts=Math.min(e.positiveTabindex,4);score-=pts;deductions.push({issue:"Positive tabindex values",count:e.positiveTabindex,pts:pts});improvements.push("Remove positive tabindex values (use 0 or -1)")}

e.score=Math.max(0,score);e.deductions=deductions;e.improvements=improvements;
/* v0.2.61 — WCAG level tiers now map closer to actual WCAG conformance:
 *   AAA: score 95+ AND all AA blockers clean AND bonus a11y features in place
 *   AA:  score 85+ AND no AA blockers (alt, labels, lang, contrast, 24px targets, accessible names)
 *   A:   score 70+ AND headline A-level issues kept low
 *   Partial / Needs Work: below these thresholds → counted as failing. */
var blocksAA=(e.missingAltText>0||e.missingLabels>0||e.missingLang||e.contrastIssues>0||e.targetSizeIssues>0||e.noAccessibleName>0||e.iframeTitleMissing>0);
var blocksA=(e.missingAltText>2||e.missingLabels>2||e.noAccessibleName>2||e.iframeTitleMissing>0);
if(e.score>=95&&!blocksAA&&e.hasSkipLink&&e.hasMainLandmark&&e.headingSkips===0&&e.emptyLinks===0){
  e.wcagLevel="AAA Compliant";
} else if(e.score>=85&&!blocksAA){
  e.wcagLevel="AA Compliant";
} else if(e.score>=70&&!blocksA){
  e.wcagLevel="A Compliant";
} else if(e.score>=50){
  e.wcagLevel="Partial";
} else {
  e.wcagLevel="Needs Work";
}}();

/* ===== TYPOGRAPHY DETECTION ===== */
!function(){
var fontMap={},fontSizes={},lineHeights={},fontWeights={};
/* Filter out non-font values */
var invalidFontPatterns=[/\$/,/^[0-9]/,/Atlas_/,/Core\$/,/_Core/,/^mx-/,/^widget-/,/inherit/i,/initial/i,/unset/i];
/* v0.2.48 — drop universal cross-platform fallbacks entirely; they're not
 * the app's design choice. If the app relies on one (e.g., Arial), it'll
 * still appear because it's the declared primary — this list only catches
 * them when they're not the primary anywhere. */
var genericFallbacks=/^(serif|sans-serif|monospace|system-ui|-apple-system|BlinkMacSystemFont|Segoe UI|Times New Roman|Times|Arial|Helvetica|Helvetica Neue|Courier New|Courier|Georgia|Verdana|Tahoma|Trebuchet MS|Lucida|Ubuntu|Cantarell|Noto Sans|Roboto)$/i;
/* Icon-font heuristics: name patterns + whether any computed style actually
 * pairs these with visual glyph characters (Private Use Area codepoints).
 * Names that look like icon fonts get badged; the inspector shows them
 * marked so the user knows they're not text fonts. */
var iconFontNamePattern=/\b(icons?|icon-set|glyph|material|fontawesome|feather|bootstrap-icons|atlas-ui|mendix|mxui|datagrid-filters|icomoon|lineicons)\b/i;
var iconFonts={};
function isValidFont(name){return name&&name.length>1&&name.length<60&&!invalidFontPatterns.some(function(p){return p.test(name)})}
function isGenericFallback(name){return genericFallbacks.test(name)}
function isIconFont(name){return iconFontNamePattern.test(name)}
var textEls=document.querySelectorAll("body,p,span,a,li,td,th,label,h1,h2,h3,h4,h5,h6,button,input,textarea,div");
textEls.forEach(function(el){try{
var style=getComputedStyle(el);
var family=style.fontFamily.split(",")[0].replace(/['"]/g,"").trim();
if(isValidFont(family)&&!isGenericFallback(family)){
  fontMap[family]=(fontMap[family]||0)+1;
  if(isIconFont(family))iconFonts[family]=true;
}
var size=Math.round(parseFloat(style.fontSize));
if(size)fontSizes[size+"px"]=(fontSizes[size+"px"]||0)+1;
var lh=style.lineHeight;
if(lh&&lh!=="normal")lineHeights[lh]=(lineHeights[lh]||0)+1;
var weight=style.fontWeight;
if(weight)fontWeights[weight]=(fontWeights[weight]||0)+1;
}catch(ex){}});
var sortedFonts=Object.keys(fontMap).sort(function(a,b){return fontMap[b]-fontMap[a]});
var sortedSizes=Object.keys(fontSizes).sort(function(a,b){return parseInt(b)-parseInt(a)});
var sortedWeights=Object.keys(fontWeights).sort(function(a,b){return parseInt(a)-parseInt(b)});
/* primaryFont: first non-icon-font so the headline stays meaningful even
 * if an icon font happens to be most-used (it sometimes is). */
var primary=sortedFonts.find(function(fn){return !iconFonts[fn]})||sortedFonts[0]||"Unknown";
i.typography={fonts:sortedFonts.slice(0,8),fontCounts:fontMap,iconFonts:iconFonts,sizes:sortedSizes.slice(0,10),weights:sortedWeights,primaryFont:primary,fontCount:sortedFonts.length,sizeCount:sortedSizes.length}}();

/* ===== CSS ANALYSIS ===== */
!function(){
var cssInfo={
  totalRules:0,
  totalStylesheets:0,
  inlineStyles:0,
  importantCount:0,
  customProperties:0,
  /* New metrics */
  deepSelectors:[],      /* Selectors with 4+ levels of nesting */
  highSpecificity:[],    /* Selectors with high specificity */
  duplicateProperties:0, /* Same property declared multiple times */
  mediaQueries:0,
  atlasClasses:0,        /* Mendix Atlas design system classes */
  customClasses:0,       /* Non-Atlas custom classes */
  colorVariables:0,
  spacingVariables:0,
  stylesheetSizes:[],    /* Size breakdown by stylesheet */
  vendorPrefixes:0,
  unusedClasses:[],
  duplicateSelectors:[]
};
var usedClasses=new Set();
var allDefinedClasses=new Set();
var selectorCounts={};

/* Atlas design system class prefixes */
var atlasPatterns=['btn-','badge-','alert-','card-','nav-','form-','table-','modal-','dropdown-','spacing-','text-','bg-','border-','rounded-','shadow-','flex-','grid-','col-','row-','mx-','widget-'];

/* Collect all classes used in DOM */
document.querySelectorAll("*").forEach(function(el){
var cn=el.className;
if(typeof cn==="string"&&cn){
  cn.split(/\s+/).forEach(function(c){
    if(c){
      usedClasses.add(c);
      /* Check if Atlas class */
      var isAtlas=atlasPatterns.some(function(p){return c.indexOf(p)===0});
      if(isAtlas)cssInfo.atlasClasses++;
      else if(c.length>2)cssInfo.customClasses++;
    }
  });
}
if(el.style&&el.style.cssText){
  cssInfo.inlineStyles++;
}
});

/* Calculate selector specificity */
function getSpecificity(selector){
  var ids=(selector.match(/#[a-zA-Z]/g)||[]).length;
  var classes=(selector.match(/\.[a-zA-Z]/g)||[]).length;
  var attrs=(selector.match(/\[[^\]]+\]/g)||[]).length;
  var pseudoClasses=(selector.match(/:[a-zA-Z]/g)||[]).length;
  var elements=(selector.match(/(?:^|[\s+>~])([a-zA-Z])/g)||[]).length;
  return{ids:ids,classes:classes+attrs+pseudoClasses,elements:elements,score:ids*100+classes*10+attrs*10+pseudoClasses*10+elements};
}

/* Get selector depth (nesting level) */
function getSelectorDepth(selector){
  return(selector.match(/\s+/g)||[]).length+1;
}

/* Analyze stylesheets */
try{
Array.from(document.styleSheets).forEach(function(sheet,sheetIdx){
cssInfo.totalStylesheets++;
var sheetInfo={name:'',rules:0,size:0};
try{
  sheetInfo.name=sheet.href?sheet.href.split('/').pop().split('?')[0]:'inline-'+sheetIdx;
}catch(e){sheetInfo.name='stylesheet-'+sheetIdx}

try{
var rules=sheet.cssRules||sheet.rules;
if(!rules)return;
sheetInfo.rules=rules.length;
cssInfo.totalRules+=rules.length;

Array.from(rules).forEach(function(rule){
  var ruleText=rule.cssText||'';
  sheetInfo.size+=ruleText.length;
  
  /* Count !important */
  var importantMatches=ruleText.match(/!important/g);
  if(importantMatches)cssInfo.importantCount+=importantMatches.length;
  
  /* Count CSS variables */
  if(ruleText.indexOf('--')>-1){
    cssInfo.customProperties++;
    if(ruleText.match(/--.*color/i))cssInfo.colorVariables++;
    if(ruleText.match(/--.*spacing|--.*margin|--.*padding/i))cssInfo.spacingVariables++;
  }
  
  /* Count vendor prefixes */
  if(ruleText.match(/-webkit-|-moz-|-ms-|-o-/))cssInfo.vendorPrefixes++;
  
  /* Media queries */
  if(rule.type===4)cssInfo.mediaQueries++;
  
  if(rule.selectorText){
    /* Track duplicate selectors */
    if(selectorCounts[rule.selectorText])selectorCounts[rule.selectorText]++;
    else selectorCounts[rule.selectorText]=1;
    
    /* Check selector depth */
    var depth=getSelectorDepth(rule.selectorText);
    if(depth>=4&&cssInfo.deepSelectors.length<10){
      cssInfo.deepSelectors.push({selector:rule.selectorText.substring(0,50),depth:depth});
    }
    
    /* Check specificity */
    var spec=getSpecificity(rule.selectorText);
    if(spec.ids>=2||spec.score>50){
      if(cssInfo.highSpecificity.length<10){
        cssInfo.highSpecificity.push({selector:rule.selectorText.substring(0,40),score:spec.score});
      }
    }
    
    /* Extract class names */
    var matches=rule.selectorText.match(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g);
    if(matches)matches.forEach(function(m){allDefinedClasses.add(m.substring(1))});
  }
});

cssInfo.stylesheetSizes.push(sheetInfo);
}catch(e){}
});
}catch(e){}

/* Sort stylesheets by size */
cssInfo.stylesheetSizes.sort(function(a,b){return b.size-a.size});

/* Find unused classes (only check mx- and widget- prefixes) */
allDefinedClasses.forEach(function(cls){
if((cls.indexOf("mx-")===0||cls.indexOf("widget-")===0)&&!usedClasses.has(cls)){
if(cssInfo.unusedClasses.length<20)cssInfo.unusedClasses.push(cls);
}
});

/* Find duplicate selectors */
Object.keys(selectorCounts).forEach(function(sel){
if(selectorCounts[sel]>1&&cssInfo.duplicateSelectors.length<10){
cssInfo.duplicateSelectors.push({selector:sel.substring(0,40),count:selectorCounts[sel]});
}
});

/* Sort high specificity by score */
cssInfo.highSpecificity.sort(function(a,b){return b.score-a.score});

i.css=cssInfo;
}();

/* ===== SECURITY ANALYSIS ===== */
!function(){
var sec=i.security;
var sensitiveKeywords=["password","secret","token","apikey","api_key","credential","ssn","creditcard","credit_card","cardnumber","cvv","pin","auth","private","encrypt","decrypt","admin","root","master"];
var revealingKeywords=["delete","remove","bypass","override","admin","sudo","force","hack","debug","test","skip","ignore","disable","unlock","reset","impersonate"];

/* Initialize extended security fields */
sec.httpOnlyCookies=0;
sec.secureCookies=0;
sec.totalCookies=0;
sec.mixedContent=[];
sec.externalScripts=[];
sec.localStorageSensitive=[];
sec.cspMissing=true;
sec.xFrameOptions="unknown";
sec.insecureProtocol=location.protocol!=="https:";

/* 1. Scan for exposed constants in global scope */
try{
var globalVars=Object.keys(window).filter(function(k){
try{return typeof window[k]==="string"&&window[k].length<200&&window[k].length>0}catch(e){return false}
});
globalVars.forEach(function(k){
var kLower=k.toLowerCase();
sensitiveKeywords.forEach(function(s){
if(kLower.indexOf(s)>-1&&sec.exposedConstants.length<10){
sec.exposedConstants.push({name:k,preview:String(window[k]).substring(0,30)+"..."});
}
});
});
}catch(e){}

/* v0.2.46 — Sections 2 & 3 (sensitive entity-name and revealing microflow-name
 * keyword scans) removed. These heuristics matched DOM class names against
 * keywords like 'admin' / 'delete' / 'reset' and produced noisy, low-signal
 * findings. Real entity security in Mendix lives in access rules, not class
 * naming. Fields remain as empty arrays for backwards compatibility. */

/* 4. Form & Input Security Analysis */
document.querySelectorAll("input,textarea,select").forEach(function(el){
var type=el.type||"text";
var name=(el.name||el.id||"").toLowerCase();
var issue=null;

/* Password autocomplete check */
if(type==="password"&&el.autocomplete!=="off"&&el.autocomplete!=="new-password"){
issue={type:"autocomplete",msg:"Password field allows autocomplete",element:el};
}
/* Missing maxlength on text inputs */
else if((type==="text"||type==="textarea")&&!el.maxLength&&!el.getAttribute("maxlength")){
var isSensitive=sensitiveKeywords.some(function(s){return name.indexOf(s)>-1});
if(isSensitive){
issue={type:"maxlength",msg:"Sensitive input '"+name+"' has no maxlength",element:el};
}
}
/* Hidden fields with sensitive names */
else if(type==="hidden"){
var isSensitive=sensitiveKeywords.some(function(s){return name.indexOf(s)>-1});
if(isSensitive&&el.value&&el.value.length>0){
issue={type:"hidden",msg:"Hidden field '"+name+"' contains data",element:el};
}
}

if(issue&&sec.formIssues.length<10){
sec.formIssues.push(issue);
}
});

/* 5. Check URL parameters for sensitive data */
try{
var params=new URLSearchParams(window.location.search);
params.forEach(function(value,key){
var kLower=key.toLowerCase();
sensitiveKeywords.forEach(function(s){
if(kLower.indexOf(s)>-1&&sec.urlParams.length<5){
sec.urlParams.push({key:key,hasValue:value.length>0});
}
});
});
}catch(e){}

/* 6. Check for known Mendix CVEs based on version */
var ver=i.version;
if(ver&&ver!=="?"&&ver!=="N/A"){
var verParts=ver.split(".");
var major=parseInt(verParts[0])||0;
var minor=parseInt(verParts[1])||0;
var patch=parseInt(verParts[2])||0;

/* Known CVEs - based on Siemens ProductCERT advisories */
var cves=[
{id:"CVE-2022-34467",desc:"Password bypass vulnerability",affected:function(M,m,p){return(M===7&&m<23)||(M===8&&m<18)||(M===9&&m<14)},severity:"high"},
{id:"CVE-2022-31257",desc:"Internal project structure exposure",affected:function(M,m,p){return(M===7&&m<23)||(M===8&&m<18)||(M===9&&m<11)},severity:"medium"},
{id:"CVE-2023-30548",desc:"Bypass of entity access rules for specific entities",affected:function(M,m,p){return(M<9)||(M===9&&m<24)},severity:"high"},
{id:"CVE-2023-46170",desc:"Information disclosure through error messages",affected:function(M,m,p){return(M<9)||(M===9&&m<24)},severity:"medium"},
{id:"CVE-2023-49069",desc:"Bypass of entity access control rules",affected:function(M,m,p){return(M<9)||(M===9&&m<24)},severity:"high"},
{id:"CVE-2024-21681",desc:"Remote code execution via crafted expressions",affected:function(M,m,p){return(M<9)||(M===9&&m<24)||(M===10&&m<6)},severity:"critical"},
{id:"CVE-2024-33500",desc:"Entity enumeration via client actions",affected:function(M,m,p){return(M===10&&m<21)||(M===9&&m<24)||(M===8&&m<18)},severity:"medium"},
{id:"CVE-2024-45468",desc:"Race condition in basic auth lockout",affected:function(M,m,p){return(M===10&&m<16)||(M===9&&m<24)||(M===8)},severity:"high"},
{id:"CVE-2024-50312",desc:"SAML signature validation bypass",affected:function(M,m,p){return M===10&&m>=12&&m<21},severity:"critical"}
];

cves.forEach(function(cve){
try{
if(cve.affected(major,minor,patch)){
sec.cveWarnings.push(cve);
}
}catch(e){}
});
}

/* 7. Extended Checks (Extension-only features) */
/* Check for external scripts loading from third-party domains.
 * v0.2.49 — Exclude browser-extension hostnames (32-char lowercase Chrome
 * extension IDs look like <code>a-p{32}</code>). Those get injected by other
 * extensions the user has installed; they are not related to the Mendix app
 * and just create noise in the Security panel. */
try{
var currentHost=location.hostname;
var extensionIdPattern=/^[a-p]{32}$/;
document.querySelectorAll("script[src]").forEach(function(s){
try{
var url=new URL(s.src,location.href);
if(url.hostname!==currentHost&&url.hostname.indexOf("mendix")===-1&&url.hostname.indexOf("mxcdn")===-1){
/* Skip Chrome extension content-script injections */
if(extensionIdPattern.test(url.hostname))return;
/* Skip chrome-extension:// protocol entirely */
if(url.protocol==="chrome-extension:"||url.protocol==="moz-extension:")return;
if(sec.externalScripts.length<5&&sec.externalScripts.indexOf(url.hostname)===-1){sec.externalScripts.push(url.hostname)}
}
}catch(e){}
});
}catch(e){}

/* Check for mixed content (HTTP resources on HTTPS page) */
if(location.protocol==="https:"){
document.querySelectorAll('img[src^="http:"],script[src^="http:"],link[href^="http:"],iframe[src^="http:"]').forEach(function(el){
if(sec.mixedContent.length<5)sec.mixedContent.push(el.tagName.toLowerCase());
});
}

/* Check localStorage for sensitive data */
try{
Object.keys(localStorage).forEach(function(k){
var kLower=k.toLowerCase();
sensitiveKeywords.forEach(function(s){
if(kLower.indexOf(s)>-1&&sec.localStorageSensitive.length<5){
sec.localStorageSensitive.push(k);
}
});
});
}catch(e){}

/* Check for clickjacking protection via X-Frame-Options or CSP */
try{
var meta=document.querySelector('meta[http-equiv="Content-Security-Policy"]');
if(meta&&meta.content.indexOf("frame-ancestors")>-1)sec.cspMissing=false;
}catch(e){}

/* Calculate security score */
sec.score=100;
if(sec.exposedConstants.length>0)sec.score-=sec.exposedConstants.length*5;
if(sec.formIssues.length>0)sec.score-=sec.formIssues.length*5;
if(sec.urlParams.length>0)sec.score-=sec.urlParams.length*10;
if(sec.cveWarnings.length>0)sec.score-=sec.cveWarnings.length*15;
if(sec.mixedContent.length>0)sec.score-=5;
if(sec.localStorageSensitive.length>0)sec.score-=sec.localStorageSensitive.length*3;
if(sec.insecureProtocol)sec.score-=15;
if(sec.externalScripts.length>2)sec.score-=5;
sec.score=Math.max(0,sec.score);

/* v0.2.43 — extended security findings via window.__MxSecurity.
 * Loaded as a separate module. Safe to skip if not present. */
try{
if(window.__MxSecurity){
var mxsec=window.__MxSecurity.detect();
sec.mendixConstants=mxsec.constants;
sec.demoUsers=mxsec.demoUsers;
sec.anonymous=mxsec.anonymous;
sec.devMode=mxsec.devMode;
sec.writableSensitive=mxsec.writableSensitiveEntities;
/* v0.2.44 — env-aware score impact.
 * Production environments get heavy deductions for demo users / dev mode /
 * writable sensitive entities. Dev environments get no deduction (demo users
 * in dev are normal), just surfaced as a warning banner.
 * i.envType is set earlier ('Production','Acceptance','Test','Development'...) */
var isProd=/prod/i.test(i.envType||"");
var isDev=/dev|test|accept/i.test(i.envType||"");
sec.envIsProd=isProd;
sec.envIsDev=isDev;
if(mxsec.constants&&mxsec.constants.secrets>0)sec.score-=mxsec.constants.secrets*8;
if(mxsec.constants&&mxsec.constants.sensitive>0)sec.score-=mxsec.constants.sensitive*3;
/* Demo users: NO score impact on dev, HUGE on prod */
if(mxsec.demoUsers&&mxsec.demoUsers.count>0){
  if(isProd)sec.score-=Math.min(40,mxsec.demoUsers.count*8);
  /* else: no deduction, just the banner below */
}
if(mxsec.devMode&&mxsec.devMode.confidence==="high"){
  if(isProd)sec.score-=20;else sec.score-=5;
}
if(mxsec.writableSensitive&&mxsec.writableSensitive.withWrites>0){
  if(isProd)sec.score-=mxsec.writableSensitive.withWrites*10;
  else sec.score-=mxsec.writableSensitive.withWrites*3;
}
sec.score=Math.max(0,sec.score);
}
}catch(ex){console.warn("[MXI] Security module detect() threw:",ex);}

/* Store highlight targets */
if(sec.formIssues.length>0){
i.highlightTargets.formIssues=sec.formIssues.map(function(e){return e.element});
}
}();

/* Warnings - with balanced nesting scoring */
!function(){
/* First, determine load time severity (used as multiplier for nesting) */
var loadMultiplier = 1; /* Base multiplier */
if(i.loadTime > 4000) loadMultiplier = 2.5; /* Severe - nesting really hurts */
else if(i.loadTime > 2500) loadMultiplier = 1.8;
else if(i.loadTime > 1500) loadMultiplier = 1.2;
else if(i.loadTime < 800) loadMultiplier = 0.3; /* Fast load - nesting is fine! */
else if(i.loadTime < 1200) loadMultiplier = 0.6;

/* Load time warnings */
if(i.loadTime>4e3)a("error","Critical load: "+o(i.loadTime),10);else if(i.loadTime>2e3)a("warning","Slow load: "+o(i.loadTime),5);

/* DOM warnings */
if(i.domNodes>4e3)a("error","High DOM: "+i.domNodes,10);else if(i.domNodes>2e3)a("warning","DOM: "+i.domNodes,3);

/* Memory warnings */
if(i.jsHeap>150)a("error","Memory: "+i.jsHeap+"MB",8);else if(i.jsHeap>75)a("warning","Memory: "+i.jsHeap+"MB",3);

/* BALANCED NESTING SCORING */
/* v0.2.60 — insight severities aligned with the new Nested Data Views tile
 * color logic in Data Containers section:
 *   Normal (depth 2):  white when load OK (no insight)     → yellow/warning when slow
 *   Deep   (depth 3+): orange/warning when load OK         → red/error when slow
 * The load-based scoring multiplier still applies so penalties scale with
 * how much the page actually hurts. */
var loadSlow = i.loadTime > 2000;
var criticalNestingCount = i.nestedDataViewsCritical.length;
var warningNestingCount = i.nestedDataViewsWarning.length;

if (criticalNestingCount > 0) {
  var basePenaltyC = Math.min(criticalNestingCount * 3, 15);
  var adjustedPenaltyC = Math.round(basePenaltyC * loadMultiplier);
  adjustedPenaltyC = Math.min(adjustedPenaltyC, 30);
  if (loadSlow) {
    a("error", criticalNestingCount + " deeply nested data views — slowing page", adjustedPenaltyC, "nestedDataViewsCritical");
  } else {
    /* Fast load but 3+ deep is still a code smell — warning, not error */
    a("warning", criticalNestingCount + " deeply nested data views (code smell)", Math.min(adjustedPenaltyC, 8), "nestedDataViewsCritical");
  }
}

if (warningNestingCount > 0 && criticalNestingCount === 0) {
  var basePenaltyW = Math.min(warningNestingCount * 2, 8);
  var adjustedPenaltyW = Math.round(basePenaltyW * loadMultiplier);
  adjustedPenaltyW = Math.min(adjustedPenaltyW, 15);
  if (loadSlow) {
    /* Only surface Normal nesting when the page is actually slow. If load
     * is fast, nesting at depth 2 is expected Mendix building — no insight. */
    a("warning", warningNestingCount + " nested data views — may be slowing page", adjustedPenaltyW, "nestedDataViewsWarning");
  }
}

/* v0.2.64 — Runtime DS_ call insight. If a single DS_ microflow fired
 * many times on one page load, it's almost always because it sits inside
 * a repeating container (ListView row → DataView → DS_). This is the
 * concrete proof of the "DS_ + nesting" performance anti-pattern the
 * Data Sources section was built to expose.
 *
 * v0.2.67 — Also apply to Mendix 10 runtimeOperations. Even without a
 * microflow name, a repeat-calling opId is the same red flag. */
if (i.dataSourceCalls) {
  var repeatedDS = (i.dataSourceCalls.microflows || []).filter(function(mf){return mf.count > 5});
  var moderatelyRepeatedDS = (i.dataSourceCalls.microflows || []).filter(function(mf){return mf.count > 2 && mf.count <= 5});
  if (repeatedDS.length > 0) {
    var worst = repeatedDS.reduce(function(a,b){return a.count>b.count?a:b});
    var shortName = (worst.name.split(".").pop() || worst.name);
    a("error", shortName + " called " + worst.count + "× on load — likely nested", Math.min(repeatedDS.length * 3, 10));
  } else if (moderatelyRepeatedDS.length > 0 && loadSlow) {
    a("warning", moderatelyRepeatedDS.length + " DS_ microflow(s) called multiple times", Math.min(moderatelyRepeatedDS.length, 4));
  }

  /* Mendix 10 runtime operations — same pattern, opaque IDs */
  var repeatedOps = (i.dataSourceCalls.operations || []).filter(function(op){return op.count > 5});
  var moderatelyRepeatedOps = (i.dataSourceCalls.operations || []).filter(function(op){return op.count > 2 && op.count <= 5});
  if (repeatedOps.length > 0) {
    var worstOp = repeatedOps.reduce(function(a,b){return a.count>b.count?a:b});
    var opShort = worstOp.opId.length > 10 ? worstOp.opId.substring(0,10)+"…" : worstOp.opId;
    a("error", "Operation " + opShort + " called " + worstOp.count + "× on load — likely nested", Math.min(repeatedOps.length * 3, 10));
  } else if (moderatelyRepeatedOps.length > 0 && loadSlow) {
    a("warning", moderatelyRepeatedOps.length + " operation(s) called multiple times", Math.min(moderatelyRepeatedOps.length, 4));
  }
}

var lvDvRatio=i.listViews>0?Math.round(i.dataViews/i.listViews):0;
if(i.listViews>0&&lvDvRatio>10)a("warning","LV multiplier: "+i.dataViews+" DVs from "+i.listViews+" LVs",Math.round(3*loadMultiplier));

/* Tree nodes - always a warning since they're recursive */
if(i.treeNodes>0)a("warning","Tree nodes (recursive - monitor carefully)",Math.round(Math.min(i.treeNodes*2,8)*loadMultiplier));

if(i.slowRequests.length)a("warning",i.slowRequests.length+" slow requests",3);
/* v0.2.62 — Main-score a11y deductions rebalanced. v0.2.61 scaled these
 * aggressively (up to 15pts each) and added 4 new categories, which
 * crushed the main score on any imperfect page (85 → 39 in user testing).
 * The internal a11y score (e.score) keeps its strict calculation so the
 * WCAG level badge still honestly says "Partial" when appropriate — but
 * the MAIN score now caps a11y's total contribution at ~25-30pts so
 * performance, security, and nesting aren't drowned out.
 *
 * Budget targets for the main 100-pt score:
 *   Performance: ~25   Security: ~35 (CVEs matter)
 *   Nesting:     ~20   A11y:     ~25-30 */
if(i.a11y.missingAltText)a("error",i.a11y.missingAltText+" missing alt text",Math.min(i.a11y.missingAltText,5),"missingAlt");
if(i.a11y.missingLabels)a("error",i.a11y.missingLabels+" form fields without labels",Math.min(i.a11y.missingLabels,5),"missingLabels");
if(i.a11y.contrastIssues)a("error",i.a11y.contrastIssues+" contrast issues",Math.min(i.a11y.contrastIssues,4),"contrastIssues");
if(i.a11y.targetSizeIssues)a("error",i.a11y.targetSizeIssues+" targets below 24×24 (WCAG 2.2 AA)",Math.min(i.a11y.targetSizeIssues,3),"targetSizeIssues");
if(i.a11y.noAccessibleName)a("error",i.a11y.noAccessibleName+" button(s)/link(s) without accessible name",Math.min(i.a11y.noAccessibleName*2,5),"noAccessibleName");
if(i.a11y.iframeTitleMissing)a("error",i.a11y.iframeTitleMissing+" iframe(s) missing title",Math.min(i.a11y.iframeTitleMissing,2),"iframeTitleMissing");
if(i.a11y.smallFontSize)a("warning",i.a11y.smallFontSize+" small fonts (<12px)",1,"smallFontSize");
if(i.a11y.emptyLinks)a("warning",i.a11y.emptyLinks+" empty links",Math.min(i.a11y.emptyLinks,2),"emptyLinks");
if(i.a11y.headingSkips)a("warning",i.a11y.headingSkips+" heading level skip(s)",Math.min(i.a11y.headingSkips,2),"headingSkips");
if(i.a11y.focusIssues)a("warning",i.a11y.focusIssues+" element(s) without visible focus",Math.min(i.a11y.focusIssues,2),"focusIssues");
if(i.a11y.duplicateIds)a("error",i.a11y.duplicateIds+" duplicate IDs",Math.min(i.a11y.duplicateIds,2),"duplicateIds");
if(i.a11y.positiveTabindex)a("warning",i.a11y.positiveTabindex+" positive tabindex (anti-pattern)",1,"positiveTabindex");
if(i.a11y.smallTouchTargets>5)a("info",i.a11y.smallTouchTargets+" small mobile targets (<44px AAA)",1,"smallTargets");
/* Summary line: severity by WCAG level, not raw score */
var a11yType;
if(i.a11y.wcagLevel==="AAA Compliant"||i.a11y.wcagLevel==="AA Compliant")a11yType="success";
else if(i.a11y.wcagLevel==="A Compliant")a11yType="warning";
else a11yType="error";
a(a11yType,"A11y: "+i.a11y.score+"/100 ("+i.a11y.wcagLevel+")",0);
/* Security warnings */
if(i.security.cveWarnings.length)a("error",icon("shield",11)+" "+i.security.cveWarnings.length+" known CVE(s) for v"+i.version,15);
if(i.security.exposedConstants.length)a("warning",icon("shield",11)+" "+i.security.exposedConstants.length+" exposed constant(s) in JS",5);
if(i.security.formIssues.length)a("warning",icon("shield",11)+" "+i.security.formIssues.length+" form security issue(s)",5,"formIssues");
if(i.security.urlParams.length)a("error",icon("shield",11)+" "+i.security.urlParams.length+" sensitive URL param(s)",10);
/* v0.2.43 — extended security warnings */
if(i.security.mendixConstants&&i.security.mendixConstants.secrets>0)a("error",icon("shield",11)+" "+i.security.mendixConstants.secrets+" Mendix constant(s) look like secrets",8);
if(i.security.mendixConstants&&i.security.mendixConstants.sensitive>0)a("warning",icon("shield",11)+" "+i.security.mendixConstants.sensitive+" Mendix constant(s) look sensitive",3);
/* v0.2.53 — Demo users severity depends on environment:
 *   - Dev / Local / Sandbox: yellow warning (demo users are expected here)
 *   - Acceptance / Test / Production: red error (credentials leak is real)
 * The envType classification comes from detectMendixMeta(). We match only
 * true dev-style environments here, so Acceptance correctly falls through
 * to the error branch. */
if(i.security.demoUsers&&i.security.demoUsers.count>0){
  var demoIsDev=/^(local|sandbox|development|dev)$/i.test(i.envType||"");
  if(demoIsDev){
    a("warning",icon("shield",11)+" "+i.security.demoUsers.count+" demo user(s) exposed (dev environment)",0);
  } else {
    a("error",icon("shield",11)+" "+i.security.demoUsers.count+" demo user(s) exposed in session",10);
  }
}
if(i.security.anonymous&&i.security.anonymous.anonymous)a("warning",icon("shield",11)+" Anonymous session detected",0);
if(i.security.devMode&&i.security.devMode.confidence==="high")a("warning",icon("shield",11)+" Development mode indicators detected",5);
if(i.security.writableSensitive&&i.security.writableSensitive.withWrites>0)a("error",icon("shield",11)+" "+i.security.writableSensitive.withWrites+" sensitive entity/ies writable by current session",10);
if(i.consoleErrors)a("error",i.consoleErrors+" errors visible",3);
if(i.score>=90)a("success","Well optimized!",0);
i.score=Math.max(0,i.score)}();

}catch(ex){i.page="Error: "+ex.message;console.error("MXI:",ex)}

c||(i.version="N/A",i.client="Not Mendix");

/* ===== UI - REOWN / NORGRAM INSPIRED ===== */
/* Two-tone grays with yellow/orange/blue/green accents */
var m="#FF5A5A",p="#FF7A50",g="#3DDC97",u="#FFB800",x="#666666",h="#FFFFFF",f="#9A9A9A",y="#1A1A1A",v="#242424",b="#2E2E2E",w="#141414",k="#FFB800",bl="#3B99FC",gr="#3DDC97";

var existing=document.getElementById("mx-inspector-pro");if(existing)existing.remove();
var A=document.createElement("div");A.id="mx-inspector-pro";

function icon(name,sz){return'<span class="mxi-icon" style="width:'+(sz||16)+'px;height:'+(sz||16)+'px">'+IC[name]+'</span>'}
/* v0.2.47 — Rich tooltip system.
 * Each TIPS entry is an object: { what, aim, details? }.
 *   what    — one-sentence definition of the metric
 *   aim     — concrete target value(s) / threshold(s) to aim for
 *   details — optional array of supplementary bullet points
 * The tip() helper emits the trigger button + a hidden popover. Hover-toggled
 * via CSS, no JavaScript wiring needed. Styled like the main score info popover. */
function tip(key){
  var t = TIPS[key];
  if (!t) return "";
  /* Back-compat: strings are treated as 'what' with no aim */
  if (typeof t === 'string') t = { what: t };
  /* v0.2.52 — CRITICAL FIX: this was `<span class="mxi-tip">?<div...>`, which
   * is INVALID HTML. Browsers auto-close the span before the div, so the
   * .mxi-tip-pop was rendered as a SIBLING of .mxi-tip instead of a child.
   * That's why every tooltip attempt since v0.2.47 silently failed:
   * querySelector(".mxi-tip-pop") on the tip returned null, and CSS
   * :hover .mxi-tip-pop never matched. Using a div container fixes this. */
  var html = '<div class="mxi-tip"><span class="mxi-tip-mark">?</span><div class="mxi-tip-pop" role="tooltip">';
  if (t.what) html += '<div class="mxi-tip-line"><strong>What it is</strong><br>' + t.what + '</div>';
  if (t.aim)  html += '<div class="mxi-tip-line"><strong>Aim for</strong><br>' + t.aim + '</div>';
  if (t.details && t.details.length) {
    html += '<div class="mxi-tip-line"><strong>Details</strong><ul>';
    t.details.forEach(function(d){ html += '<li>' + d + '</li>'; });
    html += '</ul></div>';
  }
  html += '</div></div>';
  return html;
}
function section(id,title,ico,content,open,headerExtra){return'<div class="mxi-section'+(open?" open":"")+'" data-section-id="'+id+'"><div class="mxi-section-header" onclick="(function(e){if(e.target.closest(\'.mxi-section-header-extra\'))return;var s=e.target.closest(\'.mxi-section\'),c=s.querySelector(\'.mxi-section-content\'),a=s.querySelector(\'.mxi-arrow\');var o=c.style.display!==\'none\';c.style.display=o?\'none\':\'block\';a.style.transform=o?\'rotate(-90deg)\':\'rotate(0)\';s.classList.toggle(\'open\',!o)})(event)"><span class="mxi-arrow" style="transform:'+(open?"rotate(0)":"rotate(-90deg)")+'">▼</span>'+icon(ico,14)+'<span style="margin-left:6px">'+title+'</span>'+(headerExtra||'')+'</div><div class="mxi-section-content" style="display:'+(open?"block":"none")+'">'+content+"</div></div>"}
function metric(label,value,color,tipKey){return'<div class="mxi-metric">'+(tipKey?tip(tipKey):"")+'<div class="mxi-metric-value" style="color:'+(color||f)+'">'+value+'</div><div class="mxi-metric-label">'+label+"</div></div>"}
/* v0.2.55 — highlightMetric: clickable metric tile backed by a pre-computed
 * element array (i.highlightTargets[key]) instead of a CSS selector. Used
 * for accessibility metrics where the offending elements are identified at
 * scan time and can't be reliably re-found via a selector (contrast issues,
 * small fonts, empty links, etc.). Renders as clickable + eye-iconed when
 * there are actual targets to highlight, otherwise falls back to plain
 * metric() so zero-issue tiles stay quiet.
 * v0.2.56 — Eye icon moved to top-right corner as its own absolute element,
 * bigger (14px) and more visible. */
function highlightMetric(label,value,color,tipKey,highlightKey,severity){
  var targets=i.highlightTargets&&i.highlightTargets[highlightKey];
  if(!targets||!targets.length)return metric(label,value,color,tipKey);
  return '<div class="mxi-metric mxi-metric-clickable mxi-metric-highlight" data-highlight-key="'+esc(highlightKey)+'" data-severity="'+(severity||"warning")+'" data-label="'+esc(label)+'"><span class="mxi-eye-badge" aria-hidden="true">'+icon("eye",14)+'</span>'+(tipKey?tip(tipKey):"")+'<div class="mxi-metric-value" style="color:'+(color||f)+'">'+value+'</div><div class="mxi-metric-label">'+esc(label)+"</div></div>";
}
function clickableMetric(label,value,selector,color,tipKey){
var count=typeof value==="number"?value:parseInt(value)||0;
if(count===0)return metric(label,value,color,tipKey);
/* Use single quotes in selector to avoid HTML attribute escaping issues */
var safeSelector=selector.replace(/"/g,"'");
/* v0.2.48 — removed the native title="Click to highlight ..." attribute. It was
 * shadowing the rich ? tooltip: users saw the browser's delayed native tooltip
 * and missed the ? badge entirely. The eye icon + hover border already signals
 * the metric is clickable, and the rich popover explains what the metric means.
 * v0.2.56 — Eye icon moved to top-right corner as its own absolute element,
 * bigger (14px) and more visible. */
return'<div class="mxi-metric mxi-metric-clickable" data-selector="'+safeSelector+'" data-label="'+label+'"><span class="mxi-eye-badge" aria-hidden="true">'+icon("eye",14)+'</span>'+(tipKey?tip(tipKey):"")+'<div class="mxi-metric-value" style="color:'+(color||f)+'">'+value+'</div><div class="mxi-metric-label">'+label+"</div></div>"}
function tag(text,bg,color){return'<span class="mxi-tag" style="background:'+(bg||v)+';color:'+(color||f)+'">'+text+"</span>"}
function scoreColor(s){return s>=80?gr:s>=60?k:m}
function envIcon(type){return type==="Local"?"🟢":type==="Sandbox"?"🟡":type==="Acceptance"?"🟠":type==="Test"?"🔵":"🔴"}

var insightsHtml="";
if(i.warnings.length){
  insightsHtml='<div class="mxi-insights">';
  i.warnings.forEach(function(w){
    var hl=w.highlightKey&&i.highlightTargets[w.highlightKey];
    var aware=w.highlightKey&&A11Y_AWARENESS[w.highlightKey];
    var classes="mxi-insight "+w.type+(hl?" mxi-insight-clickable":"")+(aware?" mxi-insight-has-aware":"");
    var dataAttrs=(hl?' data-highlight-key="'+w.highlightKey+'" data-severity="'+w.type+'"':"");
    insightsHtml+='<div class="'+classes+'"'+dataAttrs+'>';
    /* Row — existing dot + text + optional info/eye, wrapped so the
     * aware panel can sit below without breaking flex alignment. */
    insightsHtml+='<div class="mxi-insight-row">';
    insightsHtml+='<span class="mxi-insight-dot"></span>';
    insightsHtml+='<span class="mxi-insight-text">'+w.msg+'</span>';
    if(aware){
      insightsHtml+='<button class="mxi-insight-info-btn" type="button" aria-label="Why this matters" title="Why this matters">'+icon("info",13)+'</button>';
    }
    if(hl){
      insightsHtml+='<span class="mxi-insight-eye" aria-hidden="true">'+icon("eye",14)+'</span>';
    }
    insightsHtml+='</div>';
    /* Collapsed aware panel — shown when .expanded class is set on the
     * parent insight. v0.2.63 — explains who and why for each finding. */
    if(aware){
      insightsHtml+='<div class="mxi-insight-aware">';
      insightsHtml+='<div class="mxi-aware-line"><strong>Who this affects</strong><br>'+esc(aware.who)+'</div>';
      insightsHtml+='<div class="mxi-aware-line"><strong>Why it matters</strong><br>'+esc(aware.why)+'</div>';
      if(aware.wcag){
        insightsHtml+='<div class="mxi-aware-line mxi-aware-wcag">'+esc(aware.wcag)+'</div>';
      }
      insightsHtml+='</div>';
    }
    insightsHtml+='</div>';
  });
  insightsHtml+='</div>';
}

function renderTree(node,d){if(!node||d>3)return"";var indent=d*16;var ti=node.type==="dv"?"📋":node.type==="lv"?"📜":node.type==="sn"?"📦":"▪️";var html='<div style="margin-left:'+indent+'px;padding:3px 0;font-size:12px">'+ti+" "+esc(node.name)+"</div>";if(node.children)node.children.forEach(function(c){html+=renderTree(c,d+1)});return html}
var treeHtml=i.widgetTree?renderTree(i.widgetTree,0):'<div style="color:'+x+'">No tree</div>';

var a11yImpr="";if(i.a11y.improvements.length){a11yImpr='<div class="mxi-improvements"><div class="mxi-impr-title">'+icon("bulb",14)+' How to improve:</div><ul>';i.a11y.improvements.slice(0,5).forEach(function(imp){a11yImpr+="<li>"+imp+"</li>"});a11yImpr+="</ul></div>"}

var css='<style>@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap");#mx-inspector-pro{position:fixed;top:20px;right:20px;width:432px;max-height:92vh;background:'+w+';border-radius:20px;box-shadow:0 0 0 1px '+b+',0 25px 80px rgba(0,0,0,.6);font-family:Geist,Inter,system-ui,-apple-system,sans-serif;font-size:13px;z-index:999999;overflow:hidden;display:flex;flex-direction:column}#mx-inspector-pro *{box-sizing:border-box}.mxi-icon{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;flex-shrink:0}.mxi-header{padding:20px 24px 20px 20px;border-bottom:1px solid '+b+';background:'+w+';cursor:move;user-select:none}.mxi-header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.mxi-logo{display:flex;align-items:center;gap:14px}.mxi-title{font-weight:600;font-size:14px;color:'+h+';letter-spacing:-.2px;margin-right:12px}.mxi-badge{font-size:10px;padding:4px 10px;border-radius:8px;font-weight:500;background:'+y+';color:'+f+';border:1px solid '+b+'}.mxi-badge-accent{background:transparent;border:1px solid #FF7A50;color:#FF7A50}.mxi-header-buttons{display:flex;align-items:center;gap:6px}.mxi-icon-btn{background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;color:#666666;display:flex;align-items:center;justify-content:center;transition:all .2s;position:relative}.mxi-icon-btn:hover{background:#242424;color:#FFFFFF}.mxi-icon-btn svg{width:16px;height:16px;fill:currentColor}.mxi-info-tooltip{position:absolute;top:100%;right:0;margin-top:8px;background:#1A1A1A;color:#FFFFFF;padding:14px 16px;border-radius:12px;font-size:11px;width:240px;white-space:normal;opacity:0;visibility:hidden;transition:all .2s;z-index:1000;font-weight:400;border:1px solid #2E2E2E;box-shadow:0 10px 40px rgba(0,0,0,.5)}.mxi-info-tooltip.show{opacity:1;visibility:visible}.mxi-info-tooltip strong{color:#FFB800}.mxi-info-tooltip a{color:#3B99FC;text-decoration:none}.mxi-info-tooltip a:hover{text-decoration:underline}.mxi-info-line{margin-bottom:8px;line-height:1.5}.mxi-info-line:last-child{margin-bottom:0}.mxi-coffee-btn{display:inline-flex;align-items:center;gap:6px;background:#FFB800;color:#141414;padding:8px 14px;border-radius:8px;font-weight:600;font-size:11px;margin-top:10px;text-decoration:none!important;-webkit-text-fill-color:#141414}.mxi-coffee-btn:hover{background:#ffcc33;text-decoration:none!important}.mxi-coffee-btn svg{width:14px;height:14px;fill:#141414}.mxi-env{background:'+y+';border:1px solid '+b+';border-radius:12px;padding:12px 14px;font-size:11px;display:flex;align-items:center;gap:10px;color:'+f+'}.mxi-env-url{color:'+k+';flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}.mxi-body{flex:1;overflow-y:auto;padding:16px;background:'+w+'}.mxi-score{display:flex;align-items:center;gap:16px;padding:20px;background:'+y+';border-radius:16px;margin-bottom:12px;border:1px solid '+b+'}.mxi-score-circle{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:'+w+'}.mxi-score-info{flex:1}.mxi-score-label{font-size:14px;font-weight:600;color:'+h+'}.mxi-score-desc{font-size:11px;color:'+x+';margin-top:4px}.mxi-page-info{background:'+y+';border-radius:16px;padding:16px;margin-bottom:12px;border:1px solid '+b+'}.mxi-page-row{display:flex;gap:12px;align-items:center}.mxi-page-main{flex:1;min-width:0}.mxi-page-module{font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;font-weight:500}.mxi-page-name{font-size:13px;font-weight:600;color:'+h+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mxi-page-popup{font-size:9px;background:'+p+';color:'+w+';padding:3px 8px;border-radius:6px;margin-left:8px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}.mxi-copy-btn{background:'+y+';border:1px solid '+b+';color:'+f+';width:40px;height:40px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}.mxi-copy-btn:hover{background:'+k+';border-color:'+k+';color:'+w+'}.mxi-copy-btn svg{width:14px;height:14px}.mxi-section{margin-bottom:8px;background:'+y+';border-radius:16px;border:1px solid '+b+'}.mxi-section-header{display:flex;align-items:center;gap:8px;padding:14px 16px;cursor:pointer;font-weight:500;font-size:12px;color:'+h+';user-select:none;letter-spacing:-.2px;border-radius:15px;transition:background .15s}.mxi-section-header:hover{background:'+v+'}.mxi-section.open .mxi-section-header{background:transparent}.mxi-section.open .mxi-section-header:hover{background:transparent}.mxi-arrow{font-size:10px;color:'+x+';transition:transform .2s;margin-right:4px}.mxi-section-content{padding:0 16px 16px}.mxi-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.mxi-metrics-3{grid-template-columns:repeat(3,1fr)}.mxi-metrics-5{grid-template-columns:repeat(5,1fr)}.mxi-metrics-2{grid-template-columns:repeat(2,1fr)}.mxi-metric{background:'+v+';border-radius:10px;padding:12px 8px;text-align:center;position:relative;min-width:0}.mxi-metric-clickable{cursor:pointer;transition:all .2s;border:1px solid transparent}.mxi-metric-clickable:hover{background:'+y+';border-color:rgba(255,255,255,.18);transform:translateY(-2px)}.mxi-metric-clickable:hover .mxi-metric-label{color:#FFFFFF}.mxi-metric-highlight[data-severity="warning"]:hover{border-color:'+k+'}.mxi-metric-highlight[data-severity="warning"]:hover .mxi-metric-label{color:'+k+'}.mxi-eye-badge{position:absolute;top:4px;right:4px;width:20px;height:20px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border-radius:5px;color:#808080;transition:background .15s,color .15s,transform .15s;pointer-events:none}.mxi-eye-badge svg{width:14px;height:14px}.mxi-metric-clickable:hover .mxi-eye-badge{background:rgba(255,255,255,.14);color:#FFFFFF;transform:scale(1.05)}.mxi-metric-highlight[data-severity="warning"] .mxi-eye-badge{background:rgba(255,184,0,.18);color:#FFB800}.mxi-metric-highlight[data-severity="warning"]:hover .mxi-eye-badge{background:#FFB800;color:#141414}.mxi-metric-highlight[data-severity="notice"] .mxi-eye-badge{background:rgba(255,122,80,.2);color:#FF7A50}.mxi-metric-highlight[data-severity="notice"]:hover .mxi-eye-badge{background:#FF7A50;color:#141414}.mxi-metric-highlight[data-severity="notice"]:hover{border-color:#FF7A50}.mxi-metric-highlight[data-severity="notice"]:hover .mxi-metric-label{color:#FF7A50}.mxi-metric-highlight[data-severity="error"] .mxi-eye-badge{background:rgba(255,90,90,.18);color:#FF5A5A}.mxi-metric-highlight[data-severity="error"]:hover .mxi-eye-badge{background:#FF5A5A;color:#141414}.mxi-metric-highlight[data-severity="error"]:hover{border-color:#FF5A5A}.mxi-metric-highlight[data-severity="error"]:hover .mxi-metric-label{color:#FF5A5A}.mxi-metric-value{font-size:14px;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:'+h+'}.mxi-metric-label{font-size:9px;color:'+x+';margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:uppercase;letter-spacing:.5px}.mxi-tip{position:absolute;bottom:3px;right:3px;width:14px;height:14px;cursor:help}.mxi-metric:has(.mxi-tip:hover){z-index:100}.mxi-tip-mark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.06);border-radius:4px;font-size:9px;font-weight:700;color:#808080;transition:background .15s,color .15s}.mxi-tip:hover .mxi-tip-mark{background:'+k+';color:#141414}.mxi-tip-pop{position:absolute;bottom:calc(100% + 6px);right:0;min-width:220px;max-width:280px;background:#1A1A1A;color:#FFFFFF;padding:14px 16px;border-radius:12px;font-size:11px;font-weight:400;line-height:1.5;white-space:normal;text-align:left;text-transform:none;letter-spacing:0;opacity:0;visibility:hidden;transition:opacity .15s,visibility .15s;z-index:100;border:1px solid #2E2E2E;box-shadow:0 10px 40px rgba(0,0,0,.5);pointer-events:none}.mxi-tip:hover .mxi-tip-pop{opacity:1;visibility:visible}.mxi-tip-line{margin-bottom:10px}.mxi-tip-line:last-child{margin-bottom:0}.mxi-tip-line strong{color:#FFB800;font-weight:600;display:inline-block;margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:.5px}.mxi-tip-line ul{margin:4px 0 0 0;padding-left:16px;color:#B8B8B8}.mxi-tip-line li{margin-bottom:3px}.mxi-tip-line code{background:#0A0A0A;color:#FFB800;padding:1px 5px;border-radius:3px;font-size:10px}.mxi-insights{display:flex;flex-direction:column;gap:6px}.mxi-insight{display:flex;flex-direction:column;padding:12px 14px;border-radius:12px;font-size:12px;line-height:1.5;background:'+v+';border:1px solid transparent}.mxi-insight-row{display:flex;align-items:flex-start;gap:12px}.mxi-insight-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}.mxi-insight.error{background:rgba(255,90,90,.08);border-color:rgba(255,90,90,.2)}.mxi-insight.error .mxi-insight-dot{background:'+m+'}.mxi-insight.warning{border-color:rgba(255,184,0,.2)}.mxi-insight.warning .mxi-insight-dot{background:'+k+'}.mxi-insight.info{border-color:rgba(59,153,252,.25)}.mxi-insight.info .mxi-insight-dot{background:#3B99FC}.mxi-insight.success .mxi-insight-dot{background:#3DDC97}.mxi-insight-text{flex:1;color:'+f+'}.mxi-insight.error .mxi-insight-text{color:#FF8A8A}.mxi-insight-clickable .mxi-insight-row{cursor:pointer;transition:transform .2s}.mxi-insight-clickable:hover{background:'+y+'}.mxi-insight-clickable:hover .mxi-insight-row{transform:translateX(2px)}.mxi-insight-clickable.active{background:'+k+'!important;border-color:'+k+'!important}.mxi-insight-clickable.active .mxi-insight-text{color:'+w+'!important}.mxi-insight-clickable.active .mxi-insight-dot{background:'+w+'!important}.mxi-insight-clickable.active .mxi-insight-eye{color:'+w+'!important}.mxi-insight .mxi-insight-eye{color:'+x+';flex-shrink:0}.mxi-insight-info-btn{background:rgba(255,255,255,.06);border:1px solid transparent;width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#9A9A9A;padding:0;transition:background .15s,color .15s,border-color .15s;flex-shrink:0}.mxi-insight-info-btn:hover{background:rgba(255,255,255,.14);color:#FFFFFF}.mxi-insight-info-btn svg{width:13px;height:13px;fill:currentColor}.mxi-insight.expanded .mxi-insight-info-btn{background:'+b+';color:#FFFFFF;border-color:rgba(255,255,255,.18)}.mxi-insight.warning.expanded .mxi-insight-info-btn{border-color:'+k+'}.mxi-insight.error.expanded .mxi-insight-info-btn{border-color:'+m+'}.mxi-insight.info.expanded .mxi-insight-info-btn{border-color:#3B99FC}.mxi-insight.success.expanded .mxi-insight-info-btn{border-color:#3DDC97}.mxi-insight-aware{display:none;margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08);font-size:11.5px;line-height:1.55;color:#B8B8B8}.mxi-insight.expanded .mxi-insight-aware{display:block}.mxi-aware-line{margin-bottom:10px}.mxi-aware-line:last-child{margin-bottom:0}.mxi-aware-line strong{color:'+h+';font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.5px;display:inline-block;margin-bottom:3px}.mxi-aware-line.mxi-aware-wcag{font-size:10.5px;color:#9A9A9A;font-style:italic;border-left:2px solid rgba(255,184,0,.4);padding-left:8px;margin-top:10px}.mxi-ds-list{display:flex;flex-direction:column;gap:4px}.mxi-ds-row{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;background:'+v+';border-radius:8px;border:1px solid transparent;transition:background .15s,border-color .15s}.mxi-ds-row:hover{background:'+y+';border-color:rgba(255,255,255,.08)}.mxi-ds-row-subtle{opacity:.8}.mxi-ds-name-wrap{flex:1;min-width:0;display:flex;align-items:center;gap:6px;flex-wrap:wrap;overflow:visible}.mxi-ds-mod{font-size:9.5px;color:#666;font-weight:400;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:90px}.mxi-ds-mod:after{content:"."}.mxi-ds-name{font-size:11.5px;color:'+h+';font-weight:500;font-family:"Geist Mono","SF Mono",Monaco,Consolas,monospace;white-space:normal;word-break:break-all;min-width:0;flex:1;line-height:1.35}.mxi-ds-meta{display:flex;align-items:center;gap:6px;flex-shrink:0;padding-top:1px}.mxi-ds-dur{font-size:10px;color:#9A9A9A;font-variant-numeric:tabular-nums}.mxi-ds-count{font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;font-variant-numeric:tabular-nums}.mxi-ds-count-lo{background:rgba(255,255,255,.06);color:#9A9A9A}.mxi-ds-count-med{background:rgba(255,184,0,.15);color:#FFB800}.mxi-ds-count-hi{background:rgba(255,122,80,.2);color:#FF7A50}.mxi-ds-copy{background:rgba(255,255,255,.06);border:none;width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#9A9A9A;padding:0;transition:background .15s,color .15s;flex-shrink:0}.mxi-ds-copy:hover{background:rgba(255,255,255,.14);color:#FFFFFF}.mxi-ds-copy svg{width:11px;height:11px;fill:currentColor}.mxi-ds-copy.mxi-ds-copied{background:#3DDC97;color:#141414}.mxi-ds-name-opid{color:#9A9A9A!important;font-size:10.5px!important;white-space:normal!important;word-break:break-all!important;overflow:visible!important;text-overflow:clip!important;line-height:1.35}.mxi-ds-shape{font-size:9.5px;color:#8FB8EF;background:rgba(59,153,252,.1);border:1px solid rgba(59,153,252,.22);padding:2px 7px;border-radius:10px;font-family:Geist,Inter,system-ui,sans-serif;white-space:nowrap;flex-shrink:0}.mxi-ds-write{font-size:11px;color:#FFB800;flex-shrink:0;margin-left:2px}.mxi-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.mxi-tag{padding:6px 10px;border-radius:8px;font-size:10px;font-weight:500;background:'+v+';color:'+f+'}.mxi-role-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.mxi-role-tag{background:#FFB800;color:#141414;padding:6px 12px;border-radius:8px;font-size:10px;font-weight:600}.mxi-improvements{background:'+v+';border-radius:10px;padding:12px;margin-top:10px}.mxi-impr-title{font-weight:600;font-size:10px;color:'+h+';margin-bottom:8px;display:flex;align-items:center;gap:6px;text-transform:uppercase;letter-spacing:.5px}.mxi-improvements ul{margin:0;padding-left:16px;font-size:11px;color:'+f+'}.mxi-improvements li{margin-bottom:4px}.mxi-a11y-top{display:flex;align-items:center;justify-content:space-between}.mxi-a11y-score-wrap{display:flex;align-items:baseline;gap:2px}.mxi-a11y-score{font-size:26px;font-weight:700;color:'+h+'}.mxi-a11y-label{font-size:12px;color:'+x+'}.mxi-a11y-badge{padding:6px 12px;border-radius:8px;font-size:10px;font-weight:600}.mxi-footer{padding:16px;border-top:1px solid '+b+';display:flex;gap:8px;background:'+w+'}.mxi-btn{flex:1;padding:12px 16px;border:none;border-radius:12px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;letter-spacing:-.1px}.mxi-btn:hover{transform:translateY(-1px)}.mxi-btn-primary{background:'+k+';color:'+w+'}.mxi-btn-secondary{background:'+y+';color:'+h+';border:1px solid '+b+'}.mxi-btn-secondary:hover{background:'+v+'}.mxi-highlight{outline:3px solid currentColor!important;outline-offset:2px!important}@keyframes mxi-pulse{0%,100%{opacity:1}50%{opacity:.7}}.mxi-highlight-label{position:fixed!important;color:'+w+'!important;font-size:10px!important;padding:4px 10px!important;border-radius:8px!important;z-index:999998!important;white-space:nowrap!important;pointer-events:none!important;font-weight:600!important}.mxi-clear-btn{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#FFB800;color:#141414;border:none;padding:12px 24px;border-radius:12px;font-family:Geist,Inter,system-ui,-apple-system,sans-serif;font-size:11px;font-weight:600;cursor:pointer;z-index:999999;display:none;box-shadow:0 4px 20px rgba(255,184,0,.4);transition:all .2s}.mxi-clear-btn:hover{transform:translateX(-50%) translateY(-2px)}.mxi-session-roles{background:'+v+';border-radius:10px;padding:12px;margin-bottom:10px}.mxi-session-roles-title{font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;font-weight:500}.mxi-session-grid{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center}.mxi-session-user{background:'+y+';border-radius:10px;padding:10px 12px}.mxi-session-user-value{font-size:11px;font-weight:500;color:'+h+';word-break:break-all}.mxi-session-user-label{font-size:9px;color:'+x+';margin-top:2px;text-transform:uppercase;letter-spacing:.5px}.mxi-session-small{background:'+y+';border-radius:10px;padding:10px 12px;text-align:center;min-width:56px}.mxi-session-small-value{font-size:11px;font-weight:600}.mxi-session-small-label{font-size:9px;color:'+x+';margin-top:2px;text-transform:uppercase;letter-spacing:.5px}#mx-inspector-pro::-webkit-scrollbar{width:6px!important;height:6px!important}#mx-inspector-pro::-webkit-scrollbar-track{background:#141414!important}#mx-inspector-pro::-webkit-scrollbar-thumb{background:#2E2E2E!important;border-radius:3px!important}#mx-inspector-pro::-webkit-scrollbar-thumb:hover{background:#666666!important}#mx-inspector-pro .mxi-body::-webkit-scrollbar{width:6px!important;height:6px!important}#mx-inspector-pro .mxi-body::-webkit-scrollbar-track{background:#141414!important}#mx-inspector-pro .mxi-body::-webkit-scrollbar-thumb{background:#2E2E2E!important;border-radius:3px!important}#mx-inspector-pro .mxi-body::-webkit-scrollbar-thumb:hover{background:#666666!important}#mx-inspector-pro *{scrollbar-width:thin!important;scrollbar-color:#2E2E2E #141414!important}.mxi-meta{margin-top:8px;display:flex;flex-wrap:wrap;gap:6px}.mxi-meta-pill{background:'+v+';border:1px solid '+b+';color:#9A9A9A;padding:4px 10px;border-radius:8px;font-size:10px;font-weight:500;display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.mxi-meta-pill strong{color:'+h+';font-weight:600}.mxi-chip-btn{background:rgba(255,255,255,.06);border:none;width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#9A9A9A;padding:0;transition:background .15s,color .15s;flex-shrink:0;position:relative}.mxi-chip-btn:hover{background:rgba(255,255,255,.14);color:#FFFFFF}.mxi-chip-btn svg{fill:currentColor}.mxi-chip-btn.mxi-chip-spin{transform:rotate(180deg);transition:transform .3s}</style>';

var scoreLabel=i.score>=90?"Excellent":i.score>=80?"Good":i.score>=60?"Fair":"Needs Work";

/* Build Sections */
var containerTotal=i.dataViews+i.listViews+i.templateGrids+i.dataGrid2s+i.galleries+i.treeNodes;
var widgetsContent=
  '<div style="font-size:10px;color:'+x+';margin-bottom:10px;font-weight:400;font-style:italic">Widgets that bind to data</div>'+
  '<div class="mxi-metrics mxi-metrics-3" style="margin-bottom:8px">'+
    clickableMetric("DataView",i.dataViews,'.mx-dataview:not(.mx-dataview-content)[class*="mx-name-"]',null,"dataviews")+
    clickableMetric("ListView",i.listViews,'.mx-listview[class*="mx-name-"]',null,"listviews")+
    clickableMetric("TemplateGrid",i.templateGrids,'.mx-templategrid[class*="mx-name-"]',null,"templategrid")+
  '</div>'+
  '<div class="mxi-metrics mxi-metrics-3">'+
    clickableMetric("DataGrid2",i.dataGrid2s,'.widget-datagrid[class*="mx-name-"]',null,"datagrid2")+
    clickableMetric("Gallery",i.galleries,'.widget-gallery[class*="mx-name-"]',null,"galleries")+
    clickableMetric("TreeNode",i.treeNodes,'.widget-tree-node[class*="mx-name-"],.mx-treeview[class*="mx-name-"]',i.treeNodes>0?p:null,"treenode")+
  '</div>'+
  /* v0.2.60 — Nested Data Views: two-box layout under a CAPS heading.
   * Normal (depth-2) stays neutral white when load is fast; turns yellow
   * when the page is slow — because that's when nested sources are likely
   * the cause. Deeply Nested (depth 3+) is orange even on fast pages
   * (it's still a code smell), red when the page is slow. */
  (function(){
    var loadSlow=i.loadTime>2000;
    var normalCount=i.nestedDataViewsWarning.length;
    var deepCount=i.nestedDataViewsCritical.length;
    var normalSev=(normalCount>0&&loadSlow)?"warning":"info";
    var normalColor=(normalCount>0&&loadSlow)?k:h;
    var deepSev=deepCount===0?"info":(loadSlow?"error":"notice");
    var deepColor=deepCount===0?h:(loadSlow?m:p);
    var normalTile=normalCount===0
      ? metric("Normal",0,h,"nestingNormal")
      : highlightMetric("Normal",normalCount,normalColor,"nestingNormal","nestedDataViewsWarning",normalSev);
    var deepTile=deepCount===0
      ? metric("Deeply Nested",0,h,"nestingDeep")
      : highlightMetric("Deeply Nested",deepCount,deepColor,"nestingDeep","nestedDataViewsCritical",deepSev);
    return '<div style="margin-top:12px;padding-top:12px;border-top:1px solid '+b+'">'+
             '<div style="font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:500">Nested Data Views</div>'+
             '<div class="mxi-metrics mxi-metrics-2">'+normalTile+deepTile+'</div>'+
           '</div>';
  })();

var sessionContent='';
if(i.roles){sessionContent+='<div class="mxi-session-roles"><div class="mxi-session-roles-title">USER ROLE(S)</div><div class="mxi-role-tags">';i.roles.split(", ").forEach(function(r){if(r.trim())sessionContent+='<span class="mxi-role-tag">'+esc(r.trim())+'</span>'});sessionContent+='</div></div>'}
sessionContent+='<div class="mxi-session-grid"><div class="mxi-session-user"><div class="mxi-session-user-value">'+(i.user||"Anonymous")+'</div><div class="mxi-session-user-label">User</div></div><div class="mxi-session-small"><div class="mxi-session-small-value" style="color:'+(i.offline?"#FF7A50":"#3DDC97")+'">'+(i.offline?"Offline":"Online")+'</div><div class="mxi-session-small-label">Status</div></div><div class="mxi-session-small"><div class="mxi-session-small-value" style="color:'+(i.guest?"#FFB800":"#9A9A9A")+'">'+(i.guest?"Yes":"No")+'</div><div class="mxi-session-small-label">Guest</div></div></div>';

/* v0.2.66 — Pluggable Widgets section removed. The page-filter heuristic
 * was never reliable enough to be useful, and as the user pointed out:
 * if you built the app, you already know what widgets you use. Removing
 * the section keeps the inspector focused on insights the dev doesn't
 * already have from memory. */

/* v0.2.61 — color by WCAG conformance level, not raw score:
 *   AAA / AA  → white (target met, near-unreachable bonus for AAA)
 *   A         → yellow (minimum only — improvement needed)
 *   Partial   → red (failing)
 *   Needs Work → red (failing)
 * Accessibility is critical (EU EAA in force since June 2025 for
 * EU-facing products) so anything below AA gets visually flagged. */
var __wl=i.a11y.wcagLevel;
var a11yScoreColor=(__wl==="AAA Compliant"||__wl==="AA Compliant")?h:(__wl==="A Compliant"?k:m);
var a11yBadgeBg=(__wl==="AAA Compliant"||__wl==="AA Compliant")?"rgba(255,255,255,.08);color:#FFFFFF":(__wl==="A Compliant"?"rgba(255,184,0,.2);color:#FFB800":"rgba(255,90,90,.2);color:#FF5A5A");
var isMobile=window.innerWidth<=1024;
var a11yContent='<div class="mxi-a11y-top"><div class="mxi-a11y-score-wrap"><span class="mxi-a11y-score" style="color:'+a11yScoreColor+'">'+i.a11y.score+'</span><span class="mxi-a11y-label">/100</span></div><span class="mxi-a11y-badge" style="background:'+a11yBadgeBg+'">'+i.a11y.wcagLevel+'</span></div>'+
/* Row 1 — core AA blockers (red when non-zero) */
'<div class="mxi-metrics mxi-metrics-3" style="margin-top:12px">'+
  highlightMetric("Missing Alt",i.a11y.missingAltText+"/"+i.a11y.totalImages,i.a11y.missingAltText?m:h,"altText","missingAlt","error")+
  highlightMetric("Missing Labels",i.a11y.missingLabels+"/"+i.a11y.totalFormFields,i.a11y.missingLabels?m:h,"formLabels","missingLabels","error")+
  highlightMetric("Contrast",i.a11y.contrastIssues,i.a11y.contrastIssues?m:h,"contrast","contrastIssues","error")+
'</div>'+
/* Row 2 — WCAG 2.2 additions + AA blockers */
'<div class="mxi-metrics mxi-metrics-3" style="margin-top:8px">'+
  highlightMetric("Target Size",i.a11y.targetSizeIssues,i.a11y.targetSizeIssues?m:h,"targetSize","targetSizeIssues","error")+
  highlightMetric("No A11y Name",i.a11y.noAccessibleName,i.a11y.noAccessibleName?m:h,"accessibleName","noAccessibleName","error")+
  highlightMetric("IFrame Titles",i.a11y.iframeTitleMissing,i.a11y.iframeTitleMissing?m:h,"iframeTitle","iframeTitleMissing","error")+
'</div>'+
/* Row 3 — warnings and non-blocking issues */
'<div class="mxi-metrics mxi-metrics-3" style="margin-top:8px">'+
  highlightMetric("Small Fonts",i.a11y.smallFontSize,i.a11y.smallFontSize?k:h,"smallFont","smallFontSize","warning")+
  highlightMetric("Headings",(i.a11y.missingH1?1:0)+i.a11y.headingSkips,i.a11y.headingSkips||i.a11y.missingH1?k:h,"headings","headingSkips","warning")+
  highlightMetric("Empty Links",i.a11y.emptyLinks,i.a11y.emptyLinks?k:h,"emptyLinks","emptyLinks","warning")+
'</div>'+
/* Row 4 — keyboard / focus (new v0.2.61) */
'<div class="mxi-metrics mxi-metrics-3" style="margin-top:8px">'+
  highlightMetric("Focus Visible",i.a11y.focusIssues,i.a11y.focusIssues?k:h,"focusVisible","focusIssues","warning")+
  metric("Tab Order",i.a11y.positiveTabindex?i.a11y.positiveTabindex+" +":"OK",i.a11y.positiveTabindex?k:h,null)+
  metric("Duplicate IDs",i.a11y.duplicateIds,i.a11y.duplicateIds?k:h,null)+
'</div>'+
(isMobile&&i.a11y.smallTouchTargets>0?'<div style="margin-top:8px;padding:8px 10px;background:rgba(255,184,0,.15);border:1px solid rgba(255,184,0,.3);border-radius:8px;font-size:11px;color:#FFB800;display:flex;align-items:center;gap:6px">'+icon("a11y",11)+' <span>'+i.a11y.smallTouchTargets+' mobile targets <44px (WCAG 2.5.5 AAA)</span></div>':'')+
'<div style="margin-top:10px;font-size:11px;color:'+x+';display:flex;align-items:center;gap:4px;flex-wrap:wrap">ARIA: '+i.a11y.ariaUsage+' • Landmarks: '+i.a11y.landmarks+' • Skip link: '+(i.a11y.hasSkipLink?icon("check",11):icon("x",11))+' • Main: '+(i.a11y.hasMainLandmark?icon("check",11):icon("x",11))+'</div>'+
'<div style="margin-top:6px;font-size:10px;color:'+x+';font-style:italic;display:flex;align-items:center;gap:6px">'+icon("info",10)+' <span>EU EAA requires WCAG 2.1 AA for EU-facing products (in force June 28, 2025)</span></div>'+
a11yImpr;

/* Typography section */
/* v0.2.3 — inline "Inspect Mode" button removed; the inspect functionality
 * is now triggered from the footer Style button. The section remains as a
 * page-wide audit (primary font, fonts used, sizes, weights). */
var typoContent='<div style="font-size:11px;color:'+x+';margin-bottom:6px">PRIMARY FONT</div><div style="font-size:18px;font-weight:600;color:'+h+';margin-bottom:12px">'+i.typography.primaryFont+'</div><div style="font-size:11px;color:'+x+';margin-bottom:6px">FONTS USED ('+i.typography.fontCount+')</div><div class="mxi-tags" style="margin-bottom:12px">';
i.typography.fonts.forEach(function(fn,idx){
  var isIcon=i.typography.iconFonts&&i.typography.iconFonts[fn];
  var bg=isIcon?"#fef3c7":(idx===0?"#dbeafe":"#f3f4f6");
  var fg=isIcon?"#92400e":(idx===0?"#1e40af":"#374151");
  var label=isIcon?fn+' <span style="font-size:9px;background:'+fg+';color:'+bg+';padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:600;letter-spacing:.3px">ICON</span>':fn;
  typoContent+='<span class="mxi-tag" style="background:'+bg+';color:'+fg+'">'+label+'</span>';
});
typoContent+='</div><div style="font-size:11px;color:'+x+';margin-bottom:6px">SIZES ('+i.typography.sizeCount+' unique)</div><div class="mxi-tags" style="margin-bottom:12px">';
i.typography.sizes.slice(0,8).forEach(function(s){typoContent+=tag(s)});
typoContent+='</div><div style="font-size:11px;color:'+x+';margin-bottom:6px">WEIGHTS</div><div class="mxi-tags">';
i.typography.weights.forEach(function(w){var wName=w==="400"?"Regular":w==="500"?"Medium":w==="600"?"Semi":w==="700"?"Bold":w;typoContent+=tag(wName+" ("+w+")")});
typoContent+='</div>';

/* CSS Analysis section */
/* v0.2.3 — inline "CSS Inspector" button removed; combined with Typography
 * inspect behind the footer Style button for discoverability. */
var cssContent='<div style="font-size:11px;color:'+x+';margin-bottom:12px">OVERVIEW</div>';
cssContent+='<div class="mxi-metrics mxi-metrics-3" style="margin-bottom:10px">'+metric("Stylesheets",i.css.totalStylesheets,null,"cssStylesheets")+metric("Rules",i.css.totalRules,null,"cssRules")+metric("Inline Styles",i.css.inlineStyles,i.css.inlineStyles>20?p:null,"cssInlineStyles")+'</div>';
cssContent+='<div class="mxi-metrics mxi-metrics-3" style="margin-bottom:12px">'+metric("!important",i.css.importantCount,i.css.importantCount>50?m:i.css.importantCount>20?p:null,"cssImportant")+metric("CSS Vars",i.css.customProperties,i.css.customProperties>0?gr:null,"cssVars")+metric("Media Q",i.css.mediaQueries,null,"cssMediaQ")+'</div>';
/* Design System Usage */
cssContent+='<div style="font-size:9px;color:'+x+';margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:500">DESIGN SYSTEM USAGE</div>';
cssContent+='<div style="display:flex;gap:8px;margin-bottom:12px"><div style="flex:1;background:'+v+';border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:600;color:'+gr+'">'+i.css.atlasClasses+'</div><div style="font-size:9px;color:'+x+';margin-top:2px">Atlas/Framework</div></div><div style="flex:1;background:'+v+';border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:600;color:'+(i.css.customClasses>i.css.atlasClasses?p:f)+'">'+i.css.customClasses+'</div><div style="font-size:9px;color:'+x+';margin-top:2px">Custom Classes</div></div></div>';
/* v0.2.48 — Deep Selectors and High Specificity sections removed. They
 * reported on compiled theme CSS (theme.compiled.css), which every Mendix
 * app has. The findings were theme-author concerns, not page-level insights. */
/* Largest Stylesheets */
if(i.css.stylesheetSizes&&i.css.stylesheetSizes.length>0){
cssContent+='<div style="font-size:9px;color:'+x+';margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:500">LARGEST STYLESHEETS</div><div style="margin-bottom:10px">';
i.css.stylesheetSizes.slice(0,3).forEach(function(s){
var sizeKb=Math.round(s.size/1024);
cssContent+='<div style="display:flex;justify-content:space-between;padding:6px 8px;background:'+y+';border-radius:4px;margin-bottom:4px;font-size:11px"><span style="color:'+f+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">'+esc(s.name)+'</span><span style="color:'+(sizeKb>100?p:x)+'">'+sizeKb+'KB</span></div>';
});
cssContent+='</div>';
}
cssContent+='<div style="margin-top:10px;padding:10px 12px;background:'+y+';border-radius:8px;font-size:11px;color:'+x+';border:1px solid '+b+'">'+icon("info",10)+' <strong style="color:'+f+';margin-left:4px">Tip:</strong> Use CSS Inspector to hover and see classes, styles, padding & margin.</div>';

/* Security Section Content */
var securityContent='';
var sec=i.security;
var secIssueCount=sec.exposedConstants.length+sec.formIssues.length+sec.urlParams.length+sec.cveWarnings.length+sec.mixedContent.length+sec.localStorageSensitive.length+(sec.insecureProtocol?1:0);
/* v0.2.43 — include extended findings in the issue count */
if(sec.mendixConstants)secIssueCount+=(sec.mendixConstants.secrets||0)+(sec.mendixConstants.sensitive||0);
if(sec.demoUsers&&sec.demoUsers.count)secIssueCount+=sec.demoUsers.count;
if(sec.anonymous&&sec.anonymous.anonymous)secIssueCount+=1;
if(sec.devMode&&sec.devMode.confidence==="high")secIssueCount+=1;
if(sec.writableSensitive&&sec.writableSensitive.withWrites)secIssueCount+=sec.writableSensitive.withWrites;
var secScoreColor=sec.score>=80?gr:sec.score>=60?k:m;

securityContent+='<div class="mxi-a11y-top" style="margin-bottom:12px"><div class="mxi-a11y-score-wrap"><span class="mxi-a11y-score" style="color:'+secScoreColor+'">'+sec.score+'</span><span class="mxi-a11y-label">/100</span></div><span class="mxi-a11y-badge" style="background:'+(sec.score>=80?"rgba(61,220,151,.2);color:#3DDC97":sec.score>=60?"rgba(255,184,0,.2);color:#FFB800":"rgba(255,90,90,.2);color:#FF5A5A")+'">'+(sec.score>=80?"Good":sec.score>=60?"Fair":"At Risk")+'</span></div>';

/* v0.2.45 — CONSTANTS metric now shows TOTAL count (Mendix constants + legacy
 * window.* scan). Color reflects the worst risk level present:
 *   red if any secrets, yellow if any sensitive-entropy, grey if all plain. */
var mcSecrets=(sec.mendixConstants&&sec.mendixConstants.secrets)||0;
var mcSensitive=(sec.mendixConstants&&sec.mendixConstants.sensitive)||0;
var mcTotal=(sec.mendixConstants&&sec.mendixConstants.count)||0;
var constantsTotal=sec.exposedConstants.length+mcTotal;
var constantsColor=(mcSecrets>0||sec.exposedConstants.length>0)?m:(mcSensitive>0?k:null);
/* v0.2.46 — Entities and Actions metrics dropped. Both were heuristic
 * name-scans that produced low-signal findings. Remaining 4 metrics in a
 * single row: Constants (Mendix + legacy), Forms, URL Params, CVEs. */
securityContent+='<div class="mxi-metrics" style="grid-template-columns:repeat(4,1fr);margin-bottom:10px">'+metric("Constants",constantsTotal,constantsColor,"secConstants")+metric("Forms",sec.formIssues.length,sec.formIssues.length>0?p:null,"secForms")+metric("URL Params",sec.urlParams.length,sec.urlParams.length>0?m:null,"secUrl")+metric("CVEs",sec.cveWarnings.length,sec.cveWarnings.length>0?m:null,"secCve")+'</div>';

/* Protocol Warning */
if(sec.insecureProtocol){
securityContent+='<div style="margin-bottom:10px;padding:10px 12px;background:rgba(255,90,90,.1);border:1px solid rgba(255,90,90,.3);border-radius:10px"><div style="font-size:11px;color:#FF5A5A;font-weight:500">🔓 Page loaded over HTTP (not secure)</div><div style="font-size:10px;color:'+x+';margin-top:4px">Use HTTPS in production environments.</div></div>';
}

/* CVE Warnings */
if(sec.cveWarnings.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:rgba(255,90,90,.1);border:1px solid rgba(255,90,90,.3);border-radius:10px">';
securityContent+='<div style="font-size:10px;color:#FF5A5A;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;display:inline-flex;align-items:center;gap:6px">'+icon("warning",10)+' KNOWN VULNERABILITIES</div>';
sec.cveWarnings.forEach(function(cve){
securityContent+='<div style="font-size:11px;margin-bottom:6px;color:'+f+'"><strong style="color:#FF8A8A">'+cve.id+'</strong> <span style="color:'+x+'">('+cve.severity+')</span><br>'+cve.desc+'</div>';
});
securityContent+='<div style="font-size:10px;color:'+x+';margin-top:8px">Update Mendix to patch these vulnerabilities.</div></div>';
}

/* Mixed Content Warning */
if(sec.mixedContent.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:rgba(255,122,80,.1);border:1px solid rgba(255,122,80,.3);border-radius:10px">';
securityContent+='<div style="font-size:10px;color:#FF7A50;font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;display:inline-flex;align-items:center;gap:6px">'+icon("warning",10)+' MIXED CONTENT</div>';
securityContent+='<div style="font-size:11px;color:'+f+'">HTTP resources on HTTPS page: '+sec.mixedContent.join(", ")+'</div></div>';
}

/* LocalStorage Sensitive Data */
if(sec.localStorageSensitive.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:'+v+';border-radius:10px">';
securityContent+='<div style="font-size:10px;color:#FFB800;font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">SENSITIVE DATA IN LOCALSTORAGE</div>';
securityContent+='<div class="mxi-tags">';
sec.localStorageSensitive.forEach(function(k){securityContent+=tag(k,"rgba(255,184,0,.15)","#FFB800")});
securityContent+='</div></div>';
}

/* External Scripts — v0.2.49: explanation text + subtle panel. Tags show full
 * hostnames so you can identify who owns them (analytics, CDN, etc.). */
if(sec.externalScripts.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:'+v+';border-radius:10px">';
securityContent+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><div style="font-size:10px;color:'+f+';font-weight:600;text-transform:uppercase;letter-spacing:.5px">External Scripts ('+sec.externalScripts.length+')</div></div>';
securityContent+='<div style="font-size:11px;color:'+x+';margin-bottom:8px;line-height:1.4">Scripts loaded from domains other than this app. Expected for analytics, tag managers, or CDN-hosted libraries; unexpected entries may warrant review.</div>';
securityContent+='<div class="mxi-tags">';
sec.externalScripts.forEach(function(host){securityContent+='<span class="mxi-tag" style="background:rgba(59,153,252,.1);color:#3B99FC;font-family:"Geist Mono",monospace;font-size:10px">'+esc(host)+'</span>'});
securityContent+='</div></div>';
}

/* Exposed Constants */
if(sec.exposedConstants.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:'+v+';border-radius:10px">';
securityContent+='<div style="font-size:10px;color:'+k+';font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">EXPOSED JS CONSTANTS</div>';
sec.exposedConstants.slice(0,5).forEach(function(c){
securityContent+='<div style="font-size:11px;margin-bottom:4px;color:'+f+'"><code style="background:'+y+';padding:2px 6px;border-radius:4px;font-size:10px">'+esc(c.name)+'</code></div>';
});
securityContent+='</div>';
}

/* v0.2.46 — Sensitive Entities and Revealing Microflows render blocks removed
 * (heuristic keyword matches against DOM class names; low signal, high noise). */

/* Form Issues */
if(sec.formIssues.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:'+v+';border-radius:10px">';
securityContent+='<div style="font-size:10px;color:'+p+';font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">FORM SECURITY ISSUES</div>';
sec.formIssues.slice(0,5).forEach(function(f){
securityContent+='<div style="font-size:11px;margin-bottom:4px;color:#9A9A9A">• '+f.msg+'</div>';
});
securityContent+='</div>';
}

/* URL Parameters */
if(sec.urlParams.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:rgba(255,90,90,.08);border:1px solid rgba(255,90,90,.2);border-radius:10px">';
securityContent+='<div style="font-size:10px;color:#FF5A5A;font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">SENSITIVE URL PARAMETERS</div>';
sec.urlParams.forEach(function(p){
securityContent+='<div style="font-size:11px;color:'+f+'"><code style="background:'+y+';padding:2px 6px;border-radius:4px;font-size:10px">'+esc(p.key)+'</code>'+(p.hasValue?' <span style="color:#FF5A5A">(has value!)</span>':'')+'</div>';
});
securityContent+='</div>';
}

if(secIssueCount===0&&!sec.insecureProtocol){
securityContent+='<div style="margin-top:10px;padding:12px;background:rgba(61,220,151,.1);border:1px solid rgba(61,220,151,.2);border-radius:10px;text-align:center"><div style="margin-bottom:6px;color:#3DDC97;display:flex;justify-content:center">'+icon("check",24)+'</div><div style="font-size:12px;color:#3DDC97;font-weight:500">No security issues detected</div><div style="font-size:10px;color:'+x+';margin-top:4px">Page passes extended security checks</div></div>';
}

/* ===== v0.2.43 — extended security blocks ===== */

/* Anonymous session banner */
if(sec.anonymous&&sec.anonymous.anonymous){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:rgba(255,184,0,.1);border:1px solid rgba(255,184,0,.3);border-radius:10px">';
securityContent+='<div style="font-size:11px;color:#FFB800;font-weight:500">🕵 Anonymous session active</div>';
securityContent+='<div style="font-size:10px;color:'+x+';margin-top:4px">Anonymous access is enabled on this app. Confirm this is intentional — if not, disable it in Studio Pro under App Security.</div></div>';
}

/* Mendix Constants (replaces/augments the old window.* scan) — v0.2.44: show ALL constants */
if(sec.mendixConstants&&sec.mendixConstants.available&&sec.mendixConstants.count>0){
var mc=sec.mendixConstants;
var secretsHi=mc.secrets>0;
var sensHi=mc.sensitive>0;
var plainCount=mc.count-mc.secrets-mc.sensitive;
/* v0.2.49 — When all constants are plain (no secrets, no sensitive), render
 * in the same neutral panel style as other Security subsections. Colored
 * border/bg is reserved for actual findings so it means something. */
var cBg=secretsHi?'rgba(255,90,90,.08)':sensHi?'rgba(255,184,0,.08)':v;
var cBr=secretsHi?'1px solid rgba(255,90,90,.25)':sensHi?'1px solid rgba(255,184,0,.25)':'none';
var cLbl=secretsHi?'#FF5A5A':sensHi?'#FFB800':f;
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:'+cBg+';'+(cBr!=='none'?'border:'+cBr+';':'')+'border-radius:10px">';
securityContent+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">';
securityContent+='<div style="font-size:10px;color:'+cLbl+';font-weight:600;text-transform:uppercase;letter-spacing:.5px">Mendix Constants ('+mc.count+')</div>';
if(secretsHi||sensHi){
securityContent+='<div style="font-size:10px;color:'+cLbl+'">'+(secretsHi?mc.secrets+' secret':'')+(secretsHi&&sensHi?' · ':'')+(sensHi?mc.sensitive+' sensitive':'')+(plainCount>0?' · '+plainCount+' plain':'')+'</div>';
}
securityContent+='</div>';
/* v0.2.45 — Plain-constant rows use a clean 3-column grid (name · type · preview).
 * Previous version had a background'd <code> that rendered as an empty grey bar
 * when the value was empty — which is what most Mendix app-level plain
 * constants are. Now: no background on empty values, grid keeps alignment. */
mc.items.forEach(function(c){
if(c.level==='plain'){
  var shortPrev=c.rawValue.length>40?c.rawValue.slice(0,37)+'…':c.rawValue;
  /* v0.2.53 — rebalanced grid columns. Previous layout was
   * `minmax(0,1fr) auto minmax(0,1fr)` which gave the name only half the
   * row width and truncated aggressively even when the value column was
   * empty. New layout gives the name column flexible full width and lets
   * the value column size to its content (usually the italic "empty" tag). */
  securityContent+='<div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;margin-bottom:3px;padding:4px 8px;background:'+y+';border-radius:5px;opacity:.8">';
  securityContent+='<code style="font-size:10px;color:'+h+';background:'+w+';padding:2px 6px;border-radius:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">'+esc(c.name)+'</code>';
  securityContent+='<span style="font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:.3px">'+(c.dataType?esc(c.dataType):'')+'</span>';
  if(shortPrev){
    securityContent+='<code style="font-size:10px;color:'+f+';white-space:nowrap;text-align:right;max-width:160px;overflow:hidden;text-overflow:ellipsis">'+esc(shortPrev)+'</code>';
  } else {
    securityContent+='<span style="font-size:10px;color:'+x+';font-style:italic;text-align:right">empty</span>';
  }
  securityContent+='</div>';
} else {
  var pillBg=c.level==='secret'?'rgba(255,90,90,.15)':'rgba(255,184,0,.15)';
  var pillFg=c.level==='secret'?'#FF5A5A':'#FFB800';
  var pillTxt=c.level==='secret'?'SECRET':'SENSITIVE';
  var safeVal=window.__MxSecurity?window.__MxSecurity.redactValue(c.rawValue):'••••';
  securityContent+='<div class="mxi-secret-row" data-constant-name="'+esc(c.name)+'" style="margin-bottom:6px;padding:6px 8px;background:'+y+';border-radius:6px">';
  securityContent+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap">';
  securityContent+='<code style="font-size:10px;color:'+h+';background:'+w+';padding:2px 6px;border-radius:4px;word-break:break-all">'+esc(c.name)+'</code>';
  securityContent+='<span style="font-size:9px;font-weight:600;background:'+pillBg+';color:'+pillFg+';padding:2px 6px;border-radius:3px;letter-spacing:.4px">'+pillTxt+'</span>';
  if(c.pattern)securityContent+='<span style="font-size:9px;color:'+x+'">'+esc(c.pattern)+'</span>';
  securityContent+='</div>';
  securityContent+='<div style="display:flex;align-items:center;gap:6px">';
  securityContent+='<code class="mxi-secret-value" data-redacted="'+esc(safeVal)+'" data-revealed="'+esc(c.rawValue)+'" style="font-size:10px;color:'+f+';background:'+w+';padding:2px 6px;border-radius:4px;flex:1;word-break:break-all">'+esc(safeVal)+'</code>';
  securityContent+='<button class="mxi-reveal-btn" data-for="'+esc(c.name)+'" style="font-size:9px;padding:3px 8px;background:'+b+';color:'+f+';border:1px solid '+b+';border-radius:4px;cursor:pointer;font-weight:500">Reveal</button>';
  securityContent+='</div></div>';
}
});
securityContent+='</div>';
} else if(sec.mendixConstants&&sec.mendixConstants.available&&sec.mendixConstants.count===0){
securityContent+='<div style="margin-top:10px;padding:8px 12px;background:rgba(61,220,151,.08);border:1px solid rgba(61,220,151,.2);border-radius:10px;font-size:11px;color:#3DDC97;display:flex;align-items:center;gap:6px">'+icon("check",11)+' <span>Mendix constants: none exposed</span></div>';
}

/* Demo Users — v0.2.45: clean 3-col grid, fixed column widths, consistent cell styling */
if(sec.demoUsers&&sec.demoUsers.available&&sec.demoUsers.count>0){
var duProd=sec.envIsProd===true;
var duBg=duProd?'rgba(255,90,90,.15)':'rgba(255,184,0,.1)';
var duBr=duProd?'2px solid #FF5A5A':'1px solid rgba(255,184,0,.3)';
var duLbl=duProd?'#FF5A5A':'#FFB800';
securityContent+='<div style="margin-top:10px;padding:12px;background:'+duBg+';border:'+duBr+';border-radius:10px">';
if(duProd){
  securityContent+='<div style="font-size:12px;color:'+duLbl+';font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:8px">'+icon("warning",12)+' <span>CRITICAL · DEMO USERS IN PRODUCTION ('+sec.demoUsers.count+')</span></div>';
  securityContent+='<div style="font-size:11px;color:#FFCCCC;margin-bottom:10px;line-height:1.5"><strong>Mendix is exposing usernames AND passwords to every visitor of this page.</strong> Anyone can log in as any of these accounts. Disable demo users in Studio Pro (Project Security → Demo Users) and redeploy immediately.</div>';
} else {
  securityContent+='<div style="font-size:10px;color:'+duLbl+';font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">DEMO USERS EXPOSED ('+sec.demoUsers.count+')</div>';
  securityContent+='<div style="font-size:11px;color:'+f+';margin-bottom:10px;line-height:1.5">Mendix publishes demo-user credentials in the client session — fine for development, catastrophic in production. Disable before go-live.</div>';
}
/* Fixed 3-col grid with definite min/max widths so nothing squishes or wraps
 * inside a cell. Click any cell to copy its value. */
var gridCols='minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr)';
securityContent+='<div style="display:grid;grid-template-columns:'+gridCols+';gap:3px 10px;font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;padding:0 8px">';
securityContent+='<span>Username</span><span>Password</span><span style="text-align:right">Roles</span>';
securityContent+='</div>';
sec.demoUsers.items.forEach(function(u){
  var pwCell;
  if(u.password){
    var pwColor=duProd?'#FF5A5A':'#FFB800';
    pwCell='<code class="mxi-demo-copy" data-copy="'+esc(u.password)+'" style="background:'+w+';color:'+pwColor+';padding:3px 6px;border-radius:3px;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;min-width:0" title="Click to copy">'+esc(u.password)+'</code>';
  } else {
    pwCell='<span style="color:'+x+';font-size:10px;font-style:italic;align-self:center">not exposed</span>';
  }
  securityContent+='<div style="display:grid;grid-template-columns:'+gridCols+';gap:3px 10px;align-items:center;margin-bottom:3px;padding:5px 8px;background:'+y+';border-radius:5px">';
  securityContent+='<code class="mxi-demo-copy" data-copy="'+esc(u.username)+'" style="background:'+w+';color:'+h+';padding:3px 6px;border-radius:3px;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;min-width:0" title="Click to copy">'+esc(u.username)+'</code>';
  securityContent+=pwCell;
  securityContent+='<span style="font-size:10px;color:'+f+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;text-align:right">'+(u.roles?esc(u.roles):'—')+'</span>';
  securityContent+='</div>';
});
securityContent+='</div>';
}

/* Writable Sensitive Entities */
if(sec.writableSensitive&&sec.writableSensitive.available&&sec.writableSensitive.withWrites>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:rgba(255,90,90,.08);border:1px solid rgba(255,90,90,.25);border-radius:10px">';
securityContent+='<div style="font-size:10px;color:#FF5A5A;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;display:inline-flex;align-items:center;gap:6px">'+icon("warning",10)+' WRITABLE SENSITIVE ENTITIES</div>';
securityContent+='<div style="font-size:11px;color:'+f+';margin-bottom:8px">Current session can write to entities that commonly should be read-only.</div>';
sec.writableSensitive.items.forEach(function(ws){
if(!ws.available||ws.writableCount===0)return;
securityContent+='<div style="margin-bottom:6px">';
securityContent+='<div style="font-size:11px;color:#FF8A8A;font-weight:500">'+esc(ws.entity)+' <span style="color:'+x+';font-weight:400">('+ws.writableCount+' writable attr)</span></div>';
if(ws.writableAttrs.length){
securityContent+='<div style="font-size:10px;color:'+x+';margin-top:2px;margin-left:8px">'+ws.writableAttrs.slice(0,6).map(esc).join(', ')+(ws.writableAttrs.length>6?', …':'')+'</div>';
}
securityContent+='</div>';
});
securityContent+='</div>';
}

/* Dev Mode indicators */
if(sec.devMode&&sec.devMode.available&&sec.devMode.confidence!=='none'){
var dmBg=sec.devMode.confidence==='high'?'rgba(255,90,90,.08)':'rgba(255,184,0,.08)';
var dmBr=sec.devMode.confidence==='high'?'rgba(255,90,90,.25)':'rgba(255,184,0,.25)';
var dmFg=sec.devMode.confidence==='high'?'#FF5A5A':'#FFB800';
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:'+dmBg+';border:1px solid '+dmBr+';border-radius:10px">';
securityContent+='<div style="font-size:10px;color:'+dmFg+';font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">DEV MODE INDICATORS ('+sec.devMode.confidence+' confidence)</div>';
sec.devMode.signals.forEach(function(s){
securityContent+='<div style="font-size:11px;margin-bottom:3px;color:'+f+'">• <code style="background:'+y+';padding:2px 5px;border-radius:3px;font-size:10px">'+esc(s.source)+'</code>: '+esc(s.value)+'</div>';
});
securityContent+='</div>';
}

/* Endpoint Probe — v0.2.44: auto-runs on section render. Still shows the
 * 4 requests it made so the user knows what went out. A "Re-probe" link
 * at the bottom repeats the HEAD requests on demand. */
securityContent+='<div style="margin-top:12px;padding:10px 12px;background:'+v+';border:1px solid '+b+';border-radius:10px">';
securityContent+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">';
securityContent+='<div style="font-size:10px;color:'+x+';font-weight:600;text-transform:uppercase;letter-spacing:.5px">DOC ENDPOINT PROBE</div>';
securityContent+='<button id="mxi-probe-endpoints-btn" style="font-size:9px;padding:3px 8px;background:'+b+';color:'+f+';border:1px solid '+b+';border-radius:4px;cursor:pointer;font-weight:500">Re-probe</button>';
securityContent+='</div>';
securityContent+='<div style="font-size:10px;color:'+x+';margin-bottom:8px">4 HEAD requests to <code style="background:'+y+';padding:1px 4px;border-radius:3px;font-size:10px">/rest-doc/</code>, <code style="background:'+y+';padding:1px 4px;border-radius:3px;font-size:10px">/odata-doc/</code>, <code style="background:'+y+';padding:1px 4px;border-radius:3px;font-size:10px">/ws-doc/</code>, <code style="background:'+y+';padding:1px 4px;border-radius:3px;font-size:10px">/debugger/</code></div>';
securityContent+='<div id="mxi-probe-endpoints-out"><div style="font-size:11px;color:'+f+';font-style:italic">Probing…</div></div>';
securityContent+='</div>';

/* MASCOT - REOWN INSPIRED . / LOGO */
var mascot='<svg viewBox="0 0 52 24" width="52" height="24" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="24" height="24" rx="7" fill="#242424"/><rect x="28" y="0" width="24" height="24" rx="7" fill="#1A1A1A" stroke="#FF7A50" stroke-width="1.5"/><rect x="10" y="10" width="4" height="4" rx="0.5" fill="#fff"/><line x1="37" y1="6" x2="43" y2="18" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>';

/* v0.2.42 — meta row under env row: profile (Responsive/PWA), locale, and
 * translation count. Only rendered if at least one field has a value, so apps
 * that don't surface this data don't get an empty box. */
/* v0.2.44 — humanize Mendix locale codes (en_US → English US, nl_NL → Dutch, etc.)
 * For 'native' locales (language spoken primarily in that one country) we
 * show just the language name. Variants keep the country suffix. Unknown
 * codes fall back to Intl.DisplayNames or the raw code. */
function formatLocale(code){
  if(!code)return"";
  var map={
    "en_US":"English US","en_GB":"English UK","en_AU":"English AU","en_CA":"English CA",
    "en_NZ":"English NZ","en_IE":"English IE","en_IN":"English IN","en_ZA":"English ZA",
    "nl_NL":"Dutch","nl_BE":"Dutch BE",
    "de_DE":"German","de_AT":"German AT","de_CH":"German CH",
    "fr_FR":"French","fr_CA":"French CA","fr_BE":"French BE","fr_CH":"French CH",
    "es_ES":"Spanish","es_MX":"Spanish MX","es_AR":"Spanish AR","es_CO":"Spanish CO","es_CL":"Spanish CL",
    "pt_PT":"Portuguese","pt_BR":"Portuguese BR",
    "it_IT":"Italian","it_CH":"Italian CH",
    "ja_JP":"Japanese","ko_KR":"Korean",
    "zh_CN":"Chinese CN","zh_TW":"Chinese TW","zh_HK":"Chinese HK",
    "ru_RU":"Russian","pl_PL":"Polish","sv_SE":"Swedish","no_NO":"Norwegian","nb_NO":"Norwegian",
    "da_DK":"Danish","fi_FI":"Finnish","el_GR":"Greek","tr_TR":"Turkish",
    "ar_SA":"Arabic SA","ar_EG":"Arabic EG","he_IL":"Hebrew","hi_IN":"Hindi",
    "th_TH":"Thai","vi_VN":"Vietnamese","cs_CZ":"Czech","hu_HU":"Hungarian",
    "ro_RO":"Romanian","uk_UA":"Ukrainian","bg_BG":"Bulgarian","hr_HR":"Croatian",
    "sk_SK":"Slovak","sl_SI":"Slovenian","et_EE":"Estonian","lv_LV":"Latvian","lt_LT":"Lithuanian",
    "ca_ES":"Catalan","id_ID":"Indonesian","ms_MY":"Malay","fil_PH":"Filipino"
  };
  var norm=String(code).replace("-","_");
  if(map[norm])return map[norm];
  try{
    if(typeof Intl!=="undefined"&&Intl.DisplayNames){
      var dn=new Intl.DisplayNames(["en"],{type:"language"});
      var parts=norm.split("_");
      var lang=dn.of(parts[0]);
      if(lang&&parts[1])return lang+" "+parts[1].toUpperCase();
      if(lang)return lang;
    }
  }catch(e){}
  return norm;
}

var metaHtml="";
if(i.mxProfile.kind||i.mxLocale||(i.mxTranslations&&i.mxTranslations.length)){
  var pieces=[];
  if(i.mxProfile.kind){
    /* v0.2.44 — emoji dropped; "Kind (bold) · Name" */
    var profileMain=i.mxProfile.name?esc(i.mxProfile.name):esc(i.mxProfile.kind);
    var profileSub=i.mxProfile.name?esc(i.mxProfile.kind):"";
    pieces.push('<span class="mxi-meta-pill" title="Mendix profile / device class"><strong>'+profileMain+'</strong>'+(profileSub?' · '+profileSub:'')+'</span>');
  }
  if(i.mxLocale){
    /* v0.2.44 — emoji dropped; "Language(s) (bold) · English US" format */
    pieces.push('<span class="mxi-meta-pill" title="Default locale of this Mendix session"><strong>Language(s)</strong> · '+esc(formatLocale(i.mxLocale))+'</span>');
  }
  if(i.mxTranslations&&i.mxTranslations.length){
    /* v0.2.44 — emoji dropped; "Translations (bold) · +N" format */
    pieces.push('<span class="mxi-meta-pill" title="Configured translations on top of the default language"><strong>Translations</strong> · +'+i.mxTranslations.length+'</span>');
  }
  metaHtml='<div class="mxi-meta">'+pieces.join("")+'</div>';
}


/* v0.2.71 — Extracted into a named function so the 5s autorefresh can
 * rebuild ONLY the Data Sources section instead of tearing down the
 * whole inspector. Closure-captures color tokens, icon/esc helpers, and
 * the info object `i` — only `dsc` varies per autorefresh tick. */
function renderDataSourcesHTML(dsc){
  dsc = dsc || {};
  var mfs=dsc.microflows||[];
  var others=dsc.otherActions||[];
  var ops=dsc.operations||[];          /* v0.2.67 — Mendix 10 runtime ops */
  var xpath=dsc.xpathRetrieves||0;
  var assoc=dsc.associationRetrieves||0;
  var commits=dsc.commits||0;
  var sessionInits=dsc.sessionInits||0;
  var totalCalls=mfs.length+ops.length+xpath+assoc;
  /* Detect which Mendix client protocol is in play — drives the UI copy.
   * "classic" = Mendix 7-9 (executeaction with microflow names)
   * "m10"     = Mendix 10 React client (runtimeOperation with opaque opIds)
   * "mixed"   = some of both (rare — e.g. legacy page embedded in new client) */
  var protocol=ops.length>0?(mfs.length>0?"mixed":"m10"):"classic";
  var html='';

  /* If tracker is inactive or caught nothing, fall back to the fiber
   * counts with a clear note explaining why. */
  if(!i.perfTrackerActive){
    html+='<div style="padding:10px 12px;background:rgba(255,184,0,.1);border:1px solid rgba(255,184,0,.25);border-radius:10px;font-size:11px;color:#FFB800;margin-bottom:10px;display:flex;align-items:flex-start;gap:8px">'+icon("warning",14)+' <span>Perf tracker not active — showing DOM-inferred counts. Reload the page with the extension enabled for real-time data source capture.</span></div>';
    html+='<div class="mxi-metrics mxi-metrics-3">'+metric("Database",i.dataSources.database,null,"datasources")+metric("Microflow",i.dataSources.microflow)+metric("Nanoflow",i.dataSources.nanoflow)+'</div>';
    return html;
  }
  if(totalCalls===0){
    html+='<div style="padding:14px;background:'+v+';border-radius:10px;text-align:center;font-size:11px;color:'+x+'">No data source calls captured yet.<br><span style="font-size:10px">If you opened the inspector mid-session, reload the page to see what fires on initial load.</span></div>';
    /* v0.2.65 — When nothing was captured, surface the debug buffer so
     * we can see WHY. The tracker records sample URLs + body heads for
     * any request it thought might be a Mendix call. Useful for figuring
     * out if the endpoint changed (Mendix 10 variants) or the body
     * structure differs from what the parser expects. */
    var dbg=i.dsDebug||{};
    if(dbg.postCount>0||(dbg.sampleUrls&&dbg.sampleUrls.length>0)){
      html+='<details style="margin-top:10px;background:'+v+';border-radius:10px;padding:10px 12px;font-size:11px">';
      html+='<summary style="cursor:pointer;color:'+k+';font-weight:500;display:flex;align-items:center;gap:6px">'+icon("crosshair",12)+' <span>Debug: what the tracker saw</span></summary>';
      html+='<div style="margin-top:10px;color:'+f+';line-height:1.6">';
      html+='<div>Requests observed: <strong style="color:'+h+'">'+dbg.postCount+'</strong> · Parsed OK: <strong style="color:'+h+'">'+dbg.parsedOk+'</strong> · Parse failed: <strong style="color:'+h+'">'+dbg.parsedFail+'</strong> · Had action field: <strong style="color:'+h+'">'+dbg.hadActionField+'</strong></div>';
      if(dbg.sampleUrls&&dbg.sampleUrls.length){
        html+='<div style="margin-top:8px"><strong style="color:'+h+'">URL patterns:</strong></div>';
        html+='<ul style="margin:4px 0 0 0;padding-left:16px;color:#B8B8B8;font-family:\'Geist Mono\',\'SF Mono\',Monaco,Consolas,monospace;font-size:10.5px">';
        dbg.sampleUrls.forEach(function(u){ html+='<li style="margin-bottom:2px;word-break:break-all">'+esc(u)+'</li>'; });
        html+='</ul>';
      }
      if(dbg.unknownActionTypes&&dbg.unknownActionTypes.length){
        html+='<div style="margin-top:8px"><strong style="color:'+h+'">Unknown action types (seen but not classified):</strong></div>';
        html+='<ul style="margin:4px 0 0 0;padding-left:16px;color:#B8B8B8;font-size:10.5px">';
        dbg.unknownActionTypes.forEach(function(u){ html+='<li style="margin-bottom:2px">'+esc(u.type)+' · ×'+u.count+'</li>'; });
        html+='</ul>';
      }
      if(dbg.sampleBodies&&dbg.sampleBodies.length){
        html+='<div style="margin-top:8px"><strong style="color:'+h+'">Body samples (first 300 chars):</strong></div>';
        dbg.sampleBodies.forEach(function(bod,idx){
          html+='<div style="margin-top:6px;padding:8px 10px;background:#0A0A0A;border-radius:6px;font-family:\'Geist Mono\',\'SF Mono\',Monaco,Consolas,monospace;font-size:10px;color:#B8B8B8;word-break:break-all;white-space:pre-wrap;max-height:140px;overflow:auto">'+esc(bod)+'</div>';
        });
      }
      html+='<div style="margin-top:10px;font-size:10px;color:'+x+';font-style:italic">If you see a Mendix-looking endpoint or action type here that the tracker isn\'t classifying, share a screenshot — we\'ll widen the parser.</div>';
      html+='</div></details>';
    }
    return html;
  }
  /* v0.2.71 — Blue Mendix 10 banner removed; its content is covered by
   * the info-button tooltip in this section's header (set from the
   * section() call below). <details> "What am I looking at?" explainer
   * also removed; same content moved to that tooltip. Scope-note emoji
   * replaced with a Phosphor page icon. */
  var navNum=dsc.navigationNumber||0;
  html+='<div style="margin-bottom:10px;font-size:10px;color:'+x+';font-style:italic;display:flex;align-items:center;gap:6px">'+icon("page",10)+'<span>Current page only · resets on navigation'+(navNum>1?' (nav #'+navNum+')':'')+'</span></div>';

  /* ===== Classic protocol — DS_ microflow list ===== */
  if(mfs.length>0){
    html+='<div style="margin-top:14px;padding-top:10px;border-top:1px solid '+b+'">'+
          '<div style="font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:500;display:flex;align-items:center;justify-content:space-between">'+
          '<span>Microflow Data Sources</span>'+
          '<span style="color:'+f+';text-transform:none;letter-spacing:0;font-weight:400">'+mfs.length+' unique · '+mfs.reduce(function(a,x){return a+x.count},0)+' call'+(mfs.reduce(function(a,x){return a+x.count},0)===1?'':'s')+'</span>'+
          '</div>';
    html+='<div class="mxi-ds-list">';
    mfs.slice(0,25).forEach(function(mf){
      var nameParts=mf.name.split('.');
      var modName=nameParts.length>1?nameParts[0]:'';
      var shortName=nameParts[nameParts.length-1]||mf.name;
      var badgeClass=mf.count>5?'mxi-ds-count-hi':(mf.count>1?'mxi-ds-count-med':'mxi-ds-count-lo');
      var avgMs=mf.count>0?Math.round(mf.totalDuration/mf.count):0;
      var durStr=avgMs>0?(avgMs<1e3?avgMs+'ms':(avgMs/1e3).toFixed(2)+'s'):'';
      html+='<div class="mxi-ds-row" data-ds-name="'+esc(mf.name)+'">'+
              '<div class="mxi-ds-name-wrap">'+
                (modName?'<span class="mxi-ds-mod">'+esc(modName)+'</span>':'')+
                '<span class="mxi-ds-name">'+esc(shortName)+'</span>'+
              '</div>'+
              '<div class="mxi-ds-meta">'+
                (durStr?'<span class="mxi-ds-dur" title="Average duration per call">'+durStr+'</span>':'')+
                '<span class="mxi-ds-count '+badgeClass+'" title="Call count on this page load">×'+mf.count+'</span>'+
                '<button class="mxi-ds-copy" type="button" title="Copy full name to clipboard" data-ds-copy="'+esc(mf.name)+'">'+icon("copy",11)+'</button>'+
              '</div>'+
            '</div>';
    });
    if(mfs.length>25){
      html+='<div style="font-size:10px;color:'+x+';text-align:center;padding:6px 0;font-style:italic">…and '+(mfs.length-25)+' more</div>';
    }
    html+='</div></div>';
  }

  /* ===== Mendix 10 protocol — operationId list ===== */
  if(ops.length>0){
    html+='<div style="margin-top:14px;padding-top:10px;border-top:1px solid '+b+'">'+
          '<div style="font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;font-weight:500;display:flex;align-items:center;justify-content:space-between">'+
          '<span>Runtime Operations</span>'+
          '<span style="color:'+f+';text-transform:none;letter-spacing:0;font-weight:400">'+ops.length+' unique · '+ops.reduce(function(a,x){return a+x.count},0)+' call'+(ops.reduce(function(a,x){return a+x.count},0)===1?'':'s')+'</span>'+
          '</div>';
    html+='<div class="mxi-ds-list">';
    ops.slice(0,25).forEach(function(op){
      var badgeClass=op.count>5?'mxi-ds-count-hi':(op.count>1?'mxi-ds-count-med':'mxi-ds-count-lo');
      var avgMs=op.count>0?Math.round(op.totalDuration/op.count):0;
      var durStr=avgMs>0?(avgMs<1e3?avgMs+'ms':(avgMs/1e3).toFixed(2)+'s'):'';
      /* Shape badge — paints the "list ×50 sorted" kind of summary so
       * the user has context even without a name. */
      var shapeHtml=op.shape?'<span class="mxi-ds-shape" title="Inferred from options payload">'+esc(op.shape)+'</span>':'';
      var writeFlag=op.hasChanges?'<span class="mxi-ds-write" title="This operation also carried changed objects — it writes data">'+icon("edit",11)+'</span>':'';
      /* v0.2.69 — full operationId shown (no truncation). The ID wraps
       * via word-break to handle long hashes without hiding information. */
      html+='<div class="mxi-ds-row" data-op-id="'+esc(op.opId)+'">'+
              '<div class="mxi-ds-name-wrap">'+
                '<span class="mxi-ds-name mxi-ds-name-opid" title="'+esc(op.opId)+'">'+esc(op.opId)+'</span>'+
                shapeHtml+
                writeFlag+
              '</div>'+
              '<div class="mxi-ds-meta">'+
                (durStr?'<span class="mxi-ds-dur" title="Average duration per call">'+durStr+'</span>':'')+
                '<span class="mxi-ds-count '+badgeClass+'" title="Call count on this page load">×'+op.count+'</span>'+
                '<button class="mxi-ds-copy" type="button" title="Copy operationId" data-ds-copy="'+esc(op.opId)+'">'+icon("copy",11)+'</button>'+
              '</div>'+
            '</div>';
    });
    if(ops.length>25){
      html+='<div style="font-size:10px;color:'+x+';text-align:center;padding:6px 0;font-style:italic">…and '+(ops.length-25)+' more</div>';
    }
    html+='</div></div>';
  }

  /* ===== Non-DS microflow actions (usually user-triggered) ===== */
  if(others.length>0){
    html+='<div style="margin-top:12px;padding-top:10px;border-top:1px solid '+b+'">'+
          '<div style="font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;font-weight:500">Other Actions ('+others.length+')</div>'+
          '<div style="font-size:10px;color:'+x+';font-style:italic;margin-bottom:8px">Microflows without DS_ prefix — usually user-triggered onClick actions</div>'+
          '<div class="mxi-ds-list">';
    others.slice(0,10).forEach(function(mf){
      var nameParts=mf.name.split('.');
      var shortName=nameParts[nameParts.length-1]||mf.name;
      html+='<div class="mxi-ds-row mxi-ds-row-subtle">'+
              '<span class="mxi-ds-name" style="font-weight:400">'+esc(shortName)+'</span>'+
              '<span class="mxi-ds-count mxi-ds-count-lo">×'+mf.count+'</span>'+
            '</div>';
    });
    html+='</div></div>';
  }

  /* ===== Footer: commits/updates (writes) ===== */
  if(commits>0){
    html+='<div style="margin-top:12px;padding:8px 12px;background:rgba(255,184,0,.08);border:1px solid rgba(255,184,0,.2);border-radius:8px;font-size:11px;color:#FFB800;display:flex;align-items:center;gap:6px">'+icon("edit",11)+' <span>'+commits+' commit/update call'+(commits===1?'':'s')+' during page load — page is writing data, not just reading.</span></div>';
  }

  /* ===== Help note ===== */
  if(protocol==="classic"||protocol==="mixed"){
    html+='<div style="margin-top:10px;font-size:10px;color:'+x+';font-style:italic;line-height:1.5;display:flex;align-items:flex-start;gap:6px">'+icon("info",10)+' <span>DS_ prefix = Mendix convention for microflows used as data sources. Repeated calls (×2+) usually mean the microflow is called from inside a nested data container — often a performance red flag.</span></div>';
  } else {
    html+='<div style="margin-top:10px;font-size:10px;color:'+x+';font-style:italic;line-height:1.5;display:flex;align-items:flex-start;gap:6px">'+icon("info",10)+' <span>In Mendix 10 the React client uses opaque operationIds. Same ID firing multiple times = same operation called repeatedly — the classic nested-data-source fingerprint. Shapes like "list ×50 sorted filtered" are inferred from the options payload each call carries.</span></div>';
  }

  return html;
}

var html=css+'<div class="mxi-header" id="mxi-drag-handle"><div class="mxi-header-top"><div class="mxi-logo">'+mascot+'<span class="mxi-title">MxInspector</span></div><div class="mxi-header-buttons"><span class="mxi-badge">'+i.version+'</span><span class="mxi-badge'+(i.client==="React"?" mxi-badge-accent":"")+'">'+i.client+'</span><button class="mxi-icon-btn" id="mxi-info-btn" title="About">'+icon("info",16)+'<div class="mxi-info-tooltip" id="mxi-info-tooltip"><div class="mxi-info-line"><strong>MxInspector</strong> v0.2.5-beta</div><div class="mxi-info-line">Created with ❤️ by <strong>Tim Maurer</strong></div><div class="mxi-info-line" style="color:#9A9A9A;font-size:10px">Free for personal & commercial use.<br>MIT License • Attribution required.</div><a href="https://paypal.me/tapmaurer" target="_blank" class="mxi-coffee-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" width="14" height="14"><path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.59,96.59,0,0,1-27,40.09H208a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16H56.54A96.3,96.3,0,0,1,24,136V88a8,8,0,0,1,8-8H208A40,40,0,0,1,248,120ZM200,96H40v40a80.27,80.27,0,0,0,45.12,72h69.76A80.27,80.27,0,0,0,200,136Zm32,24a24,24,0,0,0-16-22.62V136a95.78,95.78,0,0,1-1.2,15A24,24,0,0,0,232,128Z"/></svg>Buy me a coffee</a></div></button><button class="mxi-icon-btn" id="mxi-close-btn" title="Close">'+icon("x",16)+'</button></div></div><div class="mxi-env"><span>'+envIcon(i.envType)+' '+i.envType+'</span><span class="mxi-env-url">'+(i.env||location.host)+'</span></div>'+metaHtml+'</div><div class="mxi-body"><div class="mxi-score"><div class="mxi-score-circle" style="background:'+scoreColor(i.score)+'">'+i.score+'</div><div class="mxi-score-info"><div class="mxi-score-label">Health: '+scoreLabel+'</div><div class="mxi-score-desc">'+i.warnings.length+' insights • '+i.totalWidgets+' widgets</div></div><button class="mxi-chip-btn" id="mxi-score-info-btn" title="How is this score calculated?" style="align-self:flex-start;margin:-4px -4px 0 auto">'+icon("info",13)+'<div class="mxi-info-tooltip" id="mxi-score-info-tooltip" style="width:280px"><div class="mxi-info-line"><strong>How is this score calculated?</strong></div><div class="mxi-info-line">Starts at 100. Points are deducted when issues are detected:</div><div class="mxi-info-line">• <strong>Performance</strong> — slow load, high DOM, memory, slow requests</div><div class="mxi-info-line">• <strong>Accessibility</strong> — missing alt text, form labels, contrast</div><div class="mxi-info-line">• <strong>Security</strong> — known CVEs, exposed data, URL/form issues</div><div class="mxi-info-line">• <strong>Nesting</strong> — nested data sources, weighted by load impact</div><div class="mxi-info-line" style="color:#9A9A9A;font-size:10px;margin-top:10px">Open the <strong>Insights</strong> section below to see the exact deductions applied to this page.</div><div class="mxi-info-line" style="color:#9A9A9A;font-size:10px">90+ Excellent · 80–89 Good · 60–79 Fair · &lt;60 Needs Work</div></div></button></div><div class="mxi-page-info"><div class="mxi-page-row"><div class="mxi-page-main"><div class="mxi-page-module">'+i.module+'</div><div style="display:flex;align-items:center"><span class="mxi-page-name" title="'+i.page+'">'+i.page+'</span>'+(i.popup?'<span class="mxi-page-popup">POPUP</span>':'')+'</div></div><button class="mxi-copy-btn" id="mxi-copy-btn" title="Copy page name">'+icon("copy",14)+'</button></div>'+(i.pageParameters.length||i.dataViewEntities.length?'<div style="margin-top:10px;padding-top:10px;border-top:1px solid '+b+'"><div style="font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;display:flex;align-items:center;gap:6px">'+icon("page",12)+' CONTEXT OBJECTS</div><div style="display:flex;flex-wrap:wrap;gap:6px">'+(i.pageParameters.length?i.pageParameters:i.dataViewEntities).map(function(e){return'<span style="background:#2E2E2E;color:#FFFFFF;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:500;border:1px solid #3D3D3D">'+e+'</span>'}).join('')+'</div></div>':'')+'</div>'+
(insightsHtml?section("insights","Insights ("+i.warnings.length+")","bulb",insightsHtml,false):"")+
section("perf","Performance","lightning",'<div style="font-size:9px;color:'+x+';margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;font-weight:500">PAGE LOAD METRICS</div><div class="mxi-metrics">'+metric("Load",o(i.loadTime),i.loadTime>4e3?m:i.loadTime>2e3?p:g,"load")+metric("DOM",i.domNodes,i.domNodes>4e3?m:i.domNodes>2e3?p:g,"dom")+metric("Requests",i.totalRequests,null,"requests")+metric("Memory",i.jsHeap?i.jsHeap+"MB":"-",null,"memory")+'</div><div style="font-size:9px;color:'+x+';margin:12px 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:500">CORE WEB VITALS</div><div class="mxi-metrics">'+metric("FCP",i.firstContentfulPaint?o(i.firstContentfulPaint):"-",i.firstContentfulPaint>1800?p:null,"fcp")+metric("LCP",i.largestContentfulPaint?o(i.largestContentfulPaint):"-",i.largestContentfulPaint>2500?p:null,"lcp")+metric("TTFB",i.ttfb?o(i.ttfb):"-",i.ttfb>600?p:null,"ttfb")+metric("CLS",i.cls?i.cls.toFixed(3):"-",i.cls>0.1?p:null,"cls")+'</div><div style="margin-top:12px;font-size:10px;color:#666;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px">'+icon("info",10)+' <span>Metrics measured on initial page load</span></div>',true)+
section("widgets","Data Containers","cube",widgetsContent,false)+
/* v0.2.64 — Data Sources rebuilt around runtime call capture. The old
 * DOM-inferred "Database 7" was misleading because almost everything
 * comes from the database at some layer. This version reads the actual
 * /xas/ calls made during page load (captured by perf-tracker at
 * document_start) and shows what microflows / retrieves actually fired.
 *
 * Why this matters: DS_-prefixed microflows used as data sources are
 * often the performance killers — especially when nested. Seeing
 * "DS_GetOrderLines_ByOrder called 47 times" on a slow page is gold. */
/* v0.2.71 — Data Sources section — now a function call + a headerExtra
 * IIFE that builds the info/refresh buttons on the right side of the
 * section header. Clicks on those buttons do NOT toggle collapse —
 * section() bails when the click originated inside .mxi-section-header-extra. */
section("data","Data Sources","db",renderDataSourcesHTML(i.dataSourceCalls),false,(function(){
  var _dsc = i.dataSourceCalls || {};
  var _ops = _dsc.operations || [];
  var _mfs = _dsc.microflows || [];
  var proto = _ops.length > 0 ? (_mfs.length > 0 ? "mixed" : "m10") : "classic";
  var tipHtml = ''+
    '<div class="mxi-info-line"><strong>Each row = one server call to your Mendix backend.</strong></div>'+
    '<div class="mxi-info-line"><strong>Operation ID</strong> — unique hash identifying a specific server operation. Same hash = same microflow/retrieve. '+(proto==="m10"?'Mendix 10 doesn\'t send microflow names over the wire, so you see the ID instead.':'For classic Mendix you see the full Module.DS_Name.')+'</div>'+
    '<div class="mxi-info-line"><strong>Shape badge</strong> (blue pill) — inferred from the options payload: <strong>call</strong> = simple op, <strong>list ×N</strong> = paginated retrieve, <strong>sorted</strong> = has sort order, <strong>filtered</strong> = has XPath filter.</div>'+
    '<div class="mxi-info-line"><strong>Duration</strong> — average milliseconds per call. Above ~500ms is worth investigating.</div>'+
    '<div class="mxi-info-line"><strong>×N count</strong> — how many times this operation fired. ×1 normal · ×2–5 moderate · ×6+ likely nested data source.</div>'+
    '<div class="mxi-info-line" style="color:#9A9A9A;font-size:10px;margin-top:10px">List autorefreshes every 5s while this section is open.</div>';
  return '<span class="mxi-section-header-extra" style="margin-left:auto;display:inline-flex;align-items:center;gap:4px">'+
           '<button type="button" class="mxi-chip-btn" id="mxi-ds-refresh-btn" title="Refresh now">'+icon("refresh",13)+'</button>'+
           '<button type="button" class="mxi-chip-btn" id="mxi-ds-info-btn" title="What am I looking at?">'+icon("info",13)+
             '<div class="mxi-info-tooltip" id="mxi-ds-info-tooltip" style="width:300px">'+tipHtml+'</div>'+
           '</button>'+
         '</span>';
})())+
/* v0.2.42 — Actions section removed. Mendix 10's React client abstracts the
 * microflow reference behind an opaque runtime operationId, so we can't
 * accurately show which microflow each button calls. Rather than show
 * misleading class-name-based counts, the section is dropped entirely. */
section("conditional","Conditional ("+i.conditionalElements+")","eye",'<div class="mxi-metrics" style="grid-template-columns:1fr">'+metric("Hidden",i.conditionalElements,i.conditionalElements>30?p:null,"conditional")+"</div>",false)+
section("a11y","Accessibility ("+i.a11y.wcagLevel+")","a11y",a11yContent,false)+
section("typography","Typography","type",typoContent,false)+
section("css","CSS Analysis","css",cssContent,false)+
section("security","Security","shield",securityContent,false)+
section("network","Network","globe",'<div class="mxi-metrics mxi-metrics-3">'+metric("XHR",i.xhrRequests,null,"xhr")+metric("Static",i.staticRequests,null,"static")+metric("Total",i.totalRequests,null,"requests")+"</div>"+(i.slowRequests.length?'<div style="margin-top:10px;padding:8px 10px;background:#fef3c7;border-radius:6px;font-size:11px;color:#92400e"><strong style="display:inline-flex;align-items:center;gap:4px">'+icon("warning",11)+' Slow requests (>1s):</strong> '+i.slowRequests.slice(0,3).map(function(r){return r.url+" ("+r.duration+"ms)"}).join(", ")+"</div>":""),false)+
section("session","Session","user",sessionContent,false)+
'</div><div class="mxi-footer"><button class="mxi-btn mxi-btn-secondary" id="mxi-data-panel-btn" title="Open Data Inspector — see page parameters, entities, objects & attributes">'+icon("stack",16)+' Data</button><button class="mxi-btn mxi-btn-secondary" id="mxi-style-inspect-toggle" title="Inspect element styling & typography — hover any element to see its fonts, classes, and box model">'+icon("inspect",16)+' Style</button><button class="mxi-btn mxi-btn-primary" id="mxi-export-btn">'+icon("pdf",16)+' PDF</button></div>';

A.innerHTML=html;document.body.appendChild(A);

/* v0.2.52 — CSS handles show/hide entirely via :hover. JS does two small
 * things: (1) stop clicks on the ? from bubbling to the parent metric card
 * (which would trigger a highlight action), (2) if the popover would overflow
 * the right edge of the main panel, flip it to anchor left-aligned instead. */
(function(){
  A.querySelectorAll(".mxi-tip").forEach(function(tipEl){
    tipEl.addEventListener("click",function(e){e.stopPropagation()});
    var pop=tipEl.querySelector(".mxi-tip-pop");
    if(!pop)return;
    /* v0.2.54 — on hover, promote BOTH the metric card AND its enclosing
     * section to a high z-index. Sibling sections render in DOM order so
     * when a tooltip extends upward out of Data Containers into Performance,
     * Performance's cards paint over it unless Data Containers' stacking
     * context wins. Promoting the section z-index handles that case.
     * We also need the section to be `position:relative` for z-index to
     * take effect. */
    var parentMetric=tipEl.closest(".mxi-metric");
    var parentSection=tipEl.closest(".mxi-section");
    tipEl.addEventListener("mouseenter",function(){
      if(parentMetric)parentMetric.style.zIndex="100";
      if(parentSection){
        parentSection.style.position="relative";
        parentSection.style.zIndex="100";
      }
      /* Reset any prior flip */
      pop.style.right="0";
      pop.style.left="auto";
      var rect=pop.getBoundingClientRect();
      var panelRect=A.getBoundingClientRect();
      /* If the popover extends past the left edge of the panel, anchor left */
      if(rect.left<panelRect.left+4){
        pop.style.right="auto";
        pop.style.left="0";
      }
    });
    tipEl.addEventListener("mouseleave",function(){
      if(parentMetric)parentMetric.style.zIndex="";
      if(parentSection){
        parentSection.style.zIndex="";
        parentSection.style.position="";
      }
    });
  });
})();

/* v0.2.29 — additional styles for: embedded Data drawer button active state,
 * main-panel corner resize grip, and panel min-size rules. Injected separately
 * to keep this diff surgical. */
var extraStyle=document.createElement("style");
extraStyle.id="mxi-v029-styles";
extraStyle.textContent=
  '#mx-inspector-pro{min-width:320px;min-height:240px;max-width:95vw;max-height:95vh}'+
  '#mx-inspector-pro[data-mxi-minimized="true"]{min-height:0!important}'+
  '.mxi-body{position:relative}'+
  '.mxi-btn.mxi-btn-active{background:#FFB800;color:#141414;box-shadow:0 0 0 1px #ffcc33 inset}'+
  '.mxi-btn.mxi-btn-active:hover{background:#ffcc33}'+
  '#mxi-resize-grip{position:absolute;right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize;z-index:5;'+
    'background:linear-gradient(135deg,transparent 0 55%,#444 55% 60%,transparent 60% 70%,#444 70% 75%,transparent 75% 85%,#444 85% 90%,transparent 90%);'+
    'opacity:.5;transition:opacity .15s}'+
  '#mxi-resize-grip:hover{opacity:1}';
document.head.appendChild(extraStyle);

/* Resize grip — bottom-right corner of the main panel */
var resizeGrip=document.createElement("div");
resizeGrip.id="mxi-resize-grip";
resizeGrip.title="Drag to resize";
A.appendChild(resizeGrip);
(function(){
  var resizing=false,sx=0,sy=0,sw=0,sh=0;
  resizeGrip.addEventListener("mousedown",function(e){
    resizing=true;
    var r=A.getBoundingClientRect();
    sx=e.clientX;sy=e.clientY;sw=r.width;sh=r.height;
    /* pin top/left so width/height changes don't jump the panel */
    A.style.left=r.left+"px";A.style.top=r.top+"px";A.style.right="auto";A.style.maxHeight="none";
    e.preventDefault();e.stopPropagation();
  });
  document.addEventListener("mousemove",function(e){
    if(!resizing)return;
    var nw=Math.max(320,Math.min(window.innerWidth*0.95,sw+(e.clientX-sx)));
    var nh=Math.max(240,Math.min(window.innerHeight*0.95,sh+(e.clientY-sy)));
    A.style.width=nw+"px";
    A.style.height=nh+"px";
  },true);
  document.addEventListener("mouseup",function(){
    if(!resizing)return;
    resizing=false;
    /* v0.2.33 — persist only when a resize actually happened. Previously the
     * save ran on ANY mouseup anywhere, which was excessive and could persist
     * a minimized 68px height. */
    try {
      var r=A.getBoundingClientRect();
      localStorage.setItem("mxi_main_size",JSON.stringify({w:Math.round(r.width),h:Math.round(r.height)}));
    } catch(e){}
  },true);
})();

/* v0.2.30 — restore persisted panel size from localStorage if present */
(function(){
  try {
    var saved=localStorage.getItem("mxi_main_size");
    if(saved){
      var dims=JSON.parse(saved);
      if(dims && dims.w && dims.h){
        var maxW=window.innerWidth*0.95, maxH=window.innerHeight*0.95;
        var w=Math.max(320,Math.min(maxW,dims.w));
        var h=Math.max(240,Math.min(maxH,dims.h));
        A.style.width=w+"px";
        A.style.height=h+"px";
        A.style.maxHeight="none";
      }
    }
  } catch(e){}
})();

/* v0.2.33 — save-on-resize now integrated into the resize grip handler above. */

/* v0.2.30 — if the Data Inspector was open in this session (e.g. a page
 * navigation just rebuilt the main panel), auto-reopen the drawer after
 * initial scans are done. Small delay so the main panel finishes its own
 * render cycle first. */
setTimeout(function(){
  try {
    if (window.__MxDataPanel && window.__MxDataPanel.wasOpenInSession && window.__MxDataPanel.wasOpenInSession() && !window.__MxDataPanel.isOpen()) {
      var dataBtnAuto=document.getElementById("mxi-data-panel-btn");
      if(dataBtnAuto) dataBtnAuto.click();
    }
  } catch(e){}
},400);

var clearBtn=document.createElement("button");clearBtn.className="mxi-clear-btn";clearBtn.textContent="✕ Clear Highlights";clearBtn.onclick=function(){clearHighlights()};document.body.appendChild(clearBtn);

/* ----------------------------------------------------------------------
 * v0.2.58 — Portal-based overlay highlighting
 *
 * Previously this file used an outline class + body-level labels to
 * highlight elements triggered from clickable metrics / a11y tiles /
 * insights. That approach gets clipped by Mendix grid layouts (ancestor
 * overflow:hidden / transforms / clip-path / contain:paint).
 *
 * Ported over the overlay system from mxi-data-panel.js (v0.2.28):
 *   - One <div> per target, appended to document.body
 *   - position:fixed, coords from getBoundingClientRect()
 *   - Kept in sync by scroll (capture), resize, and a RAF tick
 *   - Tinted background (20%) + border + halo glow + inset-ring via
 *     color-mix() so all severity colors share the same visual treatment
 *
 * The overlay root uses a separate id from mxi-data-panel's so the two
 * systems don't collide when both are active (drawer open AND a metric
 * highlight pinned). ---------------------------------------------------- */
var MXI_INS_OVERLAY_ROOT_ID="mxi-ins-overlay-root";
var MXI_INS_OVERLAY_STYLE_ID="mxi-ins-overlay-styles";
function getInsOverlayRoot(){
  var r=document.getElementById(MXI_INS_OVERLAY_ROOT_ID);
  if(r)return r;
  r=document.createElement("div");
  r.id=MXI_INS_OVERLAY_ROOT_ID;
  /* z-index 999990 sits above Mendix content but below the main
   * MxInspector panel (999999) so panel text stays on top. Matches
   * mxi-data-panel's overlay root. */
  r.style.cssText="position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;z-index:999990;";
  document.body.appendChild(r);
  return r;
}
function ensureInsOverlayStyles(){
  if(document.getElementById(MXI_INS_OVERLAY_STYLE_ID))return;
  var s=document.createElement("style");
  s.id=MXI_INS_OVERLAY_STYLE_ID;
  s.textContent=
    ".mxi-ins-ol{"+
      "position:fixed;pointer-events:none;box-sizing:border-box;"+
      "border:3px solid var(--mxi-ins-color,#FFB800);"+
      "background:color-mix(in srgb, var(--mxi-ins-color,#FFB800) 18%, transparent);"+
      "box-shadow:0 0 0 1px color-mix(in srgb, var(--mxi-ins-color,#FFB800) 40%, transparent),"+
                " 0 0 12px 2px color-mix(in srgb, var(--mxi-ins-color,#FFB800) 25%, transparent);"+
      "border-radius:3px;transition:opacity .12s;"+
    "}"+
    ".mxi-ins-ol-label{"+
      "position:absolute;top:-22px;left:-3px;"+
      "background:var(--mxi-ins-color,#FFB800);color:#0A0A0A;"+
      "padding:3px 8px;border-radius:4px 4px 4px 0;"+
      "font:700 11px Inter,-apple-system,system-ui,sans-serif;"+
      "letter-spacing:.2px;white-space:nowrap;"+
      "box-shadow:0 2px 8px rgba(0,0,0,.4);"+
      "max-width:80vw;overflow:hidden;text-overflow:ellipsis;"+
    "}"+
    ".mxi-ins-ol[data-flip='below'] .mxi-ins-ol-label{"+
      "top:auto;bottom:-22px;border-radius:0 4px 4px 4px;"+
    "}"+
    /* v0.2.59 — Neutral variant for informational highlights (data
     * containers, non-warning clickable metrics). Grey outline, dark chip
     * with white text — reads as "hey look here" not "warning". */
    ".mxi-ins-ol[data-variant='neutral']{"+
      "border-color:#B0B0B0;"+
      "background:color-mix(in srgb, #B0B0B0 14%, transparent);"+
      "box-shadow:0 0 0 1px rgba(176,176,176,.32),"+
                " 0 0 12px 2px rgba(176,176,176,.18);"+
    "}"+
    ".mxi-ins-ol[data-variant='neutral'] .mxi-ins-ol-label{"+
      "background:#1A1A1A;color:#FFFFFF;"+
      "border:1px solid rgba(255,255,255,.12);"+
    "}";
  document.head.appendChild(s);
}
function createInsOverlay(target,color,label,variant){
  var ov=document.createElement("div");
  ov.className="mxi-ins-ol";
  ov.style.setProperty("--mxi-ins-color",color);
  if(variant)ov.setAttribute("data-variant",variant);
  if(label){
    var chip=document.createElement("div");
    chip.className="mxi-ins-ol-label";
    chip.textContent=label;
    ov.appendChild(chip);
  }
  function reposition(){
    if(!target||!target.getBoundingClientRect)return;
    /* v0.2.1 — display:contents handling. Mendix 11 DataGrid2 rows use
     * display:contents so getBoundingClientRect() returns 0×0. Union the
     * child rects so insight/metric highlights that target a row still
     * produce a visible overlay. Same rationale as mxi-data-panel's
     * measureTarget() — see comment there. */
    var r=target.getBoundingClientRect();
    if(r.width===0&&r.height===0){
      var kids=target.children;
      if(kids&&kids.length){
        var L=Infinity,T=Infinity,R=-Infinity,B=-Infinity,any=false;
        for(var k=0;k<kids.length;k++){
          var kr=kids[k].getBoundingClientRect();
          if(kr.width===0&&kr.height===0)continue;
          if(kr.left<L)L=kr.left;
          if(kr.top<T)T=kr.top;
          if(kr.right>R)R=kr.right;
          if(kr.bottom>B)B=kr.bottom;
          any=true;
        }
        if(any)r={left:L,top:T,right:R,bottom:B,width:R-L,height:B-T};
      }
    }
    if(r.width===0&&r.height===0){ov.style.opacity="0";return}
    ov.style.opacity="1";
    ov.style.left=r.left+"px";
    ov.style.top=r.top+"px";
    ov.style.width=r.width+"px";
    ov.style.height=r.height+"px";
    ov.setAttribute("data-flip",r.top<26?"below":"above");
  }
  reposition();
  getInsOverlayRoot().appendChild(ov);
  return {node:ov,reposition:reposition,target:target};
}
var _insOverlayListenersBound=false;
function bindInsOverlayListeners(){
  if(_insOverlayListenersBound)return;
  _insOverlayListenersBound=true;
  function refreshAll(){
    activeOverlays.forEach(function(o){if(o&&o.reposition)o.reposition()});
  }
  window.addEventListener("scroll",refreshAll,true);
  window.addEventListener("resize",refreshAll,true);
  function tick(){
    if(activeOverlays.length>0)refreshAll();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
function destroyInsOverlay(o){
  if(o&&o.node&&o.node.parentNode)o.node.parentNode.removeChild(o.node);
}

/* Highlight state — array of overlay handles (replaces the old
 * highlightedEls/labelEls pair). activeInsight/activeMetric are still
 * tracked the same way for button-state bookkeeping. */
var activeOverlays=[],activeInsight=null;
function clearHighlights(){
  activeOverlays.forEach(destroyInsOverlay);
  activeOverlays=[];
  clearBtn.style.display="none";
  clearBtn.style.background="#FFB800";
  clearBtn.style.boxShadow="0 4px 20px rgba(255,184,0,.4)";
  if(activeInsight){
    activeInsight.classList.remove("active");
    activeInsight.style.background="";
    activeInsight.style.borderColor="";
    activeInsight.removeAttribute("data-active-severity");
    activeInsight=null;
  }
  if(typeof activeMetric!=="undefined"&&activeMetric){
    activeMetric.style.background="";
    activeMetric.style.borderColor="";
    activeMetric=null;
  }
}
/* Paint an array of targets with the portal overlay approach.
 * Returns the number of overlays created so callers can bail gracefully.
 * v0.2.59: variant param ("neutral" for informational data-container
 * highlights; omit for severity-colored highlights). Labels also pick up
 * nesting depth when the target sits inside other data containers —
 * "1/3 • listView1 • 2 deep". */
function paintOverlays(targets,color,labelPrefix,variant){
  ensureInsOverlayStyles();
  bindInsOverlayListeners();
  /* Clear any drawer-owned overlays so we don't stack two systems on the
   * same element. v0.2.59 fix for the double-overlay bug. */
  try{
    if(window.__MxDataPanel&&window.__MxDataPanel.clearAllHighlights){
      window.__MxDataPanel.clearAllHighlights();
    }
  }catch(e){}
  var made=0;
  targets.forEach(function(t,idx){
    if(!t||!t.parentNode||!t.getBoundingClientRect)return;
    var widgetMatch=t.className&&typeof t.className==="string"?t.className.match(/mx-name-([^\s]+)/):null;
    /* Nesting depth — how many data-container ancestors sit above this
     * element. Useful for Nested Issues highlights, harmless otherwise. */
    var depth=0;
    try{if(typeof countContainerDepth==="function")depth=countContainerDepth(t)}catch(e){}
    var label=(idx+1)+"/"+targets.length+
              (widgetMatch?" • "+widgetMatch[1]:"")+
              (depth>0?" • "+depth+" deep":"");
    if(labelPrefix)label=labelPrefix+" "+label;
    activeOverlays.push(createInsOverlay(t,color,label,variant));
    made++;
  });
  return made;
}

/* Legacy no-op stubs. Old code paths reference highlightedEls/labelEls as
 * arrays (length checks, push calls). Keeping empty arrays around means
 * those paths run without error but do nothing. Preserved only for
 * backwards-compat until all call sites are rewired. */
var highlightedEls=[],labelEls=[];

var dragHandle=document.getElementById("mxi-drag-handle"),isDragging=false,dragPending=false,startX,startY,startLeft,startTop;
/* v0.2.2 — The old code called e.preventDefault() on every mousedown in the
 * header, which intermittently broke the double-click-to-minimize gesture.
 * Two mousedowns must pair within the browser's dblclick timing window to
 * produce a dblclick event; preventDefault on mousedown can (and, under
 * certain focus/selection state, does) break that pairing. New approach:
 * mousedown only flags the drag as "pending" and records the start point.
 * preventDefault fires only once the user has actually moved past a 4px
 * threshold — at that point it's clearly a drag, not a click or dblclick
 * gesture, so suppressing text-selection is the right call. Pure clicks
 * and double-clicks never hit preventDefault at all. */
dragHandle.addEventListener("mousedown",function(e){
  if(e.target.closest(".mxi-icon-btn")||e.target.closest(".mxi-copy-btn"))return;
  if(e.button!==0)return; /* left button only */
  dragPending=true;
  startX=e.clientX;startY=e.clientY;
  var rect=A.getBoundingClientRect();
  startLeft=rect.left;startTop=rect.top;
});
document.addEventListener("mousemove",function(e){
  if(dragPending&&!isDragging){
    var dx=e.clientX-startX,dy=e.clientY-startY;
    if(dx*dx+dy*dy>=16){ /* 4px threshold */
      isDragging=true;
      try{e.preventDefault()}catch(_){}
    }
  }
  if(isDragging){A.style.right="auto";A.style.left=startLeft+(e.clientX-startX)+"px";A.style.top=startTop+(e.clientY-startY)+"px";try{e.preventDefault()}catch(_){}}
});
document.addEventListener("mouseup",function(){isDragging=false;dragPending=false});

document.getElementById("mxi-close-btn").onclick=function(){
if(typeof styleInspectActive!=="undefined"&&styleInspectActive){styleInspectActive=false;document.removeEventListener("mousemove",handleStyleInspectHover);document.removeEventListener("mouseout",handleStyleInspectOut);if(typeof destroyStyleInspectElements==="function")destroyStyleInspectElements();document.body.style.cursor=""}
if(typeof styleInspectCloseBtn!=="undefined"&&styleInspectCloseBtn){styleInspectCloseBtn.remove();styleInspectCloseBtn=null}
if(inspectModeActive){inspectModeActive=false;document.removeEventListener("mousemove",handleInspectHover);document.removeEventListener("mouseout",handleInspectOut);destroyInspectTooltip();document.body.style.cursor=""}
if(inspectCloseBtn){inspectCloseBtn.remove();inspectCloseBtn=null}
/* Clean up widget inspector if active */
if(typeof widgetInspectActive!=="undefined"&&widgetInspectActive){widgetInspectActive=false;document.removeEventListener("mousemove",handleWidgetInspectHover);document.removeEventListener("mouseout",handleWidgetInspectOut);if(typeof destroyWidgetInspectElements==="function")destroyWidgetInspectElements();document.body.style.cursor=""}
if(typeof widgetInspectCloseBtn!=="undefined"&&widgetInspectCloseBtn){widgetInspectCloseBtn.remove();widgetInspectCloseBtn=null}
/* Clean up data panel if open */
if(typeof dataPanelVisible!=="undefined"&&dataPanelVisible&&typeof closeDataPanel==="function")closeDataPanel();
document.removeEventListener("keydown",handleEscapeKey);
cleanup();clearHighlights();clearBtn.remove();A.remove();var _or=document.getElementById(MXI_INS_OVERLAY_ROOT_ID);if(_or)_or.remove();var _os=document.getElementById(MXI_INS_OVERLAY_STYLE_ID);if(_os)_os.remove()};

var infoBtn=document.getElementById("mxi-info-btn"),infoTooltip=document.getElementById("mxi-info-tooltip");
infoBtn.onclick=function(e){e.stopPropagation();infoTooltip.classList.toggle("show")};
document.addEventListener("click",function(e){if(infoTooltip&&!e.target.closest("#mxi-info-btn")&&!e.target.closest("#mxi-info-tooltip"))infoTooltip.classList.remove("show")});

/* v0.2.37 — score breakdown info button: click to open, click outside to dismiss */
var scoreInfoBtn=document.getElementById("mxi-score-info-btn"),scoreInfoTooltip=document.getElementById("mxi-score-info-tooltip");
if(scoreInfoBtn&&scoreInfoTooltip){
  scoreInfoBtn.onclick=function(e){e.stopPropagation();scoreInfoTooltip.classList.toggle("show")};
  document.addEventListener("click",function(e){if(scoreInfoTooltip&&!e.target.closest("#mxi-score-info-btn")&&!e.target.closest("#mxi-score-info-tooltip"))scoreInfoTooltip.classList.remove("show")});
}

/* v0.2.71 — Data Sources info button (replaces the old <details> explainer)
 * and manual refresh button. Same open/dismiss pattern as Score tooltip.
 * Manual refresh uses the surgical innerHTML-swap path so it doesn't blink
 * the whole panel. */
var dsInfoBtn=document.getElementById("mxi-ds-info-btn"),dsInfoTooltip=document.getElementById("mxi-ds-info-tooltip");
if(dsInfoBtn&&dsInfoTooltip){
  /* Clicks inside the tooltip must NOT bubble to the button (which would
   * toggle the tooltip closed). */
  dsInfoTooltip.addEventListener("click",function(e){e.stopPropagation()});
  dsInfoBtn.onclick=function(e){e.stopPropagation();dsInfoTooltip.classList.toggle("show")};
  document.addEventListener("click",function(e){if(dsInfoTooltip&&!e.target.closest("#mxi-ds-info-btn")&&!e.target.closest("#mxi-ds-info-tooltip"))dsInfoTooltip.classList.remove("show")});
}
var dsRefreshBtn=document.getElementById("mxi-ds-refresh-btn");
if(dsRefreshBtn){
  dsRefreshBtn.onclick=function(e){
    e.stopPropagation();
    var btn=dsRefreshBtn;
    btn.classList.add("mxi-chip-spin");
    setTimeout(function(){ btn.classList.remove("mxi-chip-spin"); }, 400);
    try {
      if (!window.__mxiPerf || !window.__mxiPerf.getSummary) return;
      var fresh = window.__mxiPerf.getSummary();
      if (!fresh || !fresh.dataSourceCalls) return;
      var freshDsc = fresh.dataSourceCalls;
      if (freshDsc.microflows)   freshDsc.microflows.sort(function(a,b){return b.count-a.count});
      if (freshDsc.otherActions) freshDsc.otherActions.sort(function(a,b){return b.count-a.count});
      if (freshDsc.operations)   freshDsc.operations.sort(function(a,b){return b.count-a.count});
      i.dataSourceCalls = freshDsc;
      if (fresh.dsDebug) i.dsDebug = fresh.dsDebug;
      var sec = A.querySelector('.mxi-section[data-section-id="data"]');
      var content = sec && sec.querySelector(".mxi-section-content");
      if (content) content.innerHTML = renderDataSourcesHTML(freshDsc);
    } catch(err){}
  };
}

/* Copy - ONLY PAGE NAME */
document.getElementById("mxi-copy-btn").onclick=function(){var btn=this;var text=i.page;
/* v0.2.60 — Copy success flash: green background, green border (was
 * inheriting the dark-grey idle border so the yellow hover ring was
 * bleeding through), dark-text icon for legibility. */
function flashSuccess(){
  btn.innerHTML=icon("check",18);
  btn.style.background="#3DDC97";
  btn.style.borderColor="#3DDC97";
  btn.style.color="#141414";
  setTimeout(function(){
    btn.innerHTML=icon("copy",18);
    btn.style.background="";
    btn.style.borderColor="";
    btn.style.color="";
  },1500);
}
if(navigator.clipboard){navigator.clipboard.writeText(text).then(flashSuccess)}else{var ta=document.createElement("textarea");ta.value=text;ta.style.cssText="position:fixed;left:-9999px";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);flashSuccess()}};

/* v0.2.64 — Data source name copy buttons. Each DS row has a small copy
 * icon next to the call count. Clicking copies the full fully-qualified
 * microflow name so devs can paste straight into Studio Pro's Ctrl+Q
 * navigator or search to jump to the microflow. */
A.querySelectorAll(".mxi-ds-copy").forEach(function(btn){
  btn.addEventListener("click",function(e){
    e.stopPropagation();
    var name=btn.getAttribute("data-ds-copy")||"";
    if(!name)return;
    function flashDsCopy(){
      btn.classList.add("mxi-ds-copied");
      btn.innerHTML=icon("check",11);
      setTimeout(function(){
        btn.classList.remove("mxi-ds-copied");
        btn.innerHTML=icon("copy",11);
      },1200);
    }
    if(navigator.clipboard){
      navigator.clipboard.writeText(name).then(flashDsCopy);
    } else {
      var ta=document.createElement("textarea");
      ta.value=name;
      ta.style.cssText="position:fixed;left:-9999px";
      document.body.appendChild(ta);
      ta.select();
      try{document.execCommand("copy")}catch(ex){}
      document.body.removeChild(ta);
      flashDsCopy();
    }
  });
});

/* v0.2.48 — Log button removed. The console.log + alert was a debug hook
 * that non-developer users found confusing. Developers can use the Data
 * Inspector drawer or devtools directly. */



/* PDF EXPORT */
document.getElementById("mxi-export-btn").onclick=function(){
var scCol=scoreColor(i.score);var a11yCol=scoreColor(i.a11y.score);var secCol=scoreColor(i.security.score);
var logoSvg='<svg viewBox="0 0 52 24" width="52" height="24" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="24" height="24" rx="7" fill="#242424"/><rect x="28" y="0" width="24" height="24" rx="7" fill="#1A1A1A" stroke="#FF7A50" stroke-width="1.5"/><rect x="10" y="10" width="4" height="4" rx="0.5" fill="#fff"/><line x1="37" y1="6" x2="43" y2="18" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>';
var pdfHtml='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MxInspector Report - '+i.page+'</title><style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:900px;margin:0 auto;padding:40px;color:#1a1a1a;font-size:14px;line-height:1.5;background:#fff}.header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #FFB800}.header-logo{flex-shrink:0}.header-title{font-size:24px;font-weight:700;color:#1a1a1a}.header-subtitle{font-size:12px;color:#666;margin-top:2px}.meta-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px}.meta-item{background:#f8f8f8;padding:12px 16px;border-radius:8px}.meta-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}.meta-value{font-size:13px;font-weight:500;color:#1a1a1a}h2{color:#1a1a1a;font-size:16px;font-weight:600;margin:32px 0 16px;padding-bottom:8px;border-bottom:1px solid #eee}h3{color:#444;font-size:14px;font-weight:600;margin:20px 0 12px}.score-row{display:flex;gap:20px;margin-bottom:24px}.score-box{flex:1;background:#f8f8f8;border-radius:12px;padding:20px;text-align:center}.score-value{font-size:42px;font-weight:700;line-height:1}.score-label{font-size:11px;color:#666;margin-top:8px;text-transform:uppercase;letter-spacing:0.5px}.score-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-top:8px}.metrics{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.metric{background:#f8f8f8;padding:12px 16px;border-radius:8px;min-width:100px;text-align:center}.metric-value{font-size:18px;font-weight:600;color:#1a1a1a}.metric-label{font-size:10px;color:#888;margin-top:4px;text-transform:uppercase}.tag{display:inline-block;background:#f0f0f0;padding:4px 10px;margin:3px;border-radius:4px;font-size:11px;color:#444}.good{color:#3DDC97}.warn{color:#FF7A50}.bad{color:#FF5A5A}.section{margin:16px 0;padding:16px;background:#f8f8f8;border-radius:10px}.insight{padding:10px 14px;margin:6px 0;border-radius:8px;font-size:13px;background:#fff;border-left:4px solid #ddd}.insight.error{border-left-color:#FF5A5A;background:#fff5f5}.insight.warning{border-left-color:#FFB800;background:#fffbf0}.insight.success{border-left-color:#3DDC97;background:#f0fff5}.insight.info{border-left-color:#3B99FC;background:#f0f7ff}table{width:100%;border-collapse:collapse;margin:12px 0;background:#fff;border-radius:8px;overflow:hidden}th,td{padding:10px 14px;text-align:left;border-bottom:1px solid #eee}th{background:#f8f8f8;font-size:11px;text-transform:uppercase;color:#666;font-weight:600}.cve-box{background:#fff5f5;border:1px solid #ffcccc;border-radius:8px;padding:14px;margin:8px 0}.cve-id{font-weight:600;color:#FF5A5A}.cve-desc{font-size:12px;color:#666;margin-top:4px}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center;display:flex;align-items:center;justify-content:center;gap:12px}.credential-box{background:linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%);color:#fff;padding:20px;border-radius:12px;margin:24px 0}.credential-title{font-size:12px;color:#FFB800;font-weight:600;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px}.credential-row{display:flex;gap:20px;flex-wrap:wrap}.credential-item{flex:1;min-width:150px}.credential-label{font-size:10px;color:#888;margin-bottom:4px}.credential-value{font-size:14px;font-weight:500}@media print{body{padding:20px}.section,.score-box{break-inside:avoid}}</style></head><body>';

/* Header with logo */
pdfHtml+='<div class="header"><div class="header-logo">'+logoSvg+'</div><div><div class="header-title">MxInspector Report</div><div class="header-subtitle">Mendix Page Analysis & Security Audit</div></div></div>';

/* Meta info grid */
pdfHtml+='<div class="meta-grid">';
pdfHtml+='<div class="meta-item"><div class="meta-label">Page</div><div class="meta-value">'+i.module+'.'+i.page+(i.popup?' (Popup)':'')+'</div></div>';
pdfHtml+='<div class="meta-item"><div class="meta-label">Environment</div><div class="meta-value">'+i.envType+' — '+(i.env||location.host)+'</div></div>';
pdfHtml+='<div class="meta-item"><div class="meta-label">Platform</div><div class="meta-value">'+i.client+' Client • Mendix '+i.version+'</div></div>';
pdfHtml+='<div class="meta-item"><div class="meta-label">Generated</div><div class="meta-value">'+new Date().toLocaleString()+'</div></div>';
pdfHtml+='</div>';

/* Score row - Health, A11y, Security */
pdfHtml+='<div class="score-row">';
pdfHtml+='<div class="score-box"><div class="score-value" style="color:'+scCol+'">'+i.score+'</div><div class="score-label">Health Score</div><div class="score-badge" style="background:'+(i.score>=80?'#e8f5e9;color:#3DDC97':i.score>=60?'#fff3e0;color:#FF7A50':'#ffebee;color:#FF5A5A')+'">'+(i.score>=90?"Excellent":i.score>=80?"Good":i.score>=60?"Fair":"Needs Work")+'</div></div>';
pdfHtml+='<div class="score-box"><div class="score-value" style="color:'+a11yCol+'">'+i.a11y.score+'</div><div class="score-label">Accessibility</div><div class="score-badge" style="background:'+(i.a11y.score>=80?'#e8f5e9;color:#3DDC97':i.a11y.score>=60?'#fff3e0;color:#FF7A50':'#ffebee;color:#FF5A5A')+'">'+i.a11y.wcagLevel+'</div></div>';
pdfHtml+='<div class="score-box"><div class="score-value" style="color:'+secCol+'">'+i.security.score+'</div><div class="score-label">Security</div><div class="score-badge" style="background:'+(i.security.score>=80?'#e8f5e9;color:#3DDC97':i.security.score>=60?'#fff3e0;color:#FF7A50':'#ffebee;color:#FF5A5A')+'">'+(i.security.score>=80?"Good":i.security.score>=60?"Fair":"At Risk")+'</div></div>';
pdfHtml+='</div>';

/* Session / Credentials */
pdfHtml+='<div class="credential-box"><div class="credential-title">Session Information</div><div class="credential-row">';
pdfHtml+='<div class="credential-item"><div class="credential-label">User</div><div class="credential-value">'+(i.user||"Anonymous")+'</div></div>';
pdfHtml+='<div class="credential-item"><div class="credential-label">Roles</div><div class="credential-value">'+(i.roles||"None")+'</div></div>';
pdfHtml+='<div class="credential-item"><div class="credential-label">Status</div><div class="credential-value">'+(i.offline?"Offline":"Online")+'</div></div>';
pdfHtml+='<div class="credential-item"><div class="credential-label">Guest</div><div class="credential-value">'+(i.guest?"Yes":"No")+'</div></div>';
pdfHtml+='</div></div>';

/* Insights */
if(i.warnings.length){pdfHtml+='<h2>Insights ('+i.warnings.length+')</h2>';i.warnings.forEach(function(w){pdfHtml+='<div class="insight '+w.type+'">'+w.msg+'</div>'})}

/* Performance */
pdfHtml+='<h2>Performance</h2><div class="metrics">';
pdfHtml+='<div class="metric"><div class="metric-value '+(i.loadTime>4e3?"bad":i.loadTime>2e3?"warn":"good")+'">'+o(i.loadTime)+'</div><div class="metric-label">Load Time</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value '+(i.domNodes>4e3?"bad":i.domNodes>2e3?"warn":"good")+'">'+i.domNodes+'</div><div class="metric-label">DOM Nodes</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.totalRequests+'</div><div class="metric-label">Requests</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+(i.jsHeap?i.jsHeap+"MB":"-")+'</div><div class="metric-label">Memory</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+s(i.totalTransferred)+'</div><div class="metric-label">Transfer</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+(i.firstContentfulPaint?o(i.firstContentfulPaint):"-")+'</div><div class="metric-label">FCP</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+(i.largestContentfulPaint?o(i.largestContentfulPaint):"-")+'</div><div class="metric-label">LCP</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value '+(i.ttfb>600?"warn":"")+'">'+(i.ttfb?o(i.ttfb):"-")+'</div><div class="metric-label">TTFB</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value '+(i.cls>0.1?"warn":"")+'">'+(i.cls?i.cls.toFixed(3):"-")+'</div><div class="metric-label">CLS</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.maxNestingDepth+'</div><div class="metric-label">Max Depth</div></div>';
pdfHtml+='</div>';

/* Widgets */
pdfHtml+='<h2>Widgets ('+i.totalWidgets+')</h2><div class="section"><table><tr><th>Type</th><th>Count</th><th>Notes</th></tr>';
pdfHtml+='<tr><td>DataViews</td><td>'+i.dataViews+'</td><td></td></tr>';
pdfHtml+='<tr><td>ListViews</td><td>'+i.listViews+'</td><td></td></tr>';
pdfHtml+='<tr><td>TemplateGrids</td><td>'+i.templateGrids+'</td><td></td></tr>';
pdfHtml+='<tr><td>DataGrid 2</td><td>'+i.dataGrid2s+'</td><td></td></tr>';
pdfHtml+='<tr><td>Galleries</td><td>'+i.galleries+'</td><td></td></tr>';
pdfHtml+='<tr><td>TreeNodes</td><td class="'+(i.treeNodes?"warn":"")+'">'+i.treeNodes+'</td><td>'+(i.treeNodes?"Recursive nesting risk":"")+'</td></tr>';
pdfHtml+='<tr><td>Nested Issues</td><td class="'+(i.nestedDataViewsCritical.length?"bad":i.nestedDataViewsWarning.length?"warn":"")+'">'+(i.nestedDataViewsWarning.length+i.nestedDataViewsCritical.length)+'</td><td>'+(i.nestedDataViewsCritical.length?i.nestedDataViewsCritical.length+" critical (3+ levels)":"")+'</td></tr>';
pdfHtml+='</table>';
if(i.dataViewEntities.length)pdfHtml+='<p style="margin-top:12px"><strong>Entities:</strong> '+i.dataViewEntities.join(", ")+'</p>';
pdfHtml+='</div>';

/* Snippets — removed from PDF in v0.2.38 (detection unreliable) */

/* Actions — removed in v0.2.42 (see main-panel note; Mendix 10 hides microflow refs) */

/* Data Sources — v0.2.0: real runtime call capture via perf-tracker.
 * Falls back to classic 3-box counts only if the tracker isn't active. */
pdfHtml+='<h2>Data Sources</h2>';
(function(){
  var _dsc = i.dataSourceCalls || {};
  var _ops = _dsc.operations || [];
  var _mfs = _dsc.microflows || [];
  var _others = _dsc.otherActions || [];
  var _commits = _dsc.commits || 0;
  var _total = _mfs.length + _ops.length + (_dsc.xpathRetrieves||0) + (_dsc.associationRetrieves||0);
  var _proto = _ops.length > 0 ? (_mfs.length > 0 ? "mixed" : "Mendix 10") : "classic";

  if(!i.perfTrackerActive){
    /* Tracker not active — fall back to the old counts with a note. */
    pdfHtml+='<div class="section"><p style="color:#888;font-size:12px;font-style:italic;margin-bottom:12px">Perf tracker not active — showing DOM-inferred counts only.</p><div class="metrics">';
    pdfHtml+='<div class="metric"><div class="metric-value">'+(i.dataSources.database||0)+'</div><div class="metric-label">Database</div></div>';
    pdfHtml+='<div class="metric"><div class="metric-value">'+(i.dataSources.microflow||0)+'</div><div class="metric-label">Microflow</div></div>';
    pdfHtml+='<div class="metric"><div class="metric-value">'+(i.dataSources.nanoflow||0)+'</div><div class="metric-label">Nanoflow</div></div>';
    pdfHtml+='</div></div>';
    return;
  }
  if(_total===0){
    pdfHtml+='<div class="section"><p style="color:#888">No data source calls captured on this page load.</p></div>';
    return;
  }

  pdfHtml+='<div class="section"><p style="font-size:12px;color:#666;margin-bottom:12px">Protocol: <strong>'+_proto+'</strong> · '+_total+' call'+(_total===1?'':'s')+' on this page load'+(_commits?' · '+_commits+' write call'+(_commits===1?'':'s'):'')+'</p>';

  /* Classic microflows list */
  if(_mfs.length){
    pdfHtml+='<h3>Microflow Data Sources ('+_mfs.length+' unique)</h3>';
    pdfHtml+='<table><tr><th>Microflow</th><th>Avg Duration</th><th>Calls</th></tr>';
    _mfs.slice(0,30).forEach(function(mf){
      var avgMs = mf.count>0 ? Math.round(mf.totalDuration/mf.count) : 0;
      var durStr = avgMs>0 ? (avgMs<1000 ? avgMs+'ms' : (avgMs/1000).toFixed(2)+'s') : '-';
      var cls = mf.count>5 ? 'bad' : mf.count>1 ? 'warn' : '';
      pdfHtml+='<tr><td style="font-family:"Geist Mono",monospace;font-size:11px;word-break:break-all">'+mf.name+'</td><td>'+durStr+'</td><td class="'+cls+'">×'+mf.count+'</td></tr>';
    });
    if(_mfs.length>30) pdfHtml+='<tr><td colspan="3" style="text-align:center;color:#888;font-style:italic">…and '+(_mfs.length-30)+' more</td></tr>';
    pdfHtml+='</table>';
  }

  /* Mendix 10 runtime operations */
  if(_ops.length){
    pdfHtml+='<h3>Runtime Operations ('+_ops.length+' unique)</h3>';
    pdfHtml+='<p style="font-size:11px;color:#888;margin-bottom:8px">Mendix 10 uses opaque operation IDs — microflow names aren\'t sent over the wire.</p>';
    pdfHtml+='<table><tr><th>Operation ID</th><th>Shape</th><th>Avg Duration</th><th>Calls</th><th>Writes</th></tr>';
    _ops.slice(0,30).forEach(function(op){
      var avgMs = op.count>0 ? Math.round(op.totalDuration/op.count) : 0;
      var durStr = avgMs>0 ? (avgMs<1000 ? avgMs+'ms' : (avgMs/1000).toFixed(2)+'s') : '-';
      var cls = op.count>5 ? 'bad' : op.count>1 ? 'warn' : '';
      pdfHtml+='<tr><td style="font-family:"Geist Mono",monospace;font-size:10px;word-break:break-all;max-width:200px">'+op.opId+'</td><td style="font-size:11px">'+(op.shape||'-')+'</td><td>'+durStr+'</td><td class="'+cls+'">×'+op.count+'</td><td>'+(op.hasChanges?'Yes':'')+'</td></tr>';
    });
    if(_ops.length>30) pdfHtml+='<tr><td colspan="5" style="text-align:center;color:#888;font-style:italic">…and '+(_ops.length-30)+' more</td></tr>';
    pdfHtml+='</table>';
  }

  /* Other actions (non-DS microflows) */
  if(_others.length){
    pdfHtml+='<h3>Other Actions ('+_others.length+')</h3>';
    pdfHtml+='<p style="font-size:11px;color:#888;margin-bottom:8px">Microflows without DS_ prefix — usually user-triggered.</p>';
    pdfHtml+='<table><tr><th>Name</th><th>Calls</th></tr>';
    _others.slice(0,15).forEach(function(mf){
      pdfHtml+='<tr><td style="font-family:"Geist Mono",monospace;font-size:11px">'+mf.name+'</td><td>×'+mf.count+'</td></tr>';
    });
    pdfHtml+='</table>';
  }

  pdfHtml+='</div>';
})();

/* Conditional — v0.2.0 addition */
if(typeof i.conditionalElements === 'number'){
  pdfHtml+='<h2>Conditional ('+i.conditionalElements+')</h2>';
  pdfHtml+='<div class="section"><div class="metric" style="display:inline-block"><div class="metric-value '+(i.conditionalElements>30?'warn':'')+'">'+i.conditionalElements+'</div><div class="metric-label">Hidden elements</div></div>';
  if(i.conditionalElements>30) pdfHtml+='<p style="font-size:12px;color:#666;margin-top:8px;font-style:italic">High hidden-element count — consider whether all are needed on this page.</p>';
  pdfHtml+='</div>';
}

/* Accessibility */
pdfHtml+='<h2>Accessibility</h2><div class="section"><table><tr><th>Check</th><th>Result</th><th>Status</th></tr>';
pdfHtml+='<tr><td>Images without alt text</td><td>'+i.a11y.missingAltText+'/'+i.a11y.totalImages+'</td><td class="'+(i.a11y.missingAltText?"bad":"good")+'">'+(i.a11y.missingAltText?"Fail":"Pass")+'</td></tr>';
pdfHtml+='<tr><td>Form fields without labels</td><td>'+i.a11y.missingLabels+'/'+i.a11y.totalFormFields+'</td><td class="'+(i.a11y.missingLabels?"bad":"good")+'">'+(i.a11y.missingLabels?"Fail":"Pass")+'</td></tr>';
pdfHtml+='<tr><td>Heading structure</td><td>'+(i.a11y.missingH1?"Missing H1":"OK")+', '+i.a11y.headingSkips+' skips</td><td class="'+((i.a11y.missingH1||i.a11y.headingSkips)?"warn":"good")+'">'+((i.a11y.missingH1||i.a11y.headingSkips)?"Warning":"Pass")+'</td></tr>';
pdfHtml+='<tr><td>Empty links</td><td>'+i.a11y.emptyLinks+'</td><td class="'+(i.a11y.emptyLinks?"warn":"good")+'">'+(i.a11y.emptyLinks?"Warning":"Pass")+'</td></tr>';
pdfHtml+='<tr><td>Duplicate IDs</td><td>'+i.a11y.duplicateIds+'</td><td class="'+(i.a11y.duplicateIds?"bad":"good")+'">'+(i.a11y.duplicateIds?"Fail":"Pass")+'</td></tr>';
pdfHtml+='<tr><td>Contrast issues</td><td>'+i.a11y.contrastIssues+'</td><td class="'+(i.a11y.contrastIssues?"warn":"good")+'">'+(i.a11y.contrastIssues?"Warning":"Pass")+'</td></tr>';
pdfHtml+='<tr><td>Small fonts (&lt;12px)</td><td>'+i.a11y.smallFontSize+'</td><td class="'+(i.a11y.smallFontSize?"warn":"good")+'">'+(i.a11y.smallFontSize?"Warning":"Pass")+'</td></tr>';
pdfHtml+='<tr><td>Page language</td><td>'+(i.a11y.pageLang||"Missing")+'</td><td class="'+(i.a11y.missingLang?"warn":"good")+'">'+(i.a11y.missingLang?"Warning":"Pass")+'</td></tr>';
pdfHtml+='</table>';
if(i.a11y.improvements.length){pdfHtml+='<h3>Recommendations</h3><ul>';i.a11y.improvements.forEach(function(imp){pdfHtml+='<li>'+imp+'</li>'});pdfHtml+='</ul>'}
pdfHtml+='</div>';

/* Typography */
pdfHtml+='<h2>Typography</h2><div class="section">';
pdfHtml+='<p><strong>Primary Font:</strong> '+i.typography.primaryFont+'</p>';
pdfHtml+='<p><strong>Fonts Used ('+i.typography.fontCount+'):</strong> '+i.typography.fonts.slice(0,10).join(", ")+'</p>';
pdfHtml+='</div>';

/* CSS Analysis */
if(i.css){
pdfHtml+='<h2>CSS Analysis</h2><div class="metrics">';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.css.totalStylesheets+'</div><div class="metric-label">Stylesheets</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.css.totalRules+'</div><div class="metric-label">Rules</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value '+(i.css.importantCount>50?"warn":"")+'">'+i.css.importantCount+'</div><div class="metric-label">!important</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.css.inlineStyles+'</div><div class="metric-label">Inline Styles</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.css.customProperties+'</div><div class="metric-label">CSS Variables</div></div>';
pdfHtml+='</div>';
}

/* Security — v0.2.0: summary table + detail blocks for every check */
pdfHtml+='<h2>Security Analysis</h2><div class="section"><table><tr><th>Check</th><th>Found</th><th>Risk</th></tr>';
pdfHtml+='<tr><td>Known CVEs</td><td>'+i.security.cveWarnings.length+'</td><td class="'+(i.security.cveWarnings.length?"bad":"good")+'">'+(i.security.cveWarnings.length?"Critical":"None")+'</td></tr>';
pdfHtml+='<tr><td>Exposed JS Constants</td><td>'+i.security.exposedConstants.length+'</td><td class="'+(i.security.exposedConstants.length?"warn":"good")+'">'+(i.security.exposedConstants.length?"Medium":"None")+'</td></tr>';
pdfHtml+='<tr><td>Form Security Issues</td><td>'+i.security.formIssues.length+'</td><td class="'+(i.security.formIssues.length?"warn":"good")+'">'+(i.security.formIssues.length?"Medium":"None")+'</td></tr>';
pdfHtml+='<tr><td>Sensitive URL Params</td><td>'+i.security.urlParams.length+'</td><td class="'+(i.security.urlParams.length?"bad":"good")+'">'+(i.security.urlParams.length?"High":"None")+'</td></tr>';
/* v0.2.0 additions — only render rows when the underlying data is available */
if(i.security.mendixConstants){
  var _mc = i.security.mendixConstants;
  var _mcTotal = (_mc.secrets||0) + (_mc.sensitive||0);
  pdfHtml+='<tr><td>Mendix Constants · Secret scan</td><td>'+(_mc.secrets||0)+' secret · '+(_mc.sensitive||0)+' sensitive · '+(_mc.plain||0)+' plain</td><td class="'+((_mc.secrets||0)?"bad":(_mc.sensitive||0)?"warn":"good")+'">'+((_mc.secrets||0)?"High":(_mc.sensitive||0)?"Medium":"None")+'</td></tr>';
}
if(i.security.demoUsers){
  var _duIsProd = /prod/i.test(i.envType||"");
  var _duCount = i.security.demoUsers.count||0;
  pdfHtml+='<tr><td>Demo Users'+(_duIsProd?' (prod)':' (non-prod)')+'</td><td>'+_duCount+'</td><td class="'+(_duCount===0?"good":_duIsProd?"bad":"warn")+'">'+(_duCount===0?"None":_duIsProd?"Critical":"Expected")+'</td></tr>';
}
if(i.security.anonymous){
  pdfHtml+='<tr><td>Anonymous Session</td><td>'+(i.security.anonymous.anonymous?"Yes":"No")+'</td><td class="'+(i.security.anonymous.anonymous?"warn":"good")+'">'+(i.security.anonymous.anonymous?"Review":"OK")+'</td></tr>';
}
if(i.security.devMode){
  var _dm = i.security.devMode.confidence || "low";
  pdfHtml+='<tr><td>Dev-mode Indicators</td><td>Confidence: '+_dm+'</td><td class="'+(_dm==="high"?"warn":"good")+'">'+(_dm==="high"?"Warning":"OK")+'</td></tr>';
}
if(i.security.writableSensitive){
  var _ws = i.security.writableSensitive.withWrites || 0;
  pdfHtml+='<tr><td>Writable Sensitive Entities</td><td>'+_ws+'</td><td class="'+(_ws?"bad":"good")+'">'+(_ws?"High":"None")+'</td></tr>';
}
pdfHtml+='</table>';

/* CVE Details */
if(i.security.cveWarnings.length){
pdfHtml+='<h3 style="color:#FF5A5A;display:flex;align-items:center;gap:8px">'+icon("warning",14)+' Known Vulnerabilities</h3>';
i.security.cveWarnings.forEach(function(cve){
pdfHtml+='<div class="cve-box"><div class="cve-id">'+cve.id+' <span style="font-weight:400;color:#888">('+cve.severity+')</span></div><div class="cve-desc">'+cve.desc+'</div></div>';
});
pdfHtml+='<p style="font-size:12px;color:#888">Recommendation: Update Mendix to the latest version to patch these vulnerabilities.</p>';
}

/* Form Issues Details */
if(i.security.formIssues.length){
pdfHtml+='<h3>Form Security Issues</h3><ul>';
i.security.formIssues.forEach(function(f){pdfHtml+='<li>'+f.msg+'</li>'});
pdfHtml+='</ul>';
}

/* v0.2.0 — Mendix Constants secret scan detail */
if(i.security.mendixConstants && i.security.mendixConstants.flagged && i.security.mendixConstants.flagged.length){
  pdfHtml+='<h3>Mendix Constants · Flagged</h3>';
  pdfHtml+='<p style="font-size:11px;color:#888">Values redacted by default. Full list visible in the extension panel.</p>';
  pdfHtml+='<table><tr><th>Constant</th><th>Severity</th><th>Match reason</th></tr>';
  i.security.mendixConstants.flagged.forEach(function(c){
    var sev = c.severity || 'sensitive';
    var cls = sev === 'secret' ? 'bad' : 'warn';
    pdfHtml+='<tr><td style="font-family:"Geist Mono",monospace;font-size:11px">'+(c.name||'')+'</td><td class="'+cls+'">'+sev.toUpperCase()+'</td><td style="font-size:11px;color:#666">'+(c.reason||c.pattern||'')+'</td></tr>';
  });
  pdfHtml+='</table>';
}

/* v0.2.0 — Demo users detail */
if(i.security.demoUsers && i.security.demoUsers.users && i.security.demoUsers.users.length){
  pdfHtml+='<h3>Demo Users</h3>';
  var _duIsProd2 = /prod/i.test(i.envType||"");
  if(_duIsProd2) pdfHtml+='<p style="font-size:12px;color:#FF5A5A;font-weight:600">⚠ Demo users should not be enabled in production.</p>';
  pdfHtml+='<table><tr><th>Username</th><th>Roles</th></tr>';
  i.security.demoUsers.users.forEach(function(u){
    var _roles = Array.isArray(u.roles) ? u.roles.join(", ") : (u.roles||"-");
    pdfHtml+='<tr><td style="font-family:"Geist Mono",monospace;font-size:11px">'+(u.username||u.name||"-")+'</td><td>'+_roles+'</td></tr>';
  });
  pdfHtml+='</table>';
}

/* v0.2.0 — Writable sensitive entities detail */
if(i.security.writableSensitive && i.security.writableSensitive.entities && i.security.writableSensitive.entities.length){
  pdfHtml+='<h3>Writable Sensitive Entities</h3>';
  pdfHtml+='<p style="font-size:11px;color:#888">These entities are commonly flagged in Mendix security reviews.</p>';
  pdfHtml+='<ul>';
  i.security.writableSensitive.entities.forEach(function(e){
    if(e && (e.withWrites || (e.writableAttrs && e.writableAttrs.length))){
      pdfHtml+='<li><strong>'+(e.name||e.entity||"?")+'</strong>'+(e.writableAttrs && e.writableAttrs.length ? ' — writable: ' + e.writableAttrs.join(", ") : '')+'</li>';
    }
  });
  pdfHtml+='</ul>';
}

pdfHtml+='</div>';

/* Network */
pdfHtml+='<h2>Network</h2><div class="metrics">';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.xhrRequests+'</div><div class="metric-label">XHR Requests</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.staticRequests+'</div><div class="metric-label">Static Assets</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.totalRequests+'</div><div class="metric-label">Total Requests</div></div>';
pdfHtml+='</div>';
if(i.slowRequests.length){pdfHtml+='<div class="section" style="background:#fff5f5"><strong>Slow Requests (&gt;1s):</strong><ul>';i.slowRequests.slice(0,5).forEach(function(r){pdfHtml+='<li>'+r.url+' ('+r.duration+'ms)</li>'});pdfHtml+='</ul></div>'}

/* Footer */
pdfHtml+='<div class="footer">'+logoSvg+'<span>Generated by <strong>MxInspector v0.2.5-beta</strong> • Created by Tim Maurer • <a href="https://paypal.me/tapmaurer" style="color:#FFB800">Support the project</a></span></div></body></html>';

var win=window.open("","_blank");win.document.write(pdfHtml);win.document.close();setTimeout(function(){win.print()},500)};

/* HIGHLIGHT CLICK HANDLERS - TOGGLE & ACTIVE STATE WITH SEVERITY COLORS
 * v0.2.58 — uses portal overlay system (paintOverlays) instead of
 * class-based outlines. Immune to Mendix layout clipping. */
/* HIGHLIGHT CLICK HANDLERS - TOGGLE & ACTIVE STATE WITH SEVERITY COLORS
 * v0.2.58 — uses portal overlay system (paintOverlays) instead of
 * class-based outlines. Immune to Mendix layout clipping.
 * v0.2.63 — click fires on the row rather than the whole insight so it
 * doesn't intercept clicks inside the expandable aware panel. Info
 * button gets its own handler that toggles .expanded on the insight. */
var highlightColors={error:"#FF5A5A",warning:"#FFB800",info:"#3B99FC",success:"#3DDC97"};
A.querySelectorAll(".mxi-insight-clickable").forEach(function(el){
  var rowEl=el.querySelector(".mxi-insight-row")||el;
  rowEl.addEventListener("click",function(ev){
    /* Clicks that originated on the info button or inside the aware
     * panel should never trigger the highlight. */
    if(ev.target.closest(".mxi-insight-info-btn"))return;
    if(ev.target.closest(".mxi-insight-aware"))return;
    var key=el.getAttribute("data-highlight-key");
    var severity=el.getAttribute("data-severity")||"warning";
    var hlColor=highlightColors[severity]||highlightColors.warning;
    if(!key||!i.highlightTargets[key])return;
    /* Toggle off if clicking the same insight */
    if(activeInsight===el){clearHighlights();return}
    clearHighlights();
    /* Set new active */
    el.classList.add("active");
    el.setAttribute("data-active-severity",severity);
    el.style.background=hlColor;
    el.style.borderColor=hlColor;
    activeInsight=el;
    var targets=i.highlightTargets[key];
    var count=paintOverlays(targets,hlColor,null);
    if(count===0){clearHighlights();return}
    if(targets[0]&&targets[0].scrollIntoView){
      targets[0].scrollIntoView({behavior:"smooth",block:"center"});
    }
    clearBtn.style.display="block";
    clearBtn.style.background=hlColor;
    clearBtn.style.boxShadow="0 4px 20px "+hlColor+"66";
  });
});

/* v0.2.63 — Info button: toggle .expanded on the parent insight so the
 * awareness panel unfolds below the row. Stops propagation so the
 * highlight click handler above never sees this event. */
A.querySelectorAll(".mxi-insight-info-btn").forEach(function(btn){
  btn.addEventListener("click",function(ev){
    ev.stopPropagation();
    var insight=btn.closest(".mxi-insight");
    if(!insight)return;
    insight.classList.toggle("expanded");
  });
});

/* CLICKABLE METRIC HANDLERS - Highlight elements by CSS selector OR by
 * pre-computed element array (via data-highlight-key).
 * v0.2.55 — added the highlight-key branch so a11y metrics can reuse this
 * handler with their element arrays stored at scan time.
 * v0.2.58 — Rewired to paint via portal overlay system (paintOverlays) so
 * highlights render consistently with the Data Inspector drawer's
 * overlays and survive ancestor overflow:hidden / transforms / clip-path.
 * v0.2.59 — Default metrics (Data Containers — DataView, ListView etc.)
 * now render as NEUTRAL highlights: grey outline, dark chip with white
 * text. Yellow/red remain reserved for warning / error severity. Active
 * card border is also neutral (rgba-white) for default metrics. */
var activeMetric=null;
var highlightSeverityColors={error:"#FF5A5A",warning:"#FFB800",notice:"#FF7A50",info:"#B0B0B0"};
A.querySelectorAll(".mxi-metric-clickable").forEach(function(el){el.addEventListener("click",function(){
  var selector=this.getAttribute("data-selector");
  var highlightKey=this.getAttribute("data-highlight-key");
  /* No data-severity attribute → treat as informational (data containers).
   * Severity is only set when clickable metrics were minted via
   * highlightMetric() which explicitly passes it. */
  var severity=this.getAttribute("data-severity")||"info";
  var hlColor=highlightSeverityColors[severity]||"#B0B0B0";
  var variant=severity==="info"?"neutral":null;
  var activeBorder=severity==="info"?"rgba(255,255,255,.35)":hlColor;

  if(!selector&&!highlightKey)return;

  /* Toggle off */
  if(activeMetric===this){clearHighlights();return}

  clearHighlights();

  /* Set active state on the clicked card */
  this.style.background="#1A1A1A";
  this.style.borderColor=activeBorder;
  activeMetric=this;

  /* Resolve targets */
  var targets=[];
  if(highlightKey){
    var stored=i.highlightTargets&&i.highlightTargets[highlightKey];
    if(stored)stored.forEach(function(t){if(t&&t.parentNode)targets.push(t)});
  } else if(selector){
    try{
      document.querySelectorAll(selector).forEach(function(t){targets.push(t)});
    }catch(e){console.warn("Invalid selector:",selector)}
  }

  if(targets.length===0){
    /* v0.2.5 — silently no-op when no targets found. The debug log was
     * useful while wiring up insight-to-element highlighting, just chatter
     * once it's working. */
    clearHighlights();
    return;
  }

  var made=paintOverlays(targets,hlColor,null,variant);
  if(made===0){clearHighlights();return}

  if(targets[0]&&targets[0].scrollIntoView){
    targets[0].scrollIntoView({behavior:"smooth",block:"center"});
  }
  clearBtn.style.display="block";
  clearBtn.style.background=hlColor;
  clearBtn.style.boxShadow="0 4px 20px "+hlColor+"66";
})});

/* v0.2.45 — click any demo-user cell to copy it */
A.querySelectorAll(".mxi-demo-copy").forEach(function(cell){
  cell.addEventListener("click",function(){
    var txt=this.getAttribute("data-copy")||this.textContent;
    var self=this;
    var orig=self.textContent;
    var origColor=self.style.color;
    function flash(){
      self.textContent="copied";
      self.style.color="#3DDC97";
      setTimeout(function(){self.textContent=orig;self.style.color=origColor;},900);
    }
    if(navigator.clipboard){
      navigator.clipboard.writeText(txt).then(flash).catch(flash);
    } else {
      var ta=document.createElement("textarea");
      ta.value=txt;ta.style.cssText="position:fixed;left:-9999px";
      document.body.appendChild(ta);ta.select();
      try{document.execCommand("copy");}catch(e){}
      document.body.removeChild(ta);
      flash();
    }
  });
});

/* v0.2.43 — reveal / re-hide redacted constant values */
A.querySelectorAll(".mxi-reveal-btn").forEach(function(btn){
  btn.addEventListener("click",function(){
    var row=this.closest(".mxi-secret-row");
    if(!row)return;
    var valEl=row.querySelector(".mxi-secret-value");
    if(!valEl)return;
    var isRevealed=this.getAttribute("data-state")==="revealed";
    if(isRevealed){
      valEl.textContent=valEl.getAttribute("data-redacted")||"";
      this.textContent="Reveal";
      this.setAttribute("data-state","redacted");
      this.style.background=b;
      this.style.color=f;
    } else {
      valEl.textContent=valEl.getAttribute("data-revealed")||"";
      this.textContent="Hide";
      this.setAttribute("data-state","revealed");
      this.style.background="rgba(255,184,0,.2)";
      this.style.color=k;
    }
  });
});

/* v0.2.43/v0.2.44 — doc endpoint probe (auto-runs on panel render, Re-probe button repeats) */
(function(){
  var probeBtn=A.querySelector("#mxi-probe-endpoints-btn");
  var probeOut=A.querySelector("#mxi-probe-endpoints-out");
  if(!probeOut)return;

  function renderResults(report){
    var html='<div style="font-size:10px;color:'+x+';text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">RESULTS · '+report.reachableCount+'/'+report.results.length+' reachable</div>';
    report.results.forEach(function(r){
      var badge,badgeBg,badgeFg;
      if(r.status===0){badge="NETWORK";badgeBg="rgba(153,153,153,.15)";badgeFg="#999";}
      else if(r.reachable){badge=String(r.status)+" REACHABLE";badgeBg="rgba(255,90,90,.15)";badgeFg="#FF5A5A";}
      else if(r.status===401||r.status===403){badge=String(r.status)+" AUTH-GATED";badgeBg="rgba(255,184,0,.15)";badgeFg="#FFB800";}
      else{badge=String(r.status)+" OK";badgeBg="rgba(61,220,151,.15)";badgeFg="#3DDC97";}
      html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:11px"><code style="background:'+w+';color:'+h+';padding:2px 6px;border-radius:4px;font-size:10px;flex:1">'+esc(r.path)+'</code><span style="font-size:9px;font-weight:600;background:'+badgeBg+';color:'+badgeFg+';padding:2px 6px;border-radius:3px;letter-spacing:.4px">'+badge+'</span></div>';
    });
    if(report.reachableCount>0){
      html+='<div style="font-size:10px;color:'+x+';margin-top:8px;line-height:1.5"><strong style="color:'+f+'">What this means:</strong> reachable doc endpoints expose your app\'s API surface. In production, <code style="background:'+w+';padding:1px 4px;border-radius:3px">/rest-doc/</code>, <code style="background:'+w+';padding:1px 4px;border-radius:3px">/odata-doc/</code>, <code style="background:'+w+';padding:1px 4px;border-radius:3px">/ws-doc/</code>, and <code style="background:'+w+';padding:1px 4px;border-radius:3px">/debugger/</code> should be disabled or auth-gated.</div>';
    }
    probeOut.innerHTML=html;
  }

  function runProbe(){
    if(!window.__MxSecurity||!window.__MxSecurity.probeEndpoints){
      probeOut.innerHTML='<div style="font-size:11px;color:'+m+'">Security module unavailable — cannot probe.</div>';
      return;
    }
    probeOut.innerHTML='<div style="font-size:11px;color:'+f+';font-style:italic">Probing…</div>';
    if(probeBtn){probeBtn.disabled=true;probeBtn.style.opacity="0.6";}
    window.__MxSecurity.probeEndpoints().then(function(report){
      renderResults(report);
      if(probeBtn){probeBtn.disabled=false;probeBtn.style.opacity="";}
    }).catch(function(err){
      probeOut.innerHTML='<div style="font-size:11px;color:'+m+'">Probe failed: '+esc(String(err&&err.message||err))+'</div>';
      if(probeBtn){probeBtn.disabled=false;probeBtn.style.opacity="";}
    });
  }

  if(probeBtn)probeBtn.addEventListener("click",runProbe);
  /* Auto-run on first render */
  runProbe();
})();

window.__mxInspectorData=i;
/* v0.2.5 — render log removed. console.log("Mendix Inspector Pro v4.3", i)
 * was dumping the entire inspector state object to the console on every
 * panel render — useful during early dev, just noise now. The state is
 * still on window.__mxInspectorData for anyone who needs to inspect it. */

/* ===== TYPOGRAPHY INSPECT MODE ===== */
var inspectModeActive=false;
var inspectTooltip=null;
var inspectOutline=null;

function createInspectTooltip(){
if(inspectTooltip)return;
inspectTooltip=document.createElement("div");
inspectTooltip.id="mxi-type-tooltip";
inspectTooltip.style.cssText="position:fixed;background:#141414;color:#fff;padding:14px 18px;border-radius:12px;font-family:Geist,Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:999997;pointer-events:none;opacity:0;transition:opacity .15s;max-width:320px;box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E";
document.body.appendChild(inspectTooltip);
inspectOutline=document.createElement("div");
inspectOutline.id="mxi-type-outline";
inspectOutline.style.cssText="position:fixed;border:2px dashed #FFB800;pointer-events:none;z-index:999997;transition:all .1s ease-out;opacity:0";
document.body.appendChild(inspectOutline);
}

function destroyInspectTooltip(){
if(inspectTooltip){inspectTooltip.remove();inspectTooltip=null}
if(inspectOutline){inspectOutline.remove();inspectOutline=null}
}

function handleInspectHover(e){
if(!inspectModeActive||!inspectTooltip)return;
var el=e.target;
if(el.closest("#mx-inspector-pro")||el.closest("#mxi-type-tooltip"))return;
var style=getComputedStyle(el);
var fontFamily=style.fontFamily.split(",")[0].replace(/['"]/g,"").trim();
var fontSize=style.fontSize;
var fontWeight=style.fontWeight;
var lineHeight=style.lineHeight;
var letterSpacing=style.letterSpacing;
var color=style.color;
var textTransform=style.textTransform;

var wName=fontWeight==="400"?"Regular":fontWeight==="500"?"Medium":fontWeight==="600"?"Semibold":fontWeight==="700"?"Bold":fontWeight==="800"?"Extra Bold":fontWeight==="300"?"Light":fontWeight;

var html='<div style="font-weight:600;font-size:14px;margin-bottom:10px;color:#FFB800">'+fontFamily+'</div>';
html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px">';
html+='<div><span style="color:#666666">Size:</span> <strong style="color:#fff">'+fontSize+'</strong></div>';
html+='<div><span style="color:#666666">Weight:</span> <strong style="color:#fff">'+wName+'</strong></div>';
html+='<div><span style="color:#666666">Line-height:</span> <strong style="color:#fff">'+lineHeight+'</strong></div>';
html+='<div><span style="color:#666666">Letter-spacing:</span> <strong style="color:#fff">'+(letterSpacing==="normal"?"0":letterSpacing)+'</strong></div>';
html+='<div><span style="color:#666666">Transform:</span> <strong style="color:#fff">'+textTransform+'</strong></div>';
html+='<div><span style="color:#666666">Color:</span> <strong style="color:'+color+'">●</strong> <span style="color:#9A9A9A">'+color+'</span></div>';
html+='</div>';

var rect=el.getBoundingClientRect();
inspectOutline.style.left=rect.left-2+"px";
inspectOutline.style.top=rect.top-2+"px";
inspectOutline.style.width=rect.width+4+"px";
inspectOutline.style.height=rect.height+4+"px";
inspectOutline.style.opacity="1";

inspectTooltip.innerHTML=html;
var ttLeft=e.clientX+15;
var ttTop=e.clientY+15;
if(ttLeft+320>window.innerWidth)ttLeft=e.clientX-335;
if(ttTop+200>window.innerHeight)ttTop=e.clientY-inspectTooltip.offsetHeight-15;
inspectTooltip.style.left=Math.max(10,ttLeft)+"px";
inspectTooltip.style.top=Math.max(10,ttTop)+"px";
inspectTooltip.style.opacity="1";
}

function handleInspectOut(){
if(inspectTooltip)inspectTooltip.style.opacity="0";
if(inspectOutline)inspectOutline.style.opacity="0";
}

var inspectCloseBtn=null;
function handleEscapeKey(e){if(e.key==="Escape"){if(typeof styleInspectActive!=="undefined"&&styleInspectActive)toggleStyleInspectMode();if(inspectModeActive)toggleInspectMode();if(cssInspectActive)toggleCssInspectMode();if(typeof widgetInspectActive!=="undefined"&&widgetInspectActive)toggleWidgetInspectMode();if(activeOverlays.length>0)clearHighlights()}}
document.addEventListener("keydown",handleEscapeKey);

function toggleInspectMode(){
/* v0.2.3 — button is gone (typography/css inspect consolidated into footer
 * Style button). Keeping this function for backward compat with ESC handler
 * and legacy call sites; guard every btn.* write. */
var btn=document.getElementById("mxi-inspect-toggle");
inspectModeActive=!inspectModeActive;
if(inspectModeActive){
createInspectTooltip();
document.addEventListener("mousemove",handleInspectHover);
document.addEventListener("mouseout",handleInspectOut);
if(btn){btn.style.background=k;btn.style.color=w;btn.innerHTML=icon("inspect",14)+' Inspect ON';}
document.body.style.cursor="crosshair";
if(!inspectCloseBtn){inspectCloseBtn=document.createElement("button");inspectCloseBtn.className="mxi-clear-btn";inspectCloseBtn.innerHTML="✕ Exit Inspect Mode";inspectCloseBtn.onclick=toggleInspectMode;document.body.appendChild(inspectCloseBtn)}
inspectCloseBtn.style.display="block";
}else{
document.removeEventListener("mousemove",handleInspectHover);
document.removeEventListener("mouseout",handleInspectOut);
destroyInspectTooltip();
if(btn){btn.style.background=v;btn.style.color=f;btn.innerHTML=icon("inspect",14)+' Inspect Mode';}
document.body.style.cursor="";
if(inspectCloseBtn)inspectCloseBtn.style.display="none";
}
}

var inspectBtn=document.getElementById("mxi-inspect-toggle");
if(inspectBtn)inspectBtn.onclick=toggleInspectMode;

/* ===== CSS INSPECTOR MODE ===== */
var cssInspectActive=false;
var cssInspectTooltip=null;
var cssInspectOutline=null;
var cssBoxOverlay=null;

function createCssInspectElements(){
if(cssInspectTooltip)return;
cssInspectTooltip=document.createElement("div");
cssInspectTooltip.id="mxi-css-tooltip";
cssInspectTooltip.style.cssText="position:fixed;background:#141414;color:#fff;padding:14px 18px;border-radius:12px;font-family:Geist,Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:999997;pointer-events:none;opacity:0;transition:opacity .15s;max-width:380px;box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E";
document.body.appendChild(cssInspectTooltip);

cssInspectOutline=document.createElement("div");
cssInspectOutline.id="mxi-css-outline";
cssInspectOutline.style.cssText="position:fixed;border:2px dashed #FFB800;pointer-events:none;z-index:999996;transition:all .1s ease-out;opacity:0";
document.body.appendChild(cssInspectOutline);

/* Box model overlay - shows margin (orange) and padding (green) */
cssBoxOverlay=document.createElement("div");
cssBoxOverlay.id="mxi-css-box";
cssBoxOverlay.innerHTML='<div class="mxi-margin-top"></div><div class="mxi-margin-right"></div><div class="mxi-margin-bottom"></div><div class="mxi-margin-left"></div><div class="mxi-padding-top"></div><div class="mxi-padding-right"></div><div class="mxi-padding-bottom"></div><div class="mxi-padding-left"></div>';
cssBoxOverlay.style.cssText="position:fixed;pointer-events:none;z-index:999995;opacity:0;transition:opacity .1s";
var boxStyle=document.createElement("style");
boxStyle.textContent=".mxi-margin-top,.mxi-margin-right,.mxi-margin-bottom,.mxi-margin-left{position:absolute;background:rgba(255,122,80,.3);}.mxi-padding-top,.mxi-padding-right,.mxi-padding-bottom,.mxi-padding-left{position:absolute;background:rgba(61,220,151,.3);}";
document.head.appendChild(boxStyle);
document.body.appendChild(cssBoxOverlay);
}

function destroyCssInspectElements(){
if(cssInspectTooltip){cssInspectTooltip.remove();cssInspectTooltip=null}
if(cssInspectOutline){cssInspectOutline.remove();cssInspectOutline=null}
if(cssBoxOverlay){cssBoxOverlay.remove();cssBoxOverlay=null}
}

function handleCssInspectHover(e){
if(!cssInspectActive||!cssInspectTooltip)return;
var el=e.target;
if(el.closest("#mx-inspector-pro")||el.closest("#mxi-css-tooltip"))return;

var style=getComputedStyle(el);
var rect=el.getBoundingClientRect();

/* Get all classes */
var classes=(el.className&&typeof el.className==="string")?el.className.split(/\s+/).filter(function(c){return c}):[];
var mxClasses=classes.filter(function(c){return c.indexOf("mx-")===0||c.indexOf("widget-")===0});
var customClasses=classes.filter(function(c){return c.indexOf("mx-")!==0&&c.indexOf("widget-")!==0});

/* Box model values */
var margin={top:parseInt(style.marginTop)||0,right:parseInt(style.marginRight)||0,bottom:parseInt(style.marginBottom)||0,left:parseInt(style.marginLeft)||0};
var padding={top:parseInt(style.paddingTop)||0,right:parseInt(style.paddingRight)||0,bottom:parseInt(style.paddingBottom)||0,left:parseInt(style.paddingLeft)||0};

/* Build tooltip */
var html='<div style="font-weight:600;font-size:13px;margin-bottom:8px;color:#FFB800">&lt;'+el.tagName.toLowerCase()+'&gt;</div>';

if(mxClasses.length){
html+='<div style="margin-bottom:8px"><div style="font-size:9px;color:#666;margin-bottom:4px">MENDIX CLASSES</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
mxClasses.slice(0,6).forEach(function(c){html+='<span style="background:#FFB80022;color:#FFB800;padding:2px 6px;border-radius:4px;font-size:10px;font-family:"Geist Mono",monospace">'+c+'</span>'});
html+='</div></div>';
}

if(customClasses.length){
html+='<div style="margin-bottom:8px"><div style="font-size:9px;color:#666;margin-bottom:4px">CUSTOM CLASSES</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
customClasses.slice(0,6).forEach(function(c){html+='<span style="background:#3B99FC22;color:#3B99FC;padding:2px 6px;border-radius:4px;font-size:10px;font-family:"Geist Mono",monospace">'+c+'</span>'});
html+='</div></div>';
}

/* Key styles */
html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:11px;margin-bottom:8px">';
html+='<div><span style="color:#666">Size:</span> <span style="color:#fff">'+Math.round(rect.width)+'×'+Math.round(rect.height)+'</span></div>';
html+='<div><span style="color:#666">Display:</span> <span style="color:#fff">'+style.display+'</span></div>';
html+='<div><span style="color:#666">Position:</span> <span style="color:#fff">'+style.position+'</span></div>';
if(style.display==="flex"||style.display==="inline-flex"){
html+='<div><span style="color:#666">Flex:</span> <span style="color:#fff">'+style.flexDirection+'</span></div>';
}
html+='</div>';

/* Box model visual */
html+='<div style="font-size:9px;color:#666;margin-bottom:4px">BOX MODEL</div>';
html+='<div style="display:flex;gap:12px;font-size:10px">';
html+='<div><span style="color:#FF7A50">Margin:</span> <span style="color:#fff">'+margin.top+' '+margin.right+' '+margin.bottom+' '+margin.left+'</span></div>';
html+='<div><span style="color:#3DDC97">Padding:</span> <span style="color:#fff">'+padding.top+' '+padding.right+' '+padding.bottom+' '+padding.left+'</span></div>';
html+='</div>';

/* Update outline */
cssInspectOutline.style.left=rect.left-2+"px";
cssInspectOutline.style.top=rect.top-2+"px";
cssInspectOutline.style.width=rect.width+4+"px";
cssInspectOutline.style.height=rect.height+4+"px";
cssInspectOutline.style.opacity="1";

/* Update box model overlay */
cssBoxOverlay.style.left=rect.left-margin.left+"px";
cssBoxOverlay.style.top=rect.top-margin.top+"px";
cssBoxOverlay.style.width=rect.width+margin.left+margin.right+"px";
cssBoxOverlay.style.height=rect.height+margin.top+margin.bottom+"px";
cssBoxOverlay.style.opacity="1";

/* Position margin overlays */
var mt=cssBoxOverlay.querySelector(".mxi-margin-top");
var mr=cssBoxOverlay.querySelector(".mxi-margin-right");
var mb=cssBoxOverlay.querySelector(".mxi-margin-bottom");
var ml=cssBoxOverlay.querySelector(".mxi-margin-left");
mt.style.cssText="position:absolute;top:0;left:"+margin.left+"px;width:"+rect.width+"px;height:"+margin.top+"px;background:rgba(255,122,80,.3)";
mr.style.cssText="position:absolute;top:"+margin.top+"px;right:0;width:"+margin.right+"px;height:"+rect.height+"px;background:rgba(255,122,80,.3)";
mb.style.cssText="position:absolute;bottom:0;left:"+margin.left+"px;width:"+rect.width+"px;height:"+margin.bottom+"px;background:rgba(255,122,80,.3)";
ml.style.cssText="position:absolute;top:"+margin.top+"px;left:0;width:"+margin.left+"px;height:"+rect.height+"px;background:rgba(255,122,80,.3)";

/* Position padding overlays */
var pt=cssBoxOverlay.querySelector(".mxi-padding-top");
var pr=cssBoxOverlay.querySelector(".mxi-padding-right");
var pb=cssBoxOverlay.querySelector(".mxi-padding-bottom");
var pl=cssBoxOverlay.querySelector(".mxi-padding-left");
pt.style.cssText="position:absolute;top:"+margin.top+"px;left:"+margin.left+"px;width:"+rect.width+"px;height:"+padding.top+"px;background:rgba(61,220,151,.3)";
pr.style.cssText="position:absolute;top:"+(margin.top+padding.top)+"px;right:"+margin.right+"px;width:"+padding.right+"px;height:"+(rect.height-padding.top-padding.bottom)+"px;background:rgba(61,220,151,.3)";
pb.style.cssText="position:absolute;bottom:"+margin.bottom+"px;left:"+margin.left+"px;width:"+rect.width+"px;height:"+padding.bottom+"px;background:rgba(61,220,151,.3)";
pl.style.cssText="position:absolute;top:"+(margin.top+padding.top)+"px;left:"+margin.left+"px;width:"+padding.left+"px;height:"+(rect.height-padding.top-padding.bottom)+"px;background:rgba(61,220,151,.3)";

cssInspectTooltip.innerHTML=html;
var ttLeft=e.clientX+15;
var ttTop=e.clientY+15;
if(ttLeft+400>window.innerWidth)ttLeft=e.clientX-400;
if(ttTop+250>window.innerHeight)ttTop=e.clientY-cssInspectTooltip.offsetHeight-15;
cssInspectTooltip.style.left=Math.max(10,ttLeft)+"px";
cssInspectTooltip.style.top=Math.max(10,ttTop)+"px";
cssInspectTooltip.style.opacity="1";
}

function handleCssInspectOut(){
if(cssInspectTooltip)cssInspectTooltip.style.opacity="0";
if(cssInspectOutline)cssInspectOutline.style.opacity="0";
if(cssBoxOverlay)cssBoxOverlay.style.opacity="0";
}

var cssInspectCloseBtn=null;
function toggleCssInspectMode(){
var btn=document.getElementById("mxi-css-inspect-toggle");
if(!btn)return;
cssInspectActive=!cssInspectActive;
if(cssInspectActive){
/* Turn off typography inspect if active */
if(inspectModeActive)toggleInspectMode();
createCssInspectElements();
document.addEventListener("mousemove",handleCssInspectHover);
document.addEventListener("mouseout",handleCssInspectOut);
btn.style.background=k;
btn.style.color=w;
btn.innerHTML=icon("inspect",14)+' Inspector ON';
document.body.style.cursor="crosshair";
if(!cssInspectCloseBtn){cssInspectCloseBtn=document.createElement("button");cssInspectCloseBtn.className="mxi-clear-btn";cssInspectCloseBtn.innerHTML="✕ Exit CSS Inspector";cssInspectCloseBtn.onclick=toggleCssInspectMode;document.body.appendChild(cssInspectCloseBtn)}
cssInspectCloseBtn.style.display="block";
}else{
document.removeEventListener("mousemove",handleCssInspectHover);
document.removeEventListener("mouseout",handleCssInspectOut);
destroyCssInspectElements();
btn.style.background=v;
btn.style.color=f;
btn.innerHTML=icon("inspect",14)+' CSS Inspector';
document.body.style.cursor="";
if(cssInspectCloseBtn)cssInspectCloseBtn.style.display="none";
}
}

var cssInspectBtn=document.getElementById("mxi-css-inspect-toggle");
if(cssInspectBtn)cssInspectBtn.onclick=toggleCssInspectMode;

/* ===== STYLE INSPECTOR (v0.2.3) =====
 * Combines typography + CSS inspect into a single element picker triggered
 * from the footer Style button. The tooltip shows (in order):
 *   1. Tag + Mendix/custom classes (the "what is this?" anchor)
 *   2. Typography block: font, size, weight, line-height, letter-spacing, color
 *   3. CSS Box block: display, position, size, margin, padding, + visual overlay
 * Background discovery reason: section-buried inspect buttons had low find-rate
 * in user sessions (especially Typography). Promoting to footer + merging the
 * two paths into one picker fixes both problems with one move.
 *
 * When future CSS-var / advanced styling features land (see roadmap),
 * this panel is expected to split back into two tabs in a redesigned shell. */
var styleInspectActive=false;
var styleInspectTooltip=null;
var styleInspectOutline=null;
var styleBoxOverlay=null;

function createStyleInspectElements(){
if(styleInspectTooltip)return;
styleInspectTooltip=document.createElement("div");
styleInspectTooltip.id="mxi-style-tooltip";
styleInspectTooltip.style.cssText="position:fixed;background:#141414;color:#fff;padding:14px 18px;border-radius:12px;font-family:Geist,Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:999997;pointer-events:none;opacity:0;transition:opacity .15s;max-width:400px;box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E";
document.body.appendChild(styleInspectTooltip);

styleInspectOutline=document.createElement("div");
styleInspectOutline.id="mxi-style-outline";
styleInspectOutline.style.cssText="position:fixed;border:2px dashed #FFB800;pointer-events:none;z-index:999996;transition:all .1s ease-out;opacity:0";
document.body.appendChild(styleInspectOutline);

/* Reuse the box-model overlay pattern from the old CSS inspector:
 * margin painted in orange, padding in green, overlaid on the target. */
styleBoxOverlay=document.createElement("div");
styleBoxOverlay.id="mxi-style-box";
styleBoxOverlay.innerHTML='<div class="mxi-style-mt"></div><div class="mxi-style-mr"></div><div class="mxi-style-mb"></div><div class="mxi-style-ml"></div><div class="mxi-style-pt"></div><div class="mxi-style-pr"></div><div class="mxi-style-pb"></div><div class="mxi-style-pl"></div>';
styleBoxOverlay.style.cssText="position:fixed;pointer-events:none;z-index:999995;opacity:0;transition:opacity .1s";
document.body.appendChild(styleBoxOverlay);
}

function destroyStyleInspectElements(){
if(styleInspectTooltip){styleInspectTooltip.remove();styleInspectTooltip=null}
if(styleInspectOutline){styleInspectOutline.remove();styleInspectOutline=null}
if(styleBoxOverlay){styleBoxOverlay.remove();styleBoxOverlay=null}
}

function handleStyleInspectHover(e){
if(!styleInspectActive||!styleInspectTooltip)return;
var el=e.target;
if(el.closest("#mx-inspector-pro")||el.closest("#mxi-style-tooltip"))return;

var style=getComputedStyle(el);
var rect=el.getBoundingClientRect();

/* --- Class parsing (same split as the old CSS inspector) --- */
var classes=(el.className&&typeof el.className==="string")?el.className.split(/\s+/).filter(function(c){return c}):[];
var mxClasses=classes.filter(function(c){return c.indexOf("mx-")===0||c.indexOf("widget-")===0});
var customClasses=classes.filter(function(c){return c.indexOf("mx-")!==0&&c.indexOf("widget-")!==0});

/* --- Typography values --- */
var fontFamily=style.fontFamily.split(",")[0].replace(/['"]/g,"").trim();
var fontSize=style.fontSize;
var fontWeight=style.fontWeight;
var lineHeight=style.lineHeight;
var letterSpacing=style.letterSpacing;
var color=style.color;
var wName=fontWeight==="400"?"Regular":fontWeight==="500"?"Medium":fontWeight==="600"?"Semibold":fontWeight==="700"?"Bold":fontWeight==="800"?"Extra Bold":fontWeight==="300"?"Light":fontWeight;

/* --- Box model values --- */
var margin={top:parseInt(style.marginTop)||0,right:parseInt(style.marginRight)||0,bottom:parseInt(style.marginBottom)||0,left:parseInt(style.marginLeft)||0};
var padding={top:parseInt(style.paddingTop)||0,right:parseInt(style.paddingRight)||0,bottom:parseInt(style.paddingBottom)||0,left:parseInt(style.paddingLeft)||0};

/* --- Build tooltip --- */
/* Header: tag name */
var html='<div style="font-weight:600;font-size:13px;margin-bottom:10px;color:#FFB800">&lt;'+el.tagName.toLowerCase()+'&gt;</div>';

/* Mendix + custom class chips */
if(mxClasses.length){
html+='<div style="margin-bottom:8px"><div style="font-size:9px;color:#666;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Mendix classes</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
mxClasses.slice(0,6).forEach(function(c){html+='<span style="background:#FFB80022;color:#FFB800;padding:2px 6px;border-radius:4px;font-size:10px;font-family:"Geist Mono",monospace">'+c+'</span>'});
html+='</div></div>';
}
if(customClasses.length){
html+='<div style="margin-bottom:10px"><div style="font-size:9px;color:#666;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Custom classes</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
customClasses.slice(0,6).forEach(function(c){html+='<span style="background:#3B99FC22;color:#3B99FC;padding:2px 6px;border-radius:4px;font-size:10px;font-family:"Geist Mono",monospace">'+c+'</span>'});
html+='</div></div>';
}

/* Divider + Typography block */
html+='<div style="height:1px;background:#2E2E2E;margin:10px -18px 10px -18px"></div>';
html+='<div style="font-size:9px;color:#FFB800;margin-bottom:6px;text-transform:uppercase;letter-spacing:.6px;font-weight:600">Typography</div>';
html+='<div style="font-weight:600;font-size:13px;margin-bottom:8px;color:#EDEDED">'+fontFamily+'</div>';
html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:11px;margin-bottom:2px">';
html+='<div><span style="color:#666">Size:</span> <strong style="color:#fff">'+fontSize+'</strong></div>';
html+='<div><span style="color:#666">Weight:</span> <strong style="color:#fff">'+wName+'</strong></div>';
html+='<div><span style="color:#666">Line:</span> <strong style="color:#fff">'+lineHeight+'</strong></div>';
html+='<div><span style="color:#666">Spacing:</span> <strong style="color:#fff">'+(letterSpacing==="normal"?"0":letterSpacing)+'</strong></div>';
html+='<div style="grid-column:1 / -1"><span style="color:#666">Color:</span> <strong style="color:'+color+'">●</strong> <span style="color:#9A9A9A">'+color+'</span></div>';
html+='</div>';

/* Divider + CSS Box block */
html+='<div style="height:1px;background:#2E2E2E;margin:10px -18px 10px -18px"></div>';
html+='<div style="font-size:9px;color:#FFB800;margin-bottom:6px;text-transform:uppercase;letter-spacing:.6px;font-weight:600">CSS Box</div>';
html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;font-size:11px;margin-bottom:6px">';
html+='<div><span style="color:#666">Size:</span> <strong style="color:#fff">'+Math.round(rect.width)+'×'+Math.round(rect.height)+'</strong></div>';
html+='<div><span style="color:#666">Display:</span> <strong style="color:#fff">'+style.display+'</strong></div>';
html+='<div><span style="color:#666">Position:</span> <strong style="color:#fff">'+style.position+'</strong></div>';
if(style.display==="flex"||style.display==="inline-flex"){
html+='<div><span style="color:#666">Flex:</span> <strong style="color:#fff">'+style.flexDirection+'</strong></div>';
}
html+='</div>';
html+='<div style="display:flex;gap:12px;font-size:10px">';
html+='<div><span style="color:#FF7A50">Margin:</span> <span style="color:#fff">'+margin.top+' '+margin.right+' '+margin.bottom+' '+margin.left+'</span></div>';
html+='<div><span style="color:#3DDC97">Padding:</span> <span style="color:#fff">'+padding.top+' '+padding.right+' '+padding.bottom+' '+padding.left+'</span></div>';
html+='</div>';

/* --- Position overlays --- */
styleInspectOutline.style.left=rect.left-2+"px";
styleInspectOutline.style.top=rect.top-2+"px";
styleInspectOutline.style.width=rect.width+4+"px";
styleInspectOutline.style.height=rect.height+4+"px";
styleInspectOutline.style.opacity="1";

styleBoxOverlay.style.left=rect.left-margin.left+"px";
styleBoxOverlay.style.top=rect.top-margin.top+"px";
styleBoxOverlay.style.width=rect.width+margin.left+margin.right+"px";
styleBoxOverlay.style.height=rect.height+margin.top+margin.bottom+"px";
styleBoxOverlay.style.opacity="1";
var mt=styleBoxOverlay.querySelector(".mxi-style-mt");
var mr=styleBoxOverlay.querySelector(".mxi-style-mr");
var mb=styleBoxOverlay.querySelector(".mxi-style-mb");
var ml=styleBoxOverlay.querySelector(".mxi-style-ml");
mt.style.cssText="position:absolute;top:0;left:"+margin.left+"px;width:"+rect.width+"px;height:"+margin.top+"px;background:rgba(255,122,80,.3)";
mr.style.cssText="position:absolute;top:"+margin.top+"px;right:0;width:"+margin.right+"px;height:"+rect.height+"px;background:rgba(255,122,80,.3)";
mb.style.cssText="position:absolute;bottom:0;left:"+margin.left+"px;width:"+rect.width+"px;height:"+margin.bottom+"px;background:rgba(255,122,80,.3)";
ml.style.cssText="position:absolute;top:"+margin.top+"px;left:0;width:"+margin.left+"px;height:"+rect.height+"px;background:rgba(255,122,80,.3)";
var pt=styleBoxOverlay.querySelector(".mxi-style-pt");
var pr=styleBoxOverlay.querySelector(".mxi-style-pr");
var pb=styleBoxOverlay.querySelector(".mxi-style-pb");
var pl=styleBoxOverlay.querySelector(".mxi-style-pl");
pt.style.cssText="position:absolute;top:"+margin.top+"px;left:"+margin.left+"px;width:"+rect.width+"px;height:"+padding.top+"px;background:rgba(61,220,151,.3)";
pr.style.cssText="position:absolute;top:"+(margin.top+padding.top)+"px;right:"+margin.right+"px;width:"+padding.right+"px;height:"+(rect.height-padding.top-padding.bottom)+"px;background:rgba(61,220,151,.3)";
pb.style.cssText="position:absolute;bottom:"+margin.bottom+"px;left:"+margin.left+"px;width:"+rect.width+"px;height:"+padding.bottom+"px;background:rgba(61,220,151,.3)";
pl.style.cssText="position:absolute;top:"+(margin.top+padding.top)+"px;left:"+margin.left+"px;width:"+padding.left+"px;height:"+(rect.height-padding.top-padding.bottom)+"px;background:rgba(61,220,151,.3)";

styleInspectTooltip.innerHTML=html;
var ttLeft=e.clientX+15;
var ttTop=e.clientY+15;
if(ttLeft+420>window.innerWidth)ttLeft=e.clientX-420;
if(ttTop+280>window.innerHeight)ttTop=e.clientY-styleInspectTooltip.offsetHeight-15;
styleInspectTooltip.style.left=Math.max(10,ttLeft)+"px";
styleInspectTooltip.style.top=Math.max(10,ttTop)+"px";
styleInspectTooltip.style.opacity="1";
}

function handleStyleInspectOut(){
if(styleInspectTooltip)styleInspectTooltip.style.opacity="0";
if(styleInspectOutline)styleInspectOutline.style.opacity="0";
if(styleBoxOverlay)styleBoxOverlay.style.opacity="0";
}

var styleInspectCloseBtn=null;
function toggleStyleInspectMode(){
var btn=document.getElementById("mxi-style-inspect-toggle");
styleInspectActive=!styleInspectActive;
if(styleInspectActive){
/* Turn off any legacy inspect modes that might somehow be active */
if(inspectModeActive)toggleInspectMode();
if(cssInspectActive)toggleCssInspectMode();
createStyleInspectElements();
document.addEventListener("mousemove",handleStyleInspectHover);
document.addEventListener("mouseout",handleStyleInspectOut);
if(btn){btn.style.background=k;btn.style.color=w;btn.innerHTML=icon("inspect",16)+' Style ON';}
document.body.style.cursor="crosshair";
if(!styleInspectCloseBtn){styleInspectCloseBtn=document.createElement("button");styleInspectCloseBtn.className="mxi-clear-btn";styleInspectCloseBtn.innerHTML="✕ Exit Style Inspector";styleInspectCloseBtn.onclick=toggleStyleInspectMode;document.body.appendChild(styleInspectCloseBtn)}
styleInspectCloseBtn.style.display="block";
}else{
document.removeEventListener("mousemove",handleStyleInspectHover);
document.removeEventListener("mouseout",handleStyleInspectOut);
destroyStyleInspectElements();
if(btn){btn.style.background=y;btn.style.color=h;btn.innerHTML=icon("inspect",16)+' Style';}
document.body.style.cursor="";
if(styleInspectCloseBtn)styleInspectCloseBtn.style.display="none";
}
}

var styleInspectBtn=document.getElementById("mxi-style-inspect-toggle");
if(styleInspectBtn)styleInspectBtn.onclick=toggleStyleInspectMode;
/* Expose for programmatic access (mirrors window.__mxiToggleWidgetInspect) */
window.__mxiToggleStyleInspect=toggleStyleInspectMode;
window.__mxiIsStyleInspectActive=function(){return styleInspectActive;};

/* ===== DATA PANEL - Database Objects & Relationships ===== */
var dataPanel=null;
var dataPanelVisible=false;

function getPageDataInfo(){
var info={entities:[],datasources:{database:0,microflow:0,nanoflow:0},totalObjects:0,widgets:[],xhrCalls:[],objectDetails:[]};
try{
/* Method 0: Use MxDataExtractor for React client (BEST for Mx 10+) */
if(window.__MxDataExtractor){
var scanResult=window.__MxDataExtractor.scanAllDataContainers();
if(scanResult&&scanResult.containers){
scanResult.containers.forEach(function(container){
var widgetInfo={
name:container.name||"",
type:container.element.className.indexOf("mx-dataview")>-1?"DataView":
container.element.className.indexOf("mx-listview")>-1?"ListView":
container.element.className.indexOf("widget-datagrid")>-1?"DataGrid2":
container.element.className.indexOf("widget-gallery")>-1?"Gallery":
container.element.className.indexOf("mx-templategrid")>-1?"TemplateGrid":"Unknown",
entity:container.entity||"",
datasource:"Database",
objectCount:container.objectCount||0
};
/* Extract attribute values from the actual objects */
if(container.entity){
var existing=info.entities.find(function(e){return e.name===container.entity});
if(existing){
existing.count+=container.objectCount||1;
if(container.name&&existing.widgets.indexOf(container.name)===-1)existing.widgets.push(container.name);
}else{
var parts=container.entity.split(".");
var entityEntry={
name:container.entity,
module:parts[0]||"",
shortName:parts[parts.length-1]||container.entity,
count:container.objectCount||1,
type:widgetInfo.type,
datasource:"Database",
widgets:[container.name].filter(Boolean),
guids:[],
objects:[]  /* NEW: Store actual object data */
};
/* Try to extract actual objects data via MxDataExtractor */
var fiberData=window.__MxDataExtractor.extractDataFromElement(container.element);
if(fiberData&&fiberData.items&&fiberData.items.length>0){
fiberData.items.slice(0,10).forEach(function(item){  /* Limit to 10 for UI */
var mxObj=window.__MxDataExtractor.getMxObjectFromItem(item);
if(mxObj){
var objData={guid:item.id||"",attributes:{}};
/* Get all attribute values */
try{
var attrs=mxObj.getAttributes?mxObj.getAttributes():[];
attrs.forEach(function(attr){
try{objData.attributes[attr]=mxObj.get(attr)}catch(e){}
});
}catch(e){}
/* Fallback to _jsonData if available */
if(mxObj._jsonData&&mxObj._jsonData.attributes){
Object.keys(mxObj._jsonData.attributes).forEach(function(attr){
if(!objData.attributes[attr])objData.attributes[attr]=mxObj._jsonData.attributes[attr];
});
}
if(Object.keys(objData.attributes).length>0){
entityEntry.objects.push(objData);
entityEntry.guids.push(objData.guid);
}
}
});
}
info.entities.push(entityEntry);
}
info.totalObjects+=container.objectCount||0;
info.datasources.database++;
}
info.widgets.push(widgetInfo);
});
}
}
/* Method 1: Use dijit.registry for Dojo client to get widget data */
if(window.dijit&&dijit.registry){
dijit.registry.forEach(function(widget){
try{
var widgetInfo={name:"",type:"",entity:"",datasource:"",objectCount:0,guid:"",loaded:false};
/* Get widget name from DOM */
if(widget.domNode){
var cn=widget.domNode.className;
if(typeof cn==="string"){
var m=cn.match(/mx-name-([^\s]+)/);
if(m)widgetInfo.name=m[1];
}
}
/* Get widget type from declaredClass */
var dc=widget.declaredClass||"";
if(dc.indexOf("DataView")>-1||dc.indexOf("dataview")>-1){widgetInfo.type="DataView"}
else if(dc.indexOf("ListView")>-1||dc.indexOf("listview")>-1){widgetInfo.type="ListView"}
else if(dc.indexOf("TemplateGrid")>-1){widgetInfo.type="TemplateGrid"}
else if(dc.indexOf("DataGrid")>-1){widgetInfo.type="DataGrid"}
/* Get entity from mxcontext */
if(widget.mxcontext){
try{
if(widget.mxcontext.getTrackEntity)widgetInfo.entity=widget.mxcontext.getTrackEntity()||"";
if(widget.mxcontext.getTrackId)widgetInfo.guid=widget.mxcontext.getTrackId()||"";
if(widget.mxcontext._contextStore){
var store=widget.mxcontext._contextStore;
Object.keys(store).forEach(function(ent){
if(ent&&ent.indexOf(".")>-1&&info.entities.findIndex(function(e){return e.name===ent})===-1){
info.entities.push({name:ent,module:ent.split(".")[0],shortName:ent.split(".").pop(),count:1,type:"Context",widgets:[widgetInfo.name||widget.id],guids:[store[ent]],objects:[]});
}
});
}
}catch(cx){}
}
/* Check for datasource property */
if(widget._datasource||widget.datasource){
var ds=widget._datasource||widget.datasource;
if(typeof ds==="object"){
if(ds.type==="microflow"||ds._type==="microflow"){widgetInfo.datasource="Microflow";info.datasources.microflow++}
else if(ds.type==="nanoflow"||ds._type==="nanoflow"){widgetInfo.datasource="Nanoflow";info.datasources.nanoflow++}
else if(ds.type==="xpath"||ds.type==="database"||ds._type==="xpath"){widgetInfo.datasource="Database";info.datasources.database++}
if(ds._entity||ds.entity)widgetInfo.entity=ds._entity||ds.entity;
}else if(typeof ds==="string"){
if(ds.indexOf("Microflow")>-1||ds.indexOf("microflow")>-1){widgetInfo.datasource="Microflow";info.datasources.microflow++}
else{widgetInfo.datasource="Database";info.datasources.database++}
}
}
/* Check widget properties for datasource info */
if(widget.dataSource||widget._dataSource){
var dsType=widget.dataSource||widget._dataSource;
if(dsType==="microflow"){info.datasources.microflow++;widgetInfo.datasource="Microflow"}
else if(dsType==="nanoflow"){info.datasources.nanoflow++;widgetInfo.datasource="Nanoflow"}
else if(dsType==="xpath"||dsType==="database"){info.datasources.database++;widgetInfo.datasource="Database"}
}
/* Get entity from widget properties */
if(!widgetInfo.entity){
if(widget.entity)widgetInfo.entity=widget.entity;
else if(widget._entity)widgetInfo.entity=widget._entity;
else if(widget.entityPath)widgetInfo.entity=widget.entityPath;
}
/* Count objects for list widgets */
if(widgetInfo.type&&widget.domNode){
if(widgetInfo.type==="ListView"){
widgetInfo.objectCount=widget.domNode.querySelectorAll('[class*="mx-listview-item"]').length;
}else if(widgetInfo.type==="DataGrid"){
widgetInfo.objectCount=Math.max(0,widget.domNode.querySelectorAll('[role="row"]').length-1);
}else if(widgetInfo.type==="TemplateGrid"){
widgetInfo.objectCount=widget.domNode.querySelectorAll('[class*="mx-templategrid-item"]').length;
}
info.totalObjects+=widgetInfo.objectCount;
}
/* Add entity to list if found and not already added by MxDataExtractor */
if(widgetInfo.entity&&widgetInfo.type){
var existing=info.entities.find(function(e){return e.name===widgetInfo.entity});
if(existing){
existing.count+=widgetInfo.objectCount||1;
if(existing.widgets.indexOf(widgetInfo.name)===-1)existing.widgets.push(widgetInfo.name||widget.id);
if(widgetInfo.datasource&&!existing.datasource)existing.datasource=widgetInfo.datasource;
}else{
var parts=widgetInfo.entity.split(".");
info.entities.push({
name:widgetInfo.entity,
module:parts[0]||"",
shortName:parts[parts.length-1]||widgetInfo.entity,
count:widgetInfo.objectCount||1,
type:widgetInfo.type,
datasource:widgetInfo.datasource||"Unknown",
widgets:[widgetInfo.name||widget.id],
guids:widgetInfo.guid?[widgetInfo.guid]:[],
objects:[]
});
}
}
/* Store widget info */
if(widgetInfo.type&&!info.widgets.find(function(w){return w.name===widgetInfo.name}))info.widgets.push(widgetInfo);
}catch(wx){}
});
}
/* Method 2: Scan DOM for data containers (fallback) */
document.querySelectorAll('[class*="mx-dataview"],[class*="mx-listview"],[class*="mx-templategrid"],[class*="widget-datagrid"],[class*="widget-gallery"]').forEach(function(el){
var name="",type="",entity="",dsType="",objCount=0;
var cn=el.className;if(typeof cn==="string"){var m=cn.match(/mx-name-([^\s]+)/);if(m)name=m[1]}
if(cn.indexOf("mx-dataview")>-1)type="DataView";
else if(cn.indexOf("mx-listview")>-1){type="ListView";objCount=el.querySelectorAll('[class*="mx-listview-item"]').length}
else if(cn.indexOf("mx-templategrid")>-1){type="TemplateGrid";objCount=el.querySelectorAll('[class*="mx-templategrid-item"]').length}
else if(cn.indexOf("widget-datagrid")>-1){type="DataGrid2";objCount=Math.max(0,el.querySelectorAll('[role="row"]').length-1)}
else if(cn.indexOf("widget-gallery")>-1){type="Gallery";objCount=el.querySelectorAll('[class*="widget-gallery-item"]').length}
/* Try to get entity from data attributes */
entity=el.getAttribute("data-mendix-entity")||el.getAttribute("data-mx-entity")||"";
/* Check for microflow datasource indicator */
if(el.querySelector('[class*="microflow"]')||el.getAttribute("data-datasource")==="microflow"){dsType="Microflow";info.datasources.microflow++}
else if(el.getAttribute("data-datasource")==="nanoflow"){dsType="Nanoflow";info.datasources.nanoflow++}
else if(type&&!info.widgets.find(function(w){return w.name===name})){dsType="Database";info.datasources.database++}
/* Add if not already tracked */
if(type&&name&&!info.widgets.find(function(w){return w.name===name})){
info.widgets.push({name:name,type:type,entity:entity,datasource:dsType,objectCount:objCount});
info.totalObjects+=objCount;
if(entity&&!info.entities.find(function(e){return e.name===entity})){
var parts=entity.split(".");
info.entities.push({name:entity,module:parts[0]||"",shortName:parts[parts.length-1]||entity,count:objCount||1,type:type,datasource:dsType,widgets:[name],guids:[],objects:[]});
}else if(type&&objCount>0&&!info.entities.find(function(e){return e.name===type+" ("+name+")"})){
info.entities.push({name:type+" ("+name+")",module:"",shortName:type,count:objCount,type:type,datasource:dsType,widgets:[name],guids:[],objects:[]});
}
}
});
/* Method 3: Check XHR calls for data retrieval info */
if(window.__mxiPerf&&window.__mxiPerf.network){
var xhrCalls=window.__mxiPerf.network.xhrCalls||[];
xhrCalls.forEach(function(xhr){
if(xhr.url&&xhr.url.indexOf("xas")>-1){
info.xhrCalls.push({url:xhr.url,duration:xhr.duration,status:xhr.status});
/* Parse entity from XHR URL if possible */
var entityMatch=xhr.url.match(/entity=([^&]+)/);
if(entityMatch){
var ent=decodeURIComponent(entityMatch[1]);
var existing=info.entities.find(function(e){return e.name===ent});
if(!existing){
var parts=ent.split(".");
info.entities.push({name:ent,module:parts[0]||"",shortName:parts[parts.length-1]||ent,count:1,type:"XHR",datasource:"Database",widgets:["API Call"],guids:[],objects:[]});
}
}
}
});
}
/* Method 4: Check mx.data cache if accessible */
if(window.mx&&mx.data){
try{
/* Try different cache locations based on Mendix version */
var cacheLocations=["_objectCache","_cache","cache","objectCache"];
cacheLocations.forEach(function(loc){
var cache=mx.data[loc];
if(cache&&typeof cache==="object"){
Object.keys(cache).forEach(function(guid){
try{
var obj=cache[guid];
if(obj){
var entity=obj._entity||obj.getEntity&&obj.getEntity()||"";
if(entity){
var existing=info.entities.find(function(e){return e.name===entity});
if(existing){existing.count++;if(existing.guids.indexOf(guid)===-1)existing.guids.push(guid)}
else{
var parts=entity.split(".");
info.entities.push({name:entity,module:parts[0]||"",shortName:parts[parts.length-1]||entity,count:1,type:"Cached",datasource:"Database",widgets:["mx.data"],guids:[guid],objects:[]});
}
info.totalObjects++;
}
}
}catch(objErr){}
});
}
});
}catch(cacheErr){}
}
}catch(err){console.error("MxInspector: Error getting data info",err)}
return info;
}

function createDataPanel(){
if(dataPanel)return;
var info=getPageDataInfo();
dataPanel=document.createElement("div");
dataPanel.id="mxi-data-panel";
var panelHtml='<div class="mxi-dp-header"><div class="mxi-dp-title">'+icon("stack",18)+' Page Data</div><button class="mxi-dp-close" id="mxi-dp-close">'+icon("x",16)+'</button></div>';
panelHtml+='<div class="mxi-dp-body">';
/* Summary stats */
panelHtml+='<div class="mxi-dp-summary">';
panelHtml+='<div class="mxi-dp-stat"><div class="mxi-dp-stat-value">'+info.entities.length+'</div><div class="mxi-dp-stat-label">Entities</div></div>';
panelHtml+='<div class="mxi-dp-stat"><div class="mxi-dp-stat-value">'+info.totalObjects+'</div><div class="mxi-dp-stat-label">Objects</div></div>';
panelHtml+='</div>';
/* Data Sources breakdown */
panelHtml+='<div class="mxi-dp-section"><div class="mxi-dp-section-title">'+icon("db",14)+' Data Sources</div>';
panelHtml+='<div class="mxi-dp-ds-grid">';
panelHtml+='<div class="mxi-dp-ds-item"><div class="mxi-dp-ds-value" style="color:#3B99FC">'+info.datasources.database+'</div><div class="mxi-dp-ds-label">Database</div></div>';
panelHtml+='<div class="mxi-dp-ds-item"><div class="mxi-dp-ds-value" style="color:#9333EA">'+info.datasources.microflow+'</div><div class="mxi-dp-ds-label">Microflow</div></div>';
panelHtml+='<div class="mxi-dp-ds-item"><div class="mxi-dp-ds-value" style="color:#3DDC97">'+info.datasources.nanoflow+'</div><div class="mxi-dp-ds-label">Nanoflow</div></div>';
panelHtml+='</div></div>';
/* Entities List with expandable object data */
if(info.entities.length>0){
panelHtml+='<div class="mxi-dp-section"><div class="mxi-dp-section-title">'+icon("table",14)+' Entities on Page <span style="color:#666;font-weight:normal">(click to expand)</span></div>';
info.entities.forEach(function(e,idx){
var typeColor=e.type==="DataView"?"#3B99FC":e.type==="ListView"?"#3DDC97":e.type==="DataGrid"||e.type==="DataGrid2"?"#9333EA":e.type==="TemplateGrid"?"#FF7A50":e.type==="Gallery"?"#EC4899":"#666";
var dsColor=e.datasource==="Microflow"?"#9333EA":e.datasource==="Nanoflow"?"#3DDC97":"#3B99FC";
var hasObjects=e.objects&&e.objects.length>0;
panelHtml+='<div class="mxi-dp-entity'+(hasObjects?" mxi-dp-entity-expandable":"")+'" data-entity-idx="'+idx+'">';
panelHtml+='<div class="mxi-dp-entity-header">';
panelHtml+='<div class="mxi-dp-entity-icon" style="background:'+typeColor+'">'+(hasObjects?icon("eye",14):icon("db",14))+'</div>';
panelHtml+='<div class="mxi-dp-entity-info"><div class="mxi-dp-entity-name">'+(e.shortName||e.name)+'</div>';
if(e.module)panelHtml+='<div class="mxi-dp-entity-module">'+e.module+'</div>';
panelHtml+='</div>';
panelHtml+='<div class="mxi-dp-entity-meta">';
if(e.count>0)panelHtml+='<span class="mxi-dp-badge" style="background:'+typeColor+'22;color:'+typeColor+'">'+e.count+' obj</span>';
panelHtml+='<span class="mxi-dp-type-badge">'+e.type+'</span>';
panelHtml+='</div></div>';
/* Data source indicator */
if(e.datasource)panelHtml+='<div class="mxi-dp-entity-ds"><span style="color:'+dsColor+';display:inline-flex;align-items:center;gap:4px">'+icon("lightning",10)+'</span> '+e.datasource+' data source</div>';
/* Widgets using this entity */
if(e.widgets&&e.widgets.length>0&&e.widgets[0]){
panelHtml+='<div class="mxi-dp-entity-widgets"><span class="mxi-dp-widgets-label">Used by:</span>';
e.widgets.filter(function(w){return w}).slice(0,5).forEach(function(w){panelHtml+='<span class="mxi-dp-widget-tag">'+w+'</span>'});
if(e.widgets.length>5)panelHtml+='<span class="mxi-dp-widget-more">+'+(e.widgets.length-5)+' more</span>';
panelHtml+='</div>';
}
/* Expandable object data section */
if(hasObjects){
panelHtml+='<div class="mxi-dp-objects" id="mxi-dp-objects-'+idx+'" style="display:none">';
panelHtml+='<div class="mxi-dp-objects-header">'+icon("table",12)+' Object Data ('+e.objects.length+(e.count>e.objects.length?' of '+e.count:'')+')</div>';
e.objects.forEach(function(obj,objIdx){
panelHtml+='<div class="mxi-dp-object">';
panelHtml+='<div class="mxi-dp-object-header">';
panelHtml+='<span class="mxi-dp-object-idx">#'+(objIdx+1)+'</span>';
if(obj.guid)panelHtml+='<span class="mxi-dp-object-guid" title="'+obj.guid+'">'+obj.guid.substring(0,12)+'...</span>';
panelHtml+='</div>';
panelHtml+='<div class="mxi-dp-attrs">';
var attrs=Object.entries(obj.attributes||{});
attrs.slice(0,15).forEach(function(kv){
var attrName=kv[0],attrVal=kv[1];
var displayVal=attrVal;
if(attrVal===null||attrVal===undefined)displayVal='<span style="color:#666">null</span>';
else if(typeof attrVal==="boolean")displayVal='<span style="color:'+(attrVal?"#3DDC97":"#FF5A5A")+'">'+attrVal+'</span>';
else if(typeof attrVal==="number")displayVal='<span style="color:#3B99FC">'+attrVal+'</span>';
else if(typeof attrVal==="string"&&attrVal.length>40)displayVal='"'+esc(attrVal.substring(0,40))+'..."';
else if(typeof attrVal==="string")displayVal='"'+esc(attrVal)+'"';
else if(typeof attrVal==="object")displayVal='<span style="color:#9333EA">[Object]</span>';
panelHtml+='<div class="mxi-dp-attr"><span class="mxi-dp-attr-name">'+attrName+'</span><span class="mxi-dp-attr-val">'+displayVal+'</span></div>';
});
if(attrs.length>15)panelHtml+='<div class="mxi-dp-attr" style="color:#666;font-style:italic">+'+(attrs.length-15)+' more attributes...</div>';
panelHtml+='</div></div>';
});
panelHtml+='</div>';
}
panelHtml+='</div>';
});
panelHtml+='</div>';
}else{
panelHtml+='<div class="mxi-dp-empty">'+icon("db",32)+'<div>No data containers detected</div><div class="mxi-dp-empty-sub">DataViews, ListViews, DataGrids will appear here.<br>Try refreshing after page fully loads.</div></div>';
}
/* XHR calls info */
if(info.xhrCalls.length>0){
panelHtml+='<div class="mxi-dp-section"><div class="mxi-dp-section-title">'+icon("globe",14)+' Data Requests ('+info.xhrCalls.length+')</div>';
panelHtml+='<div class="mxi-dp-xhr-list">';
info.xhrCalls.slice(0,5).forEach(function(xhr){
var durColor=xhr.duration>1000?"#FF5A5A":xhr.duration>500?"#FF7A50":"#3DDC97";
panelHtml+='<div class="mxi-dp-xhr"><span class="mxi-dp-xhr-dur" style="color:'+durColor+'">'+xhr.duration+'ms</span><span class="mxi-dp-xhr-url">'+xhr.url.split("/").pop().split("?")[0]+'</span></div>';
});
panelHtml+='</div></div>';
}
panelHtml+='</div>';
dataPanel.innerHTML=panelHtml;
/* Panel styles - updated with object browser styles */
var panelStyle=document.createElement("style");
panelStyle.id="mxi-data-panel-styles";
panelStyle.textContent='#mxi-data-panel{position:fixed;top:20px;left:20px;width:420px;max-height:90vh;background:#141414;border-radius:16px;box-shadow:0 0 0 1px #2E2E2E,0 25px 80px rgba(0,0,0,.6);font-family:Geist,Inter,system-ui,-apple-system,sans-serif;font-size:13px;z-index:999998;overflow:hidden;display:flex;flex-direction:column;animation:mxi-slide-in .2s ease-out}@keyframes mxi-slide-in{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}.mxi-dp-header{padding:16px 20px;border-bottom:1px solid #2E2E2E;display:flex;align-items:center;justify-content:space-between;background:#1A1A1A}.mxi-dp-title{display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px;color:#fff}.mxi-dp-close{background:none;border:none;color:#666;cursor:pointer;padding:6px;border-radius:8px;display:flex;align-items:center;justify-content:center;transition:all .2s}.mxi-dp-close:hover{background:#2E2E2E;color:#fff}.mxi-dp-body{flex:1;overflow-y:auto;padding:16px}.mxi-dp-summary{display:flex;gap:12px;margin-bottom:16px}.mxi-dp-stat{flex:1;background:#1A1A1A;border-radius:12px;padding:16px;text-align:center;border:1px solid #2E2E2E}.mxi-dp-stat-value{font-size:28px;font-weight:700;color:#FFB800}.mxi-dp-stat-label{font-size:11px;color:#666;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}.mxi-dp-section{margin-bottom:16px}.mxi-dp-section-title{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;display:flex;align-items:center;gap:8px}.mxi-dp-ds-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mxi-dp-ds-item{background:#1A1A1A;border-radius:10px;padding:12px;text-align:center;border:1px solid #2E2E2E}.mxi-dp-ds-value{font-size:24px;font-weight:700}.mxi-dp-ds-label{font-size:10px;color:#666;margin-top:4px;text-transform:uppercase}.mxi-dp-entity{background:#1A1A1A;border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid #2E2E2E;transition:all .2s}.mxi-dp-entity:hover{border-color:#3E3E3E}.mxi-dp-entity-expandable{cursor:pointer}.mxi-dp-entity-expandable:hover{transform:translateX(2px)}.mxi-dp-entity-header{display:flex;align-items:center;gap:12px}.mxi-dp-entity-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}.mxi-dp-entity-info{flex:1;min-width:0}.mxi-dp-entity-name{font-weight:600;color:#fff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mxi-dp-entity-module{font-size:11px;color:#666;margin-top:2px}.mxi-dp-entity-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.mxi-dp-badge{padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600}.mxi-dp-type-badge{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.5px}.mxi-dp-entity-ds{margin-top:8px;padding-top:8px;border-top:1px solid #2E2E2E;font-size:11px;color:#9A9A9A}.mxi-dp-entity-widgets{margin-top:8px;padding-top:8px;border-top:1px solid #2E2E2E;display:flex;flex-wrap:wrap;gap:6px;align-items:center}.mxi-dp-widgets-label{font-size:10px;color:#666;margin-right:4px}.mxi-dp-widget-tag{background:#242424;color:#9A9A9A;padding:3px 8px;border-radius:4px;font-size:10px;font-family:"Geist Mono",monospace}.mxi-dp-widget-more{font-size:10px;color:#666}.mxi-dp-objects{margin-top:12px;padding-top:12px;border-top:1px solid #2E2E2E}.mxi-dp-objects-header{font-size:10px;color:#FFB800;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;display:flex;align-items:center;gap:6px}.mxi-dp-object{background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #252525}.mxi-dp-object-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #252525}.mxi-dp-object-idx{color:#FFB800;font-weight:600;font-size:11px}.mxi-dp-object-guid{color:#666;font-family:"Geist Mono",monospace;font-size:10px}.mxi-dp-attrs{display:flex;flex-direction:column;gap:4px}.mxi-dp-attr{display:flex;justify-content:space-between;font-size:11px;padding:2px 0}.mxi-dp-attr-name{color:#9A9A9A;font-family:"Geist Mono",monospace}.mxi-dp-attr-val{color:#fff;font-family:"Geist Mono",monospace;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}.mxi-dp-empty{text-align:center;padding:40px 20px;color:#666}.mxi-dp-empty svg{color:#333;margin-bottom:12px}.mxi-dp-empty-sub{font-size:11px;color:#444;margin-top:8px;line-height:1.6}.mxi-dp-xhr-list{display:flex;flex-direction:column;gap:6px}.mxi-dp-xhr{display:flex;align-items:center;gap:10px;background:#1A1A1A;padding:8px 12px;border-radius:8px;font-size:11px;border:1px solid #2E2E2E}.mxi-dp-xhr-dur{font-weight:600;min-width:50px}.mxi-dp-xhr-url{color:#9A9A9A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#mxi-data-panel ::-webkit-scrollbar{width:6px}#mxi-data-panel ::-webkit-scrollbar-track{background:#141414}#mxi-data-panel ::-webkit-scrollbar-thumb{background:#2E2E2E;border-radius:3px}';
document.head.appendChild(panelStyle);
document.body.appendChild(dataPanel);
document.getElementById("mxi-dp-close").onclick=closeDataPanel;
/* Add click handlers for expandable entities */
dataPanel.querySelectorAll(".mxi-dp-entity-expandable").forEach(function(el){
el.onclick=function(){
var idx=el.getAttribute("data-entity-idx");
var objSection=document.getElementById("mxi-dp-objects-"+idx);
if(objSection){
var isVisible=objSection.style.display!=="none";
objSection.style.display=isVisible?"none":"block";
el.style.background=isVisible?"#1A1A1A":"#1F1F1F";
}
};
});
}

function closeDataPanel(){
if(dataPanel){dataPanel.remove();dataPanel=null}
var style=document.getElementById("mxi-data-panel-styles");
if(style)style.remove();
dataPanelVisible=false;
var btn=document.getElementById("mxi-data-panel-btn");
if(btn){btn.style.background="";btn.style.color=""}
}

function toggleDataPanel(){
/* v0.2.29 — Data Inspector is now embedded inside the main panel's body as
 * a drawer that slides up from the footer. Route toggle with mount target.
 *
 * v0.2.47 — Removed the `mainBody.style.overflow = 'hidden'` pre-set and the
 * setTimeout restore. They caused a scroll-lock bug: the data panel's open()
 * records the baseline overflow to restore on close, but our pre-set polluted
 * that baseline with 'hidden', so closing the drawer restored to 'hidden' and
 * the user could no longer scroll. Let the data panel manage mountTarget
 * overflow exclusively — its own save/restore is correct. */
if (window.__MxDataPanel) {
  var mainPanel = document.getElementById("mx-inspector-pro");
  var mainBody = mainPanel ? mainPanel.querySelector(".mxi-body") : null;
  if (mainBody) {
    // The drawer is absolute-positioned inside mainBody; ensure mainBody is
    // a positioned ancestor so the drawer anchors correctly. Overflow is
    // managed by the data panel itself.
    if (getComputedStyle(mainBody).position === 'static') {
      mainBody.style.position = 'relative';
    }
  }
  window.__MxDataPanel.toggle(mainBody || undefined);
  var btn2 = document.getElementById("mxi-data-panel-btn");
  if (btn2) {
    var on = window.__MxDataPanel.isOpen();
    btn2.classList.toggle("mxi-btn-active", on);
    btn2.style.background = on ? k : "";
    btn2.style.color = on ? w : "";
    /* v0.2.59 — if the drawer just opened, clear any main-panel overlays
     * so we don't end up with two overlay systems painting on the same
     * elements. The user can still click a metric afterwards to paint
     * fresh ones — but we force one active highlight source at a time. */
    if (on) {
      try { clearHighlights(); } catch (e) {}
    }
  }
  return;
}
if(dataPanelVisible){closeDataPanel()}
else{createDataPanel();dataPanelVisible=true;var btn=document.getElementById("mxi-data-panel-btn");if(btn){btn.style.background=k;btn.style.color=w}}
}

var dataPanelBtn=document.getElementById("mxi-data-panel-btn");
if(dataPanelBtn)dataPanelBtn.onclick=toggleDataPanel;

/* ===== WIDGET INSPECTOR MODE ===== */
var widgetInspectActive=false;
var widgetInspectTooltip=null;
var widgetInspectOutline=null;
var widgetInspectCloseBtn=null;

function createWidgetInspectElements(){
if(widgetInspectTooltip)return;
widgetInspectTooltip=document.createElement("div");
widgetInspectTooltip.id="mxi-widget-tooltip";
widgetInspectTooltip.style.cssText="position:fixed;background:#141414;color:#fff;padding:16px 18px;border-radius:14px;font-family:Geist,Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:2147483640;pointer-events:none;opacity:0;transition:opacity .15s;max-width:420px;min-width:320px;box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E";
document.body.appendChild(widgetInspectTooltip);
widgetInspectOutline=document.createElement("div");
widgetInspectOutline.id="mxi-widget-outline";
widgetInspectOutline.style.cssText="position:fixed;border:2px solid #FFB800;pointer-events:none;z-index:2147483639;transition:all .1s ease-out;opacity:0;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(255,184,0,.3)";
document.body.appendChild(widgetInspectOutline);
}

function destroyWidgetInspectElements(){
if(widgetInspectTooltip){widgetInspectTooltip.remove();widgetInspectTooltip=null}
if(widgetInspectOutline){widgetInspectOutline.remove();widgetInspectOutline=null}
}

function getWidgetType(el){
try{
var cn=el.className;
if(!cn)return null;
if(typeof cn!=="string")cn=cn.baseVal||"";
if(!cn)return null;
if(cn.indexOf("mx-dataview")>-1)return{type:"DataView",icon:icon("page",18),color:"#3B99FC"};
if(cn.indexOf("mx-listview")>-1)return{type:"ListView",icon:icon("list",18),color:"#3DDC97"};
if(cn.indexOf("mx-templategrid")>-1)return{type:"TemplateGrid",icon:icon("grid",18),color:"#FF7A50"};
if(cn.indexOf("widget-datagrid")>-1)return{type:"DataGrid2",icon:icon("table",18),color:"#9333EA"};
if(cn.indexOf("widget-gallery")>-1)return{type:"Gallery",icon:icon("image",18),color:"#EC4899"};
if(cn.indexOf("mx-button")>-1||cn.indexOf("btn")>-1)return{type:"Button",icon:icon("cursor",18),color:"#FFB800"};
if(cn.indexOf("mx-textinput")>-1||cn.indexOf("form-control")>-1)return{type:"Input",icon:icon("textcursor",18),color:"#14B8A6"};
if(cn.indexOf("mx-text")>-1)return{type:"Text",icon:icon("type",18),color:"#9A9A9A"};
if(cn.indexOf("mx-image")>-1)return{type:"Image",icon:icon("image",18),color:"#F59E0B"};
if(cn.indexOf("mx-tabcontainer")>-1)return{type:"TabContainer",icon:icon("tabs",18),color:"#6366F1"};
if(cn.indexOf("widget-")>-1){var m=cn.match(/widget-([^\s]+)/);return{type:m?m[1]:"Pluggable",icon:icon("plug",18),color:"#06B6D4"}}
if(cn.indexOf("mx-name-")>-1)return{type:"Widget",icon:icon("cube",18),color:"#666"};
}catch(ex){}
return null;
}

function getWidgetName(el){
try{
var cn=el.className;
if(!cn)return null;
if(typeof cn!=="string")cn=cn.baseVal||"";
if(!cn)return null;
var m=cn.match(/mx-name-([^\s]+)/);
return m?m[1]:null;
}catch(ex){return null}
}

function findWidgetElement(el){
var current=el;
var maxDepth=15;
while(current&&maxDepth-->0){
try{
var wt=getWidgetType(current);
var wn=getWidgetName(current);
if(wt||wn)return current;
}catch(ex){}
current=current.parentElement;
}
return null;
}

/* Get detailed widget info from dijit registry */
function getWidgetDetails(el,widgetName){
var details={entity:"",datasource:"",objectCount:0,loadTime:null,guid:""};
try{
/* Try to get from dijit registry */
if(window.dijit&&dijit.registry){
var widget=null;
/* Find widget by matching DOM node */
dijit.registry.forEach(function(w){
if(w.domNode===el||w.domNode&&w.domNode.contains&&w.domNode.contains(el)){
if(!widget||w.domNode===el)widget=w;
}
});
/* Also try by widget ID pattern */
if(!widget&&widgetName){
dijit.registry.forEach(function(w){
if(w.id&&w.id.indexOf(widgetName)>-1)widget=w;
});
}
if(widget){
/* Get entity from mxcontext */
if(widget.mxcontext){
if(widget.mxcontext.getTrackEntity)details.entity=widget.mxcontext.getTrackEntity()||"";
if(widget.mxcontext.getTrackId)details.guid=widget.mxcontext.getTrackId()||"";
}
/* Get datasource type */
if(widget._datasource||widget.datasource){
var ds=widget._datasource||widget.datasource;
if(typeof ds==="object"){
if(ds.type||ds._type){
var dsType=ds.type||ds._type;
if(dsType==="microflow")details.datasource="Microflow";
else if(dsType==="nanoflow")details.datasource="Nanoflow";
else if(dsType==="xpath"||dsType==="database")details.datasource="Database";
}
if(ds._entity||ds.entity)details.entity=ds._entity||ds.entity||details.entity;
}
}
if(widget.dataSource){
if(widget.dataSource==="microflow")details.datasource="Microflow";
else if(widget.dataSource==="nanoflow")details.datasource="Nanoflow";
else details.datasource="Database";
}
/* Get entity from widget properties */
if(!details.entity){
details.entity=widget.entity||widget._entity||widget.entityPath||"";
}
}
}
/* Try from DOM attributes */
if(!details.entity){
details.entity=el.getAttribute("data-mendix-entity")||el.getAttribute("data-mx-entity")||"";
}
}catch(ex){}
return details;
}

function handleWidgetInspectHover(e){
try{
if(!widgetInspectActive||!widgetInspectTooltip)return;
var el=e.target;
if(el.closest("#mx-inspector-pro")||el.closest("#mxi-widget-tooltip"))return;
var widgetEl=findWidgetElement(el);
if(!widgetEl){widgetInspectTooltip.style.opacity="0";widgetInspectOutline.style.opacity="0";return}
var wt=getWidgetType(widgetEl)||{type:"Widget",icon:"📦",color:"#666"};
var wn=getWidgetName(widgetEl)||"unnamed";
var rect=widgetEl.getBoundingClientRect();

/* Use MxDataExtractor for comprehensive data extraction */
var mxData=null;
if(window.__MxDataExtractor){
mxData=window.__MxDataExtractor.extractDataFromElement(widgetEl);
}

/* Get entity and object count from MxDataExtractor or fallback */
var entity=mxData&&mxData.entity?mxData.entity:null;
var objCount=mxData?mxData.objectCount:0;
var attributes=mxData&&mxData.attributes?mxData.attributes:[];
var associations=mxData&&mxData.associations?mxData.associations:[];
var mxObject=mxData?mxData.mxObject:null;

/* Ensure mxObject is the actual MxObject, not a wrapper */
if(mxObject&&window.__MxDataExtractor&&!mxObject._jsonData){
var unwrapped=window.__MxDataExtractor.getMxObjectFromItem(mxObject);
if(unwrapped)mxObject=unwrapped;
}

/* For list containers, get count from DOM if MxDataExtractor didn't find it */
if(objCount===0){
if(wt.type==="ListView"){objCount=widgetEl.querySelectorAll('[class*="mx-listview-item"]').length}
else if(wt.type==="DataGrid2"){objCount=Math.max(0,widgetEl.querySelectorAll('[role="row"]').length-1)}
else if(wt.type==="Gallery"){objCount=widgetEl.querySelectorAll('[class*="widget-gallery-item"]').length}
else if(wt.type==="TemplateGrid"){objCount=widgetEl.querySelectorAll('[class*="mx-templategrid-item"]').length}
}

/* Get nesting depth */
var depth=0;
var parent=widgetEl.parentElement;
while(parent){
var pt=getWidgetType(parent);
if(pt&&(pt.type==="DataView"||pt.type==="ListView"||pt.type==="TemplateGrid"||pt.type==="DataGrid2"))depth++;
parent=parent.parentElement;
}

/* Find parent data container */
var parentContainer=null;
if(window.__MxDataExtractor){
parentContainer=window.__MxDataExtractor.findParentDataContainer(widgetEl);
}

/* Get GUID if we have an mxObject */
var guid=null;
if(mxObject&&window.__MxDataExtractor){
guid=window.__MxDataExtractor.getObjectGuid(mxObject);
}

/* If we have an mxObject but no attributes, try to extract them directly */
if(mxObject&&attributes.length===0&&window.__MxDataExtractor){
var attrData=window.__MxDataExtractor.getObjectAttributes(mxObject);
attributes=attrData.attributes;
associations=attrData.associations;
}

/* Build tooltip - simple version with just name and click hint */
var hasData=(attributes&&attributes.length>0)||(associations&&associations.length>0)||entity;

var html='<div style="display:flex;align-items:center;gap:10px">';
html+='<div style="width:32px;height:32px;background:'+wt.color+'22;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px">'+wt.icon+'</div>';
html+='<div style="flex:1;min-width:0">';
html+='<div style="font-weight:600;font-size:12px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+wn+'</div>';
html+='<div style="font-size:10px;color:#666;margin-top:2px">'+wt.type+(entity?' • <span style="color:#3B99FC">'+entity.split(".").pop()+'</span>':'')+'</div>';
html+='</div>';
html+='</div>';
if(hasData){
html+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid #2E2E2E;text-align:center;font-size:10px;color:#888;display:flex;align-items:center;justify-content:center;gap:6px">'+icon("cursor",14)+' Click to inspect · Alt+click to cycle layers</div>';
}else{
html+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid #2E2E2E;text-align:center;font-size:10px;color:#555">No data available</div>';
}

/* v0.2.0 — add meaningful layer stack breadcrumb */
if (window.__MxLayerStack) {
  try {
    var _stack = window.__MxLayerStack.getStack(e.target);
    if (_stack && _stack.length > 1) {
      var _currentIdx = -1;
      /* v0.2.3 — prefer the tracked selection (survives alt+click cycles).
       * Fall back to widgetEl, then to default level. */
      var _selected = window.__MxLayerStack.getSelection && window.__MxLayerStack.getSelection();
      if (_selected) {
        for (var _s = 0; _s < _stack.length; _s++) {
          if (_stack[_s].element === _selected) { _currentIdx = _s; break; }
        }
      }
      if (_currentIdx < 0) {
        for (var _i = 0; _i < _stack.length; _i++) {
          if (_stack[_i].element === widgetEl) { _currentIdx = _i; break; }
        }
      }
      if (_currentIdx < 0) _currentIdx = window.__MxLayerStack.getDefaultLevel(_stack);
      html += window.__MxLayerStack.renderBreadcrumb(_stack, _currentIdx);
      widgetEl._mxiStack = _stack;
      widgetEl._mxiStackIdx = _currentIdx;
    }
  } catch (_ex) {}
}

/* Store hasData on the element for click handler */
widgetEl._mxiHasData=hasData;

widgetInspectTooltip.innerHTML=html;

/* v0.2.0 — wire up breadcrumb chip clicks */
if (window.__MxLayerStack && widgetEl._mxiStack) {
  widgetInspectTooltip.style.pointerEvents = "auto";
  var _chips = widgetInspectTooltip.querySelectorAll(".mxi-stack-chip");
  for (var _c = 0; _c < _chips.length; _c++) {
    (function(chip) {
      chip.addEventListener("click", function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        var idx = parseInt(chip.getAttribute("data-level-idx"), 10);
        var stack = widgetEl._mxiStack;
        if (stack && stack[idx]) {
          window.__MxLayerStack.setSelection(stack[idx].element);
          performWidgetInspection(stack[idx].element);
          if (window.__MxDataPanel && window.__MxDataPanel.isOpen()) {
            window.__MxDataPanel.focus(stack[idx].element);
          }
        }
      }, true);
    })(_chips[_c]);
  }
}
/* Position tooltip */
var ttWidth=420;
var ttLeft=e.clientX+15;
var ttTop=e.clientY+15;
if(ttLeft+ttWidth>window.innerWidth)ttLeft=e.clientX-ttWidth-15;
if(ttTop+widgetInspectTooltip.offsetHeight>window.innerHeight)ttTop=Math.max(10,window.innerHeight-widgetInspectTooltip.offsetHeight-10);
widgetInspectTooltip.style.left=Math.max(10,ttLeft)+"px";
widgetInspectTooltip.style.top=Math.max(10,ttTop)+"px";
widgetInspectTooltip.style.opacity="1";
/* Position outline - always use yellow brand color for consistency */
widgetInspectOutline.style.left=rect.left-3+"px";
widgetInspectOutline.style.top=rect.top-3+"px";
widgetInspectOutline.style.width=rect.width+6+"px";
widgetInspectOutline.style.height=rect.height+6+"px";
widgetInspectOutline.style.borderColor="#FFB800";
widgetInspectOutline.style.opacity="1";
}catch(ex){console.error("MxInspector hover error:",ex)}
}

function handleWidgetInspectOut(){
if(widgetInspectTooltip)widgetInspectTooltip.style.opacity="0";
if(widgetInspectOutline)widgetInspectOutline.style.opacity="0";
}

/* EXPANDED PANEL - Draggable, resizable, persistent, updates on click */
var widgetExpandedPanel=null;
var widgetExpandedData=null;
var expandedPanelOpen=false;
var currentHighlight=null;

function createExpandedPanel(widgetEl,wn,wt,entity,attributes,associations,parentContainer,mxObject){
widgetExpandedData={widgetEl:widgetEl,wn:wn,wt:wt,entity:entity,attributes:attributes,associations:associations,parentContainer:parentContainer,mxObject:mxObject};
expandedPanelOpen=true;

/* Create panel if doesn't exist, otherwise just update content */
var isNew=!widgetExpandedPanel;
if(isNew){
widgetExpandedPanel=document.createElement("div");
widgetExpandedPanel.id="mxi-expanded-panel";
/* Position 475px from right edge, 20px from top - always clear of MxInspector */
widgetExpandedPanel.style.cssText="position:fixed;top:20px;right:475px;background:#141414;color:#fff;padding:0;border-radius:12px;font-family:Geist,Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:999998;width:360px;min-width:280px;max-width:600px;min-height:200px;max-height:calc(100vh - 40px);box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E;display:flex;flex-direction:column;overflow:hidden;resize:both";
document.body.appendChild(widgetExpandedPanel);
}

/* Scrollbar styles - dark grey */
var styles='<style>#mxi-expanded-panel::-webkit-resizer{background:transparent}#mxi-expanded-panel>div:last-child::-webkit-scrollbar{width:8px}#mxi-expanded-panel>div:last-child::-webkit-scrollbar-track{background:#1A1A1A;border-radius:4px}#mxi-expanded-panel>div:last-child::-webkit-scrollbar-thumb{background:#333;border-radius:4px;border:2px solid #1A1A1A}#mxi-expanded-panel>div:last-child::-webkit-scrollbar-thumb:hover{background:#444}</style>';

/* Header - draggable */
var header='<div id="mxi-expanded-header" style="padding:12px 16px;border-bottom:1px solid #2E2E2E;display:flex;align-items:center;gap:10px;flex-shrink:0;cursor:move;background:#1A1A1A;border-radius:12px 12px 0 0">';
header+='<div style="width:36px;height:36px;background:'+wt.color+'22;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">'+wt.icon+'</div>';
header+='<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+wn+'</div>';
header+='<div style="font-size:10px;color:'+wt.color+';margin-top:2px">'+wt.type+(entity?' • <span style="color:#3B99FC">'+entity.split(".").pop()+'</span>':'')+'</div></div>';
header+='<button id="mxi-expanded-close" style="background:#252525;border:none;color:#666;font-size:18px;cursor:pointer;padding:0;line-height:1;border-radius:6px;width:28px;height:28px;display:flex;align-items:center;justify-content:center">&times;</button>';
header+='</div>';

/* Parent context */
var parentHtml='';
if(parentContainer&&parentContainer.name&&parentContainer.name!==wn){
parentHtml='<div style="padding:10px 16px;background:#0D0D0D;border-bottom:1px solid #252525;flex-shrink:0">';
parentHtml+='<div style="display:flex;align-items:center;gap:6px;font-size:11px">';
parentHtml+='<span style="color:#666">↳</span>';
parentHtml+='<span style="color:#fff">'+parentContainer.name+'</span>';
parentHtml+='<span style="color:#555">('+parentContainer.type+')</span>';
parentHtml+='<button class="mxi-highlight-parent" style="background:#FFB80022;border:1px solid #FFB80044;color:#FFB800;font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;margin-left:auto;display:flex;align-items:center;gap:4px">'+icon("eye",10)+' Show</button>';
parentHtml+='</div></div>';
}

/* Scrollable content */
var content='<div style="flex:1;overflow-y:auto;padding:12px 16px">';

/* ASSOCIATIONS FIRST (on top) */
if(associations&&associations.length>0){
/* Get page parameters to check against */
var pageParams=window.__MxDataExtractor&&window.__MxDataExtractor.getPageParameters?window.__MxDataExtractor.getPageParameters():[];

content+='<div style="margin-bottom:16px">';
content+='<div style="font-size:9px;color:#3B99FC;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ASSOCIATIONS <span style="color:#555;margin-left:4px">'+associations.length+'</span></div>';
content+='<div style="background:#1A1A1A;border-radius:6px;overflow:hidden">';
associations.forEach(function(assoc){
var hasValue=assoc.value&&assoc.value!=="";
var shortName=assoc.name.split(".").pop().split("_").pop();

/* Check if this association matches a page parameter */
var pageParam=null;
var assocEntity=assoc.name.split("_").pop();
pageParams.forEach(function(pp){
if(pp.name===assocEntity||pp.name===shortName||(pp.entity&&pp.entity.indexOf(assocEntity)>-1)){
pageParam=pp;
}
});

content+='<div class="mxi-assoc-row" data-assoc="'+assoc.name+'" data-value="'+(assoc.value||'')+'" style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid #252525;font-size:10px;cursor:pointer;transition:background .1s">';
content+='<span style="color:#777;font-family:"Geist Mono",monospace">'+shortName+'</span>';
content+='<span style="display:flex;align-items:center;gap:6px">';
if(hasValue){
content+='<span style="color:#3DDC97;display:inline-flex;align-items:center">'+icon("check",10)+'</span>';
content+='<span class="mxi-assoc-eye" style="color:#3B99FC;display:flex;align-items:center;opacity:.6">'+icon("eye",12)+'</span>';
}else if(pageParam){
/* Association is empty but matches page parameter */
content+='<span style="color:#FFB800;font-size:8px;background:#FFB80022;padding:1px 4px;border-radius:2px" title="Value from page parameter">PAGE PARAM</span>';
content+='<span class="mxi-assoc-eye" style="color:#FFB800;display:flex;align-items:center;opacity:.6">'+icon("eye",12)+'</span>';
}else{
content+='<span style="color:#444;font-size:9px">empty</span>';
}
content+='</span></div>';
});
content+='</div></div>';
}

/* ATTRIBUTES SECOND */
if(attributes&&attributes.length>0){
content+='<div style="margin-bottom:16px">';
content+='<div style="font-size:9px;color:#FFB800;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">ATTRIBUTES <span style="color:#555;margin-left:4px">'+attributes.length+'</span></div>';
content+='<div style="background:#1A1A1A;border-radius:6px;overflow:hidden">';
attributes.forEach(function(attr){
var val=attr.value;
var valStr="",valColor="#fff";
if(val===null||val===undefined){valStr="null";valColor="#555"}
else if(typeof val==="boolean"){valStr=val?"true":"false";valColor=val?"#3DDC97":"#FF7A50"}
else if(typeof val==="number"){valStr=String(val);valColor="#FFB800"}
else if(typeof val==="string"){valStr=val===""?'""':(val.length>40?'"'+val.substring(0,40)+'…"':'"'+val+'"');valColor="#9A9A9A"}
else if(Array.isArray(val)){valStr="["+val.length+"]";valColor="#3B99FC"}
else{valStr="[Object]";valColor="#3B99FC"}
content+='<div style="display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #252525;font-size:10px">';
content+='<span style="color:#777;font-family:"Geist Mono",monospace">'+attr.name+'</span>';
content+='<span style="color:'+valColor+';font-family:"Geist Mono",monospace;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+String(val).replace(/"/g,"&quot;")+'">'+valStr+'</span>';
content+='</div>';
});
content+='</div></div>';
}

if((!attributes||!attributes.length)&&(!associations||!associations.length)){
content+='<div style="text-align:center;color:#555;padding:30px">No data available</div>';
}

/* Resize hint */
content+='<div style="text-align:center;color:#333;font-size:9px;margin-top:8px">↘ Drag corner to resize</div>';

content+='</div>';
widgetExpandedPanel.innerHTML=styles+header+parentHtml+content;

/* Setup events */
setTimeout(function(){
/* Close button */
var closeBtn=document.getElementById("mxi-expanded-close");
if(closeBtn){
closeBtn.onclick=function(e){e.stopPropagation();closeExpandedPanel()};
closeBtn.onmouseenter=function(){this.style.color="#fff"};
closeBtn.onmouseleave=function(){this.style.color="#666"};
}

/* Dragging */
var hdr=document.getElementById("mxi-expanded-header");
if(hdr&&isNew){
var isDrag=false,startX,startY,startLeft,startTop;
hdr.onmousedown=function(e){
if(e.target.tagName==="BUTTON")return;
isDrag=true;
var rect=widgetExpandedPanel.getBoundingClientRect();
startX=e.clientX;startY=e.clientY;
startLeft=rect.left;startTop=rect.top;
};
document.addEventListener("mousemove",function(e){
if(!isDrag)return;
widgetExpandedPanel.style.left=startLeft+(e.clientX-startX)+"px";
widgetExpandedPanel.style.top=startTop+(e.clientY-startY)+"px";
});
document.addEventListener("mouseup",function(){isDrag=false});
}

/* Parent highlight */
var parentBtn=widgetExpandedPanel.querySelector(".mxi-highlight-parent");
if(parentBtn&&parentContainer&&parentContainer.element){
parentBtn.onclick=function(e){e.stopPropagation();toggleHighlight(parentContainer.element,"#FFB800",parentContainer.name)};
}

/* Association rows - click to toggle highlight */
widgetExpandedPanel.querySelectorAll(".mxi-assoc-row").forEach(function(row){
row.onmouseenter=function(){row.style.background="#252525"};
row.onmouseleave=function(){row.style.background="transparent"};
row.onclick=function(e){
e.stopPropagation();
var assocName=row.getAttribute("data-assoc");
var assocValue=row.getAttribute("data-value");
var found=findAssociatedElement(assocName,assocValue);
if(found){
toggleHighlight(found,"#3B99FC",assocName.split(".").pop().split("_").pop());
}else{
showToast("Not visible on page");
}
};
});
},10);
}

function toggleHighlight(el,color,label){
/* If clicking same element, remove highlight */
if(currentHighlight&&currentHighlight.element===el){
var existing=document.getElementById("mxi-temp-highlight");
if(existing)existing.remove();
currentHighlight=null;
return;
}
/* Remove any existing highlight */
var existing=document.getElementById("mxi-temp-highlight");
if(existing)existing.remove();

var rect=el.getBoundingClientRect();
var highlight=document.createElement("div");
highlight.id="mxi-temp-highlight";
highlight.style.cssText="position:fixed;pointer-events:none;z-index:999995;border:3px solid "+color+";border-radius:4px;background:"+color+"11";
highlight.style.left=rect.left-3+"px";
highlight.style.top=rect.top-3+"px";
highlight.style.width=rect.width+6+"px";
highlight.style.height=rect.height+6+"px";

/* Label */
var labelEl=document.createElement("div");
labelEl.style.cssText="position:absolute;top:-24px;left:0;background:"+color+";color:#000;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;white-space:nowrap;font-family:Geist,Inter,system-ui,sans-serif";
labelEl.textContent=label;
highlight.appendChild(labelEl);

document.body.appendChild(highlight);
currentHighlight={element:el,highlight:highlight};
}

function closeExpandedPanel(){
if(widgetExpandedPanel){
widgetExpandedPanel.remove();
widgetExpandedPanel=null;
}
/* Remove any highlight */
var existing=document.getElementById("mxi-temp-highlight");
if(existing)existing.remove();
currentHighlight=null;
expandedPanelOpen=false;
widgetExpandedData=null;
}

function handleExpandedEsc(e){
if(e.key==="Escape"&&expandedPanelOpen){
e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();
closeExpandedPanel();
}
}

function highlightElement(el,color,label){
/* Remove existing highlight */
var existing=document.getElementById("mxi-temp-highlight");
if(existing)existing.remove();

var rect=el.getBoundingClientRect();
var highlight=document.createElement("div");
highlight.id="mxi-temp-highlight";
highlight.style.cssText="position:fixed;pointer-events:none;z-index:999995;border:3px solid "+color+";border-radius:4px;transition:opacity .3s";
highlight.style.left=rect.left-3+"px";
highlight.style.top=rect.top-3+"px";
highlight.style.width=rect.width+6+"px";
highlight.style.height=rect.height+6+"px";

/* Label */
var labelEl=document.createElement("div");
labelEl.style.cssText="position:absolute;top:-24px;left:0;background:"+color+";color:#000;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;white-space:nowrap;font-family:Geist,Inter,system-ui,sans-serif";
labelEl.textContent=label;
highlight.appendChild(labelEl);

document.body.appendChild(highlight);

/* Auto-remove after 3 seconds */
setTimeout(function(){
highlight.style.opacity="0";
setTimeout(function(){highlight.remove()},300);
},3000);
}

function findAssociatedElement(assocName,assocValue){
/* Try to find an element on the page that displays this association */
var shortName=assocName.split(".").pop();

/* If we have a GUID value, try to find element with that object */
if(assocValue&&window.__MxDataExtractor){
var allDataViews=document.querySelectorAll('.mx-dataview,.mx-listview,[class*="widget-"]');
for(var i=0;i<allDataViews.length;i++){
var el=allDataViews[i];
try{
var data=window.__MxDataExtractor.extractDataFromElement(el);
if(data&&data.mxObject){
var guid=window.__MxDataExtractor.getObjectGuid(data.mxObject);
if(guid&&guid===assocValue){
return el;
}
}
}catch(e){}
}
}

/* Fallback: look for elements with association name in class */
var candidates=document.querySelectorAll('[class*="'+shortName.split("_").pop()+'"]');
for(var j=0;j<candidates.length;j++){
var cn=candidates[j].className||'';
if(cn.indexOf('mx-dataview')>-1||cn.indexOf('mx-name-')>-1){
return candidates[j];
}
}
return null;
}

function showToast(msg){
var toast=document.createElement("div");
toast.style.cssText="position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:8px;font-size:12px;font-family:Geist,Inter,system-ui,sans-serif;z-index:999999;opacity:0;transition:opacity .2s";
toast.textContent=msg;
document.body.appendChild(toast);
setTimeout(function(){toast.style.opacity="1"},10);
setTimeout(function(){
toast.style.opacity="0";
setTimeout(function(){toast.remove()},200);
},2000);
}

/* v0.2.12 — expose old-panel helpers so the Data Inspector can reuse the exact
 * same association-click-to-highlight behavior. One implementation, two UIs. */
window.__mxiFindAssociatedElement = findAssociatedElement;
window.__mxiToggleHighlight       = toggleHighlight;
window.__mxiShowToast             = showToast;

/* Mousedown handler for INPUT widgets - fires before click/focus */
function handleWidgetInspectMousedown(e){
if(!widgetInspectActive)return;

/* v0.2.0 — Alt/Option+click cycles through the meaningful layer stack.
 *   Plain alt+click  = outward (toward body)
 *   shift+alt+click  = inward (toward target)
 */
if ((e.altKey || e.metaKey) && window.__MxLayerStack) {
  try {
    var nextEl = window.__MxLayerStack.nextLevel(e.target, e.shiftKey ? -1 : 1);
    if (nextEl) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.__MxLayerStack.setSelection(nextEl);
      performWidgetInspection(nextEl);
      if (window.__MxDataPanel && window.__MxDataPanel.isOpen()) {
        window.__MxDataPanel.focus(nextEl);
      }
      /* v0.2.1 — update breadcrumb chip highlight in the hover tooltip
       * so the user sees which layer is now selected without re-hovering. */
      try {
        if (widgetInspectTooltip) {
          var _stack2 = window.__MxLayerStack.getStack(e.target);
          var _newIdx2 = -1;
          if (_stack2) {
            for (var _s = 0; _s < _stack2.length; _s++) {
              if (_stack2[_s].element === nextEl) { _newIdx2 = _s; break; }
            }
          }
          if (_newIdx2 >= 0 && window.__MxLayerStack.refreshBreadcrumb) {
            window.__MxLayerStack.refreshBreadcrumb(
              widgetInspectTooltip, _stack2, _newIdx2,
              function (lvl) {
                window.__MxLayerStack.setSelection(lvl.element);
                performWidgetInspection(lvl.element);
                if (window.__MxDataPanel && window.__MxDataPanel.isOpen()) {
                  window.__MxDataPanel.focus(lvl.element);
                }
              }
            );
          }
        }
      } catch (_e2) {}
      return false;
    }
  } catch (exAlt) {}
}

var target=e.target;

/* v0.2.5 — [MXI Debug] mousedown/isInput/widgetEl logs removed. Were
 * tracing every mousedown during widget inspect mode while we were
 * wiring up the input-click interception fix; logging four lines per
 * mouse event is way too much noise for shipped code. The interception
 * logic itself is unchanged — we just stopped narrating it. */

/* Check if target or any ancestor is an input, select, textarea */
var isInput=target.tagName==="INPUT"||target.tagName==="SELECT"||target.tagName==="TEXTAREA";
/* Check if inside a tooltip wrapper (data-tooltip-*) */
var tooltipWrapper=target.closest('[data-tooltip-content],[data-tooltip-id]');
/* Check if target is inside a pluggable widget or mx-textbox */
var isTextbox=target.closest('.mx-textbox,.mx-textarea,.mx-dropdown');
var isPluggable=target.closest('[class*="widget-"]')||target.closest('[class*="pluggable"]');

if(isInput||tooltipWrapper||isTextbox||isPluggable){
/* Prevent the input from getting focus and any default behavior */
e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();

/* Find the widget element - walk up to the mx-name- element */
var widgetEl=target.closest('[class*="mx-name-"]');
if(!widgetEl&&tooltipWrapper){
widgetEl=tooltipWrapper.querySelector('[class*="mx-name-"]')||tooltipWrapper.closest('[class*="mx-name-"]');
}
if(widgetEl){
/* Manually trigger our inspection logic */
performWidgetInspection(widgetEl);
/* v0.2.0 — track selection + push inspected element to Data Panel if it's open */
if (window.__MxLayerStack) {
  try { window.__MxLayerStack.setSelection(widgetEl); } catch (e) {}
}
if (window.__MxDataPanel && window.__MxDataPanel.isOpen()) {
  try { window.__MxDataPanel.focus(widgetEl); } catch (e) {}
}
}
return false;
}
}

/* Global window-level interceptor for stubborn inputs */
var globalInputInterceptor=null;
function setupGlobalInputInterceptor(){
if(globalInputInterceptor)return;
globalInputInterceptor=function(e){
if(!widgetInspectActive)return;
/* v0.2.13 — let alt/meta+click pass through so layer-stack cycling works
 * even when the initial selector is an input (grey Input layer). */
if(e.altKey||e.metaKey)return;
var target=e.target;
if(target.tagName==="INPUT"||target.tagName==="SELECT"||target.tagName==="TEXTAREA"||target.closest('[data-tooltip-id]')){
e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();
var widgetEl=target.closest('[class*="mx-name-"]');
if(widgetEl)performWidgetInspection(widgetEl);
return false;
}
};
window.addEventListener("mousedown",globalInputInterceptor,true);
window.addEventListener("pointerdown",globalInputInterceptor,true);
window.addEventListener("click",globalInputInterceptor,true);
window.addEventListener("focus",function(e){
if(widgetInspectActive&&(e.target.tagName==="INPUT"||e.target.tagName==="SELECT"||e.target.tagName==="TEXTAREA")){
e.target.blur();
}
},true);
}
function removeGlobalInputInterceptor(){
if(globalInputInterceptor){
window.removeEventListener("mousedown",globalInputInterceptor,true);
window.removeEventListener("pointerdown",globalInputInterceptor,true);
window.removeEventListener("click",globalInputInterceptor,true);
globalInputInterceptor=null;
}
}

/* Perform the actual widget inspection */
function performWidgetInspection(widgetEl){
if(!widgetEl)return;

var wn=getWidgetName(widgetEl);
var wt=getWidgetType(widgetEl)||{type:"Widget",icon:icon("cube",18),color:"#666"};

/* Get mx object data */
var mxData=window.__MxDataExtractor?window.__MxDataExtractor.extractDataFromElement(widgetEl):null;
var entity=null,attributes=[],associations=[],mxObject=null;

if(mxData){
entity=mxData.entity;
attributes=mxData.attributes||[];
associations=mxData.associations||[];
mxObject=mxData.mxObject;
}

/* Find parent container using MxDataExtractor */
var parentContainer=null;
if(window.__MxDataExtractor&&window.__MxDataExtractor.findParentDataContainer){
parentContainer=window.__MxDataExtractor.findParentDataContainer(widgetEl);
}

/* Open/update expanded panel — skip if Data Panel v2 is showing (v0.2.1) */
if (!(window.__MxDataPanel && window.__MxDataPanel.isOpen())) {
  createExpandedPanel(widgetEl,wn,wt,entity,attributes,associations,parentContainer,mxObject);
}

/* v0.2.0 — track selection + notify Data Panel if open */
if (window.__MxLayerStack) {
  try { window.__MxLayerStack.setSelection(widgetEl); } catch (e) {}
}
if (window.__MxDataPanel && window.__MxDataPanel.isOpen()) {
  try { window.__MxDataPanel.focus(widgetEl); } catch (e) {}
}
}

/* Click handler for widget inspect */
function handleWidgetInspectClick(e){
if(!widgetInspectActive)return;

/* v0.2.13 — alt/meta+click is handled by the mousedown handler (layer-stack cycling).
 * The click event still fires, but we must NOT hide the tooltip or mutate state here
 * or the hover tooltip vanishes after each alt+click and the user has to re-hover. */
if(e.altKey||e.metaKey){
  e.preventDefault();
  e.stopPropagation();
  return;
}

var target=e.target;

/* Ignore clicks on inspector UI */
if(target.closest('#mxi-panel')||target.closest('#mxi-expanded-panel')||target.closest('.mxi-clear-btn'))return;

/* Find widget element */
var widgetEl=null;
var current=target;
var maxDepth=30;
var d=0;
while(current&&d<maxDepth){
var cn=current.className;
if(cn&&typeof cn==='string'&&cn.indexOf('mx-name-')>-1){
widgetEl=current;
break;
}
if(cn&&cn.baseVal&&cn.baseVal.indexOf('mx-name-')>-1){
widgetEl=current;
break;
}
current=current.parentElement;
d++;
}

if(!widgetEl)return;

/* Check if widget has data (set during hover) */
if(widgetEl._mxiHasData===false){
/* No data - don't open panel */
return;
}

e.preventDefault();
e.stopPropagation();

/* Get widget info */
var cn=widgetEl.className||'';
if(typeof cn!=='string')cn=cn.baseVal||'';
var nameMatch=cn.match(/mx-name-([^\s]+)/);
var wn=nameMatch?nameMatch[1]:"Unknown";
var wt=getWidgetType(widgetEl);

/* Extract data */
var mxData=null;
if(window.__MxDataExtractor){
mxData=window.__MxDataExtractor.extractDataFromElement(widgetEl);
}

var entity=mxData&&mxData.entity?mxData.entity:null;
var attributes=mxData&&mxData.attributes?mxData.attributes:[];
var associations=mxData&&mxData.associations?mxData.associations:[];
var mxObject=mxData?mxData.mxObject:null;

/* Unwrap mxObject if needed */
if(mxObject&&window.__MxDataExtractor&&!mxObject._jsonData){
var unwrapped=window.__MxDataExtractor.getMxObjectFromItem(mxObject);
if(unwrapped)mxObject=unwrapped;
}

/* Get attributes if needed */
if(mxObject&&attributes.length===0&&window.__MxDataExtractor){
var attrData=window.__MxDataExtractor.getObjectAttributes(mxObject);
attributes=attrData.attributes;
associations=attrData.associations;
}

/* Find parent */
var parentContainer=null;
if(window.__MxDataExtractor){
parentContainer=window.__MxDataExtractor.findParentDataContainer(widgetEl);
}

/* Hide tooltip */
if(widgetInspectTooltip)widgetInspectTooltip.style.opacity="0";
if(widgetInspectOutline)widgetInspectOutline.style.opacity="0";

/* v0.2.5 — if Data Inspector is open, route there instead of old panel */
if (window.__MxDataPanel && window.__MxDataPanel.isOpen()) {
  try { window.__MxDataPanel.focus(widgetEl); } catch (_e) {}
} else {
  /* Create/update old panel only if Data Inspector isn't available */
  createExpandedPanel(widgetEl,wn,wt,entity,attributes,associations,parentContainer,mxObject);
}
}

function toggleWidgetInspectMode(){
/* v0.2.4 — button is optional now; can be triggered from Data Inspector */
var btn=document.getElementById("mxi-widget-inspect-btn");
widgetInspectActive=!widgetInspectActive;
if(widgetInspectActive){
/* Turn off other inspect modes */
if(inspectModeActive)toggleInspectMode();
if(cssInspectActive)toggleCssInspectMode();
createWidgetInspectElements();
document.addEventListener("mousemove",handleWidgetInspectHover,true);
document.addEventListener("mouseout",handleWidgetInspectOut,true);
document.addEventListener("click",handleWidgetInspectClick,true);
document.addEventListener("mousedown",handleWidgetInspectMousedown,true);
document.addEventListener("pointerdown",handleWidgetInspectMousedown,true);
setupGlobalInputInterceptor();
if(btn){btn.style.background=k;btn.style.color=w;btn.innerHTML=icon("crosshair",16)+' ON';}
document.body.style.cursor="crosshair";
if(!widgetInspectCloseBtn){
widgetInspectCloseBtn=document.createElement("button");
widgetInspectCloseBtn.className="mxi-clear-btn";
widgetInspectCloseBtn.innerHTML="✕ Exit Widget Inspector";
widgetInspectCloseBtn.style.background=k;
widgetInspectCloseBtn.style.boxShadow="0 4px 20px rgba(255,184,0,.4)";
widgetInspectCloseBtn.onclick=toggleWidgetInspectMode;
document.body.appendChild(widgetInspectCloseBtn);
}
widgetInspectCloseBtn.style.display="block";
/* v0.2.4 — minimize the main MxInspector panel while Inspect is active so it
 * doesn't block the page. Restored on deactivation. */
var mainPanel=document.getElementById("mx-inspector-pro");
if(mainPanel){
  mainPanel.setAttribute("data-mxi-minimized","true");
  mainPanel.style.transition="max-height .22s cubic-bezier(.2,.9,.3,1)";
  /* v0.2.33 — stash explicit height and force height:68px inline so a
   * previously-resized panel collapses reliably */
  if(mainPanel.style.height){mainPanel.setAttribute("data-mxi-saved-height",mainPanel.style.height)}
  mainPanel.style.height="68px";
  mainPanel.style.maxHeight="68px";
  mainPanel.style.minHeight="0";
  mainPanel.style.overflow="hidden";
  var mainBody=mainPanel.querySelector(".mxi-body");
  if(mainBody)mainBody.style.display="none";
  var mainFooter=mainPanel.querySelector(".mxi-footer");
  if(mainFooter)mainFooter.style.display="none";
}
}else{
document.removeEventListener("mousemove",handleWidgetInspectHover,true);
document.removeEventListener("mouseout",handleWidgetInspectOut,true);
document.removeEventListener("click",handleWidgetInspectClick,true);
document.removeEventListener("mousedown",handleWidgetInspectMousedown,true);
document.removeEventListener("pointerdown",handleWidgetInspectMousedown,true);
removeGlobalInputInterceptor();
closeExpandedPanel();
destroyWidgetInspectElements();
if(btn){btn.style.background="";btn.style.color="";btn.innerHTML=icon("crosshair",16)+' Inspect';}
/* v0.2.19 — also clear the Data Inspector panel's inspect icon active state
 * so Escape key properly resets both entry points. */
var dpBtn=document.getElementById("mxi-dp2-inspect");
if(dpBtn)dpBtn.classList.remove("active");
document.body.style.cursor="";
if(widgetInspectCloseBtn)widgetInspectCloseBtn.style.display="none";
/* v0.2.4 — restore the main MxInspector panel */
var mainPanel2=document.getElementById("mx-inspector-pro");
if(mainPanel2&&mainPanel2.getAttribute("data-mxi-minimized")==="true"){
  mainPanel2.removeAttribute("data-mxi-minimized");
  mainPanel2.style.maxHeight="";
  mainPanel2.style.overflow="";
  mainPanel2.style.minHeight="";
  mainPanel2.style.height="";
  /* v0.2.31 — restore saved height if set */
  var savedH2=mainPanel2.getAttribute("data-mxi-saved-height");
  if(savedH2){mainPanel2.style.height=savedH2;mainPanel2.removeAttribute("data-mxi-saved-height")}
  var mainBody2=mainPanel2.querySelector(".mxi-body");
  if(mainBody2)mainBody2.style.display="";
  var mainFooter2=mainPanel2.querySelector(".mxi-footer");
  if(mainFooter2)mainFooter2.style.display="";
}
}
}

/* v0.2.4 — expose so Data Inspector can trigger inspect mode */
window.__mxiToggleWidgetInspect = toggleWidgetInspectMode;
window.__mxiIsWidgetInspectActive = function(){return widgetInspectActive;};

/* v0.2.6 — Double-click on the main panel header toggles minimize/expand.
 * Replaces the v0.2.4 single-click restore which interfered with drag-to-move. */
(function setupMainHeaderDoubleClickToggle(){
  document.addEventListener("dblclick",function(e){
    var p=document.getElementById("mx-inspector-pro");
    if(!p||!p.contains(e.target))return;
    /* Only react to double-clicks on the header area, not body/footer */
    var header=p.querySelector(".mxi-header");
    if(!header||!header.contains(e.target))return;
    /* Ignore double-clicks on interactive header elements (buttons) */
    if(e.target.closest("button"))return;

    var isMinimized=p.getAttribute("data-mxi-minimized")==="true";
    p.style.transition="max-height .22s cubic-bezier(.2,.9,.3,1)";
    var mainBody=p.querySelector(".mxi-body");
    var mainFooter=p.querySelector(".mxi-footer");

    if(isMinimized){
      /* Expand */
      p.style.maxHeight="";
      p.style.overflow="";
      p.style.minHeight="";
      p.style.height="";
      /* v0.2.31 — restore explicit height saved at minimize time */
      var savedH=p.getAttribute("data-mxi-saved-height");
      if(savedH){p.style.height=savedH;p.removeAttribute("data-mxi-saved-height")}
      if(mainBody)mainBody.style.display="";
      if(mainFooter)mainFooter.style.display="";
      p.removeAttribute("data-mxi-minimized");
      p.setAttribute("data-mxi-user-restored","true");
    }else{
      /* Minimize */
      /* v0.2.33 — the bug was that after a resize, `height` is inline and takes
       * priority over `max-height`. Setting `height=""` alone isn't enough if
       * other inline styles remain. Set height directly to the target value. */
      if(p.style.height){p.setAttribute("data-mxi-saved-height",p.style.height)}
      p.style.height="68px";
      p.style.maxHeight="68px";
      p.style.minHeight="0";
      p.style.overflow="hidden";
      if(mainBody)mainBody.style.display="none";
      if(mainFooter)mainFooter.style.display="none";
      p.setAttribute("data-mxi-minimized","true");
      p.removeAttribute("data-mxi-user-restored");
    }
  },true);
})();

/* v0.2.4 — widget inspect is no longer wired to a footer button.
 * It is triggered from the Data Inspector panel instead. */

/* ESCAPE KEY - Close panel first, then inspect modes */
function handleEscapeKey(e){
if(e.key==="Escape"){
/* First: close expanded panel if open */
if(expandedPanelOpen){
e.preventDefault();
e.stopPropagation();
closeExpandedPanel();
return;
}
/* Then: close inspect modes */
if(styleInspectActive)toggleStyleInspectMode();
if(inspectModeActive)toggleInspectMode();
if(cssInspectActive)toggleCssInspectMode();
if(widgetInspectActive)toggleWidgetInspectMode();
}
}
document.addEventListener("keydown",handleEscapeKey);

/* RECORDING TOGGLE HANDLER */
var recordingBtn=document.getElementById("mxi-recording-toggle");
if(recordingBtn){
recordingBtn.onclick=function(){
if(window.__mxiPerf&&window.__mxiPerf.toggleRecording){
var isRec=window.__mxiPerf.toggleRecording();
/* Update button appearance */
if(isRec){
recordingBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#FF5A5A"/></svg><span style="color:#FF5A5A">REC</span>';
recordingBtn.title="Recording active - click to pause";
}else{
recordingBtn.innerHTML='<svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5" fill="none" stroke="#666" stroke-width="1.5"/></svg><span>PAUSED</span>';
recordingBtn.title="Recording paused - click to start";
}
}
};
}

/* AUTO-REFRESH */
function getCurrentPage(){var pg="";if(window.mx&&mx.ui&&mx.ui.getContentForm){try{var form=mx.ui.getContentForm();if(form&&form.path)pg=form.path}catch(x){}}return pg||location.href}
var lastPage=getCurrentPage(),lastWidgets=document.querySelectorAll('[class*="mx-name-"]').length;

function checkForChanges(){var curPage=getCurrentPage(),curWidgets=document.querySelectorAll('[class*="mx-name-"]').length;if(curPage!==lastPage||Math.abs(curWidgets-lastWidgets)>50){lastPage=curPage;lastWidgets=curWidgets;refresh()}}
function refresh(){
/* v0.2.71 — Snapshot UI state before teardown so the rebuilt panel can
 * restore scroll position, which sections are open, which insights are
 * expanded, and which <details> elements are open. Restore runs at the
 * end of the IIFE on an 80ms delay. */
try {
  var snap = { openSections: [], expandedKeys: [], openDetails: [], scrollTop: 0 };
  var body = A.querySelector(".mxi-body");
  if (body) snap.scrollTop = body.scrollTop || 0;
  A.querySelectorAll(".mxi-section.open").forEach(function(s){
    var id = s.getAttribute("data-section-id");
    if (id) snap.openSections.push(id);
  });
  A.querySelectorAll(".mxi-insight.expanded").forEach(function(ins){
    var k = ins.getAttribute("data-highlight-key");
    if (k) snap.expandedKeys.push(k);
  });
  A.querySelectorAll("details[open][data-details-id]").forEach(function(d){
    snap.openDetails.push(d.getAttribute("data-details-id"));
  });
  window.__mxiUiSnapshot = snap;
} catch(e){}
/* v0.2.30 — if the Data Inspector is embedded inside the main panel, close
 * it via closeForRefresh so its "was open" session flag survives. After the
 * main panel rebuilds, __mxInspectorRun will re-read the flag and re-open. */
try { if (window.__MxDataPanel && window.__MxDataPanel.isOpen && window.__MxDataPanel.isOpen()) { window.__MxDataPanel.closeForRefresh(); } } catch(e){}
cleanup();clearHighlights();if(clearBtn.parentNode)clearBtn.remove();A.remove();var _or2=document.getElementById(MXI_INS_OVERLAY_ROOT_ID);if(_or2)_or2.remove();var _os2=document.getElementById(MXI_INS_OVERLAY_STYLE_ID);if(_os2)_os2.remove();setTimeout(function(){if(window.__mxInspectorRun)window.__mxInspectorRun()},300)}
function onNav(){setTimeout(checkForChanges,300)}

window.addEventListener("hashchange",onNav);
window.addEventListener("popstate",onNav);
var checkInterval=setInterval(checkForChanges,2000);

/* v0.2.71 — UI snapshot restore.
 * After the panel has rebuilt, re-apply whichever sections/insights/details
 * were open plus the body scrollTop, from window.__mxiUiSnapshot. 80ms
 * delay so the DOM is fully settled. */
try {
  if (window.__mxiUiSnapshot && typeof A !== "undefined" && A) {
    var __snap = window.__mxiUiSnapshot;
    setTimeout(function(){
      try {
        (__snap.openSections || []).forEach(function(id){
          var sec = A.querySelector('.mxi-section[data-section-id="' + id + '"]');
          if (sec && !sec.classList.contains("open")) {
            var c = sec.querySelector(".mxi-section-content");
            var a = sec.querySelector(".mxi-arrow");
            if (c) c.style.display = "block";
            if (a) a.style.transform = "rotate(0)";
            sec.classList.add("open");
          }
        });
        (__snap.expandedKeys || []).forEach(function(key){
          var ins = A.querySelector('.mxi-insight[data-highlight-key="' + key + '"]');
          if (ins) ins.classList.add("expanded");
        });
        (__snap.openDetails || []).forEach(function(id){
          var d = A.querySelector('details[data-details-id="' + id + '"]');
          if (d) d.setAttribute("open", "");
        });
        if (__snap.scrollTop) {
          var body = A.querySelector(".mxi-body");
          if (body) body.scrollTop = __snap.scrollTop;
        }
      } catch(e) {}
      delete window.__mxiUiSnapshot;
    }, 80);
  }
} catch(e){}

/* v0.2.71 — Surgical Data Sources autorefresh.
 *
 * Fires every 5s while the Data Sources section is open and the tab is
 * visible. Rebuilds ONLY the section content via renderDataSourcesHTML()
 * with fresh tracker data — no full-panel flicker, header/tooltip state
 * preserved.
 *
 * Skips when:
 *   - tab is hidden
 *   - section is collapsed (no point rebuilding invisible HTML)
 *   - tracker isn't up yet (first ms of page load)
 *   - a user-facing copy flash is mid-animation (don't stomp the green) */
var autorefreshInterval = setInterval(function(){
  if (document.visibilityState !== "visible") return;
  try {
    if (typeof A === "undefined" || !A) return;
    var sec = A.querySelector('.mxi-section[data-section-id="data"]');
    if (!sec || !sec.classList.contains("open")) return;
    if (!window.__mxiPerf || !window.__mxiPerf.getSummary) return;
    if (sec.querySelector(".mxi-ds-copy.mxi-ds-copied")) return;

    var fresh = window.__mxiPerf.getSummary();
    if (!fresh || !fresh.dataSourceCalls) return;
    var freshDsc = fresh.dataSourceCalls;

    /* Match the sort order the initial render used */
    if (freshDsc.microflows)   freshDsc.microflows.sort(function(a,b){return b.count-a.count});
    if (freshDsc.otherActions) freshDsc.otherActions.sort(function(a,b){return b.count-a.count});
    if (freshDsc.operations)   freshDsc.operations.sort(function(a,b){return b.count-a.count});

    /* Keep i in sync so PDF export / insight highlights see latest numbers */
    i.dataSourceCalls = freshDsc;
    if (fresh.dsDebug) i.dsDebug = fresh.dsDebug;

    var content = sec.querySelector(".mxi-section-content");
    if (!content) return;
    content.innerHTML = renderDataSourcesHTML(freshDsc);
    /* Re-wire the per-row copy buttons on the fresh markup. The existing
     * listener is delegated on document, so no re-wire needed actually. */
  } catch(e){}
}, 5000);

var observer=null;
try{var target=document.querySelector('.mx-page,[class*="mx-name-page"],#content');if(target){observer=new MutationObserver(function(mutations){if(mutations.some(function(m){return m.addedNodes.length>3||m.removedNodes.length>3}))setTimeout(checkForChanges,200)});observer.observe(target,{childList:true,subtree:true})}}catch(x){}

function cleanup(){window.removeEventListener("hashchange",onNav);window.removeEventListener("popstate",onNav);clearInterval(checkInterval);clearInterval(autorefreshInterval);if(observer)observer.disconnect()}

}();
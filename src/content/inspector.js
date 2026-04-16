/*! 
 * MxInspector v1.3 - Mendix Page Inspector & Debugger
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
var TIPS={load:"Page load time. Under 2s is good, over 4s is poor.",dom:"DOM nodes affect rendering. Keep under 2000.",requests:"Total HTTP requests. Fewer is better.",memory:"High memory can cause slowdowns.",fcp:"First Contentful Paint. Target under 1.8s.",lcp:"Largest Contentful Paint. Target under 2.5s.",transfer:"Total data transferred.",depth:"Deep nesting slows rendering.",dataviews:"Data containers. Nesting multiplies requests.",listviews:"List containers. Watch for pagination needs.",templategrid:"Grid with custom cell templates. Can multiply like ListView.",datagrid2:"Modern data grids with built-in virtualization.",galleries:"Card/image grid containers.",treenode:"Hierarchical recursive data. Very high nesting risk!",nesting:"Nested containers multiply database calls and slow rendering.",snippets:"Reusable fragments improve maintainability.",microflows:"Server-side actions. 15+ on a page can slow load times — each requires a server round-trip.",nanoflows:"Client-side logic. Fast but watch complexity.",datasources:"Database calls are expensive. Minimize where possible.",pluggable:"Custom widgets. Check for performance impact.",conditional:"Hidden elements still render initially, affecting load time.",a11yScore:"WCAG compliance score. 90+ is AA level.",altText:"Required for screen readers.",formLabels:"Required for accessibility.",headings:"Proper H1→H2→H3 hierarchy.",emptyLinks:"Links need text for screen readers.",duplicateIds:"Break accessibility and JS.",userRoles:"Security roles affect permissions.",xhr:"XMLHttpRequest/fetch calls to server.",static:"CSS, JS, images, fonts loaded.",contrast:"WCAG requires 4.5:1 for normal text, 3:1 for large text.",smallFont:"WCAG recommends minimum 12px font size for readability.",touchTargets:"Clickable elements should be at least 44x44px for mobile.",secConstants:"Exposed constants in JS can leak sensitive configuration.",secEntities:"Entity names with sensitive keywords may indicate data exposure.",secMicroflows:"Microflow names revealing business logic can aid attackers.",secForms:"Form inputs without proper validation are vulnerable to attacks.",secUrl:"Sensitive data in URLs can be logged and leaked.",secCve:"Known vulnerabilities in this Mendix version should be patched."};

/* ===== HELPERS ===== */
function getClassName(el){if(!el)return"";var cn=el.className;if(!cn)return"";if(typeof cn==="string")return cn;if(cn.baseVal!==undefined)return cn.baseVal;return""}
var t={loadTime:{warning:2e3,error:4e3},domNodes:{warning:2e3,error:4e3}};

/* ===== DATA OBJECT ===== */
var i={timestamp:new Date().toISOString(),url:location.href,version:"?",client:"Unknown",module:"Unknown",page:"Unknown",popup:!1,env:"",envType:"Unknown",user:"",roles:"",guest:!1,offline:!1,loadTime:0,firstContentfulPaint:0,largestContentfulPaint:0,ttfb:0,cls:0,fid:null,widgetRenderTime:0,firstWidgetTime:null,lastWidgetTime:null,widgetTimeline:[],slowestWidgets:[],perfTrackerActive:false,isRecording:true,navigationRenderDuration:0,navigationFirstWidget:null,navigationLastWidget:null,navigationWidgetCount:0,domNodes:0,jsHeap:0,totalRequests:0,xhrRequests:0,staticRequests:0,slowRequests:[],largeAssets:[],totalTransferred:0,totalWidgets:0,dataViews:0,listViews:0,dataGrids:0,dataGrid2s:0,galleries:0,templateGrids:0,treeNodes:0,nestedDataViewsWarning:[],nestedDataViewsCritical:[],maxDataViewDepth:0,maxNestingDepth:0,formFields:0,images:0,lazyImages:0,dataViewEntities:[],pageParameters:[],consoleErrors:0,
snippets:[],snippetCount:0,microflowActions:0,nanoflowActions:0,otherActions:0,conditionalElements:0,
dataSources:{database:0,microflow:0,nanoflow:0},
pluggableWidgets:[],uniquePluggableWidgets:[],marketplaceWidgets:[],
widgetTree:null,
a11y:{totalImages:0,missingAltText:0,totalFormFields:0,missingLabels:0,totalHeadings:0,h1Count:0,headingSkips:0,missingH1:!1,totalLinks:0,emptyLinks:0,duplicateIds:0,missingLang:!1,pageLang:"",missingTitle:!1,contrastIssues:0,smallFontSize:0,focusIssues:0,smallTouchTargets:0,ariaUsage:0,landmarks:0,hasSkipLink:!1,hasMainLandmark:!1,positiveTabindex:0,score:100,wcagLevel:"Unknown",deductions:[],improvements:[]},
typography:{fonts:[],fontCounts:{},sizes:[],weights:[],primaryFont:"Unknown",fontCount:0,sizeCount:0},
security:{exposedConstants:[],sensitiveEntities:[],revealingMicroflows:[],formIssues:[],urlParams:[],inputValidation:[],cveWarnings:[],mixedContent:[],externalScripts:[],localStorageSensitive:[],insecureProtocol:false,score:100},
warnings:[],score:100,highlightTargets:{}};

function n(e,d){try{return e()}catch(x){return d}}
function s(e){if(0===e)return"0 B";var t=Math.floor(Math.log(e)/Math.log(1024));return parseFloat((e/Math.pow(1024,t)).toFixed(1))+" "+["B","KB","MB","GB"][t]}
function o(e){return e<1e3?e+"ms":(e/1e3).toFixed(2)+"s"}
function a(e,t,n,s){i.warnings.push({type:e,msg:t,impact:n||0,highlightKey:s||null});i.score-=n||0}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}

var c=!!window.mx;

function isAnyDataView(el){return el&&el.classList&&el.classList.contains("mx-dataview")&&!el.classList.contains("mx-dataview-content")}
function isNamedDataView(el){return isAnyDataView(el)&&getClassName(el).indexOf("mx-name-")>-1}
function countDataViewParents(el){var c=0,p=el.parentElement;while(p){if(isAnyDataView(p))c++;p=p.parentElement}return c}
function getWidgetName(el){var m=getClassName(el).match(/mx-name-(\S+)/);return m?m[1]:null}

/* ===== DETECTORS ===== */
function detectSnippets(){var sn=[],els=[],snipSet=new Set();
/* Method 1: Class-based snippets (mx-name-snip*) */
document.querySelectorAll('[class*="mx-name-"]').forEach(function(el){var cn=getClassName(el);var m=cn.match(/mx-name-((?:snip|SNIP|Snip)[^\s]*)/i);if(m&&!snipSet.has(m[1])){snipSet.add(m[1]);sn.push(m[1]);els.push(el)}});
/* Method 2: data-button-id based snippets (p.Module.SNIP_Name.*) */
document.querySelectorAll('[data-button-id*="SNIP_"],[data-button-id*="Snip_"],[data-button-id*="snip_"]').forEach(function(el){var bid=el.getAttribute("data-button-id")||"";var m=bid.match(/\.(SNIP_[^.]+|Snip_[^.]+|snip_[^.]+)\./i);if(m&&!snipSet.has(m[1])){snipSet.add(m[1]);sn.push(m[1]);els.push(el)}});
/* Method 3: Widget containers with snippet in data attributes */
document.querySelectorAll('[data-mendix-id*="SNIP_"],[data-mendix-id*="Snip_"],[data-mendix-id*="snip_"]').forEach(function(el){var mid=el.getAttribute("data-mendix-id")||"";var m=mid.match(/(SNIP_[^$\/]+|Snip_[^$\/]+|snip_[^$\/]+)/i);if(m&&!snipSet.has(m[1])){snipSet.add(m[1]);sn.push(m[1]);els.push(el)}});
i.snippets=sn;i.snippetCount=sn.length;if(els.length)i.highlightTargets.snippets=els}

function detectActions(){var mf=0,nf=0,other=0;
document.querySelectorAll('[data-button-id]').forEach(function(){other++});
document.querySelectorAll('[class*="mx-name-actionButton"]').forEach(function(){mf++});
document.querySelectorAll('[class*="mx-name-nanoflow"]').forEach(function(){nf++});
i.microflowActions=mf;i.nanoflowActions=nf;i.otherActions=Math.max(0,other-mf-nf)}

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

function detectPluggableWidgets(){var all=[],unique=[],mkt=[];
var known=["datagrid","gallery","combobox","badge","tooltip","progress","calendar","rich-text","dropdown","autocomplete","checkbox","radio","date-picker","slider","switch","file","image","signature","maps","chart","accordion","popup","timeline","tree"];
document.querySelectorAll('[class*="widget-"]').forEach(function(el){var cn=getClassName(el);cn.split(/\s+/).forEach(function(cls){if(cls.indexOf("widget-")===0&&cls!=="widget"){if(all.indexOf(cls)===-1)all.push(cls);
var base=cls.replace("widget-","").split("-")[0];if(unique.indexOf(base)===-1)unique.push(base);
known.forEach(function(k){if(cls.indexOf(k)>-1&&mkt.indexOf(base)===-1)mkt.push(base)})}})});
i.pluggableWidgets=all;i.uniquePluggableWidgets=unique;i.marketplaceWidgets=mkt}

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

/* Collect actual page parameters */
if(window.__MxDataExtractor&&window.__MxDataExtractor.getPageParameters){
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
if(modal){i.popup=true;var ids=modal.querySelectorAll("[id]");for(var j=0;j<ids.length;j++){var parts=ids[j].id.split(".");if(parts.length>=3){i.module=parts[1];i.page=parts[2].split("$")[0];break}}}else{var path="";if(window.mx&&mx.ui&&mx.ui.getContentForm){var form=n(function(){return mx.ui.getContentForm()},null);if(form)path=form.path||""}if(!path&&history.state&&history.state.pageName)path=history.state.pageName;if(path){path=path.replace(".page.xml","").replace(/\//g,".");var dot=path.indexOf(".");if(dot>-1){i.module=path.substring(0,dot);i.page=path.substring(dot+1)}else i.page=path}}

if(i.env){var u=i.env.toLowerCase();if(u.indexOf("localhost")>-1||u.indexOf(":8080")>-1)i.envType="Local";else if(u.indexOf("-sandbox")>-1||u.indexOf("mxapps.io")>-1)i.envType="Sandbox";else if(u.indexOf("-accp")>-1)i.envType="Acceptance";else if(u.indexOf("-test")>-1)i.envType="Test";else i.envType="Production"}}();

!function(){i.domNodes=document.querySelectorAll("*").length;i.formFields=document.querySelectorAll("input,select,textarea").length;i.images=document.querySelectorAll("img").length;i.lazyImages=document.querySelectorAll('img[loading="lazy"]').length;
var nonLazy=document.querySelectorAll('img:not([loading="lazy"])');if(nonLazy.length>10)i.highlightTargets.nonLazyImages=Array.from(nonLazy);
i.maxNestingDepth=function calc(el,d){if(!el||!el.children||!el.children.length)return d;var max=d;for(var j=0;j<Math.min(el.children.length,50);j++){var cd=calc(el.children[j],d+1);if(cd>max)max=cd}return max}(document.body,0)}();

i.consoleErrors=document.querySelectorAll('.mx-toast-error,.alert-danger,[class*="error"]').length;

detectSnippets();detectActions();detectConditionalVisibility();detectDataSources();detectPluggableWidgets();buildWidgetTree();

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
function parseColor(color){if(!color||color==="transparent"||color==="rgba(0, 0, 0, 0)"||color==="inherit")return null;var match=color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);if(match){var alpha=match[4]?parseFloat(match[4]):1;if(alpha<0.1)return null;return{r:parseInt(match[1]),g:parseInt(match[2]),b:parseInt(match[3]),a:alpha}}return null}
function getEffectiveBg(el){var bg=null,current=el,maxDepth=10;while(current&&current!==document.body&&maxDepth-->0){var style=getComputedStyle(current);var bgColor=parseColor(style.backgroundColor);if(bgColor&&bgColor.a>=0.5){bg=bgColor;break}current=current.parentElement}return bg||{r:255,g:255,b:255,a:1}}
function isElementVisible(el){try{var rect=el.getBoundingClientRect();if(rect.width===0||rect.height===0)return false;var style=getComputedStyle(el);if(style.display==="none"||style.visibility==="hidden"||style.opacity==="0")return false;if(rect.top>window.innerHeight||rect.bottom<0||rect.left>window.innerWidth||rect.right<0)return false;return true}catch(e){return false}}

var contrastEls=[],smallFontEls=[];
var textEls=document.querySelectorAll("p,span,a,li,td,th,label,h1,h2,h3,h4,h5,h6,button");
textEls.forEach(function(el){try{if(!isElementVisible(el))return;var text=(el.textContent||"").trim();if(!text||text.length<2)return;var style=getComputedStyle(el);var fontSize=parseFloat(style.fontSize);
/* Check for small font size - WCAG recommends minimum 12px */
if(fontSize<12&&smallFontEls.length<15)smallFontEls.push(el);
/* Check contrast */
var fg=parseColor(style.color);if(!fg)return;var bg=getEffectiveBg(el);var fgLum=getLuminance(fg.r,fg.g,fg.b);var bgLum=getLuminance(bg.r,bg.g,bg.b);var ratio=getContrastRatio(fgLum,bgLum);var isBold=parseInt(style.fontWeight)>=700;var isLargeText=(fontSize>=18.66)||(fontSize>=14&&isBold);var minRatio=isLargeText?3:4.5;if(ratio<minRatio&&contrastEls.length<15)contrastEls.push(el)}catch(ex){}});
e.contrastIssues=contrastEls.length;
e.smallFontSize=smallFontEls.length;
if(contrastEls.length)i.highlightTargets.contrastIssues=contrastEls;
if(smallFontEls.length)i.highlightTargets.smallFontSize=smallFontEls;

/* ===== FOCUS & KEYBOARD ===== */
var focusIssues=0,focusEls=[];
document.querySelectorAll("a,button,input,select,textarea,[tabindex]").forEach(function(el){try{var style=getComputedStyle(el);if(style.outline==="0px"||style.outline==="none"||style.outlineWidth==="0px"){var hasFocusStyle=false;focusIssues++;if(focusEls.length<10)focusEls.push(el)}}catch(ex){}});
e.focusIssues=focusIssues;

/* ===== TOUCH TARGETS - Only matters on mobile/tablet ===== */
var isMobileViewport=window.innerWidth<=1024;
var smallTargets=0,smallEls=[];
if(isMobileViewport){document.querySelectorAll("a,button,input[type='checkbox'],input[type='radio'],.btn,[role='button']").forEach(function(el){try{var rect=el.getBoundingClientRect();if(rect.width>0&&rect.height>0&&(rect.width<44||rect.height<44)){smallTargets++;if(smallEls.length<15)smallEls.push(el)}}catch(ex){}})}
e.smallTouchTargets=smallTargets;
if(smallEls.length)i.highlightTargets.smallTargets=smallEls;

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
if(e.smallTouchTargets>5&&window.innerWidth<=1024){var pts=Math.min(Math.floor(e.smallTouchTargets/2),6);score-=pts;deductions.push({issue:"Small touch targets (<44px)",count:e.smallTouchTargets,pts:pts});improvements.push("Increase size of "+e.smallTouchTargets+" small touch targets")}
if(!e.hasSkipLink){score-=3;deductions.push({issue:"No skip link",count:1,pts:3});improvements.push("Add a skip-to-content link")}
if(!e.hasMainLandmark){score-=3;deductions.push({issue:"No main landmark",count:1,pts:3});improvements.push("Add a <main> element or role='main'")}
if(e.positiveTabindex>0){var pts=Math.min(e.positiveTabindex,4);score-=pts;deductions.push({issue:"Positive tabindex values",count:e.positiveTabindex,pts:pts});improvements.push("Remove positive tabindex values (use 0 or -1)")}

e.score=Math.max(0,score);e.deductions=deductions;e.improvements=improvements;
e.wcagLevel=e.score>=90&&!e.missingAltText&&!e.missingLabels&&!e.missingLang&&e.contrastIssues===0?"AA Compliant":e.score>=75&&e.missingAltText<=2?"A Compliant":e.score>=50?"Partial":"Needs Work"}();

/* ===== TYPOGRAPHY DETECTION ===== */
!function(){
var fontMap={},fontSizes={},lineHeights={},fontWeights={};
/* Filter out non-font values */
var invalidFontPatterns=[/\$/,/^[0-9]/,/Atlas_/,/Core\$/,/_Core/,/^mx-/,/^widget-/,/inherit/i,/initial/i,/unset/i];
function isValidFont(name){return name&&name.length>1&&name.length<60&&!invalidFontPatterns.some(function(p){return p.test(name)})}
var textEls=document.querySelectorAll("body,p,span,a,li,td,th,label,h1,h2,h3,h4,h5,h6,button,input,textarea,div");
textEls.forEach(function(el){try{
var style=getComputedStyle(el);
var family=style.fontFamily.split(",")[0].replace(/['"]/g,"").trim();
if(isValidFont(family)){fontMap[family]=(fontMap[family]||0)+1}
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
i.typography={fonts:sortedFonts.slice(0,8),fontCounts:fontMap,sizes:sortedSizes.slice(0,10),weights:sortedWeights,primaryFont:sortedFonts[0]||"Unknown",fontCount:sortedFonts.length,sizeCount:sortedSizes.length}}();

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

/* 2. Scan DOM for sensitive entity names in mx-name classes */
var allClasses=[];
document.querySelectorAll('[class*="mx-name-"]').forEach(function(el){
var cn=getClassName(el);
var match=cn.match(/mx-name-([^\s]+)/);
if(match){
var name=match[1].toLowerCase();
sensitiveKeywords.forEach(function(s){
if(name.indexOf(s)>-1){
var exists=sec.sensitiveEntities.some(function(e){return e.name===match[1]});
if(!exists&&sec.sensitiveEntities.length<15){
sec.sensitiveEntities.push({name:match[1],element:el});
}
}
});
}
});

/* 3. Scan for revealing microflow/nanoflow names */
document.querySelectorAll('[class*="mx-name-"]').forEach(function(el){
var cn=getClassName(el);
var match=cn.match(/mx-name-(action|microflow|nanoflow|ACT_|IVK_|SUB_)([^\s]*)/i);
if(match){
var fullName=(match[1]+match[2]).toLowerCase();
revealingKeywords.forEach(function(s){
if(fullName.indexOf(s)>-1){
var exists=sec.revealingMicroflows.some(function(e){return e.name===match[1]+match[2]});
if(!exists&&sec.revealingMicroflows.length<15){
sec.revealingMicroflows.push({name:match[1]+match[2],element:el});
}
}
});
}
});

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
/* Check for external scripts loading from third-party domains */
try{
var currentHost=location.hostname;
document.querySelectorAll("script[src]").forEach(function(s){
try{
var url=new URL(s.src,location.href);
if(url.hostname!==currentHost&&url.hostname.indexOf("mendix")===-1&&url.hostname.indexOf("mxcdn")===-1){
if(sec.externalScripts.length<5)sec.externalScripts.push(url.hostname);
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
if(sec.sensitiveEntities.length>0)sec.score-=sec.sensitiveEntities.length*3;
if(sec.revealingMicroflows.length>0)sec.score-=sec.revealingMicroflows.length*2;
if(sec.formIssues.length>0)sec.score-=sec.formIssues.length*5;
if(sec.urlParams.length>0)sec.score-=sec.urlParams.length*10;
if(sec.cveWarnings.length>0)sec.score-=sec.cveWarnings.length*15;
if(sec.mixedContent.length>0)sec.score-=5;
if(sec.localStorageSensitive.length>0)sec.score-=sec.localStorageSensitive.length*3;
if(sec.insecureProtocol)sec.score-=15;
if(sec.externalScripts.length>2)sec.score-=5;
sec.score=Math.max(0,sec.score);

/* Store highlight targets */
if(sec.sensitiveEntities.length>0){
i.highlightTargets.sensitiveEntities=sec.sensitiveEntities.map(function(e){return e.element});
}
if(sec.revealingMicroflows.length>0){
i.highlightTargets.revealingMicroflows=sec.revealingMicroflows.map(function(e){return e.element});
}
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
/* If load time is good, nesting is forgiven. If load time is bad, nesting is punished severely */
var criticalNestingCount = i.nestedDataViewsCritical.length;
var warningNestingCount = i.nestedDataViewsWarning.length;

if(criticalNestingCount > 0) {
  var basePenalty = Math.min(criticalNestingCount * 3, 15); /* Base: 3 pts each, max 15 */
  var adjustedPenalty = Math.round(basePenalty * loadMultiplier);
  adjustedPenalty = Math.min(adjustedPenalty, 30); /* Cap at 30 */
  
  if(loadMultiplier < 0.7) {
    /* Fast load - just info, no real penalty */
    a("info", criticalNestingCount + " nested containers (but load is fast ✓)", 0, "nestedDataViewsCritical");
  } else if(loadMultiplier > 1.5) {
    /* Slow load + nesting = bad combo */
    a("error", criticalNestingCount + " nested containers slowing page!", adjustedPenalty, "nestedDataViewsCritical");
  } else {
    /* Medium - warning */
    a("warning", criticalNestingCount + " nested containers (watch load time)", adjustedPenalty, "nestedDataViewsCritical");
  }
}

if(warningNestingCount > 0 && criticalNestingCount === 0) {
  var basePenalty = Math.min(warningNestingCount * 2, 8);
  var adjustedPenalty = Math.round(basePenalty * loadMultiplier);
  adjustedPenalty = Math.min(adjustedPenalty, 15);
  
  if(loadMultiplier < 0.7) {
    a("info", warningNestingCount + " nested DVs (load OK)", 0, "nestedDataViewsWarning");
  } else {
    a("warning", warningNestingCount + " nested data views", adjustedPenalty, "nestedDataViewsWarning");
  }
}

var lvDvRatio=i.listViews>0?Math.round(i.dataViews/i.listViews):0;
if(i.listViews>0&&lvDvRatio>10)a("warning","LV multiplier: "+i.dataViews+" DVs from "+i.listViews+" LVs",Math.round(3*loadMultiplier));

/* Tree nodes - always a warning since they're recursive */
if(i.treeNodes>0)a("warning","Tree nodes (recursive - monitor carefully)",Math.round(Math.min(i.treeNodes*2,8)*loadMultiplier));

if(i.slowRequests.length)a("warning",i.slowRequests.length+" slow requests",3);
if(i.a11y.missingAltText)a("warning",i.a11y.missingAltText+" missing alt",2,"missingAlt");
if(i.a11y.missingLabels)a("warning",i.a11y.missingLabels+" missing labels",2,"missingLabels");
if(i.a11y.contrastIssues)a("warning",i.a11y.contrastIssues+" contrast issues",2,"contrastIssues");
if(i.a11y.smallFontSize)a("warning",i.a11y.smallFontSize+" small fonts (<12px)",1,"smallFontSize");
if(i.a11y.duplicateIds)a("error",i.a11y.duplicateIds+" duplicate IDs",2,"duplicateIds");
if(i.a11y.smallTouchTargets>5)a("info",i.a11y.smallTouchTargets+" small touch targets (mobile)",1,"smallTargets");
var a11yType=i.a11y.score>=80?"success":i.a11y.score>=60?"warning":"error";
a(a11yType,"A11y: "+i.a11y.score+"/100 ("+i.a11y.wcagLevel+")",0);
/* Security warnings */
if(i.security.cveWarnings.length)a("error","🔐 "+i.security.cveWarnings.length+" known CVE(s) for v"+i.version,15);
if(i.security.exposedConstants.length)a("warning","🔐 "+i.security.exposedConstants.length+" exposed constant(s) in JS",5);
if(i.security.sensitiveEntities.length)a("warning","🔐 "+i.security.sensitiveEntities.length+" sensitive entity name(s)",3,"sensitiveEntities");
if(i.security.revealingMicroflows.length)a("info","🔐 "+i.security.revealingMicroflows.length+" revealing action name(s)",2,"revealingMicroflows");
if(i.security.formIssues.length)a("warning","🔐 "+i.security.formIssues.length+" form security issue(s)",5,"formIssues");
if(i.security.urlParams.length)a("error","🔐 "+i.security.urlParams.length+" sensitive URL param(s)",10);
if(i.consoleErrors)a("error",i.consoleErrors+" errors visible",3);
if(i.score>=90)a("success","Well optimized!",0);
i.score=Math.max(0,i.score)}();

}catch(ex){i.page="Error: "+ex.message;console.error("MXI:",ex)}

c||(i.version="N/A",i.client="Not Mendix");

/* ===== UI - REOWN / NORGRAM INSPIRED ===== */
/* Two-tone grays with yellow/orange/blue/green accents */
var m="#FF5A5A",p="#FF7A50",g="#2D9C5E",u="#FFB800",x="#666666",h="#FFFFFF",f="#9A9A9A",y="#1A1A1A",v="#242424",b="#2E2E2E",w="#141414",k="#FFB800",bl="#3B99FC",gr="#2D9C5E";

var existing=document.getElementById("mx-inspector-pro");if(existing)existing.remove();
var A=document.createElement("div");A.id="mx-inspector-pro";

function icon(name,sz){return'<span class="mxi-icon" style="width:'+(sz||16)+'px;height:'+(sz||16)+'px">'+IC[name]+'</span>'}
function tip(key){return TIPS[key]?'<span class="mxi-tip" title="'+TIPS[key]+'">?</span>':""}
function section(id,title,ico,content,open,headerExtra){return'<div class="mxi-section'+(open?" open":"")+'"><div class="mxi-section-header" onclick="(function(e){var s=e.target.closest(\'.mxi-section\'),c=s.querySelector(\'.mxi-section-content\'),a=s.querySelector(\'.mxi-arrow\');var o=c.style.display!==\'none\';c.style.display=o?\'none\':\'block\';a.style.transform=o?\'rotate(-90deg)\':\'rotate(0)\';s.classList.toggle(\'open\',!o)})(event)"><span class="mxi-arrow" style="transform:'+(open?"rotate(0)":"rotate(-90deg)")+'">▼</span>'+icon(ico,14)+'<span style="margin-left:6px">'+title+'</span>'+(headerExtra||'')+'</div><div class="mxi-section-content" style="display:'+(open?"block":"none")+'">'+content+"</div></div>"}
function metric(label,value,color,tipKey){return'<div class="mxi-metric">'+(tipKey?tip(tipKey):"")+'<div class="mxi-metric-value" style="color:'+(color||f)+'">'+value+'</div><div class="mxi-metric-label">'+label+"</div></div>"}
function clickableMetric(label,value,selector,color,tipKey){
var count=typeof value==="number"?value:parseInt(value)||0;
if(count===0)return metric(label,value,color,tipKey);
/* Use single quotes in selector to avoid HTML attribute escaping issues */
var safeSelector=selector.replace(/"/g,"'");
return'<div class="mxi-metric mxi-metric-clickable" data-selector="'+safeSelector+'" data-label="'+label+'" title="Click to highlight '+count+' '+label+'(s)">'+(tipKey?tip(tipKey):"")+'<div class="mxi-metric-value" style="color:'+(color||f)+'">'+value+'</div><div class="mxi-metric-label">'+label+' '+icon("eye",10)+"</div></div>"}
function tag(text,bg,color){return'<span class="mxi-tag" style="background:'+(bg||v)+';color:'+(color||f)+'">'+text+"</span>"}
function scoreColor(s){return s>=80?gr:s>=60?k:m}
function envIcon(type){return type==="Local"?"🟢":type==="Sandbox"?"🟡":type==="Acceptance"?"🟠":type==="Test"?"🔵":"🔴"}

var insightsHtml="";
if(i.warnings.length){insightsHtml='<div class="mxi-insights">';i.warnings.forEach(function(w){var hl=w.highlightKey&&i.highlightTargets[w.highlightKey];insightsHtml+='<div class="mxi-insight '+w.type+(hl?" mxi-insight-clickable":"")+'"'+(hl?' data-highlight-key="'+w.highlightKey+'" data-severity="'+w.type+'"':"")+'><span class="mxi-insight-dot"></span><span class="mxi-insight-text">'+w.msg+"</span>"+(hl?icon("eye",14):"")+"</div>"});insightsHtml+="</div>"}

function renderTree(node,d){if(!node||d>3)return"";var indent=d*16;var ti=node.type==="dv"?"📋":node.type==="lv"?"📜":node.type==="sn"?"📦":"▪️";var html='<div style="margin-left:'+indent+'px;padding:3px 0;font-size:12px">'+ti+" "+esc(node.name)+"</div>";if(node.children)node.children.forEach(function(c){html+=renderTree(c,d+1)});return html}
var treeHtml=i.widgetTree?renderTree(i.widgetTree,0):'<div style="color:'+x+'">No tree</div>';

var a11yImpr="";if(i.a11y.improvements.length){a11yImpr='<div class="mxi-improvements"><div class="mxi-impr-title">'+icon("bulb",14)+' How to improve:</div><ul>';i.a11y.improvements.slice(0,5).forEach(function(imp){a11yImpr+="<li>"+imp+"</li>"});a11yImpr+="</ul></div>"}

var css='<style>@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");#mx-inspector-pro{position:fixed;top:20px;right:20px;width:432px;max-height:92vh;background:'+w+';border-radius:20px;box-shadow:0 0 0 1px '+b+',0 25px 80px rgba(0,0,0,.6);font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;z-index:999999;overflow:hidden;display:flex;flex-direction:column}#mx-inspector-pro *{box-sizing:border-box}.mxi-icon{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;flex-shrink:0}.mxi-header{padding:20px 24px 20px 20px;border-bottom:1px solid '+b+';background:'+w+';cursor:move;user-select:none}.mxi-header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.mxi-logo{display:flex;align-items:center;gap:14px}.mxi-title{font-weight:600;font-size:14px;color:'+h+';letter-spacing:-.2px;margin-right:12px}.mxi-badge{font-size:10px;padding:4px 10px;border-radius:8px;font-weight:500;background:'+y+';color:'+f+';border:1px solid '+b+'}.mxi-badge-accent{background:transparent;border:1px solid #FF7A50;color:#FF7A50}.mxi-header-buttons{display:flex;align-items:center;gap:6px}.mxi-icon-btn{background:none;border:none;cursor:pointer;padding:8px;border-radius:10px;color:#666666;display:flex;align-items:center;justify-content:center;transition:all .2s;position:relative}.mxi-icon-btn:hover{background:#242424;color:#FFFFFF}.mxi-icon-btn svg{width:16px;height:16px;fill:currentColor}.mxi-info-tooltip{position:absolute;top:100%;right:0;margin-top:8px;background:#1A1A1A;color:#FFFFFF;padding:14px 16px;border-radius:12px;font-size:11px;width:240px;white-space:normal;opacity:0;visibility:hidden;transition:all .2s;z-index:1000;font-weight:400;border:1px solid #2E2E2E;box-shadow:0 10px 40px rgba(0,0,0,.5)}.mxi-info-tooltip.show{opacity:1;visibility:visible}.mxi-info-tooltip strong{color:#FFB800}.mxi-info-tooltip a{color:#3B99FC;text-decoration:none}.mxi-info-tooltip a:hover{text-decoration:underline}.mxi-info-line{margin-bottom:8px;line-height:1.5}.mxi-info-line:last-child{margin-bottom:0}.mxi-coffee-btn{display:inline-flex;align-items:center;gap:6px;background:#FFB800;color:#141414;padding:8px 14px;border-radius:8px;font-weight:600;font-size:11px;margin-top:10px;text-decoration:none!important;-webkit-text-fill-color:#141414}.mxi-coffee-btn:hover{background:#ffcc33;text-decoration:none!important}.mxi-coffee-btn svg{width:14px;height:14px;fill:#141414}.mxi-env{background:'+y+';border:1px solid '+b+';border-radius:12px;padding:12px 14px;font-size:11px;display:flex;align-items:center;gap:10px;color:'+f+'}.mxi-env-url{color:'+k+';flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}.mxi-body{flex:1;overflow-y:auto;padding:16px;background:'+w+'}.mxi-score{display:flex;align-items:center;gap:16px;padding:20px;background:'+y+';border-radius:16px;margin-bottom:12px;border:1px solid '+b+'}.mxi-score-circle{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:'+w+'}.mxi-score-info{flex:1}.mxi-score-label{font-size:14px;font-weight:600;color:'+h+'}.mxi-score-desc{font-size:11px;color:'+x+';margin-top:4px}.mxi-page-info{background:'+y+';border-radius:16px;padding:16px;margin-bottom:12px;border:1px solid '+b+'}.mxi-page-row{display:flex;gap:12px;align-items:center}.mxi-page-main{flex:1;min-width:0}.mxi-page-module{font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;font-weight:500}.mxi-page-name{font-size:13px;font-weight:600;color:'+h+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mxi-page-popup{font-size:9px;background:'+p+';color:'+w+';padding:3px 8px;border-radius:6px;margin-left:8px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}.mxi-copy-btn{background:'+y+';border:1px solid '+b+';color:'+f+';width:40px;height:40px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s}.mxi-copy-btn:hover{background:'+k+';border-color:'+k+';color:'+w+'}.mxi-copy-btn svg{width:14px;height:14px}.mxi-section{margin-bottom:8px;background:'+y+';border-radius:16px;overflow:hidden;border:1px solid '+b+'}.mxi-section-header{display:flex;align-items:center;gap:8px;padding:14px 16px;cursor:pointer;font-weight:500;font-size:12px;color:'+h+';user-select:none;letter-spacing:-.2px}.mxi-section-header:hover{background:'+v+'}.mxi-section.open .mxi-section-header{background:transparent}.mxi-section.open .mxi-section-header:hover{background:transparent}.mxi-arrow{font-size:10px;color:'+x+';transition:transform .2s;margin-right:4px}.mxi-section-content{padding:0 16px 16px}.mxi-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.mxi-metrics-3{grid-template-columns:repeat(3,1fr)}.mxi-metrics-5{grid-template-columns:repeat(5,1fr)}.mxi-metrics-2{grid-template-columns:repeat(2,1fr)}.mxi-metric{background:'+v+';border-radius:10px;padding:12px 8px;text-align:center;position:relative;min-width:0}.mxi-metric-clickable{cursor:pointer;transition:all .2s;border:1px solid transparent}.mxi-metric-clickable:hover{background:'+y+';border-color:'+k+';transform:translateY(-2px)}.mxi-metric-clickable:hover .mxi-metric-label{color:'+k+'}.mxi-metric-clickable .mxi-icon{opacity:.5;margin-left:4px}.mxi-metric-clickable:hover .mxi-icon{opacity:1;color:'+k+'}.mxi-metric-value{font-size:14px;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:'+h+'}.mxi-metric-label{font-size:9px;color:'+x+';margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:uppercase;letter-spacing:.5px}.mxi-tip{position:absolute;bottom:4px;right:4px;cursor:help;width:14px;height:14px;background:'+y+';border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:'+x+'}.mxi-tip:hover{background:'+k+';color:'+w+'}.mxi-insights{display:flex;flex-direction:column;gap:6px}.mxi-insight{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:12px;font-size:12px;line-height:1.5;background:'+v+';border:1px solid transparent}.mxi-insight-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}.mxi-insight.error{background:rgba(255,90,90,.08);border-color:rgba(255,90,90,.2)}.mxi-insight.error .mxi-insight-dot{background:'+m+'}.mxi-insight.warning{border-color:rgba(255,184,0,.2)}.mxi-insight.warning .mxi-insight-dot{background:'+k+'}.mxi-insight.info{border-color:rgba(59,153,252,.25)}.mxi-insight.info .mxi-insight-dot{background:#3B99FC}.mxi-insight.success .mxi-insight-dot{background:#2D9C5E}.mxi-insight-text{flex:1;color:'+f+'}.mxi-insight.error .mxi-insight-text{color:#FF8A8A}.mxi-insight-clickable{cursor:pointer;transition:all .2s}.mxi-insight-clickable:hover{background:'+y+';transform:translateX(2px)}.mxi-insight-clickable.active{background:'+k+'!important;border-color:'+k+'!important}.mxi-insight-clickable.active .mxi-insight-text{color:'+w+'!important}.mxi-insight-clickable.active .mxi-insight-dot{background:'+w+'!important}.mxi-insight-clickable.active .mxi-icon{color:'+w+'!important}.mxi-insight .mxi-icon{color:'+x+'}.mxi-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.mxi-tag{padding:6px 10px;border-radius:8px;font-size:10px;font-weight:500;background:'+v+';color:'+f+'}.mxi-role-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.mxi-role-tag{background:#3B99FC;color:'+w+';padding:6px 12px;border-radius:8px;font-size:10px;font-weight:600}.mxi-improvements{background:'+v+';border-radius:10px;padding:12px;margin-top:10px}.mxi-impr-title{font-weight:600;font-size:10px;color:'+h+';margin-bottom:8px;display:flex;align-items:center;gap:6px;text-transform:uppercase;letter-spacing:.5px}.mxi-improvements ul{margin:0;padding-left:16px;font-size:11px;color:'+f+'}.mxi-improvements li{margin-bottom:4px}.mxi-a11y-top{display:flex;align-items:center;justify-content:space-between}.mxi-a11y-score-wrap{display:flex;align-items:baseline;gap:2px}.mxi-a11y-score{font-size:26px;font-weight:700;color:'+h+'}.mxi-a11y-label{font-size:12px;color:'+x+'}.mxi-a11y-badge{padding:6px 12px;border-radius:8px;font-size:10px;font-weight:600}.mxi-footer{padding:16px;border-top:1px solid '+b+';display:flex;gap:8px;background:'+w+'}.mxi-btn{flex:1;padding:12px 16px;border:none;border-radius:12px;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;letter-spacing:-.1px}.mxi-btn:hover{transform:translateY(-1px)}.mxi-btn-primary{background:'+k+';color:'+w+'}.mxi-btn-secondary{background:'+y+';color:'+h+';border:1px solid '+b+'}.mxi-btn-secondary:hover{background:'+v+'}.mxi-highlight{outline:3px solid currentColor!important;outline-offset:2px!important}@keyframes mxi-pulse{0%,100%{opacity:1}50%{opacity:.7}}.mxi-highlight-label{position:fixed!important;color:'+w+'!important;font-size:10px!important;padding:4px 10px!important;border-radius:8px!important;z-index:999998!important;white-space:nowrap!important;pointer-events:none!important;font-weight:600!important}.mxi-clear-btn{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#FFB800;color:#141414;border:none;padding:12px 24px;border-radius:12px;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:11px;font-weight:600;cursor:pointer;z-index:999999;display:none;box-shadow:0 4px 20px rgba(255,184,0,.4);transition:all .2s}.mxi-clear-btn:hover{transform:translateX(-50%) translateY(-2px)}.mxi-session-roles{background:'+v+';border-radius:10px;padding:12px;margin-bottom:10px}.mxi-session-roles-title{font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;font-weight:500}.mxi-session-grid{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center}.mxi-session-user{background:'+y+';border-radius:10px;padding:10px 12px}.mxi-session-user-value{font-size:11px;font-weight:500;color:'+h+';word-break:break-all}.mxi-session-user-label{font-size:9px;color:'+x+';margin-top:2px;text-transform:uppercase;letter-spacing:.5px}.mxi-session-small{background:'+y+';border-radius:10px;padding:10px 12px;text-align:center;min-width:56px}.mxi-session-small-value{font-size:11px;font-weight:600}.mxi-session-small-label{font-size:9px;color:'+x+';margin-top:2px;text-transform:uppercase;letter-spacing:.5px}#mx-inspector-pro::-webkit-scrollbar{width:6px!important;height:6px!important}#mx-inspector-pro::-webkit-scrollbar-track{background:#141414!important}#mx-inspector-pro::-webkit-scrollbar-thumb{background:#2E2E2E!important;border-radius:3px!important}#mx-inspector-pro::-webkit-scrollbar-thumb:hover{background:#666666!important}#mx-inspector-pro .mxi-body::-webkit-scrollbar{width:6px!important;height:6px!important}#mx-inspector-pro .mxi-body::-webkit-scrollbar-track{background:#141414!important}#mx-inspector-pro .mxi-body::-webkit-scrollbar-thumb{background:#2E2E2E!important;border-radius:3px!important}#mx-inspector-pro .mxi-body::-webkit-scrollbar-thumb:hover{background:#666666!important}#mx-inspector-pro *{scrollbar-width:thin!important;scrollbar-color:#2E2E2E #141414!important}</style>';

var scoreLabel=i.score>=90?"Excellent":i.score>=80?"Good":i.score>=60?"Fair":"Needs Work";

/* Build Sections */
var containerTotal=i.dataViews+i.listViews+i.templateGrids+i.dataGrid2s+i.galleries+i.treeNodes;
var widgetsContent='<div style="font-size:9px;color:'+x+';margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;font-weight:500">DATA CONTAINERS</div><div class="mxi-metrics mxi-metrics-3" style="margin-bottom:8px">'+clickableMetric("DataView",i.dataViews,'.mx-dataview:not(.mx-dataview-content)[class*="mx-name-"]',null,"dataviews")+clickableMetric("ListView",i.listViews,'.mx-listview[class*="mx-name-"]',null,"listviews")+clickableMetric("TemplateGrid",i.templateGrids,'.mx-templategrid[class*="mx-name-"]',null,"templategrid")+'</div><div class="mxi-metrics mxi-metrics-3" style="margin-bottom:8px">'+clickableMetric("DataGrid2",i.dataGrid2s,'.widget-datagrid[class*="mx-name-"]',null,"datagrid2")+clickableMetric("Gallery",i.galleries,'.widget-gallery[class*="mx-name-"]',null,"galleries")+clickableMetric("TreeNode",i.treeNodes,'.widget-tree-node[class*="mx-name-"],.mx-treeview[class*="mx-name-"]',i.treeNodes>0?p:null,"treenode")+'</div><div class="mxi-metrics mxi-metrics-2">'+metric("Nested Issues",i.nestedDataViewsWarning.length+i.nestedDataViewsCritical.length,i.nestedDataViewsCritical.length?m:i.nestedDataViewsWarning.length?k:gr,"nesting")+metric("Total Widgets",i.totalWidgets)+'</div>';

var sessionContent='';
if(i.roles){sessionContent+='<div class="mxi-session-roles"><div class="mxi-session-roles-title">USER ROLE(S)</div><div class="mxi-role-tags">';i.roles.split(", ").forEach(function(r){if(r.trim())sessionContent+='<span class="mxi-role-tag">'+esc(r.trim())+'</span>'});sessionContent+='</div></div>'}
sessionContent+='<div class="mxi-session-grid"><div class="mxi-session-user"><div class="mxi-session-user-value">'+(i.user||"Anonymous")+'</div><div class="mxi-session-user-label">User</div></div><div class="mxi-session-small"><div class="mxi-session-small-value" style="color:'+(i.offline?"#FF7A50":"#2D9C5E")+'">'+(i.offline?"Offline":"Online")+'</div><div class="mxi-session-small-label">Status</div></div><div class="mxi-session-small"><div class="mxi-session-small-value" style="color:'+(i.guest?"#FFB800":"#9A9A9A")+'">'+(i.guest?"Yes":"No")+'</div><div class="mxi-session-small-label">Guest</div></div></div>';

var plugContent='';
if(i.uniquePluggableWidgets.length){plugContent='<div class="mxi-tags">';i.uniquePluggableWidgets.forEach(function(w){var isMkt=i.marketplaceWidgets.indexOf(w)>-1;plugContent+=tag(w,isMkt?"#dcfce7":"#f3f4f6",isMkt?"#166534":"#374151")});plugContent+='</div><div style="font-size:11px;color:'+x+';margin-top:8px">✓ Green = Marketplace widget</div>'}else{plugContent='<span style="color:'+x+'">None detected</span>'}

var a11yScoreColor=i.a11y.score>=80?gr:i.a11y.score>=60?k:m;
var a11yBadgeBg=i.a11y.score>=80?"rgba(45,156,94,.2);color:#2D9C5E":i.a11y.score>=60?"rgba(255,184,0,.2);color:#FFB800":"rgba(255,90,90,.2);color:#FF5A5A";
var isMobile=window.innerWidth<=1024;
var a11yContent='<div class="mxi-a11y-top"><div class="mxi-a11y-score-wrap"><span class="mxi-a11y-score" style="color:'+a11yScoreColor+'">'+i.a11y.score+'</span><span class="mxi-a11y-label">/100</span></div><span class="mxi-a11y-badge" style="background:'+a11yBadgeBg+'">'+i.a11y.wcagLevel+'</span></div><div class="mxi-metrics mxi-metrics-3" style="margin-top:12px">'+metric("Missing Alt",i.a11y.missingAltText+"/"+i.a11y.totalImages,i.a11y.missingAltText?m:gr,"altText")+metric("Missing Labels",i.a11y.missingLabels+"/"+i.a11y.totalFormFields,i.a11y.missingLabels?m:gr,"formLabels")+metric("Contrast",i.a11y.contrastIssues,i.a11y.contrastIssues?m:gr,"contrast")+'</div><div class="mxi-metrics mxi-metrics-3" style="margin-top:8px">'+metric("Small Fonts",i.a11y.smallFontSize,i.a11y.smallFontSize?k:gr,"smallFont")+metric("Headings",(i.a11y.missingH1?1:0)+i.a11y.headingSkips,i.a11y.headingSkips||i.a11y.missingH1?k:gr,"headings")+metric("Empty Links",i.a11y.emptyLinks,i.a11y.emptyLinks?k:gr,"emptyLinks")+'</div>'+(isMobile&&i.a11y.smallTouchTargets>0?'<div style="margin-top:8px;padding:8px 10px;background:rgba(255,184,0,.15);border:1px solid rgba(255,184,0,.3);border-radius:8px;font-size:11px;color:#FFB800">📱 '+i.a11y.smallTouchTargets+' small touch targets (<44px)</div>':'')+'<div style="margin-top:10px;font-size:11px;color:'+x+'">ARIA: '+i.a11y.ariaUsage+' • Landmarks: '+i.a11y.landmarks+' • Skip link: '+(i.a11y.hasSkipLink?"✓":"✗")+'</div>'+a11yImpr;

/* Typography section */
var typoContent='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div style="font-size:11px;color:'+x+'">PRIMARY FONT</div><button class="mxi-inspect-btn" id="mxi-inspect-toggle" style="background:'+v+';border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;color:'+f+';display:flex;align-items:center;gap:6px">'+icon("inspect",14)+' Inspect Mode</button></div><div style="font-size:18px;font-weight:600;color:'+h+';margin-bottom:12px">'+i.typography.primaryFont+'</div><div style="font-size:11px;color:'+x+';margin-bottom:6px">FONTS USED ('+i.typography.fontCount+')</div><div class="mxi-tags" style="margin-bottom:12px">';
i.typography.fonts.forEach(function(f,idx){typoContent+=tag(f,idx===0?"#dbeafe":"#f3f4f6",idx===0?"#1e40af":"#374151")});
typoContent+='</div><div style="font-size:11px;color:'+x+';margin-bottom:6px">SIZES ('+i.typography.sizeCount+' unique)</div><div class="mxi-tags" style="margin-bottom:12px">';
i.typography.sizes.slice(0,8).forEach(function(s){typoContent+=tag(s)});
typoContent+='</div><div style="font-size:11px;color:'+x+';margin-bottom:6px">WEIGHTS</div><div class="mxi-tags">';
i.typography.weights.forEach(function(w){var wName=w==="400"?"Regular":w==="500"?"Medium":w==="600"?"Semi":w==="700"?"Bold":w;typoContent+=tag(wName+" ("+w+")")});
typoContent+='</div>';

/* CSS Analysis section */
var cssContent='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div style="font-size:11px;color:'+x+'">OVERVIEW</div><button class="mxi-inspect-btn" id="mxi-css-inspect-toggle" style="background:'+v+';border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;color:'+f+';display:flex;align-items:center;gap:6px">'+icon("inspect",14)+' CSS Inspector</button></div>';
cssContent+='<div class="mxi-metrics mxi-metrics-3" style="margin-bottom:10px">'+metric("Stylesheets",i.css.totalStylesheets)+metric("Rules",i.css.totalRules)+metric("Inline Styles",i.css.inlineStyles,i.css.inlineStyles>20?p:null)+'</div>';
cssContent+='<div class="mxi-metrics mxi-metrics-3" style="margin-bottom:12px">'+metric("!important",i.css.importantCount,i.css.importantCount>50?m:i.css.importantCount>20?p:null)+metric("CSS Vars",i.css.customProperties,i.css.customProperties>0?gr:null)+metric("Media Q",i.css.mediaQueries)+'</div>';
/* Design System Usage */
cssContent+='<div style="font-size:9px;color:'+x+';margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:500">DESIGN SYSTEM USAGE</div>';
cssContent+='<div style="display:flex;gap:8px;margin-bottom:12px"><div style="flex:1;background:'+v+';border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:600;color:'+gr+'">'+i.css.atlasClasses+'</div><div style="font-size:9px;color:'+x+';margin-top:2px">Atlas/Framework</div></div><div style="flex:1;background:'+v+';border-radius:8px;padding:10px;text-align:center"><div style="font-size:16px;font-weight:600;color:'+(i.css.customClasses>i.css.atlasClasses?p:f)+'">'+i.css.customClasses+'</div><div style="font-size:9px;color:'+x+';margin-top:2px">Custom Classes</div></div></div>';
/* Deep Selectors Warning */
if(i.css.deepSelectors&&i.css.deepSelectors.length>0){
cssContent+='<div style="font-size:9px;color:'+p+';margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:500">⚠️ DEEP SELECTORS ('+i.css.deepSelectors.length+')</div><div style="margin-bottom:10px">';
i.css.deepSelectors.slice(0,3).forEach(function(d){
var selectorDisplay=d.selector.length>45?d.selector.substring(0,45)+"...":d.selector;
cssContent+='<div style="padding:6px 8px;background:'+y+';border-radius:4px;margin-bottom:4px;font-family:monospace;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(d.selector)+'"><span style="color:'+p+';font-weight:600">'+d.depth+' lvl:</span> <span style="color:'+f+'">'+esc(selectorDisplay)+'</span></div>';
});
cssContent+='<div style="font-size:10px;color:'+x+';margin-top:4px">Selectors with 4+ levels of nesting can be hard to override and maintain.</div></div>';
}
/* High Specificity Warning */
if(i.css.highSpecificity&&i.css.highSpecificity.length>0){
cssContent+='<div style="font-size:9px;color:'+k+';margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:500">HIGH SPECIFICITY ('+i.css.highSpecificity.length+')</div><div style="margin-bottom:10px">';
i.css.highSpecificity.slice(0,3).forEach(function(s){
var selectorDisplay=s.selector.length>35?s.selector.substring(0,35)+"...":s.selector;
cssContent+='<div style="padding:6px 8px;background:'+y+';border-radius:4px;margin-bottom:4px;font-family:monospace;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+esc(s.selector)+'"><span style="color:'+k+';font-weight:600">'+s.score+':</span> <span style="color:'+f+'">'+esc(selectorDisplay)+'</span></div>';
});
cssContent+='<div style="font-size:10px;color:'+x+';margin-top:4px">Score = IDs×100 + Classes×10 + Elements. High specificity makes overriding difficult.</div></div>';
}
/* Largest Stylesheets */
if(i.css.stylesheetSizes&&i.css.stylesheetSizes.length>0){
cssContent+='<div style="font-size:9px;color:'+x+';margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;font-weight:500">LARGEST STYLESHEETS</div><div style="margin-bottom:10px">';
i.css.stylesheetSizes.slice(0,3).forEach(function(s){
var sizeKb=Math.round(s.size/1024);
cssContent+='<div style="display:flex;justify-content:space-between;padding:6px 8px;background:'+y+';border-radius:4px;margin-bottom:4px;font-size:11px"><span style="color:'+f+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">'+esc(s.name)+'</span><span style="color:'+(sizeKb>100?p:x)+'">'+sizeKb+'KB</span></div>';
});
cssContent+='</div>';
}
cssContent+='<div style="margin-top:10px;padding:10px 12px;background:'+y+';border-radius:8px;font-size:11px;color:'+x+';border:1px solid '+b+'">💡 <strong style="color:'+f+'">Tip:</strong> Use CSS Inspector to hover and see classes, styles, padding & margin.</div>';

/* Security Section Content */
var securityContent='';
var sec=i.security;
var secIssueCount=sec.exposedConstants.length+sec.sensitiveEntities.length+sec.revealingMicroflows.length+sec.formIssues.length+sec.urlParams.length+sec.cveWarnings.length+sec.mixedContent.length+sec.localStorageSensitive.length+(sec.insecureProtocol?1:0);
var secScoreColor=sec.score>=80?gr:sec.score>=60?k:m;

securityContent+='<div class="mxi-a11y-top" style="margin-bottom:12px"><div class="mxi-a11y-score-wrap"><span class="mxi-a11y-score" style="color:'+secScoreColor+'">'+sec.score+'</span><span class="mxi-a11y-label">/100</span></div><span class="mxi-a11y-badge" style="background:'+(sec.score>=80?"rgba(45,156,94,.2);color:#2D9C5E":sec.score>=60?"rgba(255,184,0,.2);color:#FFB800":"rgba(255,90,90,.2);color:#FF5A5A")+'">'+(sec.score>=80?"Good":sec.score>=60?"Fair":"At Risk")+'</span></div>';

securityContent+='<div class="mxi-metrics mxi-metrics-3" style="margin-bottom:10px">'+metric("Constants",sec.exposedConstants.length,sec.exposedConstants.length>0?p:null,"secConstants")+metric("Entities",sec.sensitiveEntities.length,sec.sensitiveEntities.length>0?k:null,"secEntities")+metric("Actions",sec.revealingMicroflows.length,sec.revealingMicroflows.length>0?bl:null,"secMicroflows")+'</div>';
securityContent+='<div class="mxi-metrics mxi-metrics-3" style="margin-bottom:10px">'+metric("Forms",sec.formIssues.length,sec.formIssues.length>0?p:null,"secForms")+metric("URL Params",sec.urlParams.length,sec.urlParams.length>0?m:null,"secUrl")+metric("CVEs",sec.cveWarnings.length,sec.cveWarnings.length>0?m:null,"secCve")+'</div>';

/* Protocol Warning */
if(sec.insecureProtocol){
securityContent+='<div style="margin-bottom:10px;padding:10px 12px;background:rgba(255,90,90,.1);border:1px solid rgba(255,90,90,.3);border-radius:10px"><div style="font-size:11px;color:#FF5A5A;font-weight:500">🔓 Page loaded over HTTP (not secure)</div><div style="font-size:10px;color:'+x+';margin-top:4px">Use HTTPS in production environments.</div></div>';
}

/* CVE Warnings */
if(sec.cveWarnings.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:rgba(255,90,90,.1);border:1px solid rgba(255,90,90,.3);border-radius:10px">';
securityContent+='<div style="font-size:10px;color:#FF5A5A;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">⚠️ KNOWN VULNERABILITIES</div>';
sec.cveWarnings.forEach(function(cve){
securityContent+='<div style="font-size:11px;margin-bottom:6px;color:'+f+'"><strong style="color:#FF8A8A">'+cve.id+'</strong> <span style="color:'+x+'">('+cve.severity+')</span><br>'+cve.desc+'</div>';
});
securityContent+='<div style="font-size:10px;color:'+x+';margin-top:8px">Update Mendix to patch these vulnerabilities.</div></div>';
}

/* Mixed Content Warning */
if(sec.mixedContent.length>0){
securityContent+='<div style="margin-top:10px;padding:10px 12px;background:rgba(255,122,80,.1);border:1px solid rgba(255,122,80,.3);border-radius:10px">';
securityContent+='<div style="font-size:10px;color:#FF7A50;font-weight:600;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">⚠️ MIXED CONTENT</div>';
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

/* External Scripts */
if(sec.externalScripts.length>0){
securityContent+='<div style="margin-top:10px">';
securityContent+='<div style="font-size:10px;color:'+x+';font-weight:500;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">EXTERNAL SCRIPTS ('+sec.externalScripts.length+')</div>';
securityContent+='<div class="mxi-tags">';
sec.externalScripts.forEach(function(h){securityContent+=tag(h,"rgba(59,153,252,.1)","#3B99FC")});
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

/* Sensitive Entities */
if(sec.sensitiveEntities.length>0){
securityContent+='<div style="margin-top:10px">';
securityContent+='<div style="font-size:10px;color:'+x+';font-weight:500;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">SENSITIVE ENTITY NAMES</div>';
securityContent+='<div class="mxi-tags">';
sec.sensitiveEntities.slice(0,8).forEach(function(e){
securityContent+=tag(e.name,"rgba(255,184,0,.15)","#FFB800");
});
securityContent+='</div></div>';
}

/* Revealing Microflows */
if(sec.revealingMicroflows.length>0){
securityContent+='<div style="margin-top:10px">';
securityContent+='<div style="font-size:10px;color:'+x+';font-weight:500;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">REVEALING ACTION NAMES</div>';
securityContent+='<div class="mxi-tags">';
sec.revealingMicroflows.slice(0,8).forEach(function(e){
securityContent+=tag(e.name,"rgba(59,153,252,.15)","#3B99FC");
});
securityContent+='</div></div>';
}

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
securityContent+='<div style="margin-top:10px;padding:12px;background:rgba(45,156,94,.1);border:1px solid rgba(45,156,94,.2);border-radius:10px;text-align:center"><div style="font-size:24px;margin-bottom:6px;color:#2D9C5E">✓</div><div style="font-size:12px;color:#2D9C5E;font-weight:500">No security issues detected</div><div style="font-size:10px;color:'+x+';margin-top:4px">Page passes extended security checks</div></div>';
}

/* MASCOT - REOWN INSPIRED . / LOGO */
var mascot='<svg viewBox="0 0 52 24" width="52" height="24" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="24" height="24" rx="7" fill="#242424"/><rect x="28" y="0" width="24" height="24" rx="7" fill="#1A1A1A" stroke="#FF7A50" stroke-width="1.5"/><rect x="10" y="10" width="4" height="4" rx="0.5" fill="#fff"/><line x1="37" y1="6" x2="43" y2="18" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>';

var html=css+'<div class="mxi-header" id="mxi-drag-handle"><div class="mxi-header-top"><div class="mxi-logo">'+mascot+'<span class="mxi-title">MxInspector</span></div><div class="mxi-header-buttons"><span class="mxi-badge">'+i.version+'</span><span class="mxi-badge'+(i.client==="React"?" mxi-badge-accent":"")+'">'+i.client+'</span><button class="mxi-icon-btn" id="mxi-info-btn" title="About">'+icon("info",16)+'<div class="mxi-info-tooltip" id="mxi-info-tooltip"><div class="mxi-info-line"><strong>MxInspector</strong> v1.3</div><div class="mxi-info-line">Created with ❤️ by <strong>Tim Maurer</strong></div><div class="mxi-info-line" style="color:#9A9A9A;font-size:10px">Free for personal & commercial use.<br>MIT License • Attribution required.</div><a href="https://paypal.me/tapmaurer" target="_blank" class="mxi-coffee-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" width="14" height="14"><path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.59,96.59,0,0,1-27,40.09H208a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16H56.54A96.3,96.3,0,0,1,24,136V88a8,8,0,0,1,8-8H208A40,40,0,0,1,248,120ZM200,96H40v40a80.27,80.27,0,0,0,45.12,72h69.76A80.27,80.27,0,0,0,200,136Zm32,24a24,24,0,0,0-16-22.62V136a95.78,95.78,0,0,1-1.2,15A24,24,0,0,0,232,128Z"/></svg>Buy me a coffee</a></div></button><button class="mxi-icon-btn" id="mxi-close-btn" title="Close">'+icon("x",16)+'</button></div></div><div class="mxi-env"><span>'+envIcon(i.envType)+' '+i.envType+'</span><span class="mxi-env-url">'+(i.env||location.host)+'</span></div></div><div class="mxi-body"><div class="mxi-score"><div class="mxi-score-circle" style="background:'+scoreColor(i.score)+'">'+i.score+'</div><div class="mxi-score-info"><div class="mxi-score-label">Health: '+scoreLabel+'</div><div class="mxi-score-desc">'+i.warnings.length+' insights • '+i.totalWidgets+' widgets</div></div></div><div class="mxi-page-info"><div class="mxi-page-row"><div class="mxi-page-main"><div class="mxi-page-module">'+i.module+'</div><div style="display:flex;align-items:center"><span class="mxi-page-name" title="'+i.page+'">'+i.page+'</span>'+(i.popup?'<span class="mxi-page-popup">POPUP</span>':'')+'</div></div><button class="mxi-copy-btn" id="mxi-copy-btn" title="Copy page name">'+icon("copy",14)+'</button></div>'+(i.pageParameters.length||i.dataViewEntities.length?'<div style="margin-top:10px;padding-top:10px;border-top:1px solid '+b+'"><div style="font-size:9px;color:'+x+';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;display:flex;align-items:center;gap:6px">'+icon("page",12)+' PAGE PARAMETERS</div><div style="display:flex;flex-wrap:wrap;gap:6px">'+(i.pageParameters.length?i.pageParameters:i.dataViewEntities).map(function(e){return'<span style="background:#2E2E2E;color:#FFFFFF;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:500;border:1px solid #3D3D3D">'+e+'</span>'}).join('')+'</div></div>':'')+'</div>'+
(insightsHtml?section("insights","Insights ("+i.warnings.length+")","bulb",insightsHtml,false):"")+
section("perf","Performance","lightning",'<div style="font-size:9px;color:'+x+';margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;font-weight:500">PAGE LOAD METRICS</div><div class="mxi-metrics">'+metric("Load",o(i.loadTime),i.loadTime>4e3?m:i.loadTime>2e3?p:g,"load")+metric("DOM",i.domNodes,i.domNodes>4e3?m:i.domNodes>2e3?p:g,"dom")+metric("Requests",i.totalRequests,null,"requests")+metric("Memory",i.jsHeap?i.jsHeap+"MB":"-",null,"memory")+'</div><div style="font-size:9px;color:'+x+';margin:12px 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:500">CORE WEB VITALS</div><div class="mxi-metrics">'+metric("FCP",i.firstContentfulPaint?o(i.firstContentfulPaint):"-",i.firstContentfulPaint>1800?p:null,"fcp")+metric("LCP",i.largestContentfulPaint?o(i.largestContentfulPaint):"-",i.largestContentfulPaint>2500?p:null,"lcp")+metric("TTFB",i.ttfb?o(i.ttfb):"-",i.ttfb>600?p:null)+metric("CLS",i.cls?i.cls.toFixed(3):"-",i.cls>0.1?p:null)+'</div><div style="margin-top:12px;font-size:10px;color:#666;text-align:center">💡 Metrics measured on initial page load</div>',true)+
section("widgets","Widgets","cube",widgetsContent,false)+
section("snippets","Snippets ("+i.snippetCount+")","pkg",(i.snippets.length?'<div class="mxi-tags">'+i.snippets.map(function(s){return tag(s,"#dbeafe","#1e40af")}).join("")+"</div>":'<span style="color:'+x+'">None detected</span>'),false)+
section("actions","Actions","refresh",'<div class="mxi-metrics mxi-metrics-3">'+metric("Microflow",i.microflowActions,i.microflowActions>15?p:null,"microflows")+metric("Nanoflow",i.nanoflowActions,null,"nanoflows")+metric("Other",i.otherActions)+'</div>',false)+
section("data","Data Sources","db",'<div class="mxi-metrics mxi-metrics-3">'+metric("Database",i.dataSources.database,null,"datasources")+metric("Microflow",i.dataSources.microflow)+metric("Nanoflow",i.dataSources.nanoflow)+'</div>',false)+
section("pluggable","Pluggable Widgets ("+i.uniquePluggableWidgets.length+")","plug",plugContent,false)+
section("conditional","Conditional ("+i.conditionalElements+")","eye",'<div class="mxi-metrics mxi-metrics-3">'+metric("Hidden",i.conditionalElements,i.conditionalElements>30?p:null,"conditional")+metric("Forms",i.formFields)+metric("Images",i.images)+"</div>",false)+
section("tree","Widget Tree","tree",treeHtml,false)+
section("a11y","Accessibility ("+i.a11y.wcagLevel+")","a11y",a11yContent,false)+
section("typography","Typography","type",typoContent,false)+
section("css","CSS Analysis","css",cssContent,false)+
section("security","Security","shield",securityContent,false)+
section("network","Network","globe",'<div class="mxi-metrics mxi-metrics-3">'+metric("XHR",i.xhrRequests,null,"xhr")+metric("Static",i.staticRequests,null,"static")+metric("Total",i.totalRequests,null,"requests")+"</div>"+(i.slowRequests.length?'<div style="margin-top:10px;padding:8px 10px;background:#fef3c7;border-radius:6px;font-size:11px;color:#92400e"><strong>⚠️ Slow requests (>1s):</strong> '+i.slowRequests.slice(0,3).map(function(r){return r.url+" ("+r.duration+"ms)"}).join(", ")+"</div>":""),false)+
section("session","Session","user",sessionContent,false)+
'</div><div class="mxi-footer"><button class="mxi-btn mxi-btn-secondary" id="mxi-widget-inspect-btn" title="Object Inspector - See attributes & associations">'+icon("crosshair",16)+' Inspect</button><button class="mxi-btn mxi-btn-secondary" id="mxi-log-btn">'+icon("terminal",16)+' Log</button><button class="mxi-btn mxi-btn-primary" id="mxi-export-btn">'+icon("pdf",16)+' PDF</button></div>';

A.innerHTML=html;document.body.appendChild(A);

var clearBtn=document.createElement("button");clearBtn.className="mxi-clear-btn";clearBtn.textContent="✕ Clear Highlights";clearBtn.onclick=clearHighlights;document.body.appendChild(clearBtn);

var highlightedEls=[],labelEls=[],activeInsight=null;
function clearHighlights(){highlightedEls.forEach(function(el){el.classList.remove("mxi-highlight");el.style.removeProperty("outline-color");el.style.removeProperty("outline-width");el.style.removeProperty("outline-style");el.style.removeProperty("outline-offset");el.style.removeProperty("background-color")});labelEls.forEach(function(el){if(el.parentNode)el.parentNode.removeChild(el)});highlightedEls=[];labelEls=[];clearBtn.style.display="none";clearBtn.style.background="#FFB800";clearBtn.style.boxShadow="0 4px 20px rgba(255,184,0,.4)";if(activeInsight){activeInsight.classList.remove("active");activeInsight.style.background="";activeInsight.style.borderColor="";activeInsight.removeAttribute("data-active-severity");activeInsight=null}if(typeof activeMetric!=="undefined"&&activeMetric){activeMetric.style.background="";activeMetric.style.borderColor="";activeMetric=null}}

var dragHandle=document.getElementById("mxi-drag-handle"),isDragging=false,startX,startY,startLeft,startTop;
dragHandle.addEventListener("mousedown",function(e){if(!e.target.closest(".mxi-icon-btn")&&!e.target.closest(".mxi-copy-btn")){isDragging=true;startX=e.clientX;startY=e.clientY;var rect=A.getBoundingClientRect();startLeft=rect.left;startTop=rect.top;e.preventDefault()}});
document.addEventListener("mousemove",function(e){if(isDragging){A.style.right="auto";A.style.left=startLeft+(e.clientX-startX)+"px";A.style.top=startTop+(e.clientY-startY)+"px"}});
document.addEventListener("mouseup",function(){isDragging=false});

document.getElementById("mxi-close-btn").onclick=function(){
if(inspectModeActive){inspectModeActive=false;document.removeEventListener("mousemove",handleInspectHover);document.removeEventListener("mouseout",handleInspectOut);destroyInspectTooltip();document.body.style.cursor=""}
if(inspectCloseBtn){inspectCloseBtn.remove();inspectCloseBtn=null}
/* Clean up widget inspector if active */
if(typeof widgetInspectActive!=="undefined"&&widgetInspectActive){widgetInspectActive=false;document.removeEventListener("mousemove",handleWidgetInspectHover);document.removeEventListener("mouseout",handleWidgetInspectOut);if(typeof destroyWidgetInspectElements==="function")destroyWidgetInspectElements();document.body.style.cursor=""}
if(typeof widgetInspectCloseBtn!=="undefined"&&widgetInspectCloseBtn){widgetInspectCloseBtn.remove();widgetInspectCloseBtn=null}
/* Clean up data panel if open */
if(typeof dataPanelVisible!=="undefined"&&dataPanelVisible&&typeof closeDataPanel==="function")closeDataPanel();
document.removeEventListener("keydown",handleEscapeKey);
cleanup();clearHighlights();clearBtn.remove();A.remove()};

var infoBtn=document.getElementById("mxi-info-btn"),infoTooltip=document.getElementById("mxi-info-tooltip");
infoBtn.onclick=function(e){e.stopPropagation();infoTooltip.classList.toggle("show")};
document.addEventListener("click",function(e){if(infoTooltip&&!e.target.closest("#mxi-info-btn")&&!e.target.closest("#mxi-info-tooltip"))infoTooltip.classList.remove("show")});

/* Copy - ONLY PAGE NAME */
document.getElementById("mxi-copy-btn").onclick=function(){var btn=this;var text=i.page;if(navigator.clipboard){navigator.clipboard.writeText(text).then(function(){btn.innerHTML=icon("check",18);btn.style.background="#22c55e";setTimeout(function(){btn.innerHTML=icon("copy",18);btn.style.background=""},1500)})}else{var ta=document.createElement("textarea");ta.value=text;ta.style.cssText="position:fixed;left:-9999px";document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);btn.innerHTML=icon("check",18);btn.style.background="#22c55e";setTimeout(function(){btn.innerHTML=icon("copy",18);btn.style.background=""},1500)}};

document.getElementById("mxi-log-btn").onclick=function(){console.log("%c Mendix Inspector Pro ","background:#0595DB;color:white;font-weight:bold;padding:6px 12px;border-radius:4px",i);alert("Logged to console (F12)")};

/* PDF EXPORT */
document.getElementById("mxi-export-btn").onclick=function(){
var scCol=scoreColor(i.score);var a11yCol=scoreColor(i.a11y.score);var secCol=scoreColor(i.security.score);
var logoSvg='<svg viewBox="0 0 52 24" width="52" height="24" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="24" height="24" rx="7" fill="#242424"/><rect x="28" y="0" width="24" height="24" rx="7" fill="#1A1A1A" stroke="#FF7A50" stroke-width="1.5"/><rect x="10" y="10" width="4" height="4" rx="0.5" fill="#fff"/><line x1="37" y1="6" x2="43" y2="18" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>';
var pdfHtml='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>MxInspector Report - '+i.page+'</title><style>*{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:900px;margin:0 auto;padding:40px;color:#1a1a1a;font-size:14px;line-height:1.5;background:#fff}.header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #FFB800}.header-logo{flex-shrink:0}.header-title{font-size:24px;font-weight:700;color:#1a1a1a}.header-subtitle{font-size:12px;color:#666;margin-top:2px}.meta-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px}.meta-item{background:#f8f8f8;padding:12px 16px;border-radius:8px}.meta-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px}.meta-value{font-size:13px;font-weight:500;color:#1a1a1a}h2{color:#1a1a1a;font-size:16px;font-weight:600;margin:32px 0 16px;padding-bottom:8px;border-bottom:1px solid #eee}h3{color:#444;font-size:14px;font-weight:600;margin:20px 0 12px}.score-row{display:flex;gap:20px;margin-bottom:24px}.score-box{flex:1;background:#f8f8f8;border-radius:12px;padding:20px;text-align:center}.score-value{font-size:42px;font-weight:700;line-height:1}.score-label{font-size:11px;color:#666;margin-top:8px;text-transform:uppercase;letter-spacing:0.5px}.score-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-top:8px}.metrics{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.metric{background:#f8f8f8;padding:12px 16px;border-radius:8px;min-width:100px;text-align:center}.metric-value{font-size:18px;font-weight:600;color:#1a1a1a}.metric-label{font-size:10px;color:#888;margin-top:4px;text-transform:uppercase}.tag{display:inline-block;background:#f0f0f0;padding:4px 10px;margin:3px;border-radius:4px;font-size:11px;color:#444}.good{color:#2D9C5E}.warn{color:#FF7A50}.bad{color:#FF5A5A}.section{margin:16px 0;padding:16px;background:#f8f8f8;border-radius:10px}.insight{padding:10px 14px;margin:6px 0;border-radius:8px;font-size:13px;background:#fff;border-left:4px solid #ddd}.insight.error{border-left-color:#FF5A5A;background:#fff5f5}.insight.warning{border-left-color:#FFB800;background:#fffbf0}.insight.success{border-left-color:#2D9C5E;background:#f0fff5}.insight.info{border-left-color:#3B99FC;background:#f0f7ff}table{width:100%;border-collapse:collapse;margin:12px 0;background:#fff;border-radius:8px;overflow:hidden}th,td{padding:10px 14px;text-align:left;border-bottom:1px solid #eee}th{background:#f8f8f8;font-size:11px;text-transform:uppercase;color:#666;font-weight:600}.cve-box{background:#fff5f5;border:1px solid #ffcccc;border-radius:8px;padding:14px;margin:8px 0}.cve-id{font-weight:600;color:#FF5A5A}.cve-desc{font-size:12px;color:#666;margin-top:4px}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center;display:flex;align-items:center;justify-content:center;gap:12px}.credential-box{background:linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%);color:#fff;padding:20px;border-radius:12px;margin:24px 0}.credential-title{font-size:12px;color:#FFB800;font-weight:600;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px}.credential-row{display:flex;gap:20px;flex-wrap:wrap}.credential-item{flex:1;min-width:150px}.credential-label{font-size:10px;color:#888;margin-bottom:4px}.credential-value{font-size:14px;font-weight:500}@media print{body{padding:20px}.section,.score-box{break-inside:avoid}}</style></head><body>';

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
pdfHtml+='<div class="score-box"><div class="score-value" style="color:'+scCol+'">'+i.score+'</div><div class="score-label">Health Score</div><div class="score-badge" style="background:'+(i.score>=80?'#e8f5e9;color:#2D9C5E':i.score>=60?'#fff3e0;color:#FF7A50':'#ffebee;color:#FF5A5A')+'">'+(i.score>=90?"Excellent":i.score>=80?"Good":i.score>=60?"Fair":"Needs Work")+'</div></div>';
pdfHtml+='<div class="score-box"><div class="score-value" style="color:'+a11yCol+'">'+i.a11y.score+'</div><div class="score-label">Accessibility</div><div class="score-badge" style="background:'+(i.a11y.score>=80?'#e8f5e9;color:#2D9C5E':i.a11y.score>=60?'#fff3e0;color:#FF7A50':'#ffebee;color:#FF5A5A')+'">'+i.a11y.wcagLevel+'</div></div>';
pdfHtml+='<div class="score-box"><div class="score-value" style="color:'+secCol+'">'+i.security.score+'</div><div class="score-label">Security</div><div class="score-badge" style="background:'+(i.security.score>=80?'#e8f5e9;color:#2D9C5E':i.security.score>=60?'#fff3e0;color:#FF7A50':'#ffebee;color:#FF5A5A')+'">'+(i.security.score>=80?"Good":i.security.score>=60?"Fair":"At Risk")+'</div></div>';
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

/* Snippets */
if(i.snippets.length){pdfHtml+='<h2>Snippets ('+i.snippetCount+')</h2><div class="section">';i.snippets.forEach(function(s){pdfHtml+='<span class="tag">'+s+'</span>'});pdfHtml+='</div>'}

/* Actions */
pdfHtml+='<h2>Actions</h2><div class="metrics">';
pdfHtml+='<div class="metric"><div class="metric-value '+(i.microflowActions>15?"warn":"")+'">'+i.microflowActions+'</div><div class="metric-label">Microflows</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.nanoflowActions+'</div><div class="metric-label">Nanoflows</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.otherActions+'</div><div class="metric-label">Other</div></div>';
pdfHtml+='</div>';

/* Data Sources */
pdfHtml+='<h2>Data Sources</h2><div class="metrics">';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.dataSources.database+'</div><div class="metric-label">Database</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.dataSources.microflow+'</div><div class="metric-label">Microflow</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.dataSources.nanoflow+'</div><div class="metric-label">Nanoflow</div></div>';
pdfHtml+='</div>';

/* Pluggable Widgets */
if(i.uniquePluggableWidgets.length){pdfHtml+='<h2>Pluggable Widgets ('+i.uniquePluggableWidgets.length+')</h2><div class="section">';i.uniquePluggableWidgets.forEach(function(w){pdfHtml+='<span class="tag">'+w+'</span>'});pdfHtml+='</div>'}

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

/* Security */
pdfHtml+='<h2>Security Analysis</h2><div class="section"><table><tr><th>Check</th><th>Found</th><th>Risk</th></tr>';
pdfHtml+='<tr><td>Exposed JS Constants</td><td>'+i.security.exposedConstants.length+'</td><td class="'+(i.security.exposedConstants.length?"warn":"good")+'">'+(i.security.exposedConstants.length?"Medium":"None")+'</td></tr>';
pdfHtml+='<tr><td>Sensitive Entity Names</td><td>'+i.security.sensitiveEntities.length+'</td><td class="'+(i.security.sensitiveEntities.length?"warn":"good")+'">'+(i.security.sensitiveEntities.length?"Low":"None")+'</td></tr>';
pdfHtml+='<tr><td>Revealing Action Names</td><td>'+i.security.revealingMicroflows.length+'</td><td class="'+(i.security.revealingMicroflows.length?"":"good")+'">'+(i.security.revealingMicroflows.length?"Info":"None")+'</td></tr>';
pdfHtml+='<tr><td>Form Security Issues</td><td>'+i.security.formIssues.length+'</td><td class="'+(i.security.formIssues.length?"warn":"good")+'">'+(i.security.formIssues.length?"Medium":"None")+'</td></tr>';
pdfHtml+='<tr><td>Sensitive URL Params</td><td>'+i.security.urlParams.length+'</td><td class="'+(i.security.urlParams.length?"bad":"good")+'">'+(i.security.urlParams.length?"High":"None")+'</td></tr>';
pdfHtml+='<tr><td>Known CVEs</td><td>'+i.security.cveWarnings.length+'</td><td class="'+(i.security.cveWarnings.length?"bad":"good")+'">'+(i.security.cveWarnings.length?"Critical":"None")+'</td></tr>';
pdfHtml+='</table>';

/* CVE Details */
if(i.security.cveWarnings.length){
pdfHtml+='<h3 style="color:#FF5A5A">⚠️ Known Vulnerabilities</h3>';
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

pdfHtml+='</div>';

/* Network */
pdfHtml+='<h2>Network</h2><div class="metrics">';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.xhrRequests+'</div><div class="metric-label">XHR Requests</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.staticRequests+'</div><div class="metric-label">Static Assets</div></div>';
pdfHtml+='<div class="metric"><div class="metric-value">'+i.totalRequests+'</div><div class="metric-label">Total Requests</div></div>';
pdfHtml+='</div>';
if(i.slowRequests.length){pdfHtml+='<div class="section" style="background:#fff5f5"><strong>Slow Requests (&gt;1s):</strong><ul>';i.slowRequests.slice(0,5).forEach(function(r){pdfHtml+='<li>'+r.url+' ('+r.duration+'ms)</li>'});pdfHtml+='</ul></div>'}

/* Footer */
pdfHtml+='<div class="footer">'+logoSvg+'<span>Generated by <strong>MxInspector v1.0</strong> • Created by Tim Maurer • <a href="https://paypal.me/tapmaurer" style="color:#FFB800">Support the project</a></span></div></body></html>';

var win=window.open("","_blank");win.document.write(pdfHtml);win.document.close();setTimeout(function(){win.print()},500)};

/* HIGHLIGHT CLICK HANDLERS - TOGGLE & ACTIVE STATE WITH SEVERITY COLORS */
var highlightColors={error:"#FF5A5A",warning:"#FFB800",info:"#3B99FC",success:"#2D9C5E"};
A.querySelectorAll(".mxi-insight-clickable").forEach(function(el){el.addEventListener("click",function(){var key=this.getAttribute("data-highlight-key");var severity=this.getAttribute("data-severity")||"warning";var hlColor=highlightColors[severity]||highlightColors.warning;if(key&&i.highlightTargets[key]){
/* If clicking the same insight, toggle off */
if(activeInsight===this){clearHighlights();this.classList.remove("active");this.removeAttribute("data-active-severity");activeInsight=null;return}
/* Clear previous */
clearHighlights();
if(activeInsight){activeInsight.classList.remove("active");activeInsight.removeAttribute("data-active-severity")}
/* Set new active with severity class */
this.classList.add("active");
this.setAttribute("data-active-severity",severity);
this.style.background=hlColor;
this.style.borderColor=hlColor;
activeInsight=this;
var targets=i.highlightTargets[key];targets.forEach(function(t,idx){if(t&&t.parentNode){t.classList.add("mxi-highlight");t.style.setProperty("outline-color",hlColor,"important");t.style.setProperty("outline-width","3px","important");t.style.setProperty("outline-style","solid","important");t.style.setProperty("outline-offset","2px","important");highlightedEls.push(t);var label=document.createElement("div");label.className="mxi-highlight-label";label.textContent=(idx+1)+"/"+targets.length;label.style.background=hlColor;label.style.boxShadow="0 4px 12px "+hlColor+"55";document.body.appendChild(label);labelEls.push(label);
function positionLabel(){var rect=t.getBoundingClientRect();label.style.left=Math.max(10,rect.left)+"px";label.style.top=Math.max(10,rect.top-30)+"px"}
positionLabel();window.addEventListener("scroll",positionLabel);window.addEventListener("resize",positionLabel)}});if(targets[0])targets[0].scrollIntoView({behavior:"smooth",block:"center"});clearBtn.style.display="block";clearBtn.style.background=hlColor;clearBtn.style.boxShadow="0 4px 20px "+hlColor+"66"}})});;;

/* CLICKABLE METRIC HANDLERS - Highlight elements by CSS selector */
var activeMetric=null;
A.querySelectorAll(".mxi-metric-clickable").forEach(function(el){el.addEventListener("click",function(){
var selector=this.getAttribute("data-selector");
var label=this.getAttribute("data-label");
var hlColor="#FFB800";  /* Yellow for metrics */

if(!selector)return;

/* If clicking the same metric, toggle off */
if(activeMetric===this){
clearHighlights();
this.style.background="";
this.style.borderColor="";
activeMetric=null;
return;
}

/* Clear previous highlights */
clearHighlights();
if(activeMetric){activeMetric.style.background="";activeMetric.style.borderColor="";}
if(activeInsight){activeInsight.classList.remove("active");activeInsight=null;}

/* Highlight this metric */
this.style.background="#1A1A1A";
this.style.borderColor=hlColor;
activeMetric=this;

/* Find and highlight elements by selector */
var targets=[];
try{
document.querySelectorAll(selector).forEach(function(t){targets.push(t)});
}catch(e){console.warn("Invalid selector:",selector)}

if(targets.length===0){
console.log("No elements found for selector:",selector);
return;
}

targets.forEach(function(t,idx){
if(t&&t.parentNode){
t.classList.add("mxi-highlight");
t.style.setProperty("outline-color",hlColor,"important");
t.style.setProperty("outline-width","3px","important");
t.style.setProperty("outline-style","solid","important");
t.style.setProperty("outline-offset","2px","important");
highlightedEls.push(t);

/* Create label */
var labelEl=document.createElement("div");
labelEl.className="mxi-highlight-label";
var widgetName=t.className.match(/mx-name-([^\s]+)/);
labelEl.textContent=(idx+1)+"/"+targets.length+(widgetName?" • "+widgetName[1]:"");
labelEl.style.background=hlColor;
labelEl.style.boxShadow="0 4px 12px "+hlColor+"55";
document.body.appendChild(labelEl);
labelEls.push(labelEl);

function positionLabel(){var rect=t.getBoundingClientRect();labelEl.style.left=Math.max(10,rect.left)+"px";labelEl.style.top=Math.max(10,rect.top-30)+"px"}
positionLabel();
window.addEventListener("scroll",positionLabel);
window.addEventListener("resize",positionLabel);
}
});

/* Scroll to first element */
if(targets[0])targets[0].scrollIntoView({behavior:"smooth",block:"center"});
clearBtn.style.display="block";
clearBtn.style.background=hlColor;
clearBtn.style.boxShadow="0 4px 20px "+hlColor+"66";
})});

window.__mxInspectorData=i;
console.log("%c Mendix Inspector Pro v4.3 ","background:#0595DB;color:white;font-weight:bold",i);

/* ===== TYPOGRAPHY INSPECT MODE ===== */
var inspectModeActive=false;
var inspectTooltip=null;
var inspectOutline=null;

function createInspectTooltip(){
if(inspectTooltip)return;
inspectTooltip=document.createElement("div");
inspectTooltip.id="mxi-type-tooltip";
inspectTooltip.style.cssText="position:fixed;background:#141414;color:#fff;padding:14px 18px;border-radius:12px;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:999997;pointer-events:none;opacity:0;transition:opacity .15s;max-width:320px;box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E";
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
function handleEscapeKey(e){if(e.key==="Escape"){if(inspectModeActive)toggleInspectMode();if(cssInspectActive)toggleCssInspectMode();if(typeof widgetInspectActive!=="undefined"&&widgetInspectActive)toggleWidgetInspectMode();if(highlightedEls.length>0)clearHighlights()}}
document.addEventListener("keydown",handleEscapeKey);

function toggleInspectMode(){
var btn=document.getElementById("mxi-inspect-toggle");
inspectModeActive=!inspectModeActive;
if(inspectModeActive){
createInspectTooltip();
document.addEventListener("mousemove",handleInspectHover);
document.addEventListener("mouseout",handleInspectOut);
btn.style.background=k;
btn.style.color=w;
btn.innerHTML=icon("inspect",14)+' Inspect ON';
document.body.style.cursor="crosshair";
if(!inspectCloseBtn){inspectCloseBtn=document.createElement("button");inspectCloseBtn.className="mxi-clear-btn";inspectCloseBtn.innerHTML="✕ Exit Inspect Mode";inspectCloseBtn.onclick=toggleInspectMode;document.body.appendChild(inspectCloseBtn)}
inspectCloseBtn.style.display="block";
}else{
document.removeEventListener("mousemove",handleInspectHover);
document.removeEventListener("mouseout",handleInspectOut);
destroyInspectTooltip();
btn.style.background=v;
btn.style.color=f;
btn.innerHTML=icon("inspect",14)+' Inspect Mode';
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
cssInspectTooltip.style.cssText="position:fixed;background:#141414;color:#fff;padding:14px 18px;border-radius:12px;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:999997;pointer-events:none;opacity:0;transition:opacity .15s;max-width:380px;box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E";
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
boxStyle.textContent=".mxi-margin-top,.mxi-margin-right,.mxi-margin-bottom,.mxi-margin-left{position:absolute;background:rgba(255,122,80,.3);}.mxi-padding-top,.mxi-padding-right,.mxi-padding-bottom,.mxi-padding-left{position:absolute;background:rgba(45,156,94,.3);}";
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
mxClasses.slice(0,6).forEach(function(c){html+='<span style="background:#FFB80022;color:#FFB800;padding:2px 6px;border-radius:4px;font-size:10px;font-family:monospace">'+c+'</span>'});
html+='</div></div>';
}

if(customClasses.length){
html+='<div style="margin-bottom:8px"><div style="font-size:9px;color:#666;margin-bottom:4px">CUSTOM CLASSES</div><div style="display:flex;flex-wrap:wrap;gap:4px">';
customClasses.slice(0,6).forEach(function(c){html+='<span style="background:#3B99FC22;color:#3B99FC;padding:2px 6px;border-radius:4px;font-size:10px;font-family:monospace">'+c+'</span>'});
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
html+='<div><span style="color:#2D9C5E">Padding:</span> <span style="color:#fff">'+padding.top+' '+padding.right+' '+padding.bottom+' '+padding.left+'</span></div>';
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
pt.style.cssText="position:absolute;top:"+margin.top+"px;left:"+margin.left+"px;width:"+rect.width+"px;height:"+padding.top+"px;background:rgba(45,156,94,.3)";
pr.style.cssText="position:absolute;top:"+(margin.top+padding.top)+"px;right:"+margin.right+"px;width:"+padding.right+"px;height:"+(rect.height-padding.top-padding.bottom)+"px;background:rgba(45,156,94,.3)";
pb.style.cssText="position:absolute;bottom:"+margin.bottom+"px;left:"+margin.left+"px;width:"+rect.width+"px;height:"+padding.bottom+"px;background:rgba(45,156,94,.3)";
pl.style.cssText="position:absolute;top:"+(margin.top+padding.top)+"px;left:"+margin.left+"px;width:"+padding.left+"px;height:"+(rect.height-padding.top-padding.bottom)+"px;background:rgba(45,156,94,.3)";

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
panelHtml+='<div class="mxi-dp-ds-item"><div class="mxi-dp-ds-value" style="color:#2D9C5E">'+info.datasources.nanoflow+'</div><div class="mxi-dp-ds-label">Nanoflow</div></div>';
panelHtml+='</div></div>';
/* Entities List with expandable object data */
if(info.entities.length>0){
panelHtml+='<div class="mxi-dp-section"><div class="mxi-dp-section-title">'+icon("table",14)+' Entities on Page <span style="color:#666;font-weight:normal">(click to expand)</span></div>';
info.entities.forEach(function(e,idx){
var typeColor=e.type==="DataView"?"#3B99FC":e.type==="ListView"?"#2D9C5E":e.type==="DataGrid"||e.type==="DataGrid2"?"#9333EA":e.type==="TemplateGrid"?"#FF7A50":e.type==="Gallery"?"#EC4899":"#666";
var dsColor=e.datasource==="Microflow"?"#9333EA":e.datasource==="Nanoflow"?"#2D9C5E":"#3B99FC";
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
if(e.datasource)panelHtml+='<div class="mxi-dp-entity-ds"><span style="color:'+dsColor+'">⚡</span> '+e.datasource+' data source</div>';
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
else if(typeof attrVal==="boolean")displayVal='<span style="color:'+(attrVal?"#2D9C5E":"#FF5A5A")+'">'+attrVal+'</span>';
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
var durColor=xhr.duration>1000?"#FF5A5A":xhr.duration>500?"#FF7A50":"#2D9C5E";
panelHtml+='<div class="mxi-dp-xhr"><span class="mxi-dp-xhr-dur" style="color:'+durColor+'">'+xhr.duration+'ms</span><span class="mxi-dp-xhr-url">'+xhr.url.split("/").pop().split("?")[0]+'</span></div>';
});
panelHtml+='</div></div>';
}
panelHtml+='</div>';
dataPanel.innerHTML=panelHtml;
/* Panel styles - updated with object browser styles */
var panelStyle=document.createElement("style");
panelStyle.id="mxi-data-panel-styles";
panelStyle.textContent='#mxi-data-panel{position:fixed;top:20px;left:20px;width:420px;max-height:90vh;background:#141414;border-radius:16px;box-shadow:0 0 0 1px #2E2E2E,0 25px 80px rgba(0,0,0,.6);font-family:Inter,system-ui,-apple-system,sans-serif;font-size:13px;z-index:999998;overflow:hidden;display:flex;flex-direction:column;animation:mxi-slide-in .2s ease-out}@keyframes mxi-slide-in{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}.mxi-dp-header{padding:16px 20px;border-bottom:1px solid #2E2E2E;display:flex;align-items:center;justify-content:space-between;background:#1A1A1A}.mxi-dp-title{display:flex;align-items:center;gap:10px;font-weight:600;font-size:14px;color:#fff}.mxi-dp-close{background:none;border:none;color:#666;cursor:pointer;padding:6px;border-radius:8px;display:flex;align-items:center;justify-content:center;transition:all .2s}.mxi-dp-close:hover{background:#2E2E2E;color:#fff}.mxi-dp-body{flex:1;overflow-y:auto;padding:16px}.mxi-dp-summary{display:flex;gap:12px;margin-bottom:16px}.mxi-dp-stat{flex:1;background:#1A1A1A;border-radius:12px;padding:16px;text-align:center;border:1px solid #2E2E2E}.mxi-dp-stat-value{font-size:28px;font-weight:700;color:#FFB800}.mxi-dp-stat-label{font-size:11px;color:#666;margin-top:4px;text-transform:uppercase;letter-spacing:.5px}.mxi-dp-section{margin-bottom:16px}.mxi-dp-section-title{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;display:flex;align-items:center;gap:8px}.mxi-dp-ds-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mxi-dp-ds-item{background:#1A1A1A;border-radius:10px;padding:12px;text-align:center;border:1px solid #2E2E2E}.mxi-dp-ds-value{font-size:24px;font-weight:700}.mxi-dp-ds-label{font-size:10px;color:#666;margin-top:4px;text-transform:uppercase}.mxi-dp-entity{background:#1A1A1A;border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid #2E2E2E;transition:all .2s}.mxi-dp-entity:hover{border-color:#3E3E3E}.mxi-dp-entity-expandable{cursor:pointer}.mxi-dp-entity-expandable:hover{transform:translateX(2px)}.mxi-dp-entity-header{display:flex;align-items:center;gap:12px}.mxi-dp-entity-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}.mxi-dp-entity-info{flex:1;min-width:0}.mxi-dp-entity-name{font-weight:600;color:#fff;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mxi-dp-entity-module{font-size:11px;color:#666;margin-top:2px}.mxi-dp-entity-meta{display:flex;flex-direction:column;align-items:flex-end;gap:4px}.mxi-dp-badge{padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600}.mxi-dp-type-badge{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.5px}.mxi-dp-entity-ds{margin-top:8px;padding-top:8px;border-top:1px solid #2E2E2E;font-size:11px;color:#9A9A9A}.mxi-dp-entity-widgets{margin-top:8px;padding-top:8px;border-top:1px solid #2E2E2E;display:flex;flex-wrap:wrap;gap:6px;align-items:center}.mxi-dp-widgets-label{font-size:10px;color:#666;margin-right:4px}.mxi-dp-widget-tag{background:#242424;color:#9A9A9A;padding:3px 8px;border-radius:4px;font-size:10px;font-family:monospace}.mxi-dp-widget-more{font-size:10px;color:#666}.mxi-dp-objects{margin-top:12px;padding-top:12px;border-top:1px solid #2E2E2E}.mxi-dp-objects-header{font-size:10px;color:#FFB800;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;display:flex;align-items:center;gap:6px}.mxi-dp-object{background:#0D0D0D;border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid #252525}.mxi-dp-object-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #252525}.mxi-dp-object-idx{color:#FFB800;font-weight:600;font-size:11px}.mxi-dp-object-guid{color:#666;font-family:monospace;font-size:10px}.mxi-dp-attrs{display:flex;flex-direction:column;gap:4px}.mxi-dp-attr{display:flex;justify-content:space-between;font-size:11px;padding:2px 0}.mxi-dp-attr-name{color:#9A9A9A;font-family:monospace}.mxi-dp-attr-val{color:#fff;font-family:monospace;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}.mxi-dp-empty{text-align:center;padding:40px 20px;color:#666}.mxi-dp-empty svg{color:#333;margin-bottom:12px}.mxi-dp-empty-sub{font-size:11px;color:#444;margin-top:8px;line-height:1.6}.mxi-dp-xhr-list{display:flex;flex-direction:column;gap:6px}.mxi-dp-xhr{display:flex;align-items:center;gap:10px;background:#1A1A1A;padding:8px 12px;border-radius:8px;font-size:11px;border:1px solid #2E2E2E}.mxi-dp-xhr-dur{font-weight:600;min-width:50px}.mxi-dp-xhr-url{color:#9A9A9A;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#mxi-data-panel ::-webkit-scrollbar{width:6px}#mxi-data-panel ::-webkit-scrollbar-track{background:#141414}#mxi-data-panel ::-webkit-scrollbar-thumb{background:#2E2E2E;border-radius:3px}';
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
widgetInspectTooltip.style.cssText="position:fixed;background:#141414;color:#fff;padding:16px 18px;border-radius:14px;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:999997;pointer-events:none;opacity:0;transition:opacity .15s;max-width:420px;min-width:320px;box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E";
document.body.appendChild(widgetInspectTooltip);
widgetInspectOutline=document.createElement("div");
widgetInspectOutline.id="mxi-widget-outline";
widgetInspectOutline.style.cssText="position:fixed;border:2px solid #FFB800;pointer-events:none;z-index:999996;transition:all .1s ease-out;opacity:0;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(255,184,0,.3)";
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
if(cn.indexOf("mx-listview")>-1)return{type:"ListView",icon:icon("list",18),color:"#2D9C5E"};
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
html+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid #2E2E2E;text-align:center;font-size:10px;color:#888;display:flex;align-items:center;justify-content:center;gap:6px">'+icon("cursor",14)+' Click to inspect</div>';
}else{
html+='<div style="margin-top:10px;padding-top:10px;border-top:1px solid #2E2E2E;text-align:center;font-size:10px;color:#555">No data available</div>';
}

/* Store hasData on the element for click handler */
widgetEl._mxiHasData=hasData;

widgetInspectTooltip.innerHTML=html;
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
widgetExpandedPanel.style.cssText="position:fixed;top:20px;right:475px;background:#141414;color:#fff;padding:0;border-radius:12px;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:12px;z-index:999998;width:360px;min-width:280px;max-width:600px;min-height:200px;max-height:calc(100vh - 40px);box-shadow:0 0 0 1px #2E2E2E,0 10px 40px rgba(0,0,0,.5);border:1px solid #2E2E2E;display:flex;flex-direction:column;overflow:hidden;resize:both";
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
content+='<span style="color:#777;font-family:monospace">'+shortName+'</span>';
content+='<span style="display:flex;align-items:center;gap:6px">';
if(hasValue){
content+='<span style="color:#2D9C5E;font-size:9px">✓</span>';
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
else if(typeof val==="boolean"){valStr=val?"true":"false";valColor=val?"#2D9C5E":"#FF7A50"}
else if(typeof val==="number"){valStr=String(val);valColor="#FFB800"}
else if(typeof val==="string"){valStr=val===""?'""':(val.length>40?'"'+val.substring(0,40)+'…"':'"'+val+'"');valColor="#9A9A9A"}
else if(Array.isArray(val)){valStr="["+val.length+"]";valColor="#3B99FC"}
else{valStr="[Object]";valColor="#3B99FC"}
content+='<div style="display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid #252525;font-size:10px">';
content+='<span style="color:#777;font-family:monospace">'+attr.name+'</span>';
content+='<span style="color:'+valColor+';font-family:monospace;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+String(val).replace(/"/g,"&quot;")+'">'+valStr+'</span>';
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
labelEl.style.cssText="position:absolute;top:-24px;left:0;background:"+color+";color:#000;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;white-space:nowrap;font-family:Inter,system-ui,sans-serif";
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
labelEl.style.cssText="position:absolute;top:-24px;left:0;background:"+color+";color:#000;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;white-space:nowrap;font-family:Inter,system-ui,sans-serif";
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
toast.style.cssText="position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:8px;font-size:12px;font-family:Inter,system-ui,sans-serif;z-index:999999;opacity:0;transition:opacity .2s";
toast.textContent=msg;
document.body.appendChild(toast);
setTimeout(function(){toast.style.opacity="1"},10);
setTimeout(function(){
toast.style.opacity="0";
setTimeout(function(){toast.remove()},200);
},2000);
}

/* Mousedown handler for INPUT widgets - fires before click/focus */
function handleWidgetInspectMousedown(e){
if(!widgetInspectActive)return;
var target=e.target;

console.log('[MXI Debug] mousedown/pointerdown on:', target.tagName, target.className);

/* Check if target or any ancestor is an input, select, textarea */
var isInput=target.tagName==="INPUT"||target.tagName==="SELECT"||target.tagName==="TEXTAREA";
/* Check if inside a tooltip wrapper (data-tooltip-*) */
var tooltipWrapper=target.closest('[data-tooltip-content],[data-tooltip-id]');
/* Check if target is inside a pluggable widget or mx-textbox */
var isTextbox=target.closest('.mx-textbox,.mx-textarea,.mx-dropdown');
var isPluggable=target.closest('[class*="widget-"]')||target.closest('[class*="pluggable"]');

console.log('[MXI Debug] isInput:', isInput, 'tooltipWrapper:', !!tooltipWrapper, 'isTextbox:', !!isTextbox, 'isPluggable:', !!isPluggable);

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
console.log('[MXI Debug] Found widgetEl:', widgetEl?widgetEl.className:'null');
if(widgetEl){
/* Manually trigger our inspection logic */
performWidgetInspection(widgetEl);
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
var target=e.target;
if(target.tagName==="INPUT"||target.tagName==="SELECT"||target.tagName==="TEXTAREA"||target.closest('[data-tooltip-id]')){
console.log('[MXI Global] Intercepted:', target.tagName);
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

/* Open/update expanded panel */
createExpandedPanel(widgetEl,wn,wt,entity,attributes,associations,parentContainer,mxObject);
}

/* Click handler for widget inspect */
function handleWidgetInspectClick(e){
if(!widgetInspectActive)return;

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

/* Create/update panel */
createExpandedPanel(widgetEl,wn,wt,entity,attributes,associations,parentContainer,mxObject);
}

function toggleWidgetInspectMode(){
var btn=document.getElementById("mxi-widget-inspect-btn");
if(!btn)return;
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
btn.style.background=k;
btn.style.color=w;
btn.innerHTML=icon("crosshair",16)+' ON';
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
}else{
document.removeEventListener("mousemove",handleWidgetInspectHover,true);
document.removeEventListener("mouseout",handleWidgetInspectOut,true);
document.removeEventListener("click",handleWidgetInspectClick,true);
document.removeEventListener("mousedown",handleWidgetInspectMousedown,true);
document.removeEventListener("pointerdown",handleWidgetInspectMousedown,true);
removeGlobalInputInterceptor();
closeExpandedPanel();
destroyWidgetInspectElements();
btn.style.background="";
btn.style.color="";
btn.innerHTML=icon("crosshair",16)+' Inspect';
document.body.style.cursor="";
if(widgetInspectCloseBtn)widgetInspectCloseBtn.style.display="none";
}
}

var widgetInspectBtn=document.getElementById("mxi-widget-inspect-btn");
if(widgetInspectBtn)widgetInspectBtn.onclick=toggleWidgetInspectMode;

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

function checkForChanges(){var curPage=getCurrentPage(),curWidgets=document.querySelectorAll('[class*="mx-name-"]').length;if(curPage!==lastPage||Math.abs(curWidgets-lastWidgets)>50){console.log("%c Inspector: Refreshing... ","background:#0595DB;color:white");lastPage=curPage;lastWidgets=curWidgets;refresh()}}
function refresh(){cleanup();clearHighlights();if(clearBtn.parentNode)clearBtn.remove();A.remove();setTimeout(function(){if(window.__mxInspectorRun)window.__mxInspectorRun()},300)}
function onNav(){setTimeout(checkForChanges,300)}

window.addEventListener("hashchange",onNav);
window.addEventListener("popstate",onNav);
var checkInterval=setInterval(checkForChanges,2000);

var observer=null;
try{var target=document.querySelector('.mx-page,[class*="mx-name-page"],#content');if(target){observer=new MutationObserver(function(mutations){if(mutations.some(function(m){return m.addedNodes.length>3||m.removedNodes.length>3}))setTimeout(checkForChanges,200)});observer.observe(target,{childList:true,subtree:true})}}catch(x){}

function cleanup(){window.removeEventListener("hashchange",onNav);window.removeEventListener("popstate",onNav);clearInterval(checkInterval);if(observer)observer.disconnect()}

}();
// MxInspector Background Service Worker v1.3 (extension v0.2.0)
// Handles extension icon click and injects inspector scripts into page.
// v0.2.0: adds layer-stack module and enhanced Data Panel.

chrome.action.onClicked.addListener(async (tab) => {
  // Don't run on chrome:// or edge:// pages
  if (tab.url.startsWith('chrome://') ||
      tab.url.startsWith('chrome-extension://') ||
      tab.url.startsWith('edge://') ||
      tab.url.startsWith('about:')) {
    console.log('MxInspector: Cannot run on browser pages');
    return;
  }

  try {
    // 1. Data extractor — provides React Fiber extraction
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/mx-data-extractor.js'],
      world: 'MAIN'
    });

    // Small delay to ensure extractor is ready
    await new Promise(resolve => setTimeout(resolve, 50));

    // 2. v0.2.0 support modules (loaded BEFORE inspector.js so inspector
    //    can reference window.__MxLayerStack / window.__MxDataPanel / 
    //    window.__MxSecurity if present)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [
        'content/mxi-layer-stack.js',
        'content/mxi-data-panel.js',
        'content/mxi-security.js'
      ],
      world: 'MAIN'
    });

    // 3. Main inspector UI
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/inspector.js'],
      world: 'MAIN'
    });

    console.log('MxInspector v0.2.43: Injected successfully');
  } catch (error) {
    console.error('MxInspector: Failed to inject', error);
  }
});

// MxInspector Background Service Worker v1.2
// Handles extension icon click and injects inspector directly into page
// Now with React client support via data extractor

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
    // First inject the data extractor (provides React Fiber extraction)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/mx-data-extractor.js'],
      world: 'MAIN'
    });
    
    // Small delay to ensure data extractor is ready
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Then inject the inspector script
    // Uses world: 'MAIN' to access window.mx and the data extractor
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content/inspector.js'],
      world: 'MAIN'
    });
    
    console.log('MxInspector: Injected successfully (React + Dojo support)');
  } catch (error) {
    console.error('MxInspector: Failed to inject', error);
  }
});

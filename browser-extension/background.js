// AutoApply Pro Background Script
chrome.runtime.onInstalled.addListener(() => {
  console.log('AutoApply Pro extension installed');
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'updateStatus':
      // Store connection status
      chrome.storage.local.set({
        connected: request.connected,
        statusMessage: request.message
      });
      break;
      
    case 'showDetectedFields':
      // Store detected fields for popup
      chrome.storage.local.set({
        detectedFields: request.fields
      });
      break;
      
    case 'showGeneratedResponse':
      // Store generated response for popup
      chrome.storage.local.set({
        generatedResponse: request.response
      });
      break;
  }
});

// Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const jobSites = [
      'linkedin.com/jobs',
      'indeed.com',
      'glassdoor.com',
      'workday.com',
      'greenhouse.io',
      'lever.co'
    ];
    
    const isJobSite = jobSites.some(site => tab.url.includes(site));
    
    if (isJobSite) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(err => {
        console.log('Content script already injected or failed to inject:', err);
      });
    }
  }
});
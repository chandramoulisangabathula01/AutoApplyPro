// AutoApply Pro Background Script
chrome.runtime.onInstalled.addListener(() => {
  console.log('AutoApply Pro extension installed');
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'checkConnection':
      // Check if user is authenticated with AutoApply Pro
      fetch('https://autoapply-pro.replit.app/api/auth/user', {
        credentials: 'include'
      })
      .then(response => {
        if (response.ok) {
          sendResponse({ connected: true, message: 'Connected to AutoApply Pro' });
        } else {
          sendResponse({ connected: false, message: 'Please log in to AutoApply Pro' });
        }
      })
      .catch(() => {
        sendResponse({ connected: false, message: 'Cannot connect to AutoApply Pro' });
      });
      return true; // Keep message channel open for async response
      
    case 'openApp':
      chrome.tabs.create({ url: 'https://autoapply-pro.replit.app' });
      break;
  }
});

// Context menu for quick access
chrome.contextMenus.create({
  id: 'autoapply-detect',
  title: 'Detect Job Application Form',
  contexts: ['page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'autoapply-detect') {
    chrome.tabs.sendMessage(tab.id, { action: 'detectForm' });
  }
});
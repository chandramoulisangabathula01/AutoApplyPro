// AutoApply Pro Content Script
(function() {
  'use strict';

  const APP_URL = 'https://autoapply-pro.replit.app'; // Update with your actual domain
  let detectedFields = [];
  let userProfile = null;

  // Initialize extension
  init();

  function init() {
    console.log('AutoApply Pro extension loaded');
    loadUserProfile();
    createFloatingButton();
  }

  // Load user profile from the main application
  async function loadUserProfile() {
    try {
      const response = await fetch(`${APP_URL}/api/auth/user`, {
        credentials: 'include'
      });
      if (response.ok) {
        userProfile = await response.json();
        console.log('User profile loaded:', userProfile);
      }
    } catch (error) {
      console.warn('Could not load user profile:', error);
    }
  }

  // Create floating action button
  function createFloatingButton() {
    const button = document.createElement('div');
    button.id = 'autoapply-fab';
    button.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: #2563eb;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        color: white;
        font-weight: bold;
        font-size: 18px;
        transition: all 0.3s ease;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        AA
      </div>
    `;
    
    button.addEventListener('click', () => {
      detectApplicationForm();
    });
    
    document.body.appendChild(button);
  }

  // Detect job application forms on the page
  function detectApplicationForm() {
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, textarea, select');
    
    detectedFields = [];
    
    inputs.forEach(input => {
      const fieldInfo = analyzeField(input);
      if (fieldInfo.type !== 'unknown') {
        detectedFields.push(fieldInfo);
      }
    });

    if (detectedFields.length > 0) {
      showDetectionResults();
      highlightDetectedFields();
    } else {
      alert('No job application form detected on this page.');
    }
  }

  // Analyze individual form field
  function analyzeField(element) {
    const label = getFieldLabel(element);
    const name = element.name || element.id || '';
    const placeholder = element.placeholder || '';
    const type = element.type || 'text';
    
    const allText = (label + ' ' + name + ' ' + placeholder).toLowerCase();
    
    let fieldType = 'unknown';
    
    // Common job application field patterns
    if (allText.includes('name') && !allText.includes('company')) {
      fieldType = 'fullName';
    } else if (allText.includes('email')) {
      fieldType = 'email';
    } else if (allText.includes('phone')) {
      fieldType = 'phone';
    } else if (allText.includes('resume') || allText.includes('cv')) {
      fieldType = 'resume';
    } else if (allText.includes('cover letter')) {
      fieldType = 'coverLetter';
    } else if (allText.includes('linkedin')) {
      fieldType = 'linkedin';
    } else if (allText.includes('experience')) {
      fieldType = 'experience';
    } else if (allText.includes('skill')) {
      fieldType = 'skills';
    } else if (allText.includes('why') && (allText.includes('company') || allText.includes('position'))) {
      fieldType = 'motivation';
    } else if (allText.includes('salary')) {
      fieldType = 'salary';
    } else if (allText.includes('location') || allText.includes('address')) {
      fieldType = 'location';
    }

    return {
      element,
      type: fieldType,
      label,
      name,
      placeholder
    };
  }

  // Get field label
  function getFieldLabel(element) {
    // Try to find associated label
    let label = '';
    
    if (element.id) {
      const labelElement = document.querySelector(`label[for="${element.id}"]`);
      if (labelElement) {
        label = labelElement.textContent.trim();
      }
    }
    
    if (!label) {
      // Look for nearby text that might be a label
      const parent = element.parentElement;
      if (parent) {
        const prevSibling = element.previousElementSibling;
        if (prevSibling && prevSibling.tagName === 'LABEL') {
          label = prevSibling.textContent.trim();
        } else {
          // Look for text content in parent
          const textNodes = parent.childNodes;
          for (let node of textNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              label = node.textContent.trim();
              break;
            }
          }
        }
      }
    }
    
    return label;
  }

  // Highlight detected fields
  function highlightDetectedFields() {
    detectedFields.forEach(field => {
      field.element.style.boxShadow = '0 0 5px #2563eb';
      field.element.style.border = '2px solid #2563eb';
    });
  }

  // Show detection results
  function showDetectionResults() {
    const overlay = document.createElement('div');
    overlay.id = 'autoapply-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        ">
          <h2 style="margin-top: 0; color: #1f2937;">Form Detected!</h2>
          <p style="color: #6b7280;">Found ${detectedFields.length} application fields:</p>
          <ul style="color: #374151; margin: 15px 0;">
            ${detectedFields.map(field => `<li>${field.label || field.name} (${field.type})</li>`).join('')}
          </ul>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="autofill-btn" style="
              flex: 1;
              padding: 12px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
            ">Auto Fill</button>
            <button id="close-overlay" style="
              flex: 1;
              padding: 12px;
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
            ">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('autofill-btn').addEventListener('click', () => {
      fillApplicationForm();
      document.body.removeChild(overlay);
    });
    
    document.getElementById('close-overlay').addEventListener('click', () => {
      document.body.removeChild(overlay);
      clearHighlights();
    });
  }

  // Fill the application form with user data
  function fillApplicationForm() {
    if (!userProfile) {
      alert('Please log in to AutoApply Pro to use auto-fill.');
      return;
    }

    detectedFields.forEach(field => {
      const { element, type } = field;
      let value = '';

      switch (type) {
        case 'fullName':
          value = userProfile.fullName || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
          break;
        case 'email':
          value = userProfile.email || '';
          break;
        case 'phone':
          value = userProfile.phone || '';
          break;
        case 'linkedin':
          value = userProfile.linkedin || '';
          break;
        case 'location':
          value = userProfile.preferredLocations || '';
          break;
        case 'skills':
          value = userProfile.skills ? userProfile.skills.join(', ') : '';
          break;
        case 'experience':
          value = userProfile.experience || '';
          break;
      }

      if (value && element.type !== 'file') {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    clearHighlights();
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10002;
        font-weight: 500;
      ">
        ✓ Form filled successfully!
      </div>
    `;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      if (document.body.contains(successMsg)) {
        document.body.removeChild(successMsg);
      }
    }, 3000);
  }

  // Clear field highlights
  function clearHighlights() {
    detectedFields.forEach(field => {
      field.element.style.boxShadow = '';
      field.element.style.border = '';
    });
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'detectForm':
        detectApplicationForm();
        sendResponse({ detected: detectedFields.length > 0, fields: detectedFields.length });
        break;
      case 'autoFill':
        fillApplicationForm();
        sendResponse({ success: true });
        break;
      case 'generateResponse':
        generateAIResponse(request.question);
        break;
    }
  });

  // Generate AI response for application questions
  async function generateAIResponse(question) {
    try {
      const response = await fetch(`${APP_URL}/api/ai/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          question: question || 'Why do you want to work at this company?',
          jobTitle: extractJobTitle(),
          company: extractCompanyName()
        })
      });

      if (response.ok) {
        const data = await response.json();
        showGeneratedResponse(data.response);
      } else {
        alert('Please log in to AutoApply Pro to use AI features.');
      }
    } catch (error) {
      console.error('Error generating response:', error);
      alert('Error generating response. Please try again.');
    }
  }

  // Extract job title from page
  function extractJobTitle() {
    const selectors = [
      'h1', '.job-title', '.position-title', '[data-testid="job-title"]'
    ];
    
    for (let selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    return document.title;
  }

  // Extract company name from page
  function extractCompanyName() {
    const selectors = [
      '.company-name', '.employer-name', '[data-testid="company-name"]'
    ];
    
    for (let selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    return window.location.hostname;
  }

  // Show generated AI response
  function showGeneratedResponse(responseText) {
    const overlay = document.createElement('div');
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        ">
          <h2 style="margin-top: 0; color: #1f2937;">Generated Response</h2>
          <div style="
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            white-space: pre-wrap;
            line-height: 1.6;
            color: #374151;
          ">${responseText}</div>
          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="copy-response" style="
              flex: 1;
              padding: 12px;
              background: #2563eb;
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
            ">Copy Response</button>
            <button id="close-response" style="
              flex: 1;
              padding: 12px;
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
            ">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    document.getElementById('copy-response').addEventListener('click', () => {
      navigator.clipboard.writeText(responseText).then(() => {
        document.getElementById('copy-response').textContent = 'Copied!';
        setTimeout(() => {
          if (document.getElementById('copy-response')) {
            document.getElementById('copy-response').textContent = 'Copy Response';
          }
        }, 2000);
      });
    });
    
    document.getElementById('close-response').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  }

})();
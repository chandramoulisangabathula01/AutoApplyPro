// AutoApply Pro Browser Extension - Popup Script

let isConnected = false;
let userProfile = null;
const API_BASE = 'https://your-app-domain.replit.app'; // Update with actual domain

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await checkConnection();
  setupEventListeners();
  await detectJobApplicationForm();
});

// Check connection to main app
async function checkConnection() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/user`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      userProfile = await response.json();
      isConnected = true;
      updateConnectionStatus(true, `Connected as ${userProfile.email}`);
      document.getElementById('autoFillBtn').disabled = false;
    } else {
      updateConnectionStatus(false, 'Not logged in to AutoApply Pro');
    }
  } catch (error) {
    updateConnectionStatus(false, 'Connection failed');
  }
}

// Update connection status display
function updateConnectionStatus(connected, message) {
  const dot = document.getElementById('connectionDot');
  const status = document.getElementById('connectionStatus');
  const userInfo = document.getElementById('userInfo');
  
  dot.className = `dot ${connected ? 'connected' : 'disconnected'}`;
  status.textContent = connected ? 'Connected' : 'Disconnected';
  userInfo.textContent = message;
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('autoFillBtn').addEventListener('click', autoFillApplication);
  document.getElementById('generateResponseBtn').addEventListener('click', showResponseForm);
  document.getElementById('generateBtn').addEventListener('click', generateAIResponse);
  document.getElementById('cancelBtn').addEventListener('click', hideResponseForm);
  document.getElementById('copyResponseBtn').addEventListener('click', copyResponse);
}

// Detect job application form on current page
async function detectJobApplicationForm() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: detectFormFields
    });
    
    if (results[0].result && results[0].result.length > 0) {
      showDetectedFields(results[0].result);
    }
  } catch (error) {
    console.log('Could not detect form fields:', error);
  }
}

// Function to inject into page to detect form fields
function detectFormFields() {
  const formFields = [];
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea, select');
    inputs.forEach(input => {
      const label = getFieldLabel(input);
      if (label && isJobApplicationField(label)) {
        formFields.push({
          type: input.tagName.toLowerCase(),
          label: label,
          id: input.id,
          name: input.name,
          placeholder: input.placeholder
        });
      }
    });
  });
  
  return formFields;
}

// Get label for form field
function getFieldLabel(input) {
  // Try to find label by for attribute
  const labelFor = document.querySelector(`label[for="${input.id}"]`);
  if (labelFor) return labelFor.textContent.trim();
  
  // Try to find parent label
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent.trim();
  
  // Try to find preceding label
  const prevLabel = input.previousElementSibling;
  if (prevLabel && prevLabel.tagName === 'LABEL') {
    return prevLabel.textContent.trim();
  }
  
  // Use placeholder or name as fallback
  return input.placeholder || input.name || '';
}

// Check if field is related to job applications
function isJobApplicationField(label) {
  const jobKeywords = [
    'name', 'email', 'phone', 'resume', 'cover letter', 'experience',
    'skills', 'education', 'why', 'interested', 'motivation', 'background',
    'qualification', 'portfolio', 'linkedin', 'github', 'salary', 'availability'
  ];
  
  return jobKeywords.some(keyword => 
    label.toLowerCase().includes(keyword)
  );
}

// Show detected form fields
function showDetectedFields(fields) {
  const container = document.getElementById('detectedFields');
  const list = document.getElementById('detectedFieldsList');
  
  if (fields.length > 0) {
    list.innerHTML = fields.map(field => 
      `<div class="detected-field">${field.label}</div>`
    ).join('');
    container.style.display = 'block';
  }
}

// Auto-fill application form
async function autoFillApplication() {
  if (!isConnected || !userProfile) {
    alert('Please log in to AutoApply Pro first');
    return;
  }
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: fillFormFields,
      args: [userProfile]
    });
    
    alert('Form fields filled successfully!');
  } catch (error) {
    alert('Error filling form: ' + error.message);
  }
}

// Function to inject into page to fill form fields
function fillFormFields(profile) {
  const fieldMappings = {
    // Name fields
    'name': profile.fullName || `${profile.firstName} ${profile.lastName}`,
    'full name': profile.fullName || `${profile.firstName} ${profile.lastName}`,
    'first name': profile.firstName,
    'last name': profile.lastName,
    
    // Contact fields
    'email': profile.email,
    'phone': profile.phone,
    'linkedin': profile.linkedin,
    
    // Professional fields
    'skills': profile.skills?.join(', '),
    'experience': 'Please see attached resume for detailed experience',
    'background': 'Please refer to my resume for my professional background',
    'qualification': 'Please see my resume for relevant qualifications'
  };
  
  const inputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
  
  inputs.forEach(input => {
    const label = getFieldLabel(input)?.toLowerCase() || '';
    
    for (const [key, value] of Object.entries(fieldMappings)) {
      if (label.includes(key) && value) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
  });
}

// Show response generation form
function showResponseForm() {
  document.getElementById('responseForm').style.display = 'block';
}

// Hide response generation form
function hideResponseForm() {
  document.getElementById('responseForm').style.display = 'none';
  document.getElementById('generatedResponse').style.display = 'none';
}

// Generate AI response
async function generateAIResponse() {
  if (!isConnected) {
    alert('Please log in to AutoApply Pro first');
    return;
  }
  
  const question = document.getElementById('question').value;
  const jobTitle = document.getElementById('jobTitle').value;
  const company = document.getElementById('company').value;
  
  if (!question.trim()) {
    alert('Please enter a question');
    return;
  }
  
  try {
    document.getElementById('generateBtn').textContent = 'Generating...';
    document.getElementById('generateBtn').disabled = true;
    
    const response = await fetch(`${API_BASE}/api/ai/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        question,
        jobTitle,
        company
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      showGeneratedResponse(data.response);
    } else {
      alert('Error generating response. Please try again.');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  } finally {
    document.getElementById('generateBtn').textContent = 'Generate Response';
    document.getElementById('generateBtn').disabled = false;
  }
}

// Show generated response
function showGeneratedResponse(responseText) {
  document.getElementById('responseText').textContent = responseText;
  document.getElementById('generatedResponse').style.display = 'block';
}

// Copy response to clipboard
async function copyResponse() {
  const responseText = document.getElementById('responseText').textContent;
  
  try {
    await navigator.clipboard.writeText(responseText);
    const button = document.getElementById('copyResponseBtn');
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  } catch (error) {
    alert('Could not copy to clipboard');
  }
}
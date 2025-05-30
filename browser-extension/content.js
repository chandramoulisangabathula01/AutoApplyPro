// AutoApply Pro Content Script
class AutoApplyContent {
  constructor() {
    this.serverUrl = 'https://autoapply-pro.replit.app'; // Replace with your actual domain
    this.userProfile = null;
    this.detectedFields = [];
    this.init();
  }

  async init() {
    console.log('AutoApply Pro extension loaded');
    this.addAutoApplyButton();
    await this.checkAuthentication();
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'detectForm':
          this.detectJobApplicationForm();
          sendResponse({ success: true });
          break;
        case 'fillForm':
          this.autoFillApplication();
          sendResponse({ success: true });
          break;
        case 'generateResponse':
          this.generateAIResponse(request.data);
          sendResponse({ success: true });
          break;
      }
    });
  }

  async checkAuthentication() {
    try {
      const response = await fetch(`${this.serverUrl}/api/auth/user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        this.userProfile = await response.json();
        this.updateConnectionStatus(true, 'Connected to AutoApply Pro');
      } else {
        this.updateConnectionStatus(false, 'Please log in to AutoApply Pro');
      }
    } catch (error) {
      this.updateConnectionStatus(false, 'Connection failed');
    }
  }

  updateConnectionStatus(connected, message) {
    chrome.runtime.sendMessage({
      action: 'updateStatus',
      connected,
      message
    });
  }

  addAutoApplyButton() {
    // Add a floating button for quick access
    const button = document.createElement('div');
    button.id = 'autoapply-floating-btn';
    button.innerHTML = '🚀';
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;
    
    button.addEventListener('click', () => {
      this.detectJobApplicationForm();
    });
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(button);
  }

  detectJobApplicationForm() {
    this.detectedFields = [];
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const fields = this.detectFormFields(form);
      this.detectedFields.push(...fields);
    });

    // Also check for standalone input fields
    const standaloneFields = this.detectFormFields(document.body);
    this.detectedFields.push(...standaloneFields);

    this.highlightDetectedFields();
    this.showDetectedFields();
    
    return this.detectedFields;
  }

  detectFormFields(container) {
    const fields = [];
    const inputs = container.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const fieldType = this.identifyFieldType(input);
      if (fieldType) {
        fields.push({
          element: input,
          type: fieldType,
          label: this.getFieldLabel(input),
          value: input.value || '',
          filled: !!input.value
        });
      }
    });
    
    return fields;
  }

  identifyFieldType(input) {
    const label = this.getFieldLabel(input).toLowerCase();
    const id = input.id?.toLowerCase() || '';
    const name = input.name?.toLowerCase() || '';
    const placeholder = input.placeholder?.toLowerCase() || '';
    const type = input.type?.toLowerCase() || '';
    
    const allText = `${label} ${id} ${name} ${placeholder}`.toLowerCase();
    
    // Job application field patterns
    const patterns = {
      firstName: /first.?name|given.?name|fname/,
      lastName: /last.?name|family.?name|surname|lname/,
      fullName: /full.?name|name/,
      email: /email|e-mail/,
      phone: /phone|telephone|mobile|cell/,
      resume: /resume|cv|curriculum/,
      coverLetter: /cover.?letter|motivation|letter/,
      experience: /experience|years/,
      skills: /skills|technologies|competenc/,
      education: /education|degree|university|school/,
      linkedin: /linkedin|profile/,
      portfolio: /portfolio|website|github/,
      salary: /salary|compensation|pay/,
      location: /location|address|city|state/,
      availability: /availability|start.?date|notice/,
      visa: /visa|authorization|eligibility|sponsor/,
      why: /why|interest|motivation|reason/,
      questions: /question|additional|comment|note/
    };
    
    for (const [fieldType, pattern] of Object.entries(patterns)) {
      if (pattern.test(allText) || pattern.test(type)) {
        return fieldType;
      }
    }
    
    return null;
  }

  getFieldLabel(input) {
    // Try different methods to get field label
    let label = '';
    
    // Check for associated label
    if (input.id) {
      const labelElement = document.querySelector(`label[for="${input.id}"]`);
      if (labelElement) {
        label = labelElement.textContent.trim();
      }
    }
    
    // Check parent elements for label text
    if (!label) {
      let parent = input.parentElement;
      let depth = 0;
      while (parent && depth < 3) {
        const labelInParent = parent.querySelector('label');
        if (labelInParent) {
          label = labelInParent.textContent.trim();
          break;
        }
        
        // Check for text content in parent
        const textContent = parent.textContent.trim();
        if (textContent.length < 100 && textContent.includes(':')) {
          label = textContent.split(':')[0].trim();
          break;
        }
        
        parent = parent.parentElement;
        depth++;
      }
    }
    
    // Fallback to placeholder or name
    if (!label) {
      label = input.placeholder || input.name || input.id || 'Unknown field';
    }
    
    return label;
  }

  highlightDetectedFields() {
    // Remove previous highlights
    document.querySelectorAll('.autoapply-highlight').forEach(el => {
      el.classList.remove('autoapply-highlight');
    });
    
    // Add highlights to detected fields
    this.detectedFields.forEach(field => {
      field.element.classList.add('autoapply-highlight');
    });
  }

  showDetectedFields() {
    chrome.runtime.sendMessage({
      action: 'showDetectedFields',
      fields: this.detectedFields.map(field => ({
        type: field.type,
        label: field.label,
        filled: field.filled
      }))
    });
  }

  async autoFillApplication() {
    if (!this.userProfile) {
      alert('Please log in to AutoApply Pro first');
      return;
    }

    const fieldMapping = {
      firstName: this.userProfile.firstName,
      lastName: this.userProfile.lastName,
      fullName: this.userProfile.fullName || `${this.userProfile.firstName} ${this.userProfile.lastName}`,
      email: this.userProfile.email,
      phone: this.userProfile.phone,
      linkedin: this.userProfile.linkedin,
      portfolio: this.userProfile.portfolio,
      location: this.userProfile.location,
      experience: this.userProfile.experience?.toString(),
      skills: Array.isArray(this.userProfile.skills) ? this.userProfile.skills.join(', ') : this.userProfile.skills,
      education: this.userProfile.education
    };

    let filledCount = 0;
    
    this.detectedFields.forEach(field => {
      const value = fieldMapping[field.type];
      if (value && !field.element.value) {
        this.fillField(field.element, value);
        filledCount++;
      }
    });

    this.showNotification(`Auto-filled ${filledCount} fields`);
  }

  fillField(element, value) {
    // Simulate human-like typing
    element.focus();
    element.value = value;
    
    // Trigger events to ensure the field is properly updated
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  async generateAIResponse(data) {
    try {
      const response = await fetch(`${this.serverUrl}/api/ai/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          question: data.question,
          jobTitle: data.jobTitle,
          company: data.company,
          jobDescription: this.extractJobDescription()
        })
      });

      if (response.ok) {
        const result = await response.json();
        chrome.runtime.sendMessage({
          action: 'showGeneratedResponse',
          response: result.response
        });
      } else {
        throw new Error('Failed to generate response');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      chrome.runtime.sendMessage({
        action: 'showError',
        message: 'Failed to generate AI response'
      });
    }
  }

  extractJobDescription() {
    // Try to extract job description from the page
    const selectors = [
      '.job-description',
      '.job-details',
      '.description',
      '[data-testid="job-description"]',
      '.jobs-description'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }
    
    return '';
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Initialize the content script
new AutoApplyContent();
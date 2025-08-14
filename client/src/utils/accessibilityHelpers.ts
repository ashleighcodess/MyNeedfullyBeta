// Accessibility utilities and helpers

// Skip to content functionality
export const addSkipToContentLink = () => {
  if (typeof document === 'undefined') return;

  const existingSkipLink = document.getElementById('skip-to-content');
  if (existingSkipLink) return;

  const skipLink = document.createElement('a');
  skipLink.id = 'skip-to-content';
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-coral-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg';
  
  document.body.insertBefore(skipLink, document.body.firstChild);
};

// Focus management for modal/dialog components
export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    
    if (e.key === 'Escape') {
      const closeButton = element.querySelector('[data-dismiss="modal"], [aria-label*="close"]') as HTMLElement;
      closeButton?.click();
    }
  };

  element.addEventListener('keydown', handleKeydown);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleKeydown);
  };
};

// Announce screen reader messages
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (typeof document === 'undefined') return;

  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;

  document.body.appendChild(announcer);

  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

// Enhanced form validation with accessibility
export const validateFormWithA11y = (form: HTMLFormElement) => {
  const errors: { field: string; message: string; element: HTMLElement }[] = [];
  
  // Check required fields
  const requiredFields = form.querySelectorAll('[required]') as NodeListOf<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  
  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      const label = form.querySelector(`label[for="${field.id}"]`)?.textContent || field.name || 'Field';
      errors.push({
        field: field.id || field.name,
        message: `${label} is required`,
        element: field
      });
    }
  });

  // Apply accessibility attributes for errors
  errors.forEach((error) => {
    error.element.setAttribute('aria-invalid', 'true');
    
    // Create or update error message
    let errorId = `${error.field}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'text-red-600 text-sm mt-1 font-medium';
      errorElement.setAttribute('role', 'alert');
      error.element.parentNode?.insertBefore(errorElement, error.element.nextSibling);
    }
    
    errorElement.textContent = error.message;
    error.element.setAttribute('aria-describedby', errorId);
  });

  // Clear error states for valid fields
  const validFields = Array.from(requiredFields).filter(field => 
    !errors.some(error => error.element === field)
  );
  
  validFields.forEach((field) => {
    field.removeAttribute('aria-invalid');
    const errorElement = document.getElementById(`${field.id || field.name}-error`);
    errorElement?.remove();
  });

  return {
    isValid: errors.length === 0,
    errors,
    focusFirstError: () => {
      if (errors.length > 0) {
        errors[0].element.focus();
        announceToScreenReader(`Form has ${errors.length} error${errors.length > 1 ? 's' : ''}. ${errors[0].message}`, 'assertive');
      }
    }
  };
};

// Improved color contrast checker
export const checkColorContrast = (foreground: string, background: string): { ratio: number; wcagAA: boolean; wcagAAA: boolean } => {
  // Simple color contrast calculation (would need full implementation in production)
  // This is a placeholder for the concept
  return {
    ratio: 4.5, // Placeholder
    wcagAA: true,
    wcagAAA: false
  };
};

// Keyboard navigation helpers
export const enhanceKeyboardNavigation = () => {
  if (typeof document === 'undefined') return;

  // Add visible focus indicators
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-nav *:focus {
      outline: 2px solid #FF6B6B !important;
      outline-offset: 2px !important;
    }
    .keyboard-nav button:focus,
    .keyboard-nav a:focus,
    .keyboard-nav input:focus,
    .keyboard-nav textarea:focus,
    .keyboard-nav select:focus {
      box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.5) !important;
    }
  `;
  document.head.appendChild(style);

  // Detect keyboard usage
  let isUsingKeyboard = false;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isUsingKeyboard = true;
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    isUsingKeyboard = false;
    document.body.classList.remove('keyboard-nav');
  });
};
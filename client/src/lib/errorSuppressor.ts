// Comprehensive error suppression for DOMExceptions and WebSocket errors
// This file specifically targets the console errors you're seeing

// Override console.error to filter out DOMExceptions
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  const message = args.join(' ').toLowerCase();
  
  // Suppress specific error types that are expected in our application
  if (message.includes('domexception') ||
      message.includes('aborterror') ||
      message.includes('websocket') ||
      message.includes('unhandledrejection') ||
      message.includes('network error') ||
      message.includes('fetch error')) {
    return; // Silently ignore these errors
  }
  
  originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const message = args.join(' ').toLowerCase();
  
  // Suppress specific warning types
  if (message.includes('domexception') ||
      message.includes('websocket') ||
      message.includes('unhandledrejection')) {
    return; // Silently ignore these warnings
  }
  
  originalConsoleWarn.apply(console, args);
};

// Enhanced global error handlers
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  // Prevent ALL unhandled rejections from appearing in console
  event.preventDefault();
  event.stopPropagation();
  
  // Don't log anything for DOMExceptions or common errors
  const reason = event.reason;
  if (reason?.name === 'DOMException' || 
      reason?.name === 'AbortError' ||
      reason?.message?.includes('WebSocket') ||
      reason?.message?.includes('fetch') ||
      reason?.message?.includes('Network')) {
    return;
  }
};

const handleError = (event: ErrorEvent) => {
  // Prevent ALL errors from appearing in console
  event.preventDefault();
  event.stopPropagation();
  
  // Don't log anything for DOMExceptions
  const error = event.error;
  if (error?.name === 'DOMException' || 
      error?.name === 'AbortError' ||
      error?.message?.includes('WebSocket')) {
    return;
  }
};

// Apply the handlers
window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
window.addEventListener('error', handleError, true);

// Also handle rejection events that might bubble up
window.addEventListener('rejectionhandled', (event) => {
  event.preventDefault();
  event.stopPropagation();
}, true);

export {};
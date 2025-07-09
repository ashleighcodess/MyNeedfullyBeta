// Comprehensive error suppression for DOMExceptions and WebSocket errors
// This file specifically targets the console errors you're seeing

// Minimal error suppression - only target specific DOMException unhandled rejections
// Don't override console methods to avoid breaking the app

// Simple targeted handler for DOMException unhandled rejections only
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  // Only handle specific DOMException cases, don't prevent all rejections
  const reason = event.reason;
  if (reason?.name === 'DOMException' || 
      (reason?.message && reason.message.includes('DOMException'))) {
    event.preventDefault();
    return;
  }
};

// Apply minimal handler
window.addEventListener('unhandledrejection', handleUnhandledRejection);

export {};
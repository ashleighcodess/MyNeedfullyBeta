import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorSuppressor"; // Import comprehensive error suppression

// Global error handlers to prevent unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  // Handle ALL unhandled rejections silently to clean console
  event.preventDefault();
  
  // Only log significant errors, not DOMExceptions or WebSocket issues
  if (event.reason?.name !== 'DOMException' && 
      event.reason?.name !== 'AbortError' &&
      !event.reason?.message?.includes('WebSocket') &&
      !event.reason?.message?.includes('NetworkError') &&
      !event.reason?.message?.includes('fetch')) {
    console.warn('Unhandled rejection:', event.reason);
  }
});

window.addEventListener('error', (event) => {
  // Handle ALL errors silently to clean console
  event.preventDefault();
  
  // Only log significant errors, not DOMExceptions or WebSocket issues
  if (event.error?.name !== 'DOMException' && 
      event.error?.name !== 'AbortError' &&
      !event.error?.message?.includes('WebSocket') &&
      !event.error?.message?.includes('NetworkError')) {
    console.warn('Global error:', event.error);
  }
});

const startApp = async () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Error starting React app:", error);
    document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif; color: #dc2626;"><h1>MyNeedfully</h1><p>Loading application...</p><div style="margin-top: 20px; padding: 10px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">If this persists, please refresh the page.</div></div>`;
  }
};

startApp();

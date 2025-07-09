import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers to prevent unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  // Specifically handle DOMException and other common errors
  if (event.reason?.name === 'DOMException' || 
      event.reason?.message?.includes('AbortError') ||
      event.reason?.message?.includes('NetworkError') ||
      event.reason?.message?.includes('WebSocket')) {
    console.warn('DOMException/WebSocket error handled silently:', event.reason.name);
    event.preventDefault();
    return;
  }
  
  console.warn('Unhandled promise rejection caught globally:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  // Handle specific error types silently
  if (event.error?.name === 'DOMException' || 
      event.error?.message?.includes('WebSocket') ||
      event.error?.message?.includes('AbortError')) {
    console.warn('DOMException/WebSocket error handled silently');
    event.preventDefault();
    return;
  }
  
  console.warn('Global error caught:', event.error);
  event.preventDefault();
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

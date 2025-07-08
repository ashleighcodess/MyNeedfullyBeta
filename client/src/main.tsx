import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers to prevent unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection caught globally:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
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

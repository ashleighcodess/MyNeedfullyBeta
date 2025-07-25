import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// import "./lib/errorSuppressor"; // Temporarily disabled to debug

// Simplified error handling for better app startup
window.addEventListener('unhandledrejection', (event) => {
  // Prevent console spam but allow the app to continue
  if (event.reason?.name === 'DOMException' || 
      event.reason?.message?.includes('WebSocket')) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  // Allow important errors to show but prevent WebSocket noise
  if (event.error?.name === 'DOMException' || 
      event.error?.message?.includes('WebSocket')) {
    event.preventDefault();
  }
});

const startApp = () => {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found");
      return;
    }
    
    console.log("Starting React app...");
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("React app rendered successfully");
  } catch (error) {
    console.error("Failed to start React app:", error);
    // Show a basic error message to the user
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
          <h2>Application Error</h2>
          <p>Failed to load the application. Please refresh the page.</p>
          <details>
            <summary>Error Details</summary>
            <pre>${error.message}\n${error.stack}</pre>
          </details>
        </div>
      `;
    }
  }
};

startApp();

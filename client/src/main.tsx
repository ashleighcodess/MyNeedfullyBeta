import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorSuppressor"; // Import comprehensive error suppression

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
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found");
    return;
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
};

startApp();

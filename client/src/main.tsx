import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
if (root) {
  try {
    createRoot(root).render(<App />);
  } catch (error) {
    console.error("Error rendering App:", error);
    // Show error message
    root.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #FF6B6B;">Loading Error</h1>
        <p>There was an error loading the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error}</pre>
      </div>
    `;
  }
}

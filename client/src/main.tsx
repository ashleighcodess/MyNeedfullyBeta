import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error("Error starting React app:", error);
  document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif;"><h1>Application Error</h1><p>Error: ${error}</p></div>`;
}

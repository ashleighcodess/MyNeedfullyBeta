import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Main.tsx loading...");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (rootElement) {
    const root = createRoot(rootElement);
    console.log("React root created");
    root.render(<App />);
    console.log("App rendered");
  } else {
    console.error("Root element not found!");
  }
} catch (error) {
  console.error("Error during app initialization:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Loading Error</h1>
      <p>There was an error loading the application. Check the console for details.</p>
      <pre>${error}</pre>
    </div>
  `;
}

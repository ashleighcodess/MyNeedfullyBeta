import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

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

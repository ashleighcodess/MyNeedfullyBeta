import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/errorSuppressor"; // Import comprehensive error suppression
import { injectCriticalCSS, loadNonCriticalCSS } from "./utils/criticalCSS";
import { addSkipToContentLink, enhanceKeyboardNavigation } from "./utils/accessibilityHelpers";
import { measureWebVitals, preloadCriticalResources, checkPerformanceBudget } from "./utils/performanceOptimizer";

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
  
  // Inject critical CSS for faster rendering
  injectCriticalCSS();
  
  // Add accessibility enhancements
  addSkipToContentLink();
  enhanceKeyboardNavigation();
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  // Load non-critical CSS after the app starts
  setTimeout(loadNonCriticalCSS, 100);
  
  // Performance optimization
  preloadCriticalResources([
    { href: '/assets/index.css', as: 'style', type: 'text/css' },
    { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style', type: 'text/css' }
  ]);
  
  // Monitor Web Vitals with performance budgets
  checkPerformanceBudget({
    FCP: 2000, // 2 seconds
    LCP: 4000, // 4 seconds
    FID: 100,  // 100ms
    CLS: 0.1   // 0.1
  });
  
  // Measure and report Web Vitals
  measureWebVitals((vitals) => {
    // In production, send to analytics
    console.log('Web Vitals:', vitals);
  });
};

startApp();

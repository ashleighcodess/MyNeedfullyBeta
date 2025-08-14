// Critical CSS utilities for above-the-fold content
export const criticalCSS = `
/* Critical CSS for above-the-fold content */
:root {
  --primary: 20 14.3% 4.1%;
  --primary-foreground: 60 9.1% 97.8%;
  --coral: 0 84% 60%;
  --coral-light: 0 84% 70%;
  --warm-orange: 24 95% 53%;
}

* {
  border: 0 solid #e5e7eb;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  margin: 0;
  background-color: #ffffff;
  color: #1f2937;
}

/* Header and navigation critical styles */
.header-container {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
}

/* Hero section critical styles */
.hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, hsl(var(--coral)) 0%, hsl(var(--warm-orange)) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Button critical styles */
.btn-primary {
  background: linear-gradient(135deg, hsl(var(--coral)) 0%, hsl(var(--warm-orange)) 100%);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

/* Loading skeleton */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

// Inject critical CSS inline
export const injectCriticalCSS = () => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
  }
};

// Load non-critical CSS asynchronously
export const loadNonCriticalCSS = () => {
  if (typeof document !== 'undefined') {
    const links = document.querySelectorAll('link[rel="stylesheet"][data-non-critical]');
    links.forEach((link) => {
      (link as HTMLLinkElement).rel = 'stylesheet';
    });
  }
};
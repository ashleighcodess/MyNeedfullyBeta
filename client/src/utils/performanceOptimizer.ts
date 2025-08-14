// Performance optimization utilities

// Web Vitals measurement
export interface WebVitals {
  FCP?: number;
  LCP?: number;
  FID?: number;
  CLS?: number;
  TTFB?: number;
}

// Performance observer for Core Web Vitals
export const measureWebVitals = (callback: (vitals: WebVitals) => void) => {
  const vitals: WebVitals = {};

  // First Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.FCP = entry.startTime;
          }
        });
        callback(vitals);
      });
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      console.warn('FCP measurement failed:', e);
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
        callback(vitals);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP measurement failed:', e);
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          vitals.FID = entry.processingStart - entry.startTime;
        });
        callback(vitals);
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID measurement failed:', e);
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.CLS = clsValue;
        callback(vitals);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS measurement failed:', e);
    }
  }

  // Time to First Byte (fallback)
  if (performance.timing) {
    vitals.TTFB = performance.timing.responseStart - performance.timing.navigationStart;
    callback(vitals);
  }
};

// Resource loading optimization
export const preloadCriticalResources = (resources: Array<{ href: string; as: string; type?: string }>) => {
  if (typeof document === 'undefined') return;

  resources.forEach(({ href, as, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Bundle splitting and code optimization
export const dynamicImport = async <T>(importFn: () => Promise<T>): Promise<T> => {
  try {
    return await importFn();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    throw error;
  }
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  if ('IntersectionObserver' in window) {
    return new IntersectionObserver(callback, defaultOptions);
  }

  return null;
};

// Memory usage optimization
export const monitorMemoryUsage = (callback: (memoryInfo: any) => void) => {
  if ('memory' in performance) {
    const memoryInfo = (performance as any).memory;
    callback({
      usedJSHeapSize: memoryInfo.usedJSHeapSize,
      totalJSHeapSize: memoryInfo.totalJSHeapSize,
      jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
    });
  }
};

// Image compression utility
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Font loading optimization
export const optimizeFontLoading = (fonts: Array<{ family: string; weight?: string; display?: string }>) => {
  if (typeof document === 'undefined') return;

  fonts.forEach(({ family, weight = '400', display = 'swap' }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = `https://fonts.gstatic.com/s/${family.toLowerCase()}/v1/${family.toLowerCase()}-${weight}.woff2`;
    document.head.appendChild(link);
  });
};

// Performance budget monitoring
export const checkPerformanceBudget = (budgets: {
  FCP?: number;
  LCP?: number;
  FID?: number;
  CLS?: number;
}) => {
  measureWebVitals((vitals) => {
    const violations = [];

    if (budgets.FCP && vitals.FCP && vitals.FCP > budgets.FCP) {
      violations.push(`FCP: ${vitals.FCP}ms exceeds budget of ${budgets.FCP}ms`);
    }

    if (budgets.LCP && vitals.LCP && vitals.LCP > budgets.LCP) {
      violations.push(`LCP: ${vitals.LCP}ms exceeds budget of ${budgets.LCP}ms`);
    }

    if (budgets.FID && vitals.FID && vitals.FID > budgets.FID) {
      violations.push(`FID: ${vitals.FID}ms exceeds budget of ${budgets.FID}ms`);
    }

    if (budgets.CLS && vitals.CLS && vitals.CLS > budgets.CLS) {
      violations.push(`CLS: ${vitals.CLS} exceeds budget of ${budgets.CLS}`);
    }

    if (violations.length > 0) {
      console.warn('Performance budget violations:', violations);
    }
  });
};
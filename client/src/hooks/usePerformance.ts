import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Define performance entry types
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

export const usePerformance = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reportMetrics = (metrics: PerformanceMetrics) => {
      // Log metrics to console in development
      if (import.meta.env.DEV) {
        console.group('🚀 Performance Metrics');
        Object.entries(metrics).forEach(([key, value]) => {
          if (value !== undefined) {
            console.log(`${key.toUpperCase()}: ${value.toFixed(2)}ms`);
          }
        });
        console.groupEnd();
      }

      // Send to analytics in production
      if (window.gtag && import.meta.env.PROD) {
        Object.entries(metrics).forEach(([key, value]) => {
          if (value !== undefined) {
            window.gtag('event', 'web_vitals', {
              custom_parameter_1: key,
              custom_parameter_2: Math.round(value),
            });
          }
        });
      }
    };

    // Measure Core Web Vitals
    const measureCoreWebVitals = () => {
      const metrics: PerformanceMetrics = {};

      // First Contentful Paint (FCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime;
          reportMetrics(metrics);
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          metrics.lcp = lastEntry.startTime;
          reportMetrics(metrics);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-input') {
            const eventEntry = entry as PerformanceEventTiming;
            metrics.fid = eventEntry.processingStart - eventEntry.startTime;
            reportMetrics(metrics);
          }
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const layoutEntry = entry as LayoutShiftEntry;
          if (!layoutEntry.hadRecentInput) {
            clsValue += layoutEntry.value;
          }
        });
        metrics.cls = clsValue;
        reportMetrics(metrics);
      }).observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte (TTFB)
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        reportMetrics(metrics);
      }
    };

    // Run measurements after page load
    if (document.readyState === 'complete') {
      measureCoreWebVitals();
    } else {
      window.addEventListener('load', measureCoreWebVitals);
    }

    return () => {
      window.removeEventListener('load', measureCoreWebVitals);
    };
  }, []);
};

// Utility to mark performance milestones
export const markPerformance = (name: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name);
    
    if (import.meta.env.DEV) {
      console.log(`⏱️ Performance mark: ${name} at ${performance.now().toFixed(2)}ms`);
    }
  }
};

// Utility to measure performance between marks
export const measurePerformance = (name: string, startMark: string, endMark: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      
      if (import.meta.env.DEV) {
        console.log(`📊 Performance measure: ${name} took ${measure.duration.toFixed(2)}ms`);
      }
      
      return measure.duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }
  }
  return 0;
};
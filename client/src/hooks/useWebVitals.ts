import { useState, useEffect } from 'react';
import { measureWebVitals, WebVitals } from '@/utils/performanceOptimizer';

export const useWebVitals = () => {
  const [vitals, setVitals] = useState<WebVitals>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    measureWebVitals((newVitals) => {
      setVitals(prev => ({ ...prev, ...newVitals }));
      setIsLoading(false);
    });
  }, []);

  const getPerformanceScore = () => {
    const { FCP, LCP, FID, CLS } = vitals;
    
    let score = 100;
    
    // FCP scoring (target: < 1.8s)
    if (FCP) {
      if (FCP > 3000) score -= 25;
      else if (FCP > 1800) score -= 10;
    }
    
    // LCP scoring (target: < 2.5s)
    if (LCP) {
      if (LCP > 4000) score -= 25;
      else if (LCP > 2500) score -= 10;
    }
    
    // FID scoring (target: < 100ms)
    if (FID) {
      if (FID > 300) score -= 25;
      else if (FID > 100) score -= 10;
    }
    
    // CLS scoring (target: < 0.1)
    if (CLS) {
      if (CLS > 0.25) score -= 25;
      else if (CLS > 0.1) score -= 10;
    }
    
    return Math.max(0, score);
  };

  return {
    vitals,
    isLoading,
    performanceScore: getPerformanceScore(),
    isGoodPerformance: getPerformanceScore() >= 75
  };
};
import React, { useState } from 'react';
import { useWebVitals } from '@/hooks/useWebVitals';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Zap } from 'lucide-react';

export const PerformanceDebugger: React.FC = () => {
  const { vitals, performanceScore, isGoodPerformance } = useWebVitals();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatTime = (time?: number) => {
    if (!time) return 'N/A';
    return time < 1000 ? `${Math.round(time)}ms` : `${(time / 1000).toFixed(2)}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-coral-600 hover:bg-coral-700 text-white p-2 rounded-full shadow-lg transition-colors"
        aria-label="Show performance metrics"
      >
        <Zap className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Performance Metrics</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Hide performance metrics"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>

        {/* Overall Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Overall Score</span>
            <Badge className={getScoreColor(performanceScore)}>
              {performanceScore}
            </Badge>
          </div>
          <Progress value={performanceScore} className="h-1" />
        </div>

        {/* Core Web Vitals */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">First Contentful Paint:</span>
            <span className={vitals.FCP && vitals.FCP > 1800 ? 'text-red-600' : 'text-green-600'}>
              {formatTime(vitals.FCP)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Largest Contentful Paint:</span>
            <span className={vitals.LCP && vitals.LCP > 2500 ? 'text-red-600' : 'text-green-600'}>
              {formatTime(vitals.LCP)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">First Input Delay:</span>
            <span className={vitals.FID && vitals.FID > 100 ? 'text-red-600' : 'text-green-600'}>
              {formatTime(vitals.FID)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Cumulative Layout Shift:</span>
            <span className={vitals.CLS && vitals.CLS > 0.1 ? 'text-red-600' : 'text-green-600'}>
              {vitals.CLS ? vitals.CLS.toFixed(3) : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Time to First Byte:</span>
            <span>{formatTime(vitals.TTFB)}</span>
          </div>
        </div>

        {/* Performance Tips */}
        {!isGoodPerformance && (
          <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
            <div className="font-medium text-yellow-800 mb-1">Optimization Tips:</div>
            <ul className="text-yellow-700 space-y-1 text-xs">
              {vitals.LCP && vitals.LCP > 2500 && (
                <li>• Optimize images and use WebP format</li>
              )}
              {vitals.FCP && vitals.FCP > 1800 && (
                <li>• Reduce render-blocking resources</li>
              )}
              {vitals.CLS && vitals.CLS > 0.1 && (
                <li>• Add explicit size attributes to images</li>
              )}
              {vitals.FID && vitals.FID > 100 && (
                <li>• Minimize JavaScript execution time</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
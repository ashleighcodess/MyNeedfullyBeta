import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { pageView } from './ga4';

export default function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    pageView(location, window.location.href);
  }, [location]);
}
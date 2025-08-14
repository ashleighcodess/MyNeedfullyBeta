import React, { Suspense, lazy } from 'react';

// Loading component for better UX
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center p-8 min-h-[200px]" role="status" aria-label={message}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-600"></div>
    <span className="sr-only">{message}</span>
  </div>
);

// Error boundary for lazy-loaded components
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyLoadErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error?: Error }> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ComponentType<{ error?: Error }> }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyLoad component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <div className="p-8 text-center" role="alert">
          <p className="text-red-600 dark:text-red-400">Something went wrong loading this content.</p>
          <button 
            className="mt-2 px-4 py-2 text-sm bg-coral-600 text-white rounded hover:bg-coral-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for lazy loading components
export const withLazyLoading = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  loadingMessage?: string,
  fallback?: React.ComponentType<{ error?: Error }>
) => {
  const LazyComponent = lazy(importFunc);

  return (props: P) => (
    <LazyLoadErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

// Lazy loaded page components
export const LazyBrowseWishlists = withLazyLoading(
  () => import('@/pages/browse-wishlists'),
  'Loading needs lists...'
);

export const LazyCreateWishlist = withLazyLoading(
  () => import('@/pages/create-wishlist'),
  'Loading create form...'
);

export const LazyProfile = withLazyLoading(
  () => import('@/pages/profile'),
  'Loading profile...'
);

export const LazyWishlistDetail = withLazyLoading(
  () => import('@/pages/wishlist-detail'),
  'Loading needs list details...'
);

export const LazyAdminDashboard = withLazyLoading(
  () => import('@/pages/admin-dashboard'),
  'Loading admin dashboard...'
);

export const LazySettings = withLazyLoading(
  () => import('@/pages/settings'),
  'Loading settings...'
);

export default LoadingSpinner;
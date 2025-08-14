// Image optimization utilities for better performance
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
}

// Generate responsive image URLs with different sizes
export const generateResponsiveImageUrls = (src: string) => {
  // For Unsplash images, we can append size parameters
  if (src.includes('unsplash.com')) {
    return {
      small: src.replace(/w=\d+/, 'w=400').replace(/h=\d+/, 'h=300'),
      medium: src.replace(/w=\d+/, 'w=800').replace(/h=\d+/, 'h=600'),
      large: src.replace(/w=\d+/, 'w=1200').replace(/h=\d+/, 'h=900'),
    };
  }
  
  // For local images, return the original (we'll handle optimization server-side later)
  return {
    small: src,
    medium: src,
    large: src,
  };
};

// Convert images to modern formats when possible
export const getOptimizedImageSrc = (src: string, format: 'webp' | 'avif' | 'original' = 'webp') => {
  if (src.includes('unsplash.com') && format === 'webp') {
    return src + '&fm=webp&q=80';
  }
  if (src.includes('unsplash.com') && format === 'avif') {
    return src + '&fm=avif&q=80';
  }
  return src;
};

// Lazy loading intersection observer
export const createImageObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    });
  }
  return null;
};
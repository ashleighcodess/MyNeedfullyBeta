import React, { useState, useRef, useEffect } from 'react';
import { ResponsiveImageProps, generateResponsiveImageUrls, getOptimizedImageSrc, createImageObserver } from '@/utils/imageOptimization';

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return; // Don't lazy load priority images

    const observer = createImageObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer?.unobserve(entry.target);
        }
      });
    });

    if (observer && imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer?.disconnect();
  }, [priority]);

  const responsiveUrls = generateResponsiveImageUrls(src);
  const optimizedSrc = getOptimizedImageSrc(responsiveUrls.medium);

  // Generate srcSet for responsive images
  const srcSet = `
    ${getOptimizedImageSrc(responsiveUrls.small)} 400w,
    ${getOptimizedImageSrc(responsiveUrls.medium)} 800w,
    ${getOptimizedImageSrc(responsiveUrls.large)} 1200w
  `;

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder/skeleton while loading */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : undefined}
        srcSet={isInView ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        {...(priority && { fetchPriority: 'high' } as any)}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />

      {/* Error fallback */}
      {hasError && (
        <div 
          className="flex items-center justify-center bg-gray-100 text-gray-500 text-sm"
          style={{ width, height: height || 200 }}
          role="img"
          aria-label={`Failed to load image: ${alt}`}
        >
          Image unavailable
        </div>
      )}
    </div>
  );
};
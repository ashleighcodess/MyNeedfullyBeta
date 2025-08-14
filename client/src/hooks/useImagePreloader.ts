import { useEffect, useState } from 'react';

interface UseImagePreloaderOptions {
  images: string[];
  priority?: boolean;
}

export const useImagePreloader = ({ images, priority = false }: UseImagePreloaderOptions) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!images.length) {
      setIsLoading(false);
      return;
    }

    const preloadImages = async () => {
      const imagePromises = images.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, src]));
            resolve(src);
          };
          
          img.onerror = () => {
            console.warn(`Failed to preload image: ${src}`);
            resolve(src); // Resolve anyway to not block other images
          };

          // Set priority attributes for critical images
          if (priority) {
            img.loading = 'eager';
            img.fetchPriority = 'high';
          }
          
          img.src = src;
        });
      });

      try {
        await Promise.allSettled(imagePromises);
      } catch (error) {
        console.error('Error preloading images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    preloadImages();
  }, [images, priority]);

  return {
    loadedImages,
    isLoading,
    isImageLoaded: (src: string) => loadedImages.has(src)
  };
};
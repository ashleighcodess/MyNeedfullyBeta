import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  // Use React Query for consistent auth state across all components
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false, // Don't retry 401 errors
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes (reduced polling)
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus to prevent constant requests
    refetchOnMount: false, // Don't refetch on every mount to reduce requests
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include', // Ensure cookies are sent
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.status === 401) {
          // Return null for unauthorized instead of throwing
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        
        const userData = await response.json();
        return userData;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.warn('Auth request timed out');
          return null;
        }
        throw error;
      }
    },
  });

  // Removed excessive logging for better performance

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}

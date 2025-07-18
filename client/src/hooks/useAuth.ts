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
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include', // Ensure cookies are sent
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.status === 401) {
          // Return null for unauthorized instead of throwing
          return null;
        }
        
        if (!response.ok) {
          console.warn(`Auth check failed: ${response.status} ${response.statusText}`);
          return null; // Return null instead of throwing to prevent app crashes
        }
        
        const userData = await response.json();
        return userData;
      } catch (networkError) {
        console.warn('Auth network error:', networkError);
        return null; // Return null for network errors to prevent app crashes
      }
    },
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  // Use React Query for consistent auth state across all components
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false, // Don't retry 401 errors
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on focus to prevent constant requests
    refetchOnMount: false, // Only fetch if not in cache
    queryFn: async () => {
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
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}

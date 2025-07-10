import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  // Use React Query for consistent auth state across all components
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false, // Don't retry 401 errors
    staleTime: 0, // Always fresh - never use cached auth data
    cacheTime: 0, // Don't cache auth responses
    refetchOnWindowFocus: true, // DO refetch when window gains focus to catch auth changes
    refetchOnMount: true, // Always check auth on component mount
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

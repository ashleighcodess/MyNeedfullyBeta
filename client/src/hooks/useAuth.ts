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
    refetchOnMount: true, // Always fetch on mount to ensure latest auth state
    queryFn: async () => {
      console.log('🔐 useAuth: Fetching user authentication status...');
      const response = await fetch('/api/auth/user', {
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`🔐 useAuth: Auth response status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('🔐 useAuth: User not authenticated (401)');
        // Return null for unauthorized instead of throwing
        return null;
      }
      
      if (!response.ok) {
        console.log(`🔐 useAuth: Auth error: ${response.status} ${response.statusText}`);
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log('🔐 useAuth: User authenticated successfully:', { id: userData.id, email: userData.email });
      return userData;
    },
  });

  console.log('🔐 useAuth: Current state:', { 
    hasUser: !!user, 
    isLoading, 
    hasError: !!error,
    isAuthenticated: !!user && !error
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}

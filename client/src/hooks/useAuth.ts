import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  // Use React Query for consistent auth state across all components
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false, // Don't retry 401 errors
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: true, // Always check auth on component mount
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}

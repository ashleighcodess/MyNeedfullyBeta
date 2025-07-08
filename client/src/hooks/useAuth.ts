import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 60000, // 1 minute
  });

  // Log any errors for debugging but don't throw them
  if (error) {
    console.warn("Auth query error (non-critical):", error);
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

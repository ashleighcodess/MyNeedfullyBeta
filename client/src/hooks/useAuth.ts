import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  try {
    const { data: user, isLoading, error } = useQuery<User | null>({
      queryKey: ["/api/auth/user"],
      queryFn: getQueryFn({ on401: "returnNull" }),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 10000, // 10 seconds
      gcTime: 10000, // Keep data for 10 seconds after component unmounts
    });

    // Log any errors for debugging but don't throw them
    if (error) {
      console.warn("Auth query error (non-critical):", error);
    }

    // If we get a 401 or error, treat as not authenticated but not loading
    const isActuallyLoading = isLoading && !error;

    return {
      user: user || null,
      isLoading: isActuallyLoading || false,
      isAuthenticated: !!user,
    };
  } catch (error) {
    console.warn("useAuth hook error:", error);
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }
}

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
      staleTime: 60000, // 1 minute
      gcTime: 60000, // Keep data for 1 minute after component unmounts
    });

    // Log any errors for debugging but don't throw them
    if (error) {
      console.warn("Auth query error (non-critical):", error);
    }

    return {
      user: user || null,
      isLoading: isLoading || false,
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

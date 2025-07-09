import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useAuth() {
  const [forceLoaded, setForceLoaded] = useState(false);
  
  try {
    const { data: user, isLoading, error, isError } = useQuery<User | null>({
      queryKey: ["/api/auth/user"],
      queryFn: getQueryFn({ on401: "returnNull" }),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5000, // 5 seconds
      gcTime: 5000, // Keep data for 5 seconds after component unmounts
    });

    // Force loading to complete after 3 seconds to prevent infinite loading
    useEffect(() => {
      const timeout = setTimeout(() => {
        setForceLoaded(true);
      }, 3000);

      return () => clearTimeout(timeout);
    }, []);

    // Log any errors for debugging but don't throw them
    if (error) {
      console.warn("Auth query error (non-critical):", error);
    }

    // If we get a 401 or error, treat as not authenticated and not loading
    // Only show loading if we're actually loading and haven't encountered an error
    const actuallyLoading = isLoading && !isError && !error && !forceLoaded;

    return {
      user: user || null,
      isLoading: actuallyLoading,
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

import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  try {
    const { data: user, isLoading, error, isError } = useQuery<User | null>({
      queryKey: ["/api/auth/user"],
      queryFn: getQueryFn({ on401: "returnNull" }),
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000, // 1 second
      gcTime: 1000, // Keep data for 1 second after component unmounts
    });

    // Mark as initialized after first attempt
    useEffect(() => {
      if (!isLoading || isError || error) {
        setIsInitialized(true);
      }
    }, [isLoading, isError, error]);

    // Log any errors for debugging but don't throw them
    if (error) {
      console.warn("Auth query error (non-critical):", error);
    }

    // Don't show loading if we've already initialized or if there's an error
    const actuallyLoading = isLoading && !isInitialized && !isError && !error;

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

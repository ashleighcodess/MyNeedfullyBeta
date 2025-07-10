import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  
  // CRITICAL FIX: Detect public pages to prevent 401 spam
  const isPublicPage = typeof window !== 'undefined' && 
    (window.location.pathname === '/browse' || 
     window.location.pathname.startsWith('/wishlist/'));
  
  // Always call useQuery hook to maintain hook order consistency
  const { data: user, isLoading, error, isError } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // Keep data for 5 minutes after component unmounts
    enabled: !isPublicPage, // Disable query for public pages
  });

  // Mark as initialized after first attempt
  useEffect(() => {
    if (!isLoading || isError || error || isPublicPage) {
      setIsInitialized(true);
    }
  }, [isLoading, isError, error, isPublicPage]);

  // Clear auth cache when logout is detected (when user data disappears)
  useEffect(() => {
    if (!isPublicPage && isInitialized && !isLoading && !user && !error) {
      // User data is null but no error - likely logged out
      queryClient.clear(); // Clear all cached data
      // Force profile picture cache to refresh
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
  }, [user, isInitialized, isLoading, error, queryClient, isPublicPage]);

  // Log any errors for debugging but don't throw them
  if (error && !isPublicPage) {
    console.warn("Auth query error (non-critical):", error);
  }

  // Return early for public pages to prevent authentication
  if (isPublicPage) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  // Don't show loading if we've already initialized or if there's an error
  const actuallyLoading = isLoading && !isInitialized && !isError && !error;

  return {
    user: user || null,
    isLoading: actuallyLoading,
    isAuthenticated: !!user,
  };
}

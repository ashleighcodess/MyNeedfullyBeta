import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [authState, setAuthState] = useState<{
    user: User | null;
    isAuthenticated: boolean;
    checkedOnce: boolean;
  }>({
    user: null,
    isAuthenticated: false,
    checkedOnce: false,
  });
  const queryClient = useQueryClient();
  
  // Only check auth ONCE on mount, then stop
  useEffect(() => {
    if (authState.checkedOnce) return; // Don't check again
    
    fetch('/api/auth/user', { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 401) {
          // Not authenticated - this is fine, just set state and stop
          setAuthState({
            user: null,
            isAuthenticated: false,
            checkedOnce: true,
          });
          setIsInitialized(true);
          return;
        }
        
        if (res.ok) {
          const userData = await res.json();
          setAuthState({
            user: userData,
            isAuthenticated: true,
            checkedOnce: true,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            checkedOnce: true,
          });
        }
        setIsInitialized(true);
      })
      .catch(() => {
        // Network error or other issue - just assume not authenticated
        setAuthState({
          user: null,
          isAuthenticated: false,
          checkedOnce: true,
        });
        setIsInitialized(true);
      });
  }, [authState.checkedOnce]);

  return {
    user: authState.user,
    isLoading: !isInitialized,
    isAuthenticated: authState.isAuthenticated,
  };
}

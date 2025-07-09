import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN && this.userId === userId) {
      return;
    }

    this.userId = userId;
    
    try {
      // Disconnect existing connection first
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?userId=${userId}`;
      
      console.log(`Attempting WebSocket connection to: ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      return;
    }

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket disconnected", event.code, event.reason);
      this.ws = null;
      if (event.code !== 1000 && event.code !== 1001) { // Only reconnect if not a normal closure
        this.reconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Properly handle the error without causing DOMException
      if (this.ws) {
        try {
          this.ws.close();
        } catch (closeError) {
          console.warn("Error closing WebSocket:", closeError);
        }
        this.ws = null;
      }
    };
  }

  private handleMessage(message: any) {
    try {
      if (message.type === "notification") {
        // Invalidate notifications cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] }).catch(error => {
          console.warn("Failed to invalidate notifications cache:", error);
        });
        
        // Show toast notification
        // Note: We can't use useToast hook here, so we'll dispatch a custom event
        try {
          window.dispatchEvent(new CustomEvent("showNotificationToast", {
            detail: {
              title: message.data?.title || "Notification",
              description: message.data?.message || "",
              duration: 5000,
            }
          }));
        } catch (error) {
          console.warn("Failed to dispatch notification toast:", error);
        }
        
        // Dispatch custom event for notification updates
        try {
          window.dispatchEvent(new CustomEvent("newNotification", {
            detail: message.data || {}
          }));
        } catch (error) {
          console.warn("Failed to dispatch notification event:", error);
        }
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached");
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    
    setTimeout(() => {
      try {
        console.log(`Reconnecting WebSocket (attempt ${this.reconnectAttempts + 1})`);
        this.reconnectAttempts++;
        if (this.userId) {
          this.connect(this.userId);
        }
      } catch (error) {
        console.error("Error during WebSocket reconnection:", error);
      }
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      try {
        this.ws.close(1000, "User disconnected");
      } catch (error) {
        console.warn("Error disconnecting WebSocket:", error);
      }
      this.ws = null;
      this.userId = null;
    }
  }
}

export const wsManager = new WebSocketManager();

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // TEMPORARILY DISABLE WebSocket due to connection issues
    // Will re-enable after server configuration is fixed
    console.log("WebSocket temporarily disabled for deployment stability");
    return;
    
    // Only connect WebSocket for authenticated users
    if (isAuthenticated && user?.id) {
      try {
        wsManager.connect(user.id);
      } catch (error) {
        console.warn("WebSocket connection failed, continuing without real-time notifications:", error);
      }
    } else {
      wsManager.disconnect();
    }

    return () => {
      wsManager.disconnect();
    };
  }, [isAuthenticated, user?.id]);
}

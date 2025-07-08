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
      if (event.code !== 1000) { // Only reconnect if not a normal closure
        this.reconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Don't throw the error, just log it to prevent unhandled rejections
    };
  }

  private handleMessage(message: any) {
    if (message.type === "notification") {
      // Invalidate notifications cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      // Show toast notification
      // Note: We can't use useToast hook here, so we'll dispatch a custom event
      window.dispatchEvent(new CustomEvent("showNotificationToast", {
        detail: {
          title: message.data.title,
          description: message.data.message,
          duration: 5000,
        }
      }));
      
      // Dispatch custom event for notification updates
      window.dispatchEvent(new CustomEvent("newNotification", {
        detail: message.data
      }));
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached");
      return;
    }

    setTimeout(() => {
      console.log(`Reconnecting WebSocket (attempt ${this.reconnectAttempts + 1})`);
      this.reconnectAttempts++;
      if (this.userId) {
        this.connect(this.userId);
      }
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.userId = null;
    }
  }
}

export const wsManager = new WebSocketManager();

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Temporarily disable WebSocket to prevent DOMException issues
    // TODO: Re-enable once the main app is stable
    console.log("WebSocket disabled temporarily to prevent loading issues");
    
    /*
    if (isAuthenticated && user?.id) {
      wsManager.connect(user.id);
    } else {
      wsManager.disconnect();
    }

    return () => {
      wsManager.disconnect();
    };
    */
  }, [isAuthenticated, user?.id]);
}

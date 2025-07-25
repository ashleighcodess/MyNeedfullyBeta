import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, Check, Heart, Gift, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import ThankYouNote from "./thank-you-note";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: {
    itemId?: number;
    wishlistId?: number;
    donationId?: number;
    supporterId?: string;
    canSendThankYou?: boolean;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showThankYouNote, setShowThankYouNote] = useState<{ supporterId: string; donationId: number } | null>(null);

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user,
    refetchInterval: 120000, // Refresh every 2 minutes for notification center
    retry: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest('POST', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      apiRequest('POST', '/api/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "All notifications marked as read",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'item_fulfilled':
        return <Gift className="h-5 w-5 text-green-600" />;
      case 'purchase_confirmed':
        return <Check className="h-5 w-5 text-blue-600" />;
      case 'thank_you_received':
        return <Heart className="h-5 w-5 text-coral" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationStyle = (type: string, isRead: boolean) => {
    const baseStyle = "p-4 border-l-4 transition-colors hover:bg-gray-50";
    const readStyle = isRead ? "bg-gray-50" : "bg-white";
    
    switch (type) {
      case 'item_fulfilled':
        return `${baseStyle} ${readStyle} border-l-green-500`;
      case 'purchase_confirmed':
        return `${baseStyle} ${readStyle} border-l-blue-500`;
      case 'thank_you_received':
        return `${baseStyle} ${readStyle} border-l-coral`;
      default:
        return `${baseStyle} ${readStyle} border-l-gray-400`;
    }
  };

  const handleSendThankYou = (supporterId: string, donationId: number) => {
    setShowThankYouNote({ supporterId, donationId });
  };

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </Button>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              View and manage your notifications for donations, fulfillments, and thank you notes
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400">
                  You'll see updates about your needs lists and donations here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={getNotificationStyle(notification.type, notification.isRead)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Send Thank You button for item fulfilled notifications */}
                        {notification.type === 'item_fulfilled' && 
                         notification.data?.supporterId && 
                         notification.data?.donationId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendThankYou(notification.data.supporterId!, notification.data.donationId!)}
                            className="text-coral border-coral hover:bg-coral hover:text-white"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Say Thanks
                          </Button>
                        )}
                        
                        {/* Mark as read button */}
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Thank You Note Modal */}
      {showThankYouNote && (
        <Dialog open={!!showThankYouNote} onOpenChange={() => setShowThankYouNote(null)}>
          <DialogContent className="max-w-md">
            <ThankYouNote
              toUserId={showThankYouNote.supporterId}
              donationId={showThankYouNote.donationId}
              onSent={() => {
                setShowThankYouNote(null);
                toast({
                  title: "Thank you note sent!",
                  description: "Your message of gratitude has been delivered.",
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
import { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { useSocket } from '../../hooks/useSocket';
import { apiUrl, fetchWithIdToken } from '@/lib/api';

interface Notification {
  _id: string;
  senderId: string;
  type: string;
  message: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPopover() {
  const { currentUser, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { socket } = useSocket();

  const fetchNotifications = async () => {
    if (authLoading || !currentUser) return;
    try {
      const res = await fetchWithIdToken('/notifications', currentUser);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser, authLoading]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for new invites and fetch notifications
    socket.on('new_invite', () => {
      fetchNotifications();
    });

    return () => {
      socket.off('new_invite');
    };
  }, [socket, currentUser]);

  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    // Optimistic update
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await fetchWithIdToken(`/notifications/${id}/read`, currentUser, { method: 'PUT' });
    } catch (error) {
      console.error('Error marking as read:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const handleUpdateStatus = async (inviteId: string, status: 'accepted' | 'rejected', notificationId: string) => {
    if (!currentUser) return;
    try {
      const response = await fetchWithIdToken(`/invites/${inviteId}`, currentUser, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Invite ${status}`);
        markAsRead(notificationId);
      } else {
        toast.error(data.message || 'Failed to update invite');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-background rounded-full"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification._id} 
                  className={`p-4 border-b border-border flex items-start gap-3 transition-colors ${!notification.isRead ? 'bg-primary/10' : 'hover:bg-background'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-medium text-foreground' : 'text-foreground'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                    {notification.type === 'invite' && !notification.isRead && notification.referenceId && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-foreground border-border hover:bg-background flex-1"
                          onClick={() => handleUpdateStatus(notification.referenceId!, 'rejected', notification._id)}
                        >
                          <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-background hover:bg-background flex-1"
                          onClick={() => handleUpdateStatus(notification.referenceId!, 'accepted', notification._id)}
                        >
                          <Check className="w-3 h-3 mr-1" /> Accept
                        </Button>
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/20"
                      onClick={() => markAsRead(notification._id)}
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-foreground">
              No notifications yet.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

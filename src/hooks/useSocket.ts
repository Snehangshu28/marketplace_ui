import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { SOCKET_URL } from '@/lib/api';

export const useSocket = () => {
  const { currentUser, userData } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (currentUser?.uid) {
      // Initialize socket connection
      const socket = io(SOCKET_URL, {
        // Polling-only avoids WebSocket upgrade failures in local dev (CSP/proxy/extensions).
        transports: ['polling'],
        upgrade: false,
        withCredentials: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
        
        // Join user room
        socket.emit('join_room', currentUser.uid);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connect_error:', err.message);
      });

      // Listen for notifications
      socket.on('new_invite', (data) => {
        toast.info(`New invite from ${data.senderName}`, {
          description: 'Check your dashboard to accept or reject.',
          duration: 5000,
        });
      });

      socket.on('invite_accepted', (data) => {
        toast.success(`Invite accepted by ${data.receiverName}`, {
          description: 'You can now start chatting!',
          duration: 5000,
        });
      });

      socket.on('error_message', (data) => {
        toast.error(data.message);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [currentUser]);

  const sendMessage = (receiverId: string, content: string, type: string = 'text', fileUrl?: string, fileId?: string, fileName?: string) => {
    if (socketRef.current && currentUser) {
      socketRef.current.emit('send_message', {
        senderId: currentUser.uid,
        receiverId,
        content,
        type,
        fileUrl,
        fileId,
        fileName,
        timestamp: new Date().toISOString()
      });
    }
  };

  const onMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('receive_message', callback);
      return () => {
        socketRef.current?.off('receive_message', callback);
      };
    }
    return () => {};
  };

  const onNewMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new_message', callback);
      return () => {
        socketRef.current?.off('new_message', callback);
      };
    }
    return () => {};
  };

  const markDelivered = (messageId: string, senderId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('message_delivered', { messageId, senderId });
    }
  };

  const markSeen = (senderId: string) => {
    if (socketRef.current && currentUser) {
      socketRef.current.emit('messages_seen', { senderId, receiverId: currentUser.uid });
    }
  };

  const onMessageStatusUpdate = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message_status_update', callback);
      socketRef.current.on('messages_status_update', callback);
      return () => {
        socketRef.current?.off('message_status_update', callback);
        socketRef.current?.off('messages_status_update', callback);
      };
    }
    return () => {};
  };

  return { socket: socketRef.current, isConnected, sendMessage, onMessage, onNewMessage, markDelivered, markSeen, onMessageStatusUpdate };
};

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useRole } from './RoleContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, role } = useRole();

  // Define notification handlers with useCallback to prevent infinite loops
  const addNotification = useCallback((notification) => {
    console.log('➕ Adding notification:', notification);
    setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50
    
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    }
    
    // Speak notification if speech synthesis is available
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${notification.title}. ${notification.message}`);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    if (!user || !role) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      console.log('👤 User object:', user);
      console.log('🔑 User ID:', user?._id || user?.id);
      console.log('🎭 Role:', role);
      setConnected(true);
      
      // Join user's personal room
      const userId = user?._id || user?.id;
      console.log('📡 Emitting join with userId:', userId, 'role:', role);
      newSocket.emit('join', { userId, role });
      newSocket.emit('setOnline', { userId, role });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    // Listen for new service requests (workers only)
    newSocket.on('newServiceRequest', (data) => {
      console.log('📬 New service request:', data);
      addNotification({
        type: 'request',
        title: 'New Service Request',
        message: data.message,
        data: data.request,
        timestamp: new Date()
      });
    });

    // Listen for request accepted (users only)
    newSocket.on('requestAccepted', (data) => {
      console.log('✅ Request accepted:', data);
      addNotification({
        type: 'accepted',
        title: 'Request Accepted',
        message: data.message,
        data: data.request,
        timestamp: new Date()
      });
    });

    // Listen for request rejected (users only)
    newSocket.on('requestRejected', (data) => {
      console.log('❌ Request rejected:', data);
      addNotification({
        type: 'rejected',
        title: 'Request Declined',
        message: data.message,
        data: data.request,
        timestamp: new Date()
      });
    });

    // Listen for request completed
    newSocket.on('requestCompleted', (data) => {
      console.log('✅ Request completed:', data);
      addNotification({
        type: 'completed',
        title: 'Job Completed',
        message: data.message,
        data: data.request,
        timestamp: new Date()
      });
    });

    // Listen for request cancelled
    newSocket.on('requestCancelled', (data) => {
      console.log('🚫 Request cancelled:', data);
      addNotification({
        type: 'cancelled',
        title: 'Request Cancelled',
        message: data.message,
        data: data.request,
        timestamp: new Date()
      });
    });

    // Listen for new messages
    newSocket.on('newMessage', (data) => {
      console.log('💬 New message:', data);
      const senderName = data.senderName || 'Someone';
      addNotification({
        type: 'message',
        title: 'New Message',
        message: `${senderName} sent you a message`,
        data: data.message,
        requestId: data.serviceRequestId,
        timestamp: new Date(),
        read: false
      });
    });

    // Listen for messages read
    newSocket.on('messagesRead', (data) => {
      console.log('✓ Messages read:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, role, addNotification]);

  const value = {
    socket,
    connected,
    notifications,
    clearNotifications,
    removeNotification,
    addNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

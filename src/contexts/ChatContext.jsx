import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to chat server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from chat server');
      });

      newSocket.on('message', (message) => {
        setMessages(prev => [...prev, message]);
        
        // Update unread count if message is not from current user
        if (message.senderId !== user.id) {
          setUnreadCount(prev => prev + 1);
        }
      });

      newSocket.on('room-joined', (room) => {
        setCurrentRoom(room);
        setMessages(room.messages || []);
      });

      newSocket.on('typing', (data) => {
        // Handle typing indicator
        console.log('User typing:', data);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        toast.error('Chat connection error');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Fetch user's chat rooms
  useEffect(() => {
    if (isAuthenticated && socket) {
      socket.emit('get-rooms');
      socket.on('rooms', (rooms) => {
        setActiveRooms(rooms);
      });
    }
  }, [isAuthenticated, socket]);

  const joinRoom = (roomId) => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
    }
  };

  const createRoom = (vendorId, productId = null) => {
    if (socket) {
      socket.emit('create-room', { vendorId, productId });
    }
  };

  const sendMessage = (content, type = 'TEXT') => {
    if (socket && currentRoom && content.trim()) {
      const message = {
        roomId: currentRoom.id,
        content: content.trim(),
        type,
      };
      
      socket.emit('send-message', message);
      
      // Add message to local state immediately for better UX
      const tempMessage = {
        ...message,
        id: Date.now().toString(),
        senderId: user.id,
        sender: user,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempMessage]);
    }
  };

  const markAsRead = (messageId) => {
    if (socket) {
      socket.emit('mark-read', messageId);
    }
  };

  const markRoomAsRead = (roomId) => {
    if (socket) {
      socket.emit('mark-room-read', roomId);
      setUnreadCount(0);
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave-room', currentRoom.id);
      setCurrentRoom(null);
      setMessages([]);
    }
  };

  const startTyping = () => {
    if (socket && currentRoom) {
      socket.emit('typing', { roomId: currentRoom.id, isTyping: true });
    }
  };

  const stopTyping = () => {
    if (socket && currentRoom) {
      socket.emit('typing', { roomId: currentRoom.id, isTyping: false });
    }
  };

  const value = {
    socket,
    messages,
    activeRooms,
    currentRoom,
    isConnected,
    unreadCount,
    joinRoom,
    createRoom,
    sendMessage,
    markAsRead,
    markRoomAsRead,
    leaveRoom,
    startTyping,
    stopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create context
const SocketContext = createContext(null);

// Backend API URL (should match the one defined in api.js)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Initialize or update socket connection when authentication state changes
  useEffect(() => {
    let socketInstance;

    if (isAuthenticated && user?.id) {
      // Initialize socket
      socketInstance = io(API_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        // Authenticate socket with user id
        socketInstance.emit('authenticate', { userId: user.id });
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(socketInstance);

      // Cleanup when component unmounts or auth state changes
      return () => {
        if (socketInstance) {
          console.log('Disconnecting socket');
          socketInstance.disconnect();
          setSocket(null);
          setConnected(false);
        }
      };
    }
  }, [isAuthenticated, user?.id]);

  const value = {
    socket,
    connected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext; 
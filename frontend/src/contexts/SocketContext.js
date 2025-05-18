import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import styled from '@emotion/styled';
import theme from '../styles/theme';
import { useNavigate } from 'react-router-dom';

// Get API URL from environment or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create context
const SocketContext = createContext(null);

// Custom styled notification for check-in success
const NotificationContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, ${theme.colors.success.light}, ${theme.colors.success.main});
  color: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(46, 204, 113, 0.2);
  max-width: 320px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
    z-index: 0;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  z-index: 1;
`;

const NotificationContent = styled.div`
  flex: 1;
  z-index: 1;
  
  h4 {
    font-weight: ${theme.typography.fontWeights.bold};
    font-size: ${theme.typography.fontSize.md};
    margin: 0 0 4px;
  }
  
  p {
    font-size: ${theme.typography.fontSize.sm};
    margin: 0;
    opacity: 0.9;
  }
`;

// Custom notification for check-in success
export const CheckInSuccessNotification = ({ eventName }) => {
  const navigate = useNavigate();
  
  return (
    <NotificationContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => navigate('/events')}
      whileHover={{ scale: 1.03 }}
      style={{ cursor: 'pointer' }}
    >
      <IconWrapper>
        <FaCheckCircle size={20} />
      </IconWrapper>
      <NotificationContent>
        <h4>Check-in Successful!</h4>
        <p>You've successfully checked in to {eventName}</p>
      </NotificationContent>
    </NotificationContainer>
  );
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect to socket if user is authenticated
    if (!isAuthenticated || !user) return;

    // Create socket connection
    const socketInstance = io(API_URL, {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      
      // Join user-specific room for private notifications
      socketInstance.emit('join-event', `user-${user.id}`);
    });

    // Listen for check-in success notifications
    socketInstance.on('check-in-success', (data) => {
      console.log('Check-in success notification received:', data);
      
      // Show notification using react-hot-toast with custom component
      toast.custom((t) => (
        <CheckInSuccessNotification 
          eventName={data.eventName}
          t={t}
        />
      ), {
        duration: 5000,
        position: 'top-center',
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Save socket instance to state
    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // Provide socket instance to components
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext; 
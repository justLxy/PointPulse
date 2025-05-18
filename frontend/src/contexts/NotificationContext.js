import React, { createContext, useContext, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import theme from '../styles/theme';

const NotificationContext = createContext();

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  max-width: 90vw;
`;

const NotificationItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.lg};
  max-width: 350px;
  background-color: ${({ type }) => {
    switch (type) {
      case 'success':
        return theme.colors.success.light;
      case 'error':
        return theme.colors.error.light;
      default:
        return theme.colors.primary.light;
    }
  }};
  border-left: 5px solid ${({ type }) => {
    switch (type) {
      case 'success':
        return theme.colors.success.main;
      case 'error':
        return theme.colors.error.main;
      default:
        return theme.colors.primary.main;
    }
  }};
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${({ type }) => {
    switch (type) {
      case 'success':
        return theme.colors.success.main;
      case 'error':
        return theme.colors.error.main;
      default:
        return theme.colors.primary.main;
    }
  }};
`;

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((title, message, type = 'info', duration = 5000) => {
    const id = Date.now();
    
    setNotifications((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const showSuccessNotification = useCallback((title, message, duration) => {
    return addNotification(title, message, 'success', duration);
  }, [addNotification]);

  const showErrorNotification = useCallback((title, message, duration) => {
    return addNotification(title, message, 'error', duration);
  }, [addNotification]);

  const showInfoNotification = useCallback((title, message, duration) => {
    return addNotification(title, message, 'info', duration);
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification,
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaTimesCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {notifications.length > 0 && (
          <NotificationContainer>
            <AnimatePresence>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  type={notification.type}
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  onClick={() => removeNotification(notification.id)}
                  style={{ cursor: 'pointer' }}
                  layout
                >
                  <IconContainer type={notification.type}>
                    {getIconForType(notification.type)}
                  </IconContainer>
                  <NotificationContent>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    {notification.message && (
                      <NotificationMessage>{notification.message}</NotificationMessage>
                    )}
                  </NotificationContent>
                </NotificationItem>
              ))}
            </AnimatePresence>
          </NotificationContainer>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 
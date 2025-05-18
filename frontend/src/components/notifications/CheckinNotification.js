import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import theme from '../../styles/theme';
import { useSocket } from '../../contexts/SocketContext';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
`;

const NotificationContainer = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  max-width: 400px;
  pointer-events: none; /* Allow clicking through the container */
`;

const NotificationCard = styled(motion.div)`
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 100%;
  pointer-events: auto; /* Make the card clickable */
  border-left: 5px solid ${theme.colors.success.main};
  animation: ${slideIn} 0.3s ease-out, ${pulse} 2s infinite;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

const IconContainer = styled.div`
  margin-right: 16px;
  color: ${theme.colors.success.main};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentContainer = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: ${theme.typography.fontWeights.bold};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  margin-bottom: 4px;
`;

const Message = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  padding: 4px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const EventName = styled.span`
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.primary.main};
`;

/**
 * CheckinNotification Component
 * Listens for check-in events and displays notifications to the user
 */
const CheckinNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const { addEventListener } = useSocket();
  
  useEffect(() => {
    // Listen for check-in success events
    const removeListener = addEventListener('checkin-success', (data) => {
      const newNotification = {
        id: Date.now(),
        title: 'Check-in Successful!',
        message: `You've been checked in to ${data.eventName} by ${data.scannedBy || 'an organizer'}`,
        eventId: data.eventId,
        eventName: data.eventName,
        timestamp: new Date(),
      };
      
      setNotifications(prev => [...prev, newNotification]);
      
      // Automatically remove notification after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 10000);
    });
    
    return removeListener;
  }, [addEventListener]);
  
  const handleClose = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  return (
    <NotificationContainer>
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
          >
            <IconContainer>
              <FaCheckCircle size={24} />
            </IconContainer>
            <ContentContainer>
              <Title>{notification.title}</Title>
              <Message>
                You've been checked in to <EventName>{notification.eventName}</EventName>
              </Message>
            </ContentContainer>
            <CloseButton onClick={() => handleClose(notification.id)}>
              <FaTimesCircle size={16} />
            </CloseButton>
          </NotificationCard>
        ))}
      </AnimatePresence>
    </NotificationContainer>
  );
};

export default CheckinNotification; 
import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import styled from '@emotion/styled';
import { useSocket } from '../../contexts/SocketContext';
import { FaCheckCircle, FaBullhorn } from 'react-icons/fa';
import theme from '../../styles/theme';

// Styled toast container
const ToastContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: ${theme.colors.primary.dark};
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 340px;

  @media (max-width: 480px) {
    max-width: 280px;
  }
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  color: ${theme.colors.success.light};
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 4px 0;
  color: ${theme.colors.success.light};
`;

const Message = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
`;

// Custom toast component
const CheckinToast = ({ event }) => (
  <ToastContainer>
    <IconWrapper>
      <FaCheckCircle />
    </IconWrapper>
    <ContentWrapper>
      <Title>Check-in Successful</Title>
      <Message>
        You have been checked in to {event.name}!
      </Message>
    </ContentWrapper>
  </ToastContainer>
);

// Main CheckinNotification component
const CheckinNotification = () => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for check-in notifications
    const handleCheckinNotification = (data) => {
      console.log('Received check-in notification:', data);
      
      // Only show notification for first-time check-in
      if (data.isFirstCheckin) {
        toast.custom((t) => (
          <AnimatePresence>
            {t.visible && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
              >
                <CheckinToast event={data.event} />
              </motion.div>
            )}
          </AnimatePresence>
        ), {
          duration: 4000,
          position: 'top-center',
        });
      }
    };

    socket.on('checkin-notification', handleCheckinNotification);

    // Cleanup listener on component unmount
    return () => {
      socket.off('checkin-notification', handleCheckinNotification);
    };
  }, [socket]);

  return <Toaster />;
};

export default CheckinNotification; 
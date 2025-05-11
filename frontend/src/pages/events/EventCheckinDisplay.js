import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { FaTimesCircle, FaSync, FaClock, FaCalendarAlt, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import EventService from '../../services/event.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import theme from '../../styles/theme';
import Button from '../../components/common/Button';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(52, 152, 219, 0); }
  100% { box-shadow: 0 0 0 0 rgba(52, 152, 219, 0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
  }
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out forwards;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.primary.dark};
  margin-bottom: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const EventName = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.primary.main};
  margin-top: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const Subtitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeights.medium};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.md};
  }
`;

const QRContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${theme.colors.background.paper};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.md};
  transition: all ${theme.transitions.default};
  animation: ${fadeIn} 0.6s ease-out forwards;
  margin: 0 auto;
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
  }
`;

const QRWrapper = styled.div`
  background-color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.radius.md};
  margin: ${theme.spacing.lg} 0;
  animation: ${pulse} 2s infinite;
  
  canvas {
    display: block;
  }
`;

const TimerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${theme.spacing.lg};
  gap: ${theme.spacing.sm};
`;

const TimerText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const ErrorContainer = styled(motion.div)`
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.lg};
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, ${theme.colors.error.light}, ${theme.colors.error.dark});
  }
`;

const ErrorIconWrapper = styled(motion.div)`
  width: 96px;
  height: 96px;
  background-color: ${theme.colors.error.light + '20'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto 24px;
  color: ${theme.colors.error.main};
`;

const ErrorTitle = styled(motion.h2)`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.error.dark};
  margin-bottom: ${theme.spacing.md};
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xl};
  background-color: ${theme.colors.background.default};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  margin-top: ${theme.spacing.xl};
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const RetryButton = styled(Button)`
  background-color: ${theme.colors.primary.main};
  color: white;
  font-weight: ${theme.typography.fontWeights.semiBold};
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  
  &:hover {
    background-color: ${theme.colors.primary.dark};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BackButton = styled(Button)`
  background-color: transparent;
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border.main};
  font-weight: ${theme.typography.fontWeights.medium};
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  
  &:hover {
    background-color: ${theme.colors.background.default};
    color: ${theme.colors.text.primary};
  }
`;

const RefreshButton = styled(Button)`
  margin-top: ${theme.spacing.lg};
`;

const EventCheckinDisplay = () => {
  const { eventId } = useParams();
  const [timer, setTimer] = useState(30);

  // Fetch the QR code token
  const {
    data: tokenData,
    isLoading: isLoadingToken,
    isError: isTokenError,
    error: tokenError,
    refetch,
  } = useQuery({
    queryKey: ['checkin-token', eventId],
    queryFn: () => EventService.getCheckinToken(eventId),
    refetchInterval: 30000, // refresh every 30s
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  // Fetch event details to display the name
  const {
    data: eventData,
    isLoading: isLoadingEvent,
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => EventService.getEvent(eventId),
  });

  // Reset timer when QR code is refreshed
  useEffect(() => {
    if (tokenData) {
      setTimer(30);
    }
  }, [tokenData]);

  // Count down timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 30));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const qrValue = useMemo(() => {
    if (!tokenData) return '';
    const { token } = tokenData;
    const origin = window.location.origin;
    return `${origin}/events/${eventId}/attend?token=${encodeURIComponent(token)}`;
  }, [tokenData, eventId]);

  const isLoading = isLoadingToken || isLoadingEvent;

  // ===== NEW: Determine event status (upcoming / ongoing / ended) =====
  const eventStatus = useMemo(() => {
    if (!eventData) return null;
    const now = new Date();
    const start = new Date(eventData.startTime);
    const end = eventData.endTime ? new Date(eventData.endTime) : null;

    if (start > now) return 'upcoming';
    if (end && end < now) return 'ended';
    return 'ongoing';
  }, [eventData]);
  // ===================================================================

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner text="Loading check-in..." />
      </Container>
    );
  }

  // ===== NEW: Restrict check-in to ongoing events only =====
  if (eventStatus === 'upcoming' || eventStatus === 'ended') {
    const message = eventStatus === 'upcoming'
      ? 'Check-in has not started yet. Please come back once the event is in progress.'
      : 'This event has already ended. Check-in is now closed.';

    return (
      <Container>
        <ErrorContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <ErrorIconWrapper
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <FaExclamationTriangle size={56} color={theme.colors.error.main} />
          </ErrorIconWrapper>

          <ErrorTitle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Check-in Unavailable
          </ErrorTitle>

          <ErrorMessage
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {message}
          </ErrorMessage>

          <ButtonGroup
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <BackButton
              as="a"
              href="/events"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Events
            </BackButton>
          </ButtonGroup>
        </ErrorContainer>
      </Container>
    );
  }
  // ===================================================================

  if (isTokenError) {
    return (
      <Container>
        <ErrorContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6,
            ease: [0.43, 0.13, 0.23, 0.96]
          }}
        >
          <ErrorIconWrapper
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <FaTimesCircle size={56} />
          </ErrorIconWrapper>
          
          <ErrorTitle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Check-in Failed
          </ErrorTitle>
          
          <ErrorMessage
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <FaExclamationTriangle size={16} color={theme.colors.error.main} />
            {tokenError.message || 'Token expired'}
          </ErrorMessage>
          
          <ButtonGroup
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <RetryButton 
              onClick={() => refetch()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Again
            </RetryButton>
            
            <BackButton
              as="a"
              href="/events"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Events
            </BackButton>
          </ButtonGroup>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Event Check-In</Title>
        <Subtitle>Scan this QR code with your device to check in</Subtitle>
      </Header>
      
      <QRContainer>
        <QRWrapper>
          <QRCodeCanvas 
            value={qrValue} 
            size={280} 
            fgColor={theme.colors.primary.main} 
            level="H"
            includeMargin 
          />
        </QRWrapper>
        
        {eventData && eventData.name && (
          <EventName>
            <FaCalendarAlt color={theme.colors.primary.main} />
            {eventData.name}
          </EventName>
        )}
        
        <TimerContainer>
          <TimerText>
            <FaClock /> Refreshes in {timer} seconds
          </TimerText>
          <Button 
            size="small" 
            variant="text"
            onClick={() => refetch()}
            title="Refresh QR code now"
          >
            <FaSync />
          </Button>
        </TimerContainer>
      </QRContainer>
    </Container>
  );
};

export default EventCheckinDisplay; 
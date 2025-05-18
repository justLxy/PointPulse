import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCalendarCheck, 
  FaSpinner, 
  FaCalendarAlt,
  FaExclamationTriangle,
  FaArrowLeft
} from 'react-icons/fa';
import theme from '../../styles/theme';
import EventService from '../../services/event.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const Container = styled.div`
  max-width: 500px;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.lg};
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Card = styled(motion.div)`
  width: 100%;
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
  text-align: center;
  overflow: hidden;
  position: relative;
  
  &.error {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(90deg, ${theme.colors.error.light}, ${theme.colors.error.dark});
    }
  }
  
  &.success {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(90deg, ${theme.colors.success.light}, ${theme.colors.success.dark});
    }
  }
  
  &.warning {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 5px;
      background: linear-gradient(90deg, ${theme.colors.warning.light}, ${theme.colors.warning.dark});
    }
  }
  
  @media (max-width: 480px) {
    padding: ${theme.spacing.lg};
  }
`;

const IconContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing.lg};
  
  &.success {
    background-color: rgba(46, 204, 113, 0.1);
    box-shadow: 0 0 30px rgba(46, 204, 113, 0.15);
  }
  
  &.error {
    background-color: rgba(231, 76, 60, 0.1);
    box-shadow: 0 0 30px rgba(231, 76, 60, 0.15);
  }
  
  &.warning {
    background-color: rgba(243, 156, 18, 0.1);
    box-shadow: 0 0 30px rgba(243, 156, 18, 0.15);
  }
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
  }
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  margin-bottom: ${theme.spacing.md};
  
  &.success {
    color: ${theme.colors.success.main};
  }
  
  &.error {
    color: ${theme.colors.error.main};
  }
  
  &.warning {
    color: ${theme.colors.warning.main};
  }
  
  @media (max-width: 480px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const Message = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${theme.spacing.lg};
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  
  strong {
    color: ${theme.colors.text.primary};
    font-weight: ${theme.typography.fontWeights.semiBold};
  }
`;

const SuccessIcon = styled(FaCheckCircle)`
  color: ${theme.colors.success.main};
  font-size: 72px;
`;

const ErrorIcon = styled(FaTimesCircle)`
  color: ${theme.colors.error.main};
  font-size: 72px;
`;

const WarningIcon = styled(FaCalendarCheck)`
  color: ${theme.colors.warning.main};
  font-size: 72px;
`;

const TimeBlock = styled.div`
  margin-top: ${theme.spacing.lg};
  background-color: ${theme.colors.primary.dark};
  color: white;
  padding: ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  box-shadow: ${theme.shadows.sm};
  
  svg {
    font-size: 1.2em;
  }
`;

const ErrorMessage = styled.div`
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
  max-width: 85%;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
    width: 100%;
    
    button {
      width: 100%;
    }
  }
`;

const PrimaryButton = styled(Button)`
  background-color: ${theme.colors.primary.main};
  color: white;
  font-weight: ${theme.typography.fontWeights.semiBold};
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  
  &:hover {
    background-color: ${theme.colors.primary.dark};
  }
`;

const SecondaryButton = styled(Button)`
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

const spin = `
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SpinnerIcon = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  margin-right: ${theme.spacing.sm};
  ${spin}
`;

const EventCheckinAttend = () => {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get token from data parameter first (new format)
  const dataParam = searchParams.get('data');
  let token = null;
  
  if (dataParam) {
    try {
      // Decode the base64 JSON data
      const decodedData = JSON.parse(atob(decodeURIComponent(dataParam)));
      if (decodedData && decodedData.type === 'pointpulse' && decodedData.context === 'event' && decodedData.token) {
        token = decodedData.token;
      }
    } catch (error) {
      console.error('Failed to decode data parameter:', error);
    }
  }
  
  // If no token was extracted, set token to null (no legacy fallback needed)
  
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'needsRsvp'
  const [time, setTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [eventName, setEventName] = useState('');

  const processCheckin = useCallback(async () => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Invalid or missing token.');
      return;
    }

    const parts = token.split(':');
    if (parts.length !== 3) {
      setStatus('error');
      setErrorMsg('Malformed token.');
      return;
    }
    const [eid, timestamp, signature] = parts;
    if (eid !== eventId) {
      setStatus('error');
      setErrorMsg('Event mismatch.');
      return;
    }

    try {
      // Get event details to display the name
      try {
        const eventDetail = await EventService.getEvent(eventId);
        setEventName(eventDetail.name);

        // ===== NEW: Restrict check-in to ongoing events only =====
        const now = new Date();
        const start = new Date(eventDetail.startTime);
        const end = eventDetail.endTime ? new Date(eventDetail.endTime) : null;

        if (start > now) {
          setStatus('error');
          setErrorMsg('This event has not started yet. Check-in will open once the event is ongoing.');
          return;
        }
        if (end && end < now) {
          setStatus('error');
          setErrorMsg('This event has already ended. Check-in is closed.');
          return;
        }
        // =========================================================
      } catch (error) {
        console.error("Could not fetch event details", error);
      }

      const res = await EventService.submitCheckin(eventId, { timestamp, signature });
      setStatus('success');
      setTime(res.checkedInAt ? new Date(res.checkedInAt).toLocaleTimeString() : new Date().toLocaleTimeString());
      
      // Update the event cache to reflect the check-in status
      queryClient.invalidateQueries(['event', eventId]);
      queryClient.invalidateQueries(['events']);
      
    } catch (err) {
      if (err.message?.includes('log in')) {
        // Use URL parameters and state for returning to this page after login
        // Create data payload for the redirect URL
        const payload = {
          type: 'pointpulse',
          version: '1.0',
          context: 'event',
          eventId: eventId,
          token: token
        };
        const encodedData = encodeURIComponent(btoa(JSON.stringify(payload)));
        const returnUrl = encodeURIComponent(`/events/${eventId}/attend?data=${encodedData}`);
        
        navigate(`/login?returnUrl=${returnUrl}`, {
          state: { from: window.location.pathname + window.location.search },
        });
        return;
      }
      
      // Check if this is a "needs RSVP" error
      if (err.response?.data?.needsRsvp) {
        setStatus('needsRsvp');
        return;
      }
      
      setStatus('error');
      setErrorMsg(err.message || 'Unknown error occurred');
    }
  }, [token, eventId, navigate, queryClient]);

  // Handle RSVP action
  const handleRsvp = useCallback(async () => {
    try {
      setStatus('rsvping');
      await EventService.rsvpToEvent(eventId);
      // After successful RSVP, retry check-in with same token
      processCheckin();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to RSVP. Please try again.');
    }
  }, [eventId, processCheckin]);

  useEffect(() => {
    processCheckin();
  }, [processCheckin]);

  return (
    <Container>
      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <Card
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingSpinner text="Checking in..." />
          </Card>
        )}

        {status === 'success' && (
          <Card
            key="success"
            className="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <IconContainer className="success">
              <SuccessIcon />
            </IconContainer>
            
            <Title className="success">
              Check-in Successful!
            </Title>
            
            {eventName && (
              <Message>
                You have successfully checked in to <strong>{eventName}</strong>.
              </Message>
            )}
            
            <TimeBlock>
              <FaCalendarAlt /> Checked in at {time}
            </TimeBlock>
            
            <ButtonGroup>
              <PrimaryButton onClick={() => navigate('/events')}>
                View All Events
              </PrimaryButton>
            </ButtonGroup>
          </Card>
        )}

        {status === 'needsRsvp' && (
          <Card
            key="needsRsvp"
            className="warning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <IconContainer className="warning">
              <WarningIcon />
            </IconContainer>
            
            <Title className="warning">RSVP Required</Title>
            
            <Message>
              {eventName 
                ? `You need to RSVP to "${eventName}" before checking in.` 
                : 'You need to RSVP to this event before checking in.'}
              <br />
              RSVP now to confirm your attendance and get access to check-in.
            </Message>
            
            <ButtonGroup>
              <PrimaryButton 
                onClick={handleRsvp}
                disabled={status === 'rsvping'}
              >
                {status === 'rsvping' ? (
                  <>
                    <SpinnerIcon size={16} /> Processing RSVP...
                  </>
                ) : (
                  'RSVP Now'
                )}
              </PrimaryButton>
            </ButtonGroup>
          </Card>
        )}

        {status === 'error' && (
          <Card
            key="error"
            className="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <IconContainer className="error">
              <ErrorIcon />
            </IconContainer>
            
            <Title className="error">
              Check-in Failed
            </Title>
            
            <ErrorMessage>
              <FaExclamationTriangle style={{ color: theme.colors.error.main, flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </ErrorMessage>
            
            <ButtonGroup>
              <PrimaryButton onClick={() => window.location.reload()}>
                Try Again
              </PrimaryButton>
              
              <SecondaryButton onClick={() => navigate('/events')}>
                <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Events
              </SecondaryButton>
            </ButtonGroup>
          </Card>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default EventCheckinAttend; 
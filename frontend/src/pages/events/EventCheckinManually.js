import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaCalendarCheck, 
  FaSpinner, 
  FaCalendarAlt,
  FaExclamationTriangle,
  FaArrowLeft,
  FaUser,
  FaClock
} from 'react-icons/fa';
import theme from '../../styles/theme';
import EventService from '../../services/event.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../contexts/AuthContext';

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

const EventList = styled.div`
  width: 100%;
  margin-top: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const EventItem = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.default};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.md};
  text-align: left;
  cursor: pointer;
  transition: all ${theme.transitions.default};
  
  &:hover {
    background-color: ${theme.colors.background.hover};
    border-color: ${theme.colors.primary.light};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EventName = styled.div`
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: ${theme.spacing.xs};
`;

const EventDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  gap: ${theme.spacing.md};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};
  
  svg {
    color: ${theme.colors.primary.main};
  }
`;

const EventCheckinManually = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeRole } = useAuth();
  const utorid = searchParams.get('utorid');
  
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  // Fetch events where user is organizer
  const { events, isLoading: isLoadingEvents } = useEvents({
    organizing: true,
    started: false,
    ended: false
  });

  useEffect(() => {
    if (!utorid) {
      setStatus('error');
      setErrorMsg('No UTORid provided');
      return;
    }

    if (!['manager', 'superuser'].includes(activeRole)) {
      setStatus('error');
      setErrorMsg('You do not have permission to check in users');
      return;
    }

    setStatus('ready');
  }, [utorid, activeRole]);

  const handleCheckIn = async (eventId) => {
    try {
      setCheckingIn(true);
      await EventService.checkInUser(eventId, utorid);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to check in user');
    } finally {
      setCheckingIn(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoadingEvents) {
    return (
      <Container>
        <LoadingSpinner text="Loading events..." />
      </Container>
    );
  }

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
            <LoadingSpinner text="Loading..." />
          </Card>
        )}

        {status === 'ready' && (
          <Card
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <UserInfo>
              <FaUser size={24} />
              <div>
                <strong>UTORid:</strong> {utorid}
              </div>
            </UserInfo>

            <Title>Select Event to Check In</Title>
            <Message>
              Choose an event to check in this user
            </Message>

            <EventList>
              {events?.map(event => (
                <EventItem
                  key={event.id}
                  onClick={() => handleCheckIn(event.id)}
                  disabled={checkingIn}
                >
                  <EventName>{event.name}</EventName>
                  <EventDetails>
                    <span>
                      <FaCalendarAlt /> {formatDate(event.startTime)}
                    </span>
                    <span>
                      <FaClock /> {formatTime(event.startTime)}
                    </span>
                  </EventDetails>
                </EventItem>
              ))}
            </EventList>
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
              <FaCheckCircle size={48} color={theme.colors.success.main} />
            </IconContainer>
            
            <Title className="success">
              Check-in Successful!
            </Title>
            
            <Message>
              User <strong>{utorid}</strong> has been successfully checked in.
            </Message>
            
            <Button
              onClick={() => navigate('/events')}
              style={{ marginTop: theme.spacing.lg }}
            >
              Back to Events
            </Button>
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
              <FaTimesCircle size={48} color={theme.colors.error.main} />
            </IconContainer>
            
            <Title className="error">
              Check-in Failed
            </Title>
            
            <Message>
              <FaExclamationTriangle style={{ color: theme.colors.error.main, marginRight: '8px' }} />
              {errorMsg}
            </Message>
            
            <Button
              onClick={() => window.location.reload()}
              style={{ marginTop: theme.spacing.lg }}
            >
              Try Again
            </Button>
          </Card>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default EventCheckinManually; 
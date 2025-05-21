import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import theme from '../../styles/theme';
import EventService from '../../services/event.service';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaUser } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.md} 0;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Instructions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const ResultCard = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.md};
  background-color: ${({ status }) => 
    status === 'success' 
      ? theme.colors.success.light + '10'
      : theme.colors.error.light + '10'
  };
  text-align: center;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  margin-bottom: ${theme.spacing.md};
  border-radius: 50%;
  background-color: ${({ status }) => 
    status === 'success'
      ? theme.colors.success.light + '20'
      : theme.colors.error.light + '20'
  };
`;

const SuccessIcon = styled(FaCheckCircle)`
  color: ${theme.colors.success.main};
  font-size: 56px;
`;

const ErrorIcon = styled(FaTimesCircle)`
  color: ${theme.colors.error.main};
  font-size: 56px;
`;

const ResultTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md} 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${({ status }) => 
    status === 'success'
      ? theme.colors.success.dark
      : theme.colors.error.dark
  };
`;

const ResultMessage = styled.p`
  margin: 0 0 ${theme.spacing.md} 0;
  color: ${theme.colors.text.secondary};
`;

const AttendeeInfo = styled.div`
  margin: ${theme.spacing.md} 0;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.md};
  width: 100%;
  text-align: center;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const ManualCheckinModal = ({ isOpen, onClose, eventId, onCheckinSuccess }) => {
  const [utorid, setUtorid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkinResult, setCheckinResult] = useState(null);
  
  const handleClose = () => {
    onClose();
    // Reset state when closing
    setUtorid('');
    setCheckinResult(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!utorid.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = await EventService.checkinByScan(eventId, utorid.trim());
      
      const date = data.checkedInAt ? new Date(data.checkedInAt) : new Date();
      
      setCheckinResult({
        status: 'success',
        message: data.message || 'Check-in successful',
        name: data.name,
        utorid: utorid.trim(),
        time: date.toLocaleString(),
      });
      
      // Trigger success callback if provided
      if (onCheckinSuccess) {
        onCheckinSuccess(data);
      }
    } catch (error) {
      setCheckinResult({
        status: 'error',
        message: error.message || 'Check-in failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setUtorid('');
    setCheckinResult(null);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Manual Attendee Check-in" size="medium">
      <Container>
        {!checkinResult ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%' }}
          >
            <Instructions>
              <span>Enter the UTORid of the attendee you want to check in</span>
            </Instructions>
            
            <Form onSubmit={handleSubmit}>
              <Input
                label="UTORid"
                value={utorid}
                onChange={(e) => setUtorid(e.target.value)}
                placeholder="Enter UTORid (e.g., johndoe1)"
                required
                autoFocus
              />
              
              <ButtonsContainer>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={!utorid.trim() || isSubmitting}
                >
                  Check In
                </Button>
              </ButtonsContainer>
            </Form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <ResultCard status={checkinResult.status}>
              <IconWrapper status={checkinResult.status}>
                {checkinResult.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
              </IconWrapper>
              
              <ResultTitle status={checkinResult.status}>
                {checkinResult.status === 'success' ? 'Check-in Successful' : 'Check-in Failed'}
              </ResultTitle>
              
              <ResultMessage>{checkinResult.message}</ResultMessage>
              
              {checkinResult.name && (
                <AttendeeInfo>
                  <h4 style={{ margin: '0 0 4px 0' }}>{checkinResult.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.text.secondary }}>
                    {checkinResult.utorid}
                  </p>
                </AttendeeInfo>
              )}
              
              {checkinResult.time && (
                <p style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, margin: 0 }}>
                  {checkinResult.time}
                </p>
              )}
              
              <ButtonsContainer>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                >
                  Close
                </Button>
                {checkinResult.status === 'success' && (
                  <Button
                    onClick={handleReset}
                  >
                    Check In Another
                  </Button>
                )}
              </ButtonsContainer>
            </ResultCard>
          </motion.div>
        )}
      </Container>
    </Modal>
  );
};

export default ManualCheckinModal; 
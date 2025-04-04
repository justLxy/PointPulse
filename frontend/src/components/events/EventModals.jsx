import React from 'react';
import styled from '@emotion/styled';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { FaInfo } from 'react-icons/fa';
import theme from '../../styles/theme';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  
  button {
    flex: 1;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  & > * {
    flex: 1;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StyledInput = styled(Input)`
  width: 100%;
  
  input, textarea {
    border-radius: ${theme.radius.md};
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    
    &:focus {
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
  }
`;

const WarningBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
  background-color: ${theme.colors.error.light}20;
  border-radius: ${theme.radius.md};
  
  strong {
    font-size: ${theme.typography.fontSize.lg};
    margin-bottom: ${theme.spacing.sm};
  }
  
  p {
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }
`;

const InfoBox = styled.div`
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${theme.spacing.sm};
    min-width: 16px;
  }
`;

export const CreateEventModal = ({ 
  isOpen, 
  onClose, 
  eventData, 
  handleFormChange, 
  handleCreateEvent, 
  isCreating,
  isManager
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event"
      size="large"
    >
      <ModalContent>
        <ModalForm>
          <StyledInput
            label="Event Name"
            value={eventData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            placeholder="Enter event name"
            required
          />
          
          <StyledInput
            label="Description"
            value={eventData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="Enter event description"
            multiline
            rows={3}
            required
          />
          
          <StyledInput
            label="Location"
            value={eventData.location}
            onChange={(e) => handleFormChange('location', e.target.value)}
            placeholder="Enter event location"
            required
          />
          
          <FormGroup>
            <StyledInput
              label="Start Time"
              type="datetime-local"
              value={eventData.startTime}
              onChange={(e) => handleFormChange('startTime', e.target.value)}
              required
            />
            
            <StyledInput
              label="End Time"
              type="datetime-local"
              value={eventData.endTime}
              onChange={(e) => handleFormChange('endTime', e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <StyledInput
              label="Capacity"
              type="number"
              value={eventData.capacity}
              onChange={(e) => handleFormChange('capacity', e.target.value)}
              placeholder="Max number of attendees (optional)"
              helperText="Leave empty for no limit"
            />
          </FormGroup>
          
          {isManager && (
            <FormGroup>
              <StyledInput
                label="Points"
                type="number"
                value={eventData.points}
                onChange={(e) => handleFormChange('points', e.target.value)}
                placeholder="Points to award to attendees"
                required
              />
            </FormGroup>
          )}
          
          {isManager && (
            <InfoBox>
              <FaInfo size={16} />
              <span>New events are created as unpublished by default. You can publish them later from the Edit screen.</span>
            </InfoBox>
          )}
        </ModalForm>
        
        <ModalActions>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateEvent}
            loading={isCreating}
          >
            Create Event
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export const EditEventModal = ({ 
  isOpen, 
  onClose, 
  eventData, 
  selectedEvent,
  handleFormChange, 
  handleUpdateEvent, 
  isUpdating,
  isManager,
  isDisabled
}) => {
  // Add console logs to debug
  React.useEffect(() => {
    if (isOpen && selectedEvent) {
      console.log("EditModal opened with description:", eventData.description);
      console.log("Selected event data:", selectedEvent);
    }
  }, [isOpen, eventData.description, selectedEvent]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Event: ${selectedEvent?.name || ''}`}
      size="large"
    >
      <ModalContent>
        <ModalForm>
          <StyledInput
            label="Event Name"
            value={eventData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            placeholder="Enter event name"
            required
          />
          
          <StyledInput
            label="Description"
            value={eventData.description || ''}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="Enter event description"
            multiline
            rows={3}
            required
            key={`description-${isOpen}-${selectedEvent?.id}`}
          />
          
          <StyledInput
            label="Location"
            value={eventData.location}
            onChange={(e) => handleFormChange('location', e.target.value)}
            placeholder="Enter event location"
            required
          />
          
          <FormGroup>
            <StyledInput
              label="Start Time"
              type="datetime-local"
              value={eventData.startTime}
              onChange={(e) => handleFormChange('startTime', e.target.value)}
              required
            />
            
            <StyledInput
              label="End Time"
              type="datetime-local"
              value={eventData.endTime}
              onChange={(e) => handleFormChange('endTime', e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <StyledInput
              label="Capacity"
              type="number"
              value={eventData.capacity}
              onChange={(e) => handleFormChange('capacity', e.target.value)}
              placeholder="Max number of attendees (optional)"
              helperText="Leave empty for no limit"
            />
          </FormGroup>
          
          {isManager && (
            <FormGroup>
              <StyledInput
                label="Points"
                type="number"
                value={eventData.points}
                onChange={(e) => handleFormChange('points', e.target.value)}
                placeholder="Points to award to attendees"
                required
              />
            </FormGroup>
          )}
          
          {isManager && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginTop: theme.spacing.sm,
              padding: theme.spacing.sm,
              backgroundColor: theme.colors.background.default,
              borderRadius: theme.radius.md
            }}>
              <input
                type="checkbox"
                id="published"
                checked={eventData.published}
                onChange={(e) => handleFormChange('published', e.target.checked)}
                style={{ marginRight: theme.spacing.sm }}
                disabled={selectedEvent?.published} // Disable if already published
              />
              <label htmlFor="published" style={{ 
                fontSize: theme.typography.fontSize.sm,
                display: 'flex',
                alignItems: 'center',
                cursor: selectedEvent?.published ? 'not-allowed' : 'pointer'
              }}>
                {selectedEvent?.published ? (
                  <>
                    <span style={{ 
                      color: theme.colors.success.main, 
                      marginRight: theme.spacing.xs 
                    }}>✓</span> 
                    This event is published and visible to users
                  </>
                ) : (
                  <>Publish this event and make it visible to users</>
                )}
              </label>
            </div>
          )}
        </ModalForm>
        
        <ModalActions>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateEvent}
            loading={isUpdating}
            disabled={isDisabled}
            title={isDisabled ? "Cannot update a past event" : ""}
          >
            Update Event
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export const DeleteEventModal = ({ 
  isOpen, 
  onClose, 
  selectedEvent, 
  handleDeleteEvent, 
  isDeleting 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Event"
      size="small"
    >
      <ModalContent>
        <WarningBox>
          <strong>{selectedEvent?.name}</strong>
          <p>Are you sure you want to delete this event?</p>
          <p>This action cannot be undone and will remove all RSVPs.</p>
        </WarningBox>
        
        <ModalActions>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleDeleteEvent}
            loading={isDeleting}
          >
            Delete
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export const RsvpEventModal = ({ 
  isOpen, 
  onClose, 
  selectedEvent,
  isRsvpd,
  handleRsvp,
  handleCancelRsvp,
  isRsvping,
  isCancellingRsvp,
  formatDate,
  formatTime
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRsvpd(selectedEvent) ? "Cancel RSVP" : "RSVP to Event"}
      size="small"
    >
      <ModalContent>
        {isRsvpd(selectedEvent) ? (
          <>
            <WarningBox>
              <strong>{selectedEvent?.name}</strong>
              <p>Are you sure you want to cancel your RSVP for this event?</p>
              <p>You may not be able to RSVP again if the event reaches capacity.</p>
            </WarningBox>
            
            <ModalActions>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={isCancellingRsvp}
              >
                Keep my RSVP
              </Button>
              <Button
                color="error"
                onClick={handleCancelRsvp}
                loading={isCancellingRsvp}
              >
                Cancel RSVP
              </Button>
            </ModalActions>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: theme.spacing.md }}>
              <h3 style={{ 
                fontSize: theme.typography.fontSize.xl, 
                fontWeight: theme.typography.fontWeights.bold,
                marginBottom: theme.spacing.sm
              }}>
                {selectedEvent?.name}
              </h3>
              <p style={{ color: theme.colors.text.secondary }}>
                {formatDate(selectedEvent?.startTime)} at {formatTime(selectedEvent?.startTime)}
              </p>
              <p style={{ color: theme.colors.text.secondary }}>
                {selectedEvent?.location}
              </p>
            </div>
            
            <ModalActions>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={isRsvping}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRsvp}
                loading={isRsvping}
              >
                Confirm RSVP
              </Button>
            </ModalActions>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}; 
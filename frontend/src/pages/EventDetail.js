import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useEvents } from '../hooks/useEvents';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import theme from '../styles/theme';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaCoins,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaTrophy,
  FaArrowLeft,
  FaUserCog,
  FaUserMinus,
} from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
  }
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  svg {
    margin-right: ${theme.spacing.xs};
  }
  
  &:hover {
    color: ${theme.colors.primary.main};
  }
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const PageSubtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
`;

const PageActionsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const EventDescription = styled.div`
  line-height: 1.6;
  color: ${theme.colors.text.primary};
  white-space: pre-wrap;
`;

const EventMetadata = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
  
  h3 {
    font-size: ${theme.typography.fontSize.lg};
    font-weight: ${theme.typography.fontWeights.semiBold};
    margin-bottom: ${theme.spacing.sm};
  }
`;

const EventDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};
  
  svg {
    color: ${theme.colors.text.secondary};
    font-size: 1.2rem;
  }
`;

const TabContainer = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.border.light};
  margin-bottom: ${theme.spacing.lg};
`;

const TabButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${props => props.active ? theme.colors.primary.main : theme.colors.text.secondary};
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary.main : 'transparent'};
  cursor: pointer;
  transition: all ${theme.transitions.default};
  
  &:hover {
    color: ${theme.colors.primary.main};
  }
`;

const AttendeesContainer = styled.div`
  margin-top: ${theme.spacing.md};
`;

const AttendeeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-of-type {
    border-bottom: none;
  }
`;

const AttendeeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AttendeeName = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
`;

const AttendeeSubtext = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const AttendeeActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm};
`;

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
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
`;

const SummaryCard = styled(Card)`
  position: sticky;
  top: ${theme.spacing.lg}; // Sticks to the top when scrolling
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  font-size: ${theme.typography.fontSize.sm};

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border.light};
  }

  strong {
    color: ${theme.colors.text.primary};
    font-weight: ${theme.typography.fontWeights.medium};
  }

  span {
    color: ${theme.colors.text.secondary};
  }
`;

// Create a custom Badge component that accepts hex color values
const ColoredBadge = styled(Badge)`
  background-color: ${props => props.customColor || theme.colors.primary.main};
  color: white;
  font-weight: ${theme.typography.fontWeights.medium};
  
  /* Ensure good contrast with text */
  ${props => props.customColor === '#f4d03f' && `
    color: #333; /* Darker text for yellow background */
  `}
`;

// Add this new styled component for the status indicator
const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  
  span {
    margin-left: ${theme.spacing.sm};
    font-weight: ${theme.typography.fontWeights.medium};
    color: ${theme.colors.text.primary}; // Use primary text color for better readability
  }
  
  &::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => 
      props.status === 'Upcoming' ? '#f4d03f' : // Yellow for upcoming
      props.status === 'Ongoing' ? '#2ecc71' :  // Green for ongoing
      '#e74c3c'  // Red for past
    };
  }
`;

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { activeRole } = useAuth();
  
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('details');
  
  // Modals state
  const [addOrganizerModalOpen, setAddOrganizerModalOpen] = useState(false);
  const [addGuestModalOpen, setAddGuestModalOpen] = useState(false);
  const [awardPointsModalOpen, setAwardPointsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  
  // Fetch event details
  const { 
    getEvent, 
    rsvpToEvent, 
    cancelRsvp,
    addOrganizer,
    removeOrganizer,
    addGuest,
    removeGuest,
    awardPoints,
    isRsvping,
    isCancellingRsvp,
    isAwardingPoints,
  } = useEvents();
  
  const { data: event, isLoading, error, refetch } = getEvent(eventId);
  
  // For searching users
  const [userSearchParams, setUserSearchParams] = useState({
    name: '',
    limit: 5,
  });
  
  const { users } = useUsers(userSearchParams);
  
  // Handle RSVP
  const handleRsvp = () => {
    rsvpToEvent(eventId, {
      onSuccess: () => {
        refetch();
      },
    });
  };
  
  // Handle cancel RSVP
  const handleCancelRsvp = () => {
    cancelRsvp(eventId, {
      onSuccess: () => {
        refetch();
      },
    });
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Check if event is upcoming
  const isUpcoming = (startTime) => {
    if (!startTime) return false;
    const now = new Date();
    return new Date(startTime) > now;
  };
  
  // Is user attending
  const isUserAttending = () => {
    return event?.isAttending || false;
  };
  
  // Is user an organizer
  const isUserOrganizer = () => {
    return event?.isOrganizer || false;
  };
  
  // Calculate event status
  const getEventStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    
    if (start > now) {
      return { text: 'Upcoming', color: '#f4d03f' }; // Yellow
    }
    if (end && end < now) {
      return { text: 'Past', color: '#e74c3c' }; // Red
    }
    // If start is in the past and end is in the future (or null), it's ongoing
    return { text: 'Ongoing', color: '#2ecc71' }; // Green
  };
  
  // Can edit event
  const canEditEvent = () => {
    return isManager || isUserOrganizer();
  };
  
  // Handle add organizer
  const handleAddOrganizer = () => {
    if (!selectedUserId) return;
    
    addOrganizer(
      { eventId, userId: selectedUserId },
      {
        onSuccess: () => {
          setAddOrganizerModalOpen(false);
          setSelectedUserId(null);
          refetch();
        },
      }
    );
  };
  
  // Handle remove organizer
  const handleRemoveOrganizer = (userId) => {
    removeOrganizer(
      { eventId, userId },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };
  
  // Handle add guest
  const handleAddGuest = () => {
    if (!selectedUserId) return;
    
    addGuest(
      { eventId, userId: selectedUserId },
      {
        onSuccess: () => {
          setAddGuestModalOpen(false);
          setSelectedUserId(null);
          refetch();
        },
      }
    );
  };
  
  // Handle remove guest
  const handleRemoveGuest = (userId) => {
    removeGuest(
      { eventId, userId },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };
  
  // Handle award points
  const handleAwardPoints = () => {
    if (!selectedUserId || !pointsAmount) return;
    
    const points = parseInt(pointsAmount);
    if (isNaN(points) || points <= 0) return;
    
    awardPoints(
      { eventId, userId: selectedUserId, points },
      {
        onSuccess: () => {
          setAwardPointsModalOpen(false);
          setSelectedUserId(null);
          setPointsAmount('');
          refetch();
        },
      }
    );
  };
  
  // Award points to all guests
  const handleAwardPointsToAll = () => {
    const points = parseInt(pointsAmount);
    if (isNaN(points) || points <= 0) return;
    
    awardPoints(
      { eventId, points },
      {
        onSuccess: () => {
          setAwardPointsModalOpen(false);
          setPointsAmount('');
          refetch();
        },
      }
    );
  };
  
  // Search for users
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setUserSearchParams({
        name: searchQuery,
        limit: 5,
      });
    }
  }, [searchQuery]);
  
  if (isLoading) {
    return <LoadingSpinner text="Loading event details..." />;
  }
  
  if (error) {
    return <EmptyState>Error loading event: {error.message}</EmptyState>;
  }
  
  if (!event) {
    return <EmptyState>Event not found</EmptyState>;
  }
  
  const eventStatus = getEventStatus(event.startTime, event.endTime);
  const attending = isUserAttending();
  const isOrganizer = isUserOrganizer();
  
  return (
    <div>
      <PageHeader>
        <div>
          <BackLink to="/events">
            <FaArrowLeft /> Back to Events
          </BackLink>
          <PageTitle>{event.name}</PageTitle>
          <BadgeContainer>
            <ColoredBadge customColor={eventStatus.color}>{eventStatus.text}</ColoredBadge>
            
            {attending && <Badge color="info">RSVP'd</Badge>}
            
            {isOrganizer && <Badge color="primary">You're an Organizer</Badge>}
          </BadgeContainer>
        </div>
        
        <PageActionsContainer>
          {eventStatus.text === 'Upcoming' && !isOrganizer && (
            attending ? (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleCancelRsvp}
                loading={isCancellingRsvp}
              >
                Cancel RSVP
              </Button>
            ) : (
              <Button 
                onClick={handleRsvp}
                loading={isRsvping}
              >
                RSVP to Event
              </Button>
            )
          )}
        </PageActionsContainer>
      </PageHeader>
      
      <ContentGrid>
        <EventInfo>
          <Card>
            <Card.Header>
              <Card.Title>Event Details</Card.Title>
            </Card.Header>
            <Card.Body>
              <EventDescription>{event.description}</EventDescription>
              
              <EventMetadata>
                <EventDetailItem>
                  <FaMapMarkerAlt />
                  <div>
                    <strong>Location</strong>
                    <div>{event.location}</div>
                  </div>
                </EventDetailItem>
                
                <EventDetailItem>
                  <FaCalendarAlt />
                  <div>
                    <strong>Date</strong>
                    <div>
                      {formatDate(event.startTime)}
                      {event.endTime && new Date(event.startTime).toDateString() !== new Date(event.endTime).toDateString() && 
                        ` - ${formatDate(event.endTime)}`}
                    </div>
                  </div>
                </EventDetailItem>
                
                <EventDetailItem>
                  <FaClock />
                  <div>
                    <strong>Time</strong>
                    <div>
                      {formatTime(event.startTime)} - {event.endTime ? formatTime(event.endTime) : 'TBD'}
                    </div>
                  </div>
                </EventDetailItem>
                
                <EventDetailItem>
                  <FaUsers />
                  <div>
                    <strong>Capacity</strong>
                    <div>
                      {event.guests && Array.isArray(event.guests) ? event.guests.length : 0} attendees
                      {event.capacity ? ` (max: ${event.capacity})` : ' (unlimited)'}
                    </div>
                  </div>
                </EventDetailItem>
                
                <EventDetailItem>
                  <FaCoins />
                  <div>
                    <strong>Points</strong>
                    <div>
                      {event.pointsAwarded || 0} points awarded 
                      ({event.pointsRemain ?? event.points ?? 0} remaining)
                    </div>
                  </div>
                </EventDetailItem>
              </EventMetadata>
            </Card.Body>
          </Card>
          
          <TabContainer>
            <TabHeader>
              <TabButton 
                active={activeTab === 'details'} 
                onClick={() => setActiveTab('details')}
              >
                Details
              </TabButton>
              <TabButton 
                active={activeTab === 'guests'} 
                onClick={() => setActiveTab('guests')}
              >
                Guests ({event.guests && Array.isArray(event.guests) ? event.guests.length : 0})
              </TabButton>
              {canEditEvent() && (
                <TabButton 
                  active={activeTab === 'organizers'} 
                  onClick={() => setActiveTab('organizers')}
                >
                  Organizers ({event.organizers && Array.isArray(event.organizers) ? event.organizers.length : 0})
                </TabButton>
              )}
            </TabHeader>
            
            {activeTab === 'details' && (
              <Card>
                <Card.Body>
                  <h3>About this Event</h3>
                  <p>{event.description}</p>
                </Card.Body>
              </Card>
            )}
            
            {activeTab === 'guests' && (
              <Card>
                <Card.Header>
                  <Card.Title>Guests</Card.Title>
                  {canEditEvent() && eventStatus.text === 'Upcoming' && (
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                      <Button 
                        size="small" 
                        onClick={() => setAddGuestModalOpen(true)}
                      >
                        <FaUserPlus /> Add Guest
                      </Button>
                      {isManager && (
                        <Button 
                          size="small" 
                          onClick={() => setAwardPointsModalOpen(true)}
                        >
                          <FaTrophy /> Award Points
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Header>
                <Card.Body>
                  <AttendeesContainer>
                    {event.guests && Array.isArray(event.guests) && event.guests.length > 0 ? (
                      event.guests.map(guest => (
                        <AttendeeRow key={guest.id}>
                          <AttendeeInfo>
                            <AttendeeName>{guest.name}</AttendeeName>
                            <AttendeeSubtext>{guest.utorid}</AttendeeSubtext>
                          </AttendeeInfo>
                          {canEditEvent() && (
                            <AttendeeActions>
                              {guest.pointsAwarded ? (
                                <Badge color="success">{guest.pointsAwarded} points awarded</Badge>
                              ) : eventStatus.text === 'Upcoming' && (
                                isManager && (
                                  <Button 
                                    size="small" 
                                    variant="outlined"
                                    onClick={() => {
                                      setSelectedUserId(guest.id);
                                      setAwardPointsModalOpen(true);
                                    }}
                                  >
                                    <FaTrophy /> Award Points
                                  </Button>
                                )
                              )}
                              
                              {canEditEvent() && (
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  color="error"
                                  onClick={() => handleRemoveGuest(guest.id)}
                                >
                                  <FaUserMinus />
                                </Button>
                              )}
                            </AttendeeActions>
                          )}
                        </AttendeeRow>
                      ))
                    ) : (
                      <EmptyState>No guests registered for this event yet.</EmptyState>
                    )}
                  </AttendeesContainer>
                </Card.Body>
              </Card>
            )}
            
            {activeTab === 'organizers' && canEditEvent() && (
              <Card>
                <Card.Header>
                  <Card.Title>Organizers</Card.Title>
                  {isManager && (
                    <Button 
                      size="small" 
                      onClick={() => setAddOrganizerModalOpen(true)}
                    >
                      <FaUserCog /> Add Organizer
                    </Button>
                  )}
                </Card.Header>
                <Card.Body>
                  <AttendeesContainer>
                    {event.organizers && Array.isArray(event.organizers) && event.organizers.length > 0 ? (
                      event.organizers.map(organizer => (
                        <AttendeeRow key={organizer.id}>
                          <AttendeeInfo>
                            <AttendeeName>{organizer.name}</AttendeeName>
                            <AttendeeSubtext>{organizer.utorid}</AttendeeSubtext>
                          </AttendeeInfo>
                          {isManager && (
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="error"
                              onClick={() => handleRemoveOrganizer(organizer.id)}
                            >
                              <FaUserMinus />
                            </Button>
                          )}
                        </AttendeeRow>
                      ))
                    ) : (
                      <EmptyState>No organizers assigned to this event yet.</EmptyState>
                    )}
                  </AttendeesContainer>
                </Card.Body>
              </Card>
            )}
          </TabContainer>
        </EventInfo>
        
        <div>
          <SummaryCard>
            <Card.Header>
              <Card.Title>Event Summary</Card.Title>
            </Card.Header>
            <Card.Body>
              <SummaryItem>
                <strong>Created by:</strong>
                <span>{event.organizers?.[0]?.name || 'N/A'}</span>
              </SummaryItem>
              <SummaryItem>
                <strong>Status:</strong>
                <StatusIndicator status={eventStatus.text}>
                  <span>{eventStatus.text}</span>
                </StatusIndicator>
              </SummaryItem>
              <SummaryItem>
                <strong>Guests:</strong>
                <span>
                  {event.guests && Array.isArray(event.guests) ? event.guests.length : 0}
                  {event.capacity ? ` / ${event.capacity} capacity` : ' (unlimited)'}
                </span>
              </SummaryItem>
              <SummaryItem>
                <strong>Points:</strong>
                <span>
                  {event.pointsAwarded || 0} awarded ({event.pointsRemain ?? event.points ?? 0} remaining)
                </span>
              </SummaryItem>
            </Card.Body>
          </SummaryCard>
        </div>
      </ContentGrid>
      
      {/* Add Organizer Modal */}
      <Modal
        isOpen={addOrganizerModalOpen}
        onClose={() => {
          setAddOrganizerModalOpen(false);
          setSelectedUserId(null);
          setSearchQuery('');
        }}
        title="Add Organizer"
        size="medium"
      >
        <ModalContent>
          <ModalForm>
            <Input
              label="Search for a user"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or UTORid"
            />
            
            {users && users.length > 0 ? (
              <div>
                <h4>Select a user:</h4>
                {users.map(user => (
                  <AttendeeRow key={user.id} onClick={() => setSelectedUserId(user.id)}>
                    <AttendeeInfo>
                      <AttendeeName>{user.name}</AttendeeName>
                      <AttendeeSubtext>{user.utorid}</AttendeeSubtext>
                    </AttendeeInfo>
                    <input 
                      type="radio" 
                      checked={selectedUserId === user.id}
                      onChange={() => setSelectedUserId(user.id)}
                    />
                  </AttendeeRow>
                ))}
              </div>
            ) : searchQuery ? (
              <EmptyState>No users found</EmptyState>
            ) : null}
          </ModalForm>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => {
                setAddOrganizerModalOpen(false);
                setSelectedUserId(null);
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrganizer}
              disabled={!selectedUserId}
            >
              Add Organizer
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* Add Guest Modal */}
      <Modal
        isOpen={addGuestModalOpen}
        onClose={() => {
          setAddGuestModalOpen(false);
          setSelectedUserId(null);
          setSearchQuery('');
        }}
        title="Add Guest"
        size="medium"
      >
        <ModalContent>
          <ModalForm>
            <Input
              label="Search for a user"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or UTORid"
            />
            
            {users && users.length > 0 ? (
              <div>
                <h4>Select a user:</h4>
                {users.map(user => (
                  <AttendeeRow key={user.id} onClick={() => setSelectedUserId(user.id)}>
                    <AttendeeInfo>
                      <AttendeeName>{user.name}</AttendeeName>
                      <AttendeeSubtext>{user.utorid}</AttendeeSubtext>
                    </AttendeeInfo>
                    <input 
                      type="radio" 
                      checked={selectedUserId === user.id}
                      onChange={() => setSelectedUserId(user.id)}
                    />
                  </AttendeeRow>
                ))}
              </div>
            ) : searchQuery ? (
              <EmptyState>No users found</EmptyState>
            ) : null}
          </ModalForm>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => {
                setAddGuestModalOpen(false);
                setSelectedUserId(null);
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGuest}
              disabled={!selectedUserId}
            >
              Add Guest
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* Award Points Modal */}
      <Modal
        isOpen={awardPointsModalOpen}
        onClose={() => {
          setAwardPointsModalOpen(false);
          setSelectedUserId(null);
          setPointsAmount('');
        }}
        title={`Award Points ${selectedUserId ? 'to Guest' : 'to All Guests'}`}
        size="small"
      >
        <ModalContent>
          <ModalForm>
            <Input
              label="Points Amount"
              type="number"
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
              placeholder="Enter points amount"
              min="1"
              max={event.points}
              required
              helperText={`Available points: ${event.points - (event.pointsAwarded || 0)}`}
            />
            
            {selectedUserId && (
              <p>
                Selected user: {event.guests && Array.isArray(event.guests) ? event.guests.find(g => g.id === selectedUserId)?.name || 'Unknown user' : 'Unknown user'}
              </p>
            )}
            
            {!selectedUserId && (
              <p>
                This will award points to all {event.guests && Array.isArray(event.guests) ? event.guests.length : 0} guests who have RSVP'd to this event.
              </p>
            )}
          </ModalForm>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => {
                setAwardPointsModalOpen(false);
                setSelectedUserId(null);
                setPointsAmount('');
              }}
              disabled={isAwardingPoints}
            >
              Cancel
            </Button>
            <Button
              onClick={selectedUserId ? handleAwardPoints : handleAwardPointsToAll}
              disabled={!pointsAmount || parseInt(pointsAmount) <= 0}
              loading={isAwardingPoints}
            >
              Award Points
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default EventDetail; 
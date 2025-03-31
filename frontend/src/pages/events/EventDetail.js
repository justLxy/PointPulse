import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useEvents } from '../../hooks/useEvents';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import theme from '../../styles/theme';
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
  FaGlobe,
} from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

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
  display: flex;
  align-items: center;
  
  &::after {
    content: ${props => props.showStatus ? `'${props.statusEmoji}'` : '""'};
    margin-left: ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const PageSubtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const EventBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: ${theme.colors.primary.main};
  color: white;
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-left: ${theme.spacing.sm};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  svg {
    margin-right: ${theme.spacing.xs};
  }
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
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.full};
  background-color: ${props => {
    switch (props.status) {
      case 'Upcoming': return '#ffd54f'; // 更深的黄色
      case 'Ongoing': return '#C8E6C9'; // Light green
      case 'Past': return '#FFCCBC'; // Light red
      default: return theme.colors.background.default;
    }
  }};
  
  span {
    color: ${props => {
      switch (props.status) {
        case 'Upcoming': return '#7e4d0d'; // 深褐色文字
        case 'Ongoing': return '#2E7D32'; // Darker green
        case 'Past': return '#BF360C'; // Darker red
        default: return theme.colors.text.primary;
      }
    }};
    font-weight: ${theme.typography.fontWeights.semiBold};
  }
`;

// 为Upcoming标签创建更简单的样式
const UpcomingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: #FFD54F;
  color: #000000;
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.medium};
`;

// 新增观众席样式组件
const AudienceContainer = styled.div`
  margin-top: ${theme.spacing.lg};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.xl};
  position: relative;
`;

const AudienceStage = styled.div`
  background: linear-gradient(180deg, #1a237e 0%, #0d47a1 100%);
  height: 50px;
  border-radius: ${theme.radius.lg} ${theme.radius.lg} 0 0;
  margin: -${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.fontWeights.bold};
  font-size: ${theme.typography.fontSize.lg};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AudienceSeats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0;
`;

const AudienceSeat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
`;

const AvatarContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${theme.colors.background.light};
  border: 3px solid ${theme.colors.primary.light};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing.sm};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.primary};
  background-color: ${props => props.randomColor || theme.colors.primary.light};
`;

const AudienceName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-bottom: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AudienceRole = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const EmptyAudienceSeat = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${theme.colors.background.default};
  border: 2px dashed ${theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing.sm};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background-color: ${theme.colors.background.hover};
    border-color: ${theme.colors.primary.light};
  }
`;

// Define styled components for the action buttons
const ActionButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  color: ${props => props.color === 'error' ? theme.colors.error.main : theme.colors.primary.main};
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 16px;
  margin: 0 2px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUtorid, setSelectedUtorid] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  
  // Form state for editing event
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    location: '',
    capacity: '',
    points: '',
    startTime: '',
    endTime: '',
    published: false,
  });
  
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
    updateEvent,
    deleteEvent,
    isUpdating,
    isDeleting,
  } = useEvents();
  
  const { data: event, isLoading, error, refetch } = getEvent(eventId);
  
  // For searching users
  const [userSearchParams, setUserSearchParams] = useState({
    name: '',
    limit: 5,
    forSearch: true
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
    if (!selectedUtorid) return;
    
    addOrganizer(
      { eventId, utorid: selectedUtorid },
      {
        onSuccess: () => {
          setAddOrganizerModalOpen(false);
          setSelectedUserId(null);
          setSelectedUtorid(null);
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
    if (!selectedUtorid) return;
    
    addGuest(
      { eventId, utorid: selectedUtorid },
      {
        onSuccess: () => {
          setAddGuestModalOpen(false);
          setSelectedUserId(null);
          setSelectedUtorid(null);
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
  
  // Handle publish event
  const handlePublishEvent = () => {
    if (!event) return;
    
    updateEvent(
      { 
        id: eventId, 
        data: { published: true } 
      },
      {
        onSuccess: () => {
          refetch();
          toast.success('Event successfully published!');
        },
      }
    );
  };
  
  // Set up event for editing
  const handleEditEvent = () => {
    if (!event) return;
    
    setEventData({
      name: event.name || '',
      description: event.description || '',
      location: event.location || '',
      capacity: event.capacity || '',
      points: event.points || '',
      startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '',
      endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '',
      published: event.published || false,
    });
    
    setEditModalOpen(true);
  };
  
  // Update event
  const handleUpdateEvent = () => {
    if (!event) return;
    
    // Format data for API
    let formattedData = {
      ...eventData,
      capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
    };
    
    // 只有管理员才能更新积分和发布状态
    if (isManager) {
      formattedData.points = eventData.points ? parseInt(eventData.points) : 0;
      
      // 只包含发布状态如果它被改变而且用户是管理员
      if (eventData.published && !event.published) {
        formattedData.published = true;
      }
    } else {
      // 确保删除受限字段，防止后端拒绝请求
      delete formattedData.points;
      delete formattedData.published;
    }
    
    updateEvent(
      { id: eventId, data: formattedData },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          refetch();
          toast.success('Event updated successfully!');
        },
      }
    );
  };
  
  // Set up event for deletion
  const handleDeleteEventClick = () => {
    setDeleteModalOpen(true);
  };
  
  // Delete event
  const handleDeleteEvent = () => {
    deleteEvent(eventId, {
      onSuccess: () => {
        navigate('/events');
        toast.success('Event deleted successfully!');
      },
    });
  };
  
  // Handle form changes for event editing
  const handleFormChange = (key, value) => {
    setEventData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Handle award points
  const handleAwardPoints = () => {
    if (!selectedUserId || !pointsAmount) return;
    
    // 确保转换为整数
    const points = Math.floor(Number(pointsAmount));
    if (isNaN(points) || points <= 0) {
      toast.error("Points must be a positive number");
      return;
    }
    
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
    // 确保转换为整数
    const points = Math.floor(Number(pointsAmount));
    if (isNaN(points) || points <= 0) {
      toast.error("Points must be a positive number");
      return;
    }
    
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
        forSearch: true
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
          <PageTitle
            showStatus={true}
            statusEmoji={
              eventStatus.text === 'Upcoming' ? '🔜' : 
              eventStatus.text === 'Ongoing' ? '🎬' : '🎭'
            }
          >
            {event.name}
          </PageTitle>
          <PageSubtitle>
            {event.startTime && (
              <>
                {formatDate(event.startTime)}
                {event.endTime && new Date(event.startTime).toDateString() !== new Date(event.endTime).toDateString() && 
                  ` - ${formatDate(event.endTime)}`}
                {' at '}
                {formatTime(event.startTime)}
                {event.endTime && ` - ${formatTime(event.endTime)}`}
                
                <EventBadge>
                  <FaUsers size={12} /> 
                  {event.guests && Array.isArray(event.guests) ? event.guests.length : 0} Attendees
                  {event.capacity ? ` / ${event.capacity}` : ''}
                </EventBadge>
              </>
            )}
          </PageSubtitle>
        </div>
        
        <PageActionsContainer>
          {eventStatus.text === 'Upcoming' && !isOrganizer && (
            attending ? (
              <Button 
                variant="outlined" 
                color="danger"
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
          
          {canEditEvent() && (
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <Button 
                variant="outlined"
                onClick={handleEditEvent}
              >
                <FaEdit /> Edit Event
              </Button>
              
              {isManager && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={handleDeleteEventClick}
                >
                  <FaTrash /> Delete Event
                </Button>
              )}
              
              {isManager && !event.published && (
                <Button 
                  onClick={handlePublishEvent}
                >
                  <FaGlobe /> Publish Event
                </Button>
              )}
            </div>
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
                      <Button 
                        size="small" 
                        onClick={() => setAwardPointsModalOpen(true)}
                      >
                        <FaTrophy /> Award Points
                      </Button>
                    </div>
                  )}
                </Card.Header>
                <Card.Body>
                  <AudienceContainer>
                    <AudienceStage>🎬 STAGE 🎬</AudienceStage>
                    {event.guests && Array.isArray(event.guests) && event.guests.length > 0 ? (
                      <AudienceSeats>
                        {event.guests.map(guest => {
                          // 为每个用户生成一个随机颜色，基于用户ID保持一致
                          const colorSeed = guest.id % 5;
                          const colors = ['#e57373', '#64b5f6', '#81c784', '#ffb74d', '#ba68c8'];
                          const randomColor = colors[colorSeed];
                          
                          // 获取用户名称的首字母
                          const initials = guest.name ? guest.name.charAt(0).toUpperCase() : '?';
                          
                          return (
                            <AudienceSeat key={guest.id}>
                              <AvatarContainer>
                                <Avatar randomColor={randomColor}>
                                  {guest.avatarUrl ? (
                                    <img 
                                      src={guest.avatarUrl} 
                                      alt={guest.name} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    initials
                                  )}
                                </Avatar>
                              </AvatarContainer>
                              <AudienceName>{guest.name}</AudienceName>
                              <AudienceRole>
                                {guest.pointsAwarded ? (
                                  <Badge color="success">{guest.pointsAwarded}pt</Badge>
                                ) : canEditEvent() && eventStatus.text === 'Upcoming' ? (
                                  <ActionButton 
                                    size="tiny" 
                                    onClick={() => {
                                      setSelectedUserId(guest.id);
                                      setSelectedUtorid(guest.utorid);
                                      setAwardPointsModalOpen(true);
                                    }}
                                  >
                                    🏆
                                  </ActionButton>
                                ) : null}
                                {canEditEvent() && (
                                  <ActionButton 
                                    size="tiny" 
                                    color="error"
                                    onClick={() => handleRemoveGuest(guest.id)}
                                  >
                                    ❌
                                  </ActionButton>
                                )}
                              </AudienceRole>
                            </AudienceSeat>
                          );
                        })}
                        {canEditEvent() && eventStatus.text === 'Upcoming' && (
                          <AudienceSeat>
                            <EmptyAudienceSeat onClick={() => setAddGuestModalOpen(true)}>
                              <FaUserPlus color={theme.colors.text.secondary} />
                            </EmptyAudienceSeat>
                            <AudienceName>Add Guest</AudienceName>
                          </AudienceSeat>
                        )}
                      </AudienceSeats>
                    ) : (
                      <EmptyState>
                        {canEditEvent() ? (
                          <>
                            <p>No guests registered for this event yet.</p>
                            <Button 
                              style={{ marginTop: theme.spacing.md }}
                              onClick={() => setAddGuestModalOpen(true)}
                            >
                              <FaUserPlus /> Add First Guest
                            </Button>
                          </>
                        ) : (
                          "No guests registered for this event yet."
                        )}
                      </EmptyState>
                    )}
                  </AudienceContainer>
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
                <UpcomingBadge>Upcoming</UpcomingBadge>
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
          setSelectedUtorid(null);
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
                  <AttendeeRow 
                    key={user.id} 
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSelectedUtorid(user.utorid);
                    }}
                  >
                    <AttendeeInfo>
                      <AttendeeName>{user.name}</AttendeeName>
                      <AttendeeSubtext>{user.utorid}</AttendeeSubtext>
                    </AttendeeInfo>
                    <input 
                      type="radio" 
                      checked={selectedUserId === user.id}
                      onChange={() => {
                        setSelectedUserId(user.id);
                        setSelectedUtorid(user.utorid);
                      }}
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
                setSelectedUtorid(null);
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrganizer}
              disabled={!selectedUtorid}
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
          setSelectedUtorid(null);
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
                  <AttendeeRow 
                    key={user.id} 
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setSelectedUtorid(user.utorid);
                    }}
                  >
                    <AttendeeInfo>
                      <AttendeeName>{user.name}</AttendeeName>
                      <AttendeeSubtext>{user.utorid}</AttendeeSubtext>
                    </AttendeeInfo>
                    <input 
                      type="radio" 
                      checked={selectedUserId === user.id}
                      onChange={() => {
                        setSelectedUserId(user.id);
                        setSelectedUtorid(user.utorid);
                      }}
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
                setSelectedUtorid(null);
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGuest}
              disabled={!selectedUtorid}
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
              onChange={(e) => {
                // 确保只能输入正整数
                const value = e.target.value;
                if (value === '' || /^[1-9]\d*$/.test(value)) {
                  setPointsAmount(value);
                }
              }}
              placeholder="Enter points amount"
              min="1"
              step="1"
              max={event.points}
              required
              helperText={`Available points: ${event.pointsRemain !== undefined ? event.pointsRemain : (event.points || 0)}`}
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
              onClick={() => {
                // 额外验证积分值
                const pointsNum = Number(pointsAmount);
                if (isNaN(pointsNum) || pointsNum <= 0) {
                  toast.error("Points must be a positive number");
                  return;
                }
                
                if (selectedUserId) {
                  handleAwardPoints();
                } else {
                  handleAwardPointsToAll();
                }
              }}
              disabled={!pointsAmount || Number(pointsAmount) <= 0}
              loading={isAwardingPoints}
            >
              Award Points
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* Edit Event Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        title={`Edit Event: ${event?.name || ''}`}
        size="large"
      >
        <ModalContent>
          <ModalForm>
            <Input
              label="Event Name"
              value={eventData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Enter event name"
              required
            />
            
            <Input
              label="Description"
              value={eventData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Enter event description"
              multiline
              rows={3}
              required
              key={`description-${editModalOpen}-${eventData.description}`}
            />
            
            <Input
              label="Location"
              value={eventData.location}
              onChange={(e) => handleFormChange('location', e.target.value)}
              placeholder="Enter event location"
              required
            />
            
            <FormGroup>
              <Input
                label="Start Time"
                type="datetime-local"
                value={eventData.startTime}
                onChange={(e) => handleFormChange('startTime', e.target.value)}
                required
              />
              
              <Input
                label="End Time"
                type="datetime-local"
                value={eventData.endTime}
                onChange={(e) => handleFormChange('endTime', e.target.value)}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Input
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
                <Input
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
                  disabled={event?.published} // Disable if already published
                />
                <label htmlFor="published" style={{ 
                  fontSize: theme.typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: event?.published ? 'not-allowed' : 'pointer'
                }}>
                  {event?.published ? (
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
              onClick={() => {
                setEditModalOpen(false);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEvent}
              loading={isUpdating}
            >
              Update Event
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* Delete Event Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
        title="Delete Event"
        size="small"
      >
        <ModalContent>
          <p>Are you sure you want to delete this event?</p>
          <p><strong>{event?.name}</strong></p>
          <p>This action cannot be undone and will remove all RSVPs.</p>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => {
                setDeleteModalOpen(false);
              }}
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
    </div>
  );
};

export default EventDetail; 
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useEvents } from '../../hooks/useEvents';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import theme from '../../styles/theme';
import { API_URL } from '../../services/api';
import { Tooltip } from 'react-tooltip';
import { QRCodeSVG } from 'qrcode.react';
import QRScanner from '../../components/common/QRScanner';
import EventService from '../../services/event.service';
import { toast } from 'react-hot-toast';
import QRCode from '../../components/common/QRCode';
import useUserProfile from '../../hooks/useUserProfile';

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
  FaTrashAlt,
  FaQrcode
} from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
  margin-bottom: ${theme.spacing.md};
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: ${theme.typography.fontSize.xl};  
  }
`;


const PageSubtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
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
  white-space: nowrap;

  svg {
    margin-right: ${theme.spacing.xs};
  }
`;

const PageActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
    }
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
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};

  svg {
    margin-top: 3px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
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


// Create simpler style for Upcoming tags
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

// New audience seating style component
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
  border: 3px solid ${props => props.checkedIn ? theme.colors.success.main : theme.colors.primary.light};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing.sm};
  box-shadow: ${props => props.checkedIn ? `0 0 8px ${theme.colors.success.main}` : '0 4px 6px rgba(0, 0, 0, 0.1)'};
  position: relative;
  transition: all 0.3s ease;
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
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    margin: 0;
  }
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

// Add a status badge styled component for check-in
const CheckInBadge = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: ${theme.colors.success.main};
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

// Add check-in stats component
const CheckInStats = styled.div`
  margin: ${theme.spacing.md} 0;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.light};
  border-radius: ${theme.radius.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span:first-of-type {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${props => props.color || theme.colors.text.primary};
  }
  
  span:last-of-type {
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.text.secondary};
  }
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};
  margin-top: ${theme.spacing.lg};
`;

const QRCodeTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const QRCodeDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin: 0;
`;

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { activeRole } = useAuth();
  const { user } = useAuth();
  const { event, loading, error, refreshEvent } = useEvents(eventId);
  const { currentUser } = useUsers();
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  
  const isManager = ['manager', 'superuser'].includes(activeRole);
  const isRegularOrCashier = ['regular', 'cashier'].includes(activeRole);
  
  // 添加useEffect钩子，确认user对象是否正确加载
  useEffect(() => {
    console.log('user对象:', user);
  }, [user]);

  // State for tabs
  const [activeTab, setActiveTab] = useState('details');
  
  // Modals state
  const [addOrganizerModalOpen, setAddOrganizerModalOpen] = useState(false);
  const [addGuestModalOpen, setAddGuestModalOpen] = useState(false);
  const [awardPointsModalOpen, setAwardPointsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAllGuestsModalOpen, setDeleteAllGuestsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUtorid, setSelectedUtorid] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  
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
    removeAllGuests,
  } = useEvents();
  
  const { data: eventDetails, isLoading, error: eventError, refetch } = getEvent(eventId);
  
  // --- Define Permission Flags --- 
  const isCurrentUserOrganizerForEvent = eventDetails?.isOrganizer || false; // Is the current user an organizer for THIS event?
  const canManageGuests = isManager || isCurrentUserOrganizerForEvent; // Can the user see/manage the guest list?
  const canEditEventDetails = isManager || isCurrentUserOrganizerForEvent; // Can the user edit general event details (name, desc, etc.)?
  // Note: isManager remains the flag for manager-only actions (delete, publish, manage organizers, see points summary)
  
  const canAddGuestByUtorid = isRegularOrCashier && isCurrentUserOrganizerForEvent;
  
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
      onError: (error) => {
        // Display error message to user
        toast.error(error.message || 'Failed to cancel RSVP');
      }
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
  
 
  // Is user attending
  const isUserAttending = () => {
    return eventDetails?.isAttending || false;
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
    if (!selectedUtorid || selectedUtorid.length !== 8) {
      toast.error("Please enter a valid 8-character UTORid");
      return;
    }
  
    addGuest(
      { eventId, utorid: selectedUtorid },
      {
        onSuccess: () => {

          setAddGuestModalOpen(false);
          setSelectedUserId(null);
          setSelectedUtorid(null);
          setSearchQuery('');
          refetch();
        },
        onError: (err) => {
          toast.error(err?.response?.data?.error || "Failed to add guest");
        }
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
    if (!eventDetails) return;
    
    updateEvent(
      { 
        eventId, 
        data: { published: true } 
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };
  
  // Set up event for editing
  const handleEditEvent = () => {
    if (!eventDetails) return;
    
    // First try to use the original points allocation if available
    // If not, use the remaining points
    const pointsValue = 
      // Original points allocation takes precedence
      typeof eventDetails.points === 'number' ? eventDetails.points : 
      // Fallback to other possible properties
      typeof eventDetails.pointsTotal === 'number' ? eventDetails.pointsTotal :
      // If we have both awarded and remaining, we can calculate the total
      (typeof eventDetails.pointsAwarded === 'number' && typeof eventDetails.pointsRemain === 'number') 
        ? (eventDetails.pointsAwarded + eventDetails.pointsRemain) :
      // Last resort, just use the remaining points
      typeof eventDetails.pointsRemain === 'number' ? eventDetails.pointsRemain : '';
    
    setEventData({
      name: eventDetails.name || '',
      description: eventDetails.description || '',
      location: eventDetails.location || '',
      capacity: eventDetails.capacity || '',
      points: pointsValue,
      startTime: eventDetails.startTime ? new Date(eventDetails.startTime).toISOString().slice(0, 16) : '',
      endTime: eventDetails.endTime ? new Date(eventDetails.endTime).toISOString().slice(0, 16) : '',
      published: eventDetails.published || false,
    });
    
    setEditModalOpen(true);
  };
  
  // Update event
  const handleUpdateEvent = () => {
    if (!eventDetails) return;
    
    // Format data for API
    let formattedData = {
      ...eventData,
      capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
    };
    
    // Only admins can update points and published status
    if (isManager) {
      formattedData.points = eventData.points ? parseInt(eventData.points) : 0;
      
      // Only include published status if it was changed and user is admin
      if (eventData.published && !eventDetails.published) {
        formattedData.published = true;
      }
    } else {
      // Make sure to remove restricted fields to prevent backend rejection
      delete formattedData.points;
      delete formattedData.published;
    }
    
    updateEvent(
      { eventId, data: formattedData },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          refetch();
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
        refetch();
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
    
    // Ensure conversion to integer
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
    // Ensure conversion to integer
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
  
  // Handle remove all guests
  const handleRemoveAllGuests = () => {
    setDeleteAllGuestsModalOpen(true);
  };
  
  // Confirm and execute remove all guests
  const confirmRemoveAllGuests = () => {
    removeAllGuests(
      { eventId },
      {
        onSuccess: () => {
          refetch();
          setDeleteAllGuestsModalOpen(false);
          toast.success('All guests have been removed');
        },
        onError: (err) => {
          toast.error(err?.message || 'Failed to remove all guests');
        }
      }
    );
  };
  
  // check if current user is a guest
  const isCurrentUserGuest = () => {
    if (!event || !user) return false;
    return event.guests.some(guest => guest.id === user.id);
  };

  // render QR code
  const renderQRCode = () => {
    if (!isCurrentUserGuest()) return null;
    return (
      <QRCodeContainer>
        <QRCodeTitle>My Check-In QR Code</QRCodeTitle>
        <QRCodeSVG 
          value={user.utorid}
          size={200}
          level="H"
          includeMargin={true}
        />
        <QRCodeDescription>
          Please show this QR code to the event organizer to complete check-in
        </QRCodeDescription>
      </QRCodeContainer>
    );
  };
  
 
  const handleCheckin = async (scannedValue) => {
    setScanResult(scannedValue);
    console.log('result:', scannedValue);
    try {
      const res = await EventService.checkinUserByUtorid(eventDetails.id, scannedValue.trim());
      if (res?.message === 'Already checked in') {
        toast.error('User already checked in');
      } else if (res?.message === 'Successfully checked in') {
        toast.success('Check-in successful!');
        refetch();
      } else {
        toast(res?.message || 'Unknown check-in result');
      }
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
      console.error('Check-in failed:', err);
    }
    setTimeout(() => setScanResult(null), 1000);
  };
  
  if (isLoading) {
    return <LoadingSpinner text="Loading event details..." />;
  }
  
  if (eventError) {
    return <EmptyState>Error loading event: {eventError.message}</EmptyState>;
  }
  
  if (!eventDetails) {
    return <EmptyState>Event not found</EmptyState>;
  }
  
  const eventStatus = getEventStatus(eventDetails.startTime, eventDetails.endTime);
  const attending = isUserAttending();
  
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
            {eventDetails.name}
          </PageTitle>
          <PageSubtitle>
            {eventDetails.startTime && (
              <>
                {formatDate(eventDetails.startTime)}
                {eventDetails.endTime && new Date(eventDetails.startTime).toDateString() !== new Date(eventDetails.endTime).toDateString() && 
                  ` - ${formatDate(eventDetails.endTime)}`}
                {' at '}
                {formatTime(eventDetails.startTime)}
                {eventDetails.endTime && ` - ${formatTime(eventDetails.endTime)}`}
                
                <EventBadge>
                   <FaUsers size={12} /> 
                {`${eventDetails.numGuests ?? eventDetails.guests?.length ?? 0}/${eventDetails.capacity || '∞'} attendees`}
                </EventBadge>

              </>
            )}
          </PageSubtitle>
        </div>
        
        <PageActionsContainer>
          {eventStatus.text === 'Upcoming' && !isCurrentUserOrganizerForEvent && (
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
          
          {canEditEventDetails && (
            <>
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
              
              {isManager && !eventDetails.published && (
                <Button 
                  onClick={handlePublishEvent}
                >
                  <FaGlobe /> Publish Event
                </Button>
              )}

              {(isCurrentUserOrganizerForEvent || isManager) && (
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/events/${eventDetails.id}/checkin-display`)}
                >
                  <FaQrcode /> Check-In QR
                </Button>
              )}
            </>
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
              <EventDescription>{eventDetails.description}</EventDescription>
              
              <EventMetadata>
                <EventDetailItem>
                  <FaMapMarkerAlt />
                  <div>
                    <strong>Location</strong>
                    <div>{eventDetails.location}</div>
                  </div>
                </EventDetailItem>
                
                <EventDetailItem>
                  <FaCalendarAlt />
                  <div>
                    <strong>Date</strong>
                    <div>
                      {formatDate(eventDetails.startTime)}
                      {eventDetails.endTime && new Date(eventDetails.startTime).toDateString() !== new Date(eventDetails.endTime).toDateString() && 
                        ` - ${formatDate(eventDetails.endTime)}`}
                    </div>
                  </div>
                </EventDetailItem>
                
                <EventDetailItem>
                  <FaClock />
                  <div>
                    <strong>Time</strong>
                    <div>
                      {formatTime(eventDetails.startTime)} - {eventDetails.endTime ? formatTime(eventDetails.endTime) : 'TBD'}
                    </div>
                  </div>
                </EventDetailItem>
                
                {/* Always show Capacity/Attendees */} 
                <EventDetailItem>
                  <FaUsers />
                  <div>
                    <strong>Capacity</strong>
                    <div>
                    {`${eventDetails.numGuests ?? eventDetails.guests?.length ?? 0}/${eventDetails.capacity || '∞'} attendees`}
                    </div>
                  </div>
                </EventDetailItem>

                {/* Conditionally render Points detail */} 
                {isManager && ( 
                  <EventDetailItem>
                    <FaCoins />
                    <div>
                      <strong>Points</strong>
                      <div>
                        {eventDetails.pointsAwarded || 0} points awarded 
                        ({eventDetails.pointsRemain ?? eventDetails.points ?? 0} remaining)
                      </div>
                    </div>
                  </EventDetailItem>
                )}

              </EventMetadata>
            </Card.Body>
          </Card>
          
          {/* 在活动信息下方添加二维码 */}
          {renderQRCode()}
          
          <TabContainer>
            <TabHeader>
              <TabButton 
                active={activeTab === 'details'} 
                onClick={() => setActiveTab('details')}
              >
                Details
              </TabButton>
              {/* Conditionally render Guests tab */} 
              {canManageGuests && ( 
                <TabButton 
                  active={activeTab === 'guests'} 
                  onClick={() => setActiveTab('guests')}
                >
                  Guests ({eventDetails.numGuests ?? eventDetails.guests?.length ?? 0})
                </TabButton>
              )}
              {/* Conditionally render Organizers tab */} 
              {isManager && ( 
                <TabButton 
                  active={activeTab === 'organizers'} 
                  onClick={() => setActiveTab('organizers')}
                >
                  Organizers ({eventDetails.organizers && Array.isArray(eventDetails.organizers) ? eventDetails.organizers.length : 0})
                </TabButton>
              )}
            </TabHeader>
            
            {activeTab === 'details' && (
              <Card>
                <Card.Body>
                  <h3>About this Event</h3>
                  <p>{eventDetails.description}</p>
                </Card.Body>
              </Card>
            )}
            
            {/* Conditionally render Guests tab content */} 
            {(activeTab === 'guests' && canManageGuests) && ( 
              <Card>
                <Card.Header>
                  <Card.Title>Guests</Card.Title>
                  {/* Keep internal button logic based on canEditEventDetails */} 
                  {canEditEventDetails && eventStatus.text === 'Upcoming' && ( 
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
                      {isManager && eventDetails.guests && Array.isArray(eventDetails.guests) && eventDetails.guests.length > 0 && (
                        <Button 
                          size="small"
                          color="error"
                          onClick={handleRemoveAllGuests}
                        >
                          <FaTrashAlt /> Delete All
                        </Button>
                      )}
                    </div>
                  )}
                </Card.Header>
                <Card.Body>
                  <AudienceContainer>
                    <AudienceStage>🎬 STAGE 🎬</AudienceStage>
                    
                    {eventDetails.guests && Array.isArray(eventDetails.guests) && eventDetails.guests.length > 0 && (
                      <CheckInStats>
                        <StatItem>
                          <span>{eventDetails.guests.length}</span>
                          <span>Total Guests</span>
                        </StatItem>
                        <StatItem color={theme.colors.success.main}>
                          <span>{eventDetails.guests.filter(g => g.checkedIn).length}</span>
                          <span>Checked In</span>
                        </StatItem>
                        <StatItem color={theme.colors.warning.main}>
                          <span>{eventDetails.guests.length - eventDetails.guests.filter(g => g.checkedIn).length}</span>
                          <span>Not Checked In</span>
                        </StatItem>
                      </CheckInStats>
                    )}
                    
                    {eventDetails.guests && Array.isArray(eventDetails.guests) && eventDetails.guests.length > 0 ? (
                      <AudienceSeats>
                        {/* ... guest mapping logic ... */}
                         {eventDetails.guests.map(guest => {
                          const colorSeed = guest.id % 5; // Example seed for color
                          const randomColor = [
                            theme.colors.primary.light,
                            theme.colors.secondary.light,
                            theme.colors.accent.light,
                            theme.colors.success.light,
                            theme.colors.info.light
                          ][colorSeed];
                          
                          const pointsAwarded = eventDetails.pointsAwardedToGuests?.find(p => p.userId === guest.id)?.points || 0;
                          
                          const version = localStorage.getItem('avatarVersion');
                          const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(guest.avatarUrl);
                          const baseSrc = isAbsolute ? guest.avatarUrl : `${API_URL}${guest.avatarUrl}`;
                          const src = version ? `${baseSrc}?v=${version}` : baseSrc;
                          
                          return (
                            <AudienceSeat key={guest.id}>
                              <AvatarContainer checkedIn={guest.checkedIn}>
                                <Avatar randomColor={randomColor}>
                                  {guest.avatarUrl ? (
                                    (() => {
                                      const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(guest.avatarUrl);
                                      const baseSrc = isAbsolute ? guest.avatarUrl : `${API_URL}${guest.avatarUrl}`;
                                      const src = version ? `${baseSrc}?v=${version}` : baseSrc;
                                      return (
                                        <img
                                          src={src}
                                          alt={guest.name}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      );
                                    })()
                                  ) : (
                                    guest.name?.charAt(0).toUpperCase() || 'U'
                                  )}
                                </Avatar>
                                {guest.checkedIn && (
                                  <CheckInBadge>✓</CheckInBadge>
                                )}
                              </AvatarContainer>
                              <AudienceName 
                                data-tooltip-id={`guest-tooltip-${guest.id}`}
                                data-tooltip-content={`${guest.name} (${guest.utorid})`}
                              >
                                {guest.name}
                              </AudienceName>

                              <Tooltip id={`guest-tooltip-${guest.id}`} place="top" />

                              <AudienceRole>
                                {pointsAwarded > 0 ? (
                                  <Badge color="success">{pointsAwarded}pt</Badge>
                                ) : canEditEventDetails && eventStatus.text === 'Upcoming' ? (
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
                                {isManager && (
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

                        {/* Add guest seat - keep internal logic based on canEditEventDetails */}
                        {canEditEventDetails && eventStatus.text === 'Upcoming' && ( 
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
                        {/* Keep internal button logic based on canEditEventDetails */} 
                        {canEditEventDetails ? ( 
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
            
            {/* Conditionally render Organizers tab content */} 
            {(activeTab === 'organizers' && isManager) && ( 
              <Card>
                <Card.Header>
                  <Card.Title>Organizers</Card.Title>
                  {/* Keep internal button logic based on isManager */}
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
                    {eventDetails.organizers && Array.isArray(eventDetails.organizers) && eventDetails.organizers.length > 0 ? (
                      eventDetails.organizers.map(organizer => (
                        <AttendeeRow key={organizer.id}>
                          <AttendeeInfo>
                            <AttendeeName>{organizer.name}</AttendeeName>
                            <AttendeeSubtext>{organizer.utorid}</AttendeeSubtext>
                          </AttendeeInfo>
                          {/* Keep internal button logic based on isManager */} 
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
                <span>{eventDetails.organizers?.[0]?.name || 'N/A'}</span>
              </SummaryItem>
              <SummaryItem>
                <strong>Status:</strong>
                <UpcomingBadge>Upcoming</UpcomingBadge>
              </SummaryItem>
              <SummaryItem>
                <strong>Guests:</strong>
                <span>
                {eventDetails.numGuests ?? eventDetails.guests?.length ?? 0}
                  {eventDetails.capacity ? ` / ${eventDetails.capacity} capacity` : ' (unlimited)'}
                </span>
               </SummaryItem>
               {/* Conditionally render Points summary */} 
               {isManager && ( 
                  <SummaryItem>
                    <strong>Points:</strong>
                    <span>
                      {eventDetails.pointsAwarded || 0} awarded ({eventDetails.pointsRemain ?? eventDetails.points ?? 0} remaining)
                    </span>
                  </SummaryItem>
                )}
            </Card.Body>
          </SummaryCard>
          {/* Event Summary下方渲染用户二维码，完全模仿Dashboard */}
          {isProfileLoading ? (
            <div>Loading QR code...</div>
          ) : (
            profile?.utorid && (
              <QRCode
                value={profile.utorid}
                label="My Check-In QR Code"
                size={200}
                level="H"
              />
            )
          )}

          {/* 仅manager+或本活动organizer可见扫码签到按钮 */}
          {(isManager || isCurrentUserOrganizerForEvent) && (
            <Button
              style={{ marginTop: 24, width: '100%' }}
              onClick={() => setScanModalOpen(true)}
            >
              Scan to Check-in
            </Button>
          )}

          {/* 扫码签到Modal */}
          <Modal
            isOpen={scanModalOpen}
            onClose={() => setScanModalOpen(false)}
            title="Scan Guest QR Code"
            size="medium"
          >
            <QRScanner
              onResult={handleCheckin}
              onError={(err) => {
                // 可选：处理扫码错误
                // toast.error('扫码失败，请重试');
              }}
            />
          </Modal>
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
          {canAddGuestByUtorid ? (
  <>
    <Input
      label="UTORid"
      value={selectedUtorid || ''}
      onChange={(e) => setSelectedUtorid(e.target.value.trim())}
      placeholder="Enter UTORid (8 characters)"
      required
    />
  </>
) : (
  <>
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
          <AttendeeRow key={user.id} onClick={() => {
            setSelectedUserId(user.id);
            setSelectedUtorid(user.utorid);
          }}>
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
  </>
)}

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
          {canAddGuestByUtorid ? (
  // If cashier/regular and is organizer, only enter utorid
  <>
    <Input
      label="Enter UTORid"
      value={selectedUtorid || ''}
      onChange={(e) => setSelectedUtorid(e.target.value)}
      placeholder="e.g. jacksun0"
      required
    />
  </>
) : (
  // If manager/superuser or non-regular/cashier organizer, show search box and user list
  <>
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
  </>
)}

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
                // Ensure only positive integers can be entered
                const value = e.target.value;
                if (value === '' || /^[1-9]\d*$/.test(value)) {
                  setPointsAmount(value);
                }
              }}
              placeholder="Enter points amount"
              min="1"
              step="1"
              max={eventDetails.points}
              required
              helperText={`Available points: ${eventDetails.pointsRemain !== undefined ? eventDetails.pointsRemain : (eventDetails.points || 0)}`}
            />
            
            {selectedUserId && (
              <p>
                Selected user: {eventDetails.guests && Array.isArray(eventDetails.guests) ? eventDetails.guests.find(g => g.id === selectedUserId)?.name || 'Unknown user' : 'Unknown user'}
              </p>
            )}
            
            {!selectedUserId && (
              <p>
                This will award points to all {eventDetails.guests && Array.isArray(eventDetails.guests) ? eventDetails.guests.length : 0} guests who have RSVP'd to this event.
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
                // Extra validation for points value
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
        title={`Edit Event: ${eventDetails?.name || ''}`}
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
                  disabled={eventDetails?.published} // Disable if already published
                />
                <label htmlFor="published" style={{ 
                  fontSize: theme.typography.fontSize.sm,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: eventDetails?.published ? 'not-allowed' : 'pointer'
                }}>
                  {eventDetails?.published ? (
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
          <p><strong>{eventDetails?.name}</strong></p>
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
      
      {/* Delete All Guests Confirmation Modal */}
      <Modal
        isOpen={deleteAllGuestsModalOpen}
        onClose={() => setDeleteAllGuestsModalOpen(false)}
        title="Delete All Guests"
        size="small"
      >
        <ModalContent>
          <p>Are you sure you want to remove all guests? This action cannot be undone.</p>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => setDeleteAllGuestsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={confirmRemoveAllGuests}
            >
              Delete All Guests
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default EventDetail; 
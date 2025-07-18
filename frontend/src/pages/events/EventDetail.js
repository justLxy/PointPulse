import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { useEvents } from '../../hooks/useEvents';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import { useEventShortlinks } from '../../hooks/useShortlinks';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { EditEventModal } from '../../components/events/EventModals';
import { CreateShortlinkModal, EditShortlinkModal, DeleteShortlinkModal } from '../../components/shortlinks/ShortlinkModals';
import ShortlinkList from '../../components/shortlinks/ShortlinkList';
import theme from '../../styles/theme';
import { API_URL } from '../../services/api';
import { Tooltip } from 'react-tooltip';
import UniversalQRCode from '../../components/common/UniversalQRCode';
import ScannerModal from '../../components/event/ScannerModal';
import ManualCheckinModal from '../../components/event/ManualCheckinModal';

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
  FaQrcode,
  FaKeyboard,
  FaChevronDown,
  FaLink,
  FaPlus,
  FaImage
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
  gap: ${theme.spacing.md};
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
    }
  }
`;

// Add new styled components for button organization
const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  position: relative;
  
  /* Create a subtle connected appearance for buttons in a group */
  button {
    position: relative;
    z-index: 1;
    
    /* Subtle shadow effect on hover */
    &:hover {
      box-shadow: ${theme.shadows.sm};
      z-index: 2;
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
    
    & > button {
      flex: 1;
    }
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

// Dropdown menu for grouping related actions
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const DropdownButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 120px;
  background-color: ${props => props.isOpen ? `${theme.colors.background.hover}` : undefined};
  transition: all ${theme.transitions.default};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg:last-child {
    margin-left: ${theme.spacing.xs};
    margin-right: 0; // Reset the right margin for the chevron icon
    transition: transform 0.2s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    opacity: 0.7;
    font-size: 0.7em;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${theme.spacing.xs};
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.md};
  min-width: 180px;
  z-index: ${theme.zIndex.dropdown};
  overflow: hidden;
  transition: transform ${theme.transitions.quick}, opacity ${theme.transitions.quick};
  transform-origin: top right;
  transform: ${props => props.isOpen ? 'scale(1)' : 'scale(0.95)'};
  opacity: ${props => props.isOpen ? 1 : 0};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  background: none;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.transitions.quick};
  border-radius: ${theme.radius.sm};
  margin: 0 ${theme.spacing.xs};
  
  svg {
    margin-right: ${theme.spacing.sm};
    color: ${props => props.color === 'error' 
      ? theme.colors.error.main 
      : theme.colors.text.secondary};
    font-size: 1.1em;
  }
  
  &:hover {
    background-color: ${theme.colors.background.hover};
    transform: translateX(2px);
  }
  
  &:active {
    transform: translateX(2px) scale(0.98);
  }
  
  &.danger {
    color: ${theme.colors.error.main};
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
  min-width: 0;
`;

const Sidebar = styled.div`
  min-width: 0;
`;

const GuestActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const EventDescription = styled.div`
  line-height: 1.6;
  color: ${theme.colors.text.primary};
  white-space: pre-wrap;
`;

const EventBackgroundImageContainer = styled.div`
  width: 100%;
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${theme.colors.background.secondary};
`;

const EventBackgroundImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: contain;
  border-radius: ${theme.radius.md};
  display: block;
  
  @media (max-width: 768px) {
    max-height: 300px;
  }
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  
  svg {
    color: ${theme.colors.text.secondary};
    opacity: 0.6;
  }
  
  p {
    margin: 0;
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


// Create simpler style for status tags
const UpcomingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  background-color: #F39C12;
  color: #FFFFFF;
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
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
  width: 100%;
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

// Define the ActionButtonForAttendee component to be used elsewhere
const AttendeeActionButton = styled(Button)`
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

// Create a base action button with standardized sizing and styling
const ActionButton = styled(Button)`
  min-width: 100px; // Set minimum width for consistency
  height: 40px; // Standardized height
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  
  /* Consistent icon styling */
  svg {
    font-size: 0.9em;
    margin-right: ${theme.spacing.xs};
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Set RSVP button to match
const RsvpButton = styled(ActionButton)`
  min-width: 120px;
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

// Add a styled separator for dropdown menu
const DropdownSeparator = styled.div`
  height: 1px;
  background-color: ${theme.colors.border.light};
  margin: ${theme.spacing.xs} 0;
`;

const EventBackgroundImageComponent = ({ src, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  if (imageError || !src) {
    return null;
  }

  return (
    <EventBackgroundImageContainer>
      <EventBackgroundImage
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </EventBackgroundImageContainer>
  );
};

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { activeRole, currentUser } = useAuth();
  const location = useLocation();
  
  const isManager = ['manager', 'superuser'].includes(activeRole);
  const isRegularOrCashier = ['regular', 'cashier'].includes(activeRole);
 
  // Add state to track if we need to refresh data after RSVP
  const [refreshAfterRsvp, setRefreshAfterRsvp] = useState(false);
  // Add state to track if we need to refresh after scan
  const [refreshAfterScan, setRefreshAfterScan] = useState(false);

  // State for tabs
  const [activeTab, setActiveTab] = useState('guests');
  
  // Modals state
  const [addOrganizerModalOpen, setAddOrganizerModalOpen] = useState(false);
  const [addGuestModalOpen, setAddGuestModalOpen] = useState(false);
  const [awardPointsModalOpen, setAwardPointsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAllGuestsModalOpen, setDeleteAllGuestsModalOpen] = useState(false);
  
  // Shortlink modals state
  const [createShortlinkModalOpen, setCreateShortlinkModalOpen] = useState(false);
  const [editShortlinkModalOpen, setEditShortlinkModalOpen] = useState(false);
  const [deleteShortlinkModalOpen, setDeleteShortlinkModalOpen] = useState(false);
  const [selectedShortlink, setSelectedShortlink] = useState(null);
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
  
  // Background image state for edit
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  
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
  
  const { data: event, isLoading, error, refetch } = getEvent(eventId);
  
  // Shortlink hooks
  const {
    shortlinks,
    isLoading: isLoadingShortlinks,
    createEventShortlink,
    updateEventShortlink,
    deleteEventShortlink,
    isCreating: isCreatingShortlink,
    isUpdating: isUpdatingShortlink,
    isDeleting: isDeletingShortlink,
  } = useEventShortlinks(eventId);
  
  // --- Define Permission Flags --- 
  const isCurrentUserOrganizerForEvent = event?.isOrganizer || false; // Is the current user an organizer for THIS event?
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
        // Set flag to force refresh when navigating back to this page
        setRefreshAfterRsvp(true);
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
  
 
  // Is user attending
  const isUserAttending = () => {
    return event?.isAttending || false;
  };
  
  // Calculate event status
  const getEventStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    
    if (start > now) {
      return { text: 'Upcoming', color: '#F39C12' }; // Darker orange/amber
    }
    if (end && end < now) {
      return { text: 'Past', color: '#e74c3c' }; // Red
    }
    // If start is in the past and end is in the future (or null), it's ongoing
    return { text: 'Ongoing', color: '#2ecc71' }; // Green
  };

  // Get background image URL
  const getBackgroundImageUrl = (backgroundUrl) => {
    if (!backgroundUrl) return null;
    if (backgroundUrl.startsWith('http')) return backgroundUrl;
    return `${API_URL}${backgroundUrl}`;
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
    if (!event) return;
    
    updateEvent(
      { 
        id: eventId, 
        data: { published: true } 
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };
  
  // Helper function to convert UTC datetime to local datetime-local format
  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    // Adjust for timezone offset to get local time
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  // Set up event for editing
  const handleEditEvent = () => {
    if (!event) return;
    
    // Force refresh the event data to ensure we have the latest information
    // This is especially important when coming from the Events page after an update
    refetch().then(({ data: refreshedEvent }) => {
      // Use the freshly fetched data to set up the form
      const currentEvent = refreshedEvent || event;
      
      // First try to use the original points allocation if available
      // If not, use the remaining points
      const pointsValue = 
        // Original points allocation takes precedence
        typeof currentEvent.points === 'number' ? currentEvent.points : 
        // Fallback to other possible properties
        typeof currentEvent.pointsTotal === 'number' ? currentEvent.pointsTotal :
        // If we have both awarded and remaining, we can calculate the total
        (typeof currentEvent.pointsAwarded === 'number' && typeof currentEvent.pointsRemain === 'number') 
          ? (currentEvent.pointsAwarded + currentEvent.pointsRemain) :
        // Last resort, just use the remaining points
        typeof currentEvent.pointsRemain === 'number' ? currentEvent.pointsRemain : '';
      
      setEventData({
        name: currentEvent.name || '',
        description: currentEvent.description || '',
        location: currentEvent.location || '',
        capacity: currentEvent.capacity || '',
        points: pointsValue,
        startTime: formatDateTimeForInput(currentEvent.startTime),
        endTime: formatDateTimeForInput(currentEvent.endTime),
        published: currentEvent.published || false,
        backgroundUrl: currentEvent.backgroundUrl || null,
      });
      
      // Reset background file state
      setBackgroundFile(null);
      
      // Set background preview from existing URL if available - use the refreshed data
      if (currentEvent.backgroundUrl) {
        const getBackgroundUrl = (url) => {
          if (!url) return null;
          if (url.startsWith('http')) return url;
          return `${API_URL}${url}`;
        };
        setBackgroundPreview(getBackgroundUrl(currentEvent.backgroundUrl));
      } else {
        setBackgroundPreview(null);
      }
      
      setEditModalOpen(true);
    }).catch((error) => {
      console.error('Failed to refresh event data:', error);
      // Fallback to using existing event data if refetch fails
      // (rest of the original logic would go here, but let's keep it simple)
      setEditModalOpen(true);
    });
  };
  
  // Update event
  const handleUpdateEvent = () => {
    if (!event) return;
    
    // Format data for API
    let formattedData = {
      ...eventData,
      capacity: eventData.capacity && String(eventData.capacity).trim() !== '' ? parseInt(eventData.capacity) : null,
    };
    
    // Only admins can update points and published status
    if (isManager) {
      formattedData.points = eventData.points ? parseInt(eventData.points) : 0;
      
      // Only include published status if it was changed and user is admin
      if (eventData.published && !event.published) {
        formattedData.published = true;
      }
    } else {
      // Make sure to remove restricted fields to prevent backend rejection
      delete formattedData.points;
      delete formattedData.published;
    }
    
    // Create FormData if there's a file to upload
    let submitData;
    if (backgroundFile) {
      submitData = new FormData();
      Object.keys(formattedData).forEach(key => {
        // Don't append null capacity to FormData - let backend handle missing field
        if (key === 'capacity' && formattedData[key] === null) {
          return;
        }
        if (formattedData[key] !== null && formattedData[key] !== undefined) {
          submitData.append(key, formattedData[key]);
        }
      });
      submitData.append('background', backgroundFile);
    } else {
      submitData = formattedData;
    }
    
    updateEvent(
      { id: eventId, data: submitData },
      {
        onSuccess: (responseData) => {
          // Update local preview state if background was updated
          if (backgroundFile && responseData && responseData.backgroundUrl) {
            // Clear the background preview since we now have the real URL
            setBackgroundPreview(null);
          }
          
          setEditModalOpen(false);
          
          // Reset background states
          setBackgroundFile(null);
          setBackgroundPreview(null);
          
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
        navigate('/events');
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
    
    // Find the selected user's utorid from the guests list
    const selectedGuest = event.guests?.find(g => g.id === selectedUserId);
    if (!selectedGuest) {
      toast.error("Selected user not found");
      return;
    }
    
    awardPoints(
      { eventId, utorid: selectedGuest.utorid, points },
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
  
  // Scanner modal state
  const [scanModalOpen, setScanModalOpen] = useState(false);
  
  // Manual check-in modal state
  const [manualCheckinModalOpen, setManualCheckinModalOpen] = useState(false);
  
  // Set default active tab based on permissions
  useEffect(() => {
    if (canManageGuests) {
      setActiveTab('guests');
    } else if (isManager) {
      setActiveTab('organizers');
    }
  }, [canManageGuests, isManager]);

  // Add an effect to check the rsvp state parameter from location
  useEffect(() => {
    // If we have just RSVPed (from state), or the flag is set, force refetch
    if ((location.state?.fromRsvp || refreshAfterRsvp) && eventId) {
      refetch();
      // Reset the flag after refetch
      setRefreshAfterRsvp(false);
    }
  }, [location.state, refreshAfterRsvp, eventId, refetch]);

  // Add an effect to refresh data after scanning
  useEffect(() => {
    if (refreshAfterScan && eventId) {
      refetch();
      setRefreshAfterScan(false);
    }
  }, [refreshAfterScan, eventId, refetch]);
  
  // Update the Scanner modal to trigger refresh after scan
  const handleScanModalClose = () => {
    setScanModalOpen(false);
    // Only refresh if not already refreshed by successful scan
    if (!refreshAfterScan) {
      setRefreshAfterScan(true);
    }
  };

  // Handle successful scan
  const handleScanSuccess = () => {
    // Immediately trigger a refresh when scan is successful
    refetch();
  };
  
  // Handle opening manual check-in modal
  const handleManualCheckinOpen = () => {
    // Only allow check-in for ongoing events
    if (eventStatus.text !== 'Ongoing') {
      toast.error("Check-in is only available during ongoing events");
      return;
    }
    setManualCheckinModalOpen(true);
  };
  
  // Handle closing manual check-in modal
  const handleManualCheckinClose = () => {
    setManualCheckinModalOpen(false);
    // Refresh guest list after manual check-in
    setRefreshAfterScan(true);
  };
  
  // Handle successful manual check-in
  const handleManualCheckinSuccess = () => {
    // Immediately trigger a refresh when check-in is successful
    refetch();
  };
  
  // Shortlink handlers
  const handleCreateShortlink = () => {
    setCreateShortlinkModalOpen(true);
  };
  
  const handleCreateShortlinkSubmit = async (shortlinkData) => {
    try {
      await createEventShortlink(shortlinkData);
      setCreateShortlinkModalOpen(false);
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      // Don't close modal on error so user can retry
    }
  };
  
  const handleEditShortlink = (shortlink) => {
    setSelectedShortlink(shortlink);
    setEditShortlinkModalOpen(true);
  };
  
  const handleEditShortlinkSubmit = async (id, updateData) => {
    await updateEventShortlink({ id, updateData });
    setEditShortlinkModalOpen(false);
    setSelectedShortlink(null);
  };
  
  const handleDeleteShortlink = (shortlink) => {
    setSelectedShortlink(shortlink);
    setDeleteShortlinkModalOpen(true);
  };
  
  const handleDeleteShortlinkConfirm = async (id) => {
    await deleteEventShortlink(id);
    setDeleteShortlinkModalOpen(false);
    setSelectedShortlink(null);
  };
  
  const handleCloseShortlinkModals = () => {
    setCreateShortlinkModalOpen(false);
    setEditShortlinkModalOpen(false);
    setDeleteShortlinkModalOpen(false);
    setSelectedShortlink(null);
  };
  
  // Add state for dropdown menu
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  
  // Update the click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if dropdown is open and click is outside dropdown container
      if (actionsDropdownOpen) {
        const dropdownContainer = document.querySelector('.dropdown-container');
        if (dropdownContainer && !dropdownContainer.contains(event.target)) {
          setActionsDropdownOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionsDropdownOpen]);
  
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
                {`${event.numGuests ?? event.guests?.length ?? 0}/${event.capacity || '∞'} attendees`}
                </EventBadge>

              </>
            )}
          </PageSubtitle>
        </div>
        
        <PageActionsContainer>
          {/* Prioritize the most important user action - RSVP */}
          {(eventStatus.text === 'Upcoming' || eventStatus.text === 'Ongoing') && !isCurrentUserOrganizerForEvent && 
           (!event.capacity || ( (event.numGuests ?? (Array.isArray(event.guests) ? event.guests.length : undefined) ?? 0) < event.capacity )) && (
            <ButtonGroup>
              {attending ? (
                <RsvpButton 
                  variant="outlined" 
                  color="danger"
                  onClick={handleCancelRsvp}
                  loading={isCancellingRsvp}
                >
                  Cancel RSVP
                </RsvpButton>
              ) : (
                <RsvpButton 
                  onClick={handleRsvp}
                  loading={isRsvping}
                >
                  RSVP to Event
                </RsvpButton>
              )}
            </ButtonGroup>
          )}
          
          {/* Group event organizer actions */}
          {canEditEventDetails && (
            <ActionButtonsContainer>
              {/* Primary action group */}
              <ButtonGroup>
                {/* Edit event is a primary action - only show for upcoming events (not ongoing or past) */}
                {eventStatus.text === 'Upcoming' && (
                  <ActionButton 
                    variant="outlined"
                    onClick={handleEditEvent}
                  >
                    <FaEdit /> Edit
                  </ActionButton>
                )}
                
                {/* Publish is an important action for managers */}
                {isManager && !event.published && (
                  <ActionButton onClick={handlePublishEvent}>
                    <FaGlobe /> Publish
                  </ActionButton>
                )}
              </ButtonGroup>
              
              {/* Check-in related functions */}
              {(isCurrentUserOrganizerForEvent || isManager) && (
                <ButtonGroup>
                  <DropdownContainer className="dropdown-container">
                    <DropdownButton 
                      variant="outlined"
                      onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                      isOpen={actionsDropdownOpen}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <FaQrcode style={{ fontSize: '1.2em', marginRight: theme.spacing.md }} /> Check-in
                      </span>
                      <FaChevronDown />
                    </DropdownButton>
                    
                    <DropdownMenu isOpen={actionsDropdownOpen}>
                      <DropdownItem onClick={() => {
                        setActionsDropdownOpen(false);
                        navigate(`/events/${event.id}/checkin-display`);
                      }}>
                        <FaQrcode /> Display QR Code
                      </DropdownItem>
                      
                      <DropdownSeparator />
                      
                      <DropdownItem onClick={() => {
                        setActionsDropdownOpen(false);
                        // Only allow check-in for ongoing events
                        if (eventStatus.text !== 'Ongoing') {
                          toast.error("Check-in is only available during ongoing events");
                          return;
                        }
                        setScanModalOpen(true);
                      }}>
                        <FaQrcode /> Scan Guest QR
                      </DropdownItem>
                      
                      <DropdownItem onClick={() => {
                        setActionsDropdownOpen(false);
                        // Only allow check-in for ongoing events
                        if (eventStatus.text !== 'Ongoing') {
                          toast.error("Check-in is only available during ongoing events");
                          return;
                        }
                        handleManualCheckinOpen();
                      }}>
                        <FaKeyboard /> Manual Check-in
                      </DropdownItem>
                    </DropdownMenu>
                  </DropdownContainer>
                </ButtonGroup>
              )}
              
              {/* Destructive actions isolated and visually distinct */}
              {isManager && !event.published && (
                <ActionButton 
                  variant="outlined" 
                  color="error"
                  onClick={handleDeleteEventClick}
                >
                  <FaTrash /> Delete
                </ActionButton>
              )}
            </ActionButtonsContainer>
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
              {/* Event Background Image */}
              <EventBackgroundImageComponent 
                src={getBackgroundImageUrl(event.backgroundUrl)} 
                alt={`${event.name} background`}
              />
              
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
                
                {/* Always show Capacity/Attendees */} 
                <EventDetailItem>
                  <FaUsers />
                  <div>
                    <strong>Capacity</strong>
                    <div>
                    {`${event.numGuests ?? event.guests?.length ?? 0}/${event.capacity || '∞'} attendees`}
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
                        {event.pointsAwarded || 0} points awarded 
                        ({event.pointsRemain ?? event.points ?? 0} remaining)
                      </div>
                    </div>
                  </EventDetailItem>
                )}

              </EventMetadata>
            </Card.Body>
          </Card>
          
          {/* Only show tabs if user has permission to see at least one tab */}
          {(canManageGuests || isManager) && (
            <TabContainer>
              <TabHeader>
                {/* Conditionally render Guests tab */} 
                {canManageGuests && ( 
                  <TabButton 
                    active={activeTab === 'guests'} 
                    onClick={() => setActiveTab('guests')}
                  >
                    Guests ({event.numGuests ?? event.guests?.length ?? 0})
                  </TabButton>
                )}
                {/* Conditionally render Organizers tab */} 
                {isManager && ( 
                  <TabButton 
                    active={activeTab === 'organizers'} 
                    onClick={() => setActiveTab('organizers')}
                  >
                    Organizers ({event.organizers && Array.isArray(event.organizers) ? event.organizers.length : 0})
                  </TabButton>
                )}
                {/* Conditionally render Shortlinks tab */} 
                {(isManager || isCurrentUserOrganizerForEvent) && ( 
                  <TabButton 
                    active={activeTab === 'shortlinks'} 
                    onClick={() => setActiveTab('shortlinks')}
                  >
                    Shortlinks ({shortlinks?.length ?? 0})
                  </TabButton>
                )}
              </TabHeader>
              
              {/* Conditionally render Guests tab content */} 
            {(activeTab === 'guests' && canManageGuests) && ( 
              <Card>
                <Card.Header>
                  <Card.Title>Guests</Card.Title>
                  {/* Keep internal button logic based on canEditEventDetails */} 
                  {canEditEventDetails && (eventStatus.text === 'Upcoming' || eventStatus.text === 'Ongoing') && ( 
                    <GuestActionButtons>
                      <Button 
                        size="small" 
                        onClick={() => setAddGuestModalOpen(true)}
                      >
                        <FaUserPlus /> Add Guest
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => {
                          setSelectedUserId(null);
                          setSelectedUtorid(null);
                          setAwardPointsModalOpen(true);
                        }}
                      >
                        <FaTrophy /> Award Points
                      </Button>
                      {isManager && event.guests && Array.isArray(event.guests) && event.guests.length > 0 && (
                        <Button 
                          size="small"
                          color="error"
                          onClick={handleRemoveAllGuests}
                        >
                          <FaTrashAlt /> Delete All
                        </Button>
                      )}
                    </GuestActionButtons>
                  )}
                </Card.Header>
                <Card.Body>
                  <AudienceContainer>
                    <AudienceStage>🎬 STAGE 🎬</AudienceStage>
                    
                    {event.guests && Array.isArray(event.guests) && event.guests.length > 0 && (
                      <CheckInStats>
                        <StatItem>
                          <span>{event.guests.length}</span>
                          <span>Total Guests</span>
                        </StatItem>
                        <StatItem color={theme.colors.success.main}>
                          <span>{event.guests.filter(g => g.checkedIn).length}</span>
                          <span>Checked In</span>
                        </StatItem>
                        <StatItem color={theme.colors.warning.main}>
                          <span>{event.guests.length - event.guests.filter(g => g.checkedIn).length}</span>
                          <span>Not Checked In</span>
                        </StatItem>
                      </CheckInStats>
                    )}
                    
                    {event.guests && Array.isArray(event.guests) && event.guests.length > 0 ? (
                      <AudienceSeats>
                        {/* ... guest mapping logic ... */}
                         {event.guests.map(guest => {
                          const colorSeed = guest.id % 5; // Example seed for color
                          const randomColor = [
                            theme.colors.primary.light,
                            theme.colors.secondary.light,
                            theme.colors.accent.light,
                            theme.colors.success.light,
                            theme.colors.info.light
                          ][colorSeed];
                          
                          const pointsAwarded = event.pointsAwardedToGuests?.find(p => p.userId === guest.id)?.points || 0;
                          
                          return (
                            <AudienceSeat key={guest.id}>
                              <AvatarContainer checkedIn={guest.checkedIn}>
                                <Avatar randomColor={randomColor}>
                                  {guest.avatarUrl ? (
                                    (() => {
                                      // Add null checks here too
                                      if (!guest.avatarUrl) return null;
                                      
                                      const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(guest.avatarUrl);
                                      const avatarPath = guest.avatarUrl.startsWith('/') ? guest.avatarUrl : `/${guest.avatarUrl}`;
                                      const baseSrc = isAbsolute ? guest.avatarUrl : `${API_URL}${avatarPath}`;
                                      return <img src={baseSrc} alt={guest.name} />;
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
                                ) : canEditEventDetails && (eventStatus.text === 'Upcoming' || eventStatus.text === 'Ongoing') ? (
                                  <AttendeeActionButton 
                                    size="tiny" 
                                    onClick={() => {
                                      setSelectedUserId(guest.id);
                                      setSelectedUtorid(guest.utorid);
                                      setAwardPointsModalOpen(true);
                                    }}
                                  >
                                    🏆
                                  </AttendeeActionButton>
                                ) : null}
                                {isManager && (
                                  <AttendeeActionButton 
                                    size="tiny" 
                                    color="error"
                                    onClick={() => handleRemoveGuest(guest.id)}
                                  >
                                    ❌
                                  </AttendeeActionButton>
                                )}
                              </AudienceRole>
                            </AudienceSeat>
                          );
                        })}

                        {/* Add guest seat - keep internal logic based on canEditEventDetails */}
                        {canEditEventDetails && (eventStatus.text === 'Upcoming' || eventStatus.text === 'Ongoing') && ( 
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
                        {canEditEventDetails && (eventStatus.text === 'Upcoming' || eventStatus.text === 'Ongoing') ? ( 
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
                    {event.organizers && Array.isArray(event.organizers) && event.organizers.length > 0 ? (
                      event.organizers.map(organizer => (
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
            
            {/* Conditionally render Shortlinks tab content */} 
            {(activeTab === 'shortlinks' && (isManager || isCurrentUserOrganizerForEvent)) && ( 
              <Card>
                <Card.Body>
                  <ShortlinkList
                    shortlinks={shortlinks}
                    isLoading={isLoadingShortlinks}
                    total={shortlinks?.length || 0}
                    page={1}
                    totalPages={1}
                    onPageChange={() => {}}
                    onEdit={handleEditShortlink}
                    onDelete={handleDeleteShortlink}
                    onCreate={handleCreateShortlink}
                    canCreate={true}
                    canEdit={true}
                    canDelete={true}
                    title="Event Shortlinks"
                  />
                </Card.Body>
              </Card>
            )}
          </TabContainer>
          )}
        </EventInfo>
        
        <Sidebar>
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
                <UpcomingBadge style={{ 
                  backgroundColor: eventStatus.color,
                  color: '#FFFFFF'
                }}>
                  {eventStatus.text}
                </UpcomingBadge>
              </SummaryItem>
              <SummaryItem>
                <strong>Guests:</strong>
                <span>
                {event.numGuests ?? event.guests?.length ?? 0}
                  {event.capacity ? ` / ${event.capacity} capacity` : ' (unlimited)'}
                </span>
               </SummaryItem>
               {/* Conditionally render Points summary */} 
               {isManager && ( 
                  <SummaryItem>
                    <strong>Points:</strong>
                    <span>
                      {event.pointsAwarded || 0} awarded ({event.pointsRemain ?? event.points ?? 0} remaining)
                    </span>
                  </SummaryItem>
                )}

               {/* QR code for attendees */}
               {isUserAttending() && currentUser && currentUser.utorid && (
                 <div style={{ marginTop: theme.spacing.lg }}>
                   <UniversalQRCode
                     context="user"
                     utorid={currentUser.utorid}
                     label="Your Universal QR Code"
                     size={180}
                     description="Present this QR code for check-in or other services"
                   />
                 </div>
               )}
            </Card.Body>
          </SummaryCard>
        </Sidebar>
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
              <>
                <p>
                  This will award points to all {event.guests && Array.isArray(event.guests) ? event.guests.length : 0} guests who have RSVP'd to this event.
                </p>
                
                {pointsAmount && event.guests && Array.isArray(event.guests) && event.guests.length > 0 && (
                  <div style={{
                    marginTop: theme.spacing.md,
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.background.light,
                    borderRadius: theme.radius.md,
                    border: `1px solid ${theme.colors.primary.light}`
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: theme.spacing.sm
                    }}>
                      <span style={{ 
                        fontWeight: theme.typography.fontWeights.medium,
                        color: theme.colors.text.primary
                      }}>
                        Points per guest:
                      </span>
                      <span style={{
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeights.bold,
                        color: theme.colors.primary.main
                      }}>
                        {pointsAmount} pts each
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary
                    }}>
                      <span>Total points needed:</span>
                      <span style={{ fontWeight: theme.typography.fontWeights.medium }}>
                        {pointsAmount} × {event.guests.length} = {Number(pointsAmount) * event.guests.length} pts
                      </span>
                    </div>
                  </div>
                )}
              </>
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
                
                // If awarding to all guests, check if we have enough total points
                if (!selectedUserId && event.guests && Array.isArray(event.guests)) {
                  const totalPointsNeeded = pointsNum * event.guests.length;
                  const availablePoints = event.pointsRemain !== undefined ? event.pointsRemain : (event.points || 0);
                  
                  if (totalPointsNeeded > availablePoints) {
                    toast.error(`Not enough points available. Need ${totalPointsNeeded} points but only ${availablePoints} available.`);
                    return;
                  }
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
      <EditEventModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          // Reset background states
          setBackgroundFile(null);
          setBackgroundPreview(null);
        }}
        eventData={eventData}
        selectedEvent={event}
        handleFormChange={handleFormChange}
        handleUpdateEvent={handleUpdateEvent}
        isUpdating={isUpdating}
        isManager={isManager}
        backgroundFile={backgroundFile}
        setBackgroundFile={setBackgroundFile}
        backgroundPreview={backgroundPreview}
        setBackgroundPreview={setBackgroundPreview}
      />
      
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

      {/* Scanner modal for organizers/managers */}
      <ScannerModal
        isOpen={scanModalOpen}
        onClose={handleScanModalClose}
        eventId={eventId}
        onScanSuccess={handleScanSuccess}
      />

      {/* Manual check-in modal for organizers/managers */}
      <ManualCheckinModal
        isOpen={manualCheckinModalOpen}
        onClose={handleManualCheckinClose}
        eventId={eventId}
        onCheckinSuccess={handleManualCheckinSuccess}
      />
      
      {/* Shortlink modals */}
      <CreateShortlinkModal
        isOpen={createShortlinkModalOpen}
        onClose={handleCloseShortlinkModals}
        onSubmit={handleCreateShortlinkSubmit}
        isLoading={isCreatingShortlink}
        eventId={eventId}
        eventName={event?.name}
        suggestedSlug={event?.name ? event.name.toLowerCase().replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-') : ''}
        suggestedUrl={`${window.location.origin}/events/${eventId}`}
      />
      
      <EditShortlinkModal
        isOpen={editShortlinkModalOpen}
        onClose={handleCloseShortlinkModals}
        onSubmit={handleEditShortlinkSubmit}
        shortlink={selectedShortlink}
        isLoading={isUpdatingShortlink}
      />
      
      <DeleteShortlinkModal
        isOpen={deleteShortlinkModalOpen}
        onClose={handleCloseShortlinkModals}
        onConfirm={handleDeleteShortlinkConfirm}
        shortlink={selectedShortlink}
        isLoading={isDeletingShortlink}
      />
    </div>
  );
};

export default EventDetail; 
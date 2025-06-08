import React, { useState } from 'react';
import styled from '@emotion/styled';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import theme from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../services/api';
import { 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaCoins,
  FaCheckCircle,
  FaImage
} from 'react-icons/fa';

const EventCard = styled(Card)`
  height: 100%;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const EventBackgroundContainer = styled.div`
  position: relative;
  width: calc(100% - 4px);
  height: 185px;
  margin: 2px 2px ${theme.spacing.sm} 2px;
  border-radius: ${theme.radius.md};
  background: ${props => props.backgroundUrl 
    ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${props.backgroundUrl})`
    : `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark})`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
  padding: ${theme.spacing.md};
  overflow: hidden;
`;

const BackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: ${theme.radius.md};
  transition: opacity 0.3s ease;
  z-index: 1;
`;

const ImagePlaceholder = styled.div`
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.radius.md};
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  svg {
    font-size: 1.5rem;
    color: ${theme.colors.text.secondary};
  }
  
  .placeholder-text {
    font-size: ${theme.typography.fontSize.xs};
    color: ${theme.colors.text.secondary};
    font-weight: ${theme.typography.fontWeights.medium};
    text-align: center;
  }
`;

const GradientOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3));
  border-radius: ${theme.radius.md};
  z-index: 3;
`;

const EventBackgroundContent = styled.div`
  color: white;
  width: 100%;
  display: flex;
  align-items: flex-end; /* Change from center to flex-end to push content down */
  gap: ${theme.spacing.md};
  position: relative;
  z-index: 4;
  
  /* Ensure the date container doesn't shrink */
  & > div:first-of-type {
    flex-shrink: 0;
  }
  
  /* Allow the content area to be flexible but prevent overflow */
  & > div:last-of-type {
    flex: 1;
    min-width: 0; /* Important for text truncation */
    margin-bottom: ${theme.spacing.xs}; /* Add bottom margin to push text up slightly from the very bottom */
  }
`;

const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.9);
  color: ${theme.colors.text.primary};
  border-radius: ${theme.radius.md};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .month {
    font-size: ${theme.typography.fontSize.xs};
    text-transform: uppercase;
    font-weight: ${theme.typography.fontWeights.semiBold};
  }
  
  .day {
    font-size: ${theme.typography.fontSize['2xl']};
    font-weight: ${theme.typography.fontWeights.bold};
  }
`;

const EventTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: ${theme.spacing.xs}; /* Keep original spacing between title and badges */
  color: inherit;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const EventDescription = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.md};
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EventDetails = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const EventDetail = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${theme.spacing.sm};
    color: ${theme.colors.text.secondary};
    min-width: 16px;
  }
`;

const EventCardBody = styled(Card.Body)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const EventContent = styled.div`
  flex-grow: 1;
`;

const EventActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  flex-shrink: 0; /* Prevent actions from shrinking */
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 4px; /* Smaller gap between badges */
  margin-top: ${theme.spacing.sm}; /* Keep original spacing between title and badges */
  flex-wrap: wrap;
  max-width: 100%;
  overflow: hidden;
`;

// Create a compact badge base style for event cards
const CompactBadge = styled(Badge)`
  /* Extra compact padding for event card badges */
  padding: 2px 6px; /* Very compact padding */
  font-size: 10px; /* Smaller font size */
  font-weight: ${theme.typography.fontWeights.medium};
  white-space: nowrap;
  line-height: 1.2;
  border-radius: ${theme.radius.sm}; /* Smaller border radius */
`;

// Create a custom Badge component that accepts hex color values
const ColoredBadge = styled(CompactBadge)`
  background-color: ${props => props.customColor || theme.colors.primary.main};
  color: white;
`;

const EventCardItem = ({ 
  event, 
  isManager, 
  formatCompactDate, 
  formatTime, 
  getEventCardDate, 
  getEventStatus, 
  isRsvpd, 
  handleEditEvent, 
  handleDeleteEventClick, 
  handleRsvpClick,
  navigateToEventDetail,
  handleCancelRsvpClick,
  handleViewDetails,
  isCreatingRsvp,
  isCancelingRsvp,
  selectedEventIdForRsvp
}) => {
  const { activeRole } = useAuth();
  const isManagerOrHigher = ['manager', 'superuser'].includes(activeRole);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Reset image state when backgroundUrl changes
  React.useEffect(() => {
    if (event?.backgroundUrl) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [event?.backgroundUrl]);

  if (!event) return null; // Skip null/undefined events
  
  const { month, day } = getEventCardDate(event.startTime);
  const eventStatus = getEventStatus(event.startTime, event.endTime);
  const isUserRsvpd = isRsvpd(event);
  const isUserCheckedIn = event.checkedIn || false;
  
  // Calculate if the event is at full capacity
  const isFull = event.capacity && event.numGuests >= event.capacity;
  
  // Get background URL - handle both local uploads and external URLs
  const getBackgroundUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const backgroundUrl = getBackgroundUrl(event.backgroundUrl);
  
  return (
    <EventCard>
      <EventBackgroundContainer>
        {backgroundUrl && !imageError ? (
          <BackgroundImage 
            src={backgroundUrl} 
            alt={event.name} 
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ 
              opacity: imageLoading ? 0 : 1
            }}
          />
        ) : null}
        
        {(!backgroundUrl || imageError) && !imageLoading && (
          <ImagePlaceholder>
            <FaImage />
            <span className="placeholder-text">No Image</span>
          </ImagePlaceholder>
        )}
        
        {backgroundUrl && !imageError && <GradientOverlay />}
        
        <EventBackgroundContent>
          <EventDate>
            <span className="month">{month || ''}</span>
            <span className="day">{day || ''}</span>
          </EventDate>
          <div>
            <EventTitle>{event.name || 'Unnamed Event'}</EventTitle>
            <BadgeContainer>
              <ColoredBadge customColor={eventStatus.color}>{eventStatus.text}</ColoredBadge>
              
              {isUserRsvpd && (
                isUserCheckedIn ? (
                  <CompactBadge color="success" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <FaCheckCircle size={12} /> Checked In
                  </CompactBadge>
                ) : (
                  <CompactBadge color="info">RSVP'd</CompactBadge>
                )
              )}
              
              {event.isOrganizer && (
                <CompactBadge color="primary">Organizer</CompactBadge>
              )}
              
              {isManagerOrHigher && (
                event.published ? 
                <CompactBadge color="success">Published</CompactBadge> : 
                <CompactBadge color="warning">Unpublished</CompactBadge>
              )}
            </BadgeContainer>
          </div>
        </EventBackgroundContent>
      </EventBackgroundContainer>
      <EventCardBody>
        <EventContent>
          {event.description && (
          <EventDescription>
              {event.description}
          </EventDescription>
          )}
          
          <EventDetails>
            <EventDetail>
              <FaMapMarkerAlt />
              <span>{event.location || 'No location specified'}</span>
            </EventDetail>
            
            <EventDetail>
              <FaCalendarAlt />
              <span>
                {formatCompactDate(event.startTime)}
                {event.endTime && new Date(event.startTime).toDateString() !== new Date(event.endTime).toDateString() && 
                  ` - ${formatCompactDate(event.endTime)}`}
              </span>
            </EventDetail>
            
            <EventDetail>
              <FaClock />
              <span>
                {formatTime(event.startTime)} - {event.endTime ? formatTime(event.endTime) : 'TBD'}
              </span>
            </EventDetail>
            
            <EventDetail>
              <FaUsers />
              <span>
                {event.numGuests ?? (event.guests?.length ?? 0)} attendees
                {event.capacity ? ` (max: ${event.capacity})` : ''}
              </span>
            </EventDetail>
            
            {isManagerOrHigher && (
              <EventDetail>
                <FaCoins />
                <span>{event.pointsRemain ?? 0} points available</span>
              </EventDetail>
            )}
          </EventDetails>
        </EventContent>
        
        <EventActions>
          <div>
            <Button 
              size="small" 
              onClick={() => navigateToEventDetail ? navigateToEventDetail(event.id) : window.location.href = `/events/${event.id}`}
            >
              View Details
            </Button>
          </div>
          
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            {(eventStatus.text === 'Upcoming' || eventStatus.text === 'Ongoing') && !isFull && (
              <Button 
                size="small" 
                variant={isUserRsvpd ? "outlined" : "default"}
                color={isUserRsvpd ? "error" : "default"}
                onClick={() => handleRsvpClick(event)}
              >
                {isUserRsvpd ? 'Cancel RSVP' : 'RSVP'}
              </Button>
            )}
            
            {(isManagerOrHigher || event.isOrganizer) && (
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleEditEvent(event)}
              >
                <FaEdit />
              </Button>
            )}
            
            {isManagerOrHigher && !event.published && (
              <Button 
                size="small" 
                variant="outlined" 
                color="error"
                onClick={() => handleDeleteEventClick(event)}
              >
                <FaTrash />
              </Button>
            )}
          </div>
        </EventActions>
      </EventCardBody>
    </EventCard>
  );
};

export default EventCardItem; 
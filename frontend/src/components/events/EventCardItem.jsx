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
  align-items: center;
  gap: ${theme.spacing.md};
  position: relative;
  z-index: 4;
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
  margin-bottom: ${theme.spacing.xs};
  color: inherit;
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

const EventActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm};
`;

// Create a custom Badge component that accepts hex color values
const ColoredBadge = styled(Badge)`
  background-color: ${props => props.customColor || theme.colors.primary.main};
  color: white;
  font-weight: ${theme.typography.fontWeights.medium};
  
  /* All badges should have white text */
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
                  <Badge color="success" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <FaCheckCircle size={12} /> Checked In
                  </Badge>
                ) : (
                  <Badge color="info">RSVP'd</Badge>
                )
              )}
              
              {event.isOrganizer && (
                <Badge color="primary">Organizer</Badge>
              )}
              
              {isManagerOrHigher && (
                event.published ? 
                <Badge color="success">Published</Badge> : 
                <Badge color="warning">Unpublished</Badge>
              )}
            </BadgeContainer>
          </div>
        </EventBackgroundContent>
      </EventBackgroundContainer>
      <Card.Body>
        
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
      </Card.Body>
    </EventCard>
  );
};

export default EventCardItem; 
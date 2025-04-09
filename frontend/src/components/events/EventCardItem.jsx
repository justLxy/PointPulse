import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import theme from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaCoins
} from 'react-icons/fa';

const EventCard = styled(Card)`
  height: 100%;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const EventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  border-radius: ${theme.radius.md};
  margin-right: ${theme.spacing.md};
  
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

const EventHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const EventTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: ${theme.spacing.xs};
`;

const EventDescription = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  line-height: 1.5;
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
  
  /* Ensure good contrast with text */
  ${props => props.customColor === '#f4d03f' && `
    color: #333; /* Darker text for yellow background */
  `}
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
  handleCancelRsvpClick,
  handleViewDetails,
  isCreatingRsvp,
  isCancelingRsvp,
  selectedEventIdForRsvp,
}) => {
  const { activeRole } = useAuth();
  const isManagerOrHigher = ['manager', 'superuser'].includes(activeRole);

  if (!event) return null; // Skip null/undefined events
  
  const { month, day } = getEventCardDate(event.startTime);
  const eventStatus = getEventStatus(event.startTime, event.endTime);
  const isUserRsvpd = isRsvpd(event);
  
  return (
    <EventCard>
      <Card.Body>
        <EventHeader>
          <EventDate>
            <span className="month">{month || ''}</span>
            <span className="day">{day || ''}</span>
          </EventDate>
          <div>
            <EventTitle>{event.name || 'Unnamed Event'}</EventTitle>
            <BadgeContainer>
              <ColoredBadge customColor={eventStatus.color}>{eventStatus.text}</ColoredBadge>
              
              {isUserRsvpd && <Badge color="info">RSVP'd</Badge>}
              
              {event.isOrganizer && (
                <Badge color="primary">Organizer</Badge>
              )}
              
              {isManager && (
                event.published ? 
                <Badge color="success">Published</Badge> : 
                <Badge color="warning">Unpublished</Badge>
              )}
            </BadgeContainer>
          </div>
        </EventHeader>
        
        <EventDescription>
          {event.description && event.description.length > 150
            ? `${event.description.slice(0, 150)}...`
            : event.description || ''}
        </EventDescription>
        
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
            <Link to={`/events/${event.id}`}>
              <Button size="small">View Details</Button>
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            {eventStatus.text === 'Upcoming' && (
              <Button 
                size="small" 
                variant={isUserRsvpd ? "outlined" : "default"}
                color={isUserRsvpd ? "error" : "default"}
                onClick={() => handleRsvpClick(event)}
              >
                {isUserRsvpd ? 'Cancel RSVP' : 'RSVP'}
              </Button>
            )}
            
            {(isManager || event.isOrganizer) && (
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => handleEditEvent(event)}
              >
                <FaEdit />
              </Button>
            )}
            
            {isManager && (
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
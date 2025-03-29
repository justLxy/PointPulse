import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import theme from '../styles/theme';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers, 
  FaUser, 
  FaCoins,
  FaFilter,
  FaSearch,
  FaInfo
} from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterInput = styled.div`
  width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.md};
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const PageInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.xl};
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

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

const BadgeContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.sm};
`;

const Events = () => {
  const { activeRole } = useAuth();
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    name: '',
    location: '',
    page: 1,
    limit: 9,
    status: '',
    capacityStatus: 'available',
    showFull: false,
    ...(isManager ? {
      started: null,
      ended: null,
      published: null,
      publishedStatus: '',
    } : {})
  });
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      // If changing a filter value, reset to page 1
      const newFilters = key === 'page' ? { ...prev, [key]: value } : { ...prev, [key]: value, page: 1 };
      return newFilters;
    });
  };
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Form state
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
  
  // Prepare API params from filters
  const getApiParams = () => {
    // Start with basic filters
    const apiParams = {
      page: filters.page,
      limit: filters.limit,
    };
    
    // Add name filter if present
    if (filters.name) {
      apiParams.name = filters.name;
    }
    
    // Add location filter if present
    if (filters.location) {
      apiParams.location = filters.location;
    }
    
    // Add status filters based on the selected status
    if (filters.status) {
      if (filters.status === 'upcoming') {
        apiParams.started = false;
      } else if (filters.status === 'ongoing') {
        apiParams.started = true;
        apiParams.ended = false;
      } else if (filters.status === 'past') {
        apiParams.ended = true;
      } else if (filters.status === 'attending') {
        apiParams.attending = true;
      }
    }
    
    // Add published filter for managers
    if (isManager && filters.publishedStatus) {
      if (filters.publishedStatus === 'published') {
        apiParams.published = true;
      } else if (filters.publishedStatus === 'unpublished') {
        apiParams.published = false;
      }
    }
    
    // Add capacity filter
    if (filters.capacityStatus === 'available') {
      apiParams.showFull = false;
    } else {
      apiParams.showFull = true;
    }
    
    return apiParams;
  };
  
  // Get events with current filters
  const { 
    events, 
    totalCount, 
    isLoading, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    rsvpToEvent, 
    cancelRsvp, 
    isCreating, 
    isUpdating, 
    isDeleting, 
    isRsvping, 
    isCancellingRsvp 
  } = useEvents(getApiParams());
  
  // Calculate pagination values
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(startIndex + filters.limit - 1, totalCount);
  const totalPages = Math.ceil(totalCount / filters.limit);
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Format time for display
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };
  
  // Get month and day for event card
  const getEventCardDate = (dateStr) => {
    if (!dateStr) return { month: '', day: '' };
    
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return { month: '', day: '' };
      }
      
      const month = date.toLocaleString('default', { month: 'short' });
      const day = date.getDate();
      return { month, day };
    } catch (error) {
      console.error('Error parsing date:', error);
      return { month: '', day: '' };
    }
  };
  
  // Check if event is upcoming
  const isUpcoming = (startTime) => {
    if (!startTime) return false;
    const now = new Date();
    return new Date(startTime) > now;
  };
  
  // Handle create/edit form changes
  const handleFormChange = (key, value) => {
    setEventData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Reset form
  const resetForm = () => {
    setEventData({
      name: '',
      description: '',
      location: '',
      capacity: '',
      points: '',
      startTime: '',
      endTime: '',
      published: false,
    });
    setSelectedEvent(null);
  };
  
  // Set up event for editing
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    
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
  
  // Set up event for deletion
  const handleDeleteEventClick = (event) => {
    setSelectedEvent(event);
    setDeleteModalOpen(true);
  };
  
  // Set up event for RSVP
  const handleRsvpClick = (event) => {
    setSelectedEvent(event);
    setRsvpModalOpen(true);
  };
  
  // Create event
  const handleCreateEvent = () => {
    // Format data for API
    const formattedData = {
      ...eventData,
      capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
      points: eventData.points ? parseInt(eventData.points) : 0,
    };
    
    createEvent(formattedData, {
      onSuccess: () => {
        setCreateModalOpen(false);
        resetForm();
      },
    });
  };
  
  // Update event
  const handleUpdateEvent = () => {
    if (!selectedEvent) return;
    
    // Format data for API
    const formattedData = {
      ...eventData,
      capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
      points: eventData.points ? parseInt(eventData.points) : 0,
    };
    
    // Only include published if it's true and not already published
    if (isManager && eventData.published && !selectedEvent.published) {
      formattedData.published = true;
    }
    
    updateEvent(
      { id: selectedEvent.id, data: formattedData },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          resetForm();
        },
      }
    );
  };
  
  // Delete event
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    
    deleteEvent(selectedEvent.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedEvent(null);
      },
    });
  };
  
  // RSVP to event
  const handleRsvp = () => {
    if (!selectedEvent) return;
    
    rsvpToEvent(selectedEvent.id, {
      onSuccess: () => {
        setRsvpModalOpen(false);
        setSelectedEvent(null);
      },
    });
  };
  
  // Cancel RSVP
  const handleCancelRsvp = () => {
    if (!selectedEvent) return;
    
    cancelRsvp(selectedEvent.id, {
      onSuccess: () => {
        setRsvpModalOpen(false);
        setSelectedEvent(null);
      },
    });
  };
  
  // Check if user is RSVP'd to event
  const isRsvpd = (event) => {
    return event && event.isAttending || false;
  };
  
  return (
    <div>
      <PageTitle>Events</PageTitle>
      
      <FilterSection>
        <FilterInput>
          <Input
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            leftIcon={<FaSearch size={16} />}
          />
        </FilterInput>
        
        <FilterInput>
          <Input
            placeholder="Search by location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            leftIcon={<FaMapMarkerAlt size={16} />}
          />
        </FilterInput>
        
        <FilterInput>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            placeholder="Event Status"
          >
            <option value="">All Events</option>
            <option value="upcoming">Upcoming Events</option>
            <option value="ongoing">Ongoing Events</option>
            <option value="past">Past Events</option>
            <option value="attending">My RSVPs</option>
          </Select>
        </FilterInput>
        
        {isManager && (
          <FilterInput>
            <Select
              value={filters.publishedStatus}
              onChange={(e) => handleFilterChange('publishedStatus', e.target.value)}
              placeholder="Published Status"
            >
              <option value="">All Visibility</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </Select>
          </FilterInput>
        )}
        
        <FilterInput>
          <Select
            value={filters.capacityStatus}
            onChange={(e) => handleFilterChange('capacityStatus', e.target.value)}
            placeholder="Capacity"
          >
            <option value="available">Available Only</option>
            <option value="all">Show Full Events</option>
          </Select>
        </FilterInput>
        
        {isManager && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <FaPlus /> Create Event
          </Button>
        )}
      </FilterSection>
      
      {isLoading ? (
        <LoadingSpinner text="Loading events..." />
      ) : events && Array.isArray(events) && events.length > 0 ? (
        (() => {
          // Filter events for regular users to see only published events
          const filteredEvents = events.filter(event => isManager || event.published);
          
          // Calculate how many events are visible after filtering
          const filteredCount = filteredEvents.length;
          
          return filteredEvents.length > 0 ? (
            <>
              <EventsGrid>
                {filteredEvents.map((event) => {
                  if (!event) return null; // Skip null/undefined events
                  
                  const { month, day } = getEventCardDate(event.startTime);
                  const isUserRsvpd = isRsvpd(event);
                  const upcoming = isUpcoming(event.startTime);
                  
                  return (
                    <EventCard key={event.id || 'unknown'}>
                      <Card.Body>
                        <EventHeader>
                          <EventDate>
                            <span className="month">{month || ''}</span>
                            <span className="day">{day || ''}</span>
                          </EventDate>
                          <div>
                            <EventTitle>{event.name || 'Unnamed Event'}</EventTitle>
                            <BadgeContainer>
                              {upcoming ? (
                                <Badge color="success">Upcoming</Badge>
                              ) : (
                                <Badge color="secondary">Past</Badge>
                              )}
                              
                              {isUserRsvpd && <Badge color="info">RSVP'd</Badge>}
                              
                              {isManager && event.isOrganizer && (
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
                              {formatDate(event.startTime)} {formatTime(event.startTime)} to{' '}
                              {event.endTime ? `${formatDate(event.endTime)} ${formatTime(event.endTime)}` : 'TBD'}
                            </span>
                          </EventDetail>
                          
                          <EventDetail>
                            <FaUsers />
                            <span>
                              {event.guests && Array.isArray(event.guests) ? `${event.guests.length} attendees` : '0 attendees'}
                              {event.capacity ? ` (max: ${event.capacity})` : ''}
                            </span>
                          </EventDetail>
                          
                          <EventDetail>
                            <FaCoins />
                            <span>{event.points || 0} points available</span>
                          </EventDetail>
                        </EventDetails>
                        
                        <EventActions>
                          <div>
                            <Link to={`/events/${event.id}`}>
                              <Button size="small">View Details</Button>
                            </Link>
                          </div>
                          
                          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                            {upcoming && (
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
                })}
              </EventsGrid>
              
              {/* Update pagination to show filtered count */}
              {filteredCount > 0 && (
                <PageControls>
                  <PageInfo>
                    Showing {Math.min(filteredCount, startIndex)} to {Math.min(endIndex, filteredCount)} of {filteredCount} events
                    {!isManager && filteredCount < totalCount && (
                      <span style={{ marginLeft: theme.spacing.sm, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.hint }}>
                        (Only showing published events)
                      </span>
                    )}
                  </PageInfo>
                  
                  <Pagination>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                      disabled={filters.page === 1}
                    >
                      Previous
                    </Button>
                    
                    <PageInfo>
                      Page {filters.page} of {Math.ceil(filteredCount / filters.limit)}
                    </PageInfo>
                    
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleFilterChange('page', Math.min(Math.ceil(filteredCount / filters.limit), filters.page + 1))}
                      disabled={filters.page === Math.ceil(filteredCount / filters.limit)}
                    >
                      Next
                    </Button>
                  </Pagination>
                </PageControls>
              )}
            </>
          ) : (
            <EmptyState>
              {isManager ? 
                "No visible events match your filters. Try different filter settings or create a new event." : 
                "No published events found. Check back later for upcoming events!"}
            </EmptyState>
          );
        })()
      ) : (
        <EmptyState>
          {isManager ? 
            "No events found. Create an event to get started!" : 
            "No events found. Check back later!"}
        </EmptyState>
      )}
      
      {/* Create Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Event"
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
              
              <Input
                label="Points"
                type="number"
                value={eventData.points}
                onChange={(e) => handleFormChange('points', e.target.value)}
                placeholder="Points to award to attendees"
                required
              />
            </FormGroup>
            
            {isManager && (
              <div style={{ 
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.background.default,
                borderRadius: theme.radius.md,
                marginTop: theme.spacing.sm,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                display: 'flex',
                alignItems: 'center'
              }}>
                <FaInfo size={16} style={{ marginRight: theme.spacing.sm, minWidth: '16px' }} />
                <span>New events are created as unpublished by default. You can publish them later from the Edit screen.</span>
              </div>
            )}
          </ModalForm>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => {
                setCreateModalOpen(false);
                resetForm();
              }}
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
      
      {/* Edit Event Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          resetForm();
        }}
        title={`Edit Event: ${selectedEvent?.name || ''}`}
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
              
              <Input
                label="Points"
                type="number"
                value={eventData.points}
                onChange={(e) => handleFormChange('points', e.target.value)}
                placeholder="Points to award to attendees"
                required
              />
            </FormGroup>
            
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
              onClick={() => {
                setEditModalOpen(false);
                resetForm();
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
          setSelectedEvent(null);
        }}
        title="Delete Event"
        size="small"
      >
        <ModalContent>
          <p>Are you sure you want to delete this event?</p>
          <p><strong>{selectedEvent?.name}</strong></p>
          <p>This action cannot be undone and will remove all RSVPs.</p>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedEvent(null);
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
      
      {/* RSVP Modal */}
      <Modal
        isOpen={rsvpModalOpen}
        onClose={() => {
          setRsvpModalOpen(false);
          setSelectedEvent(null);
        }}
        title={isRsvpd(selectedEvent) ? "Cancel RSVP" : "RSVP to Event"}
        size="small"
      >
        <ModalContent>
          {isRsvpd(selectedEvent) ? (
            <>
              <p>Are you sure you want to cancel your RSVP for this event?</p>
              <p><strong>{selectedEvent?.name}</strong></p>
              <p>You may not be able to RSVP again if the event reaches capacity.</p>
              
              <ModalActions>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRsvpModalOpen(false);
                    setSelectedEvent(null);
                  }}
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
              <p>Would you like to RSVP to this event?</p>
              <p><strong>{selectedEvent?.name}</strong></p>
              <p>{formatDate(selectedEvent?.startTime)} at {formatTime(selectedEvent?.startTime)}</p>
              <p>{selectedEvent?.location}</p>
              
              <ModalActions>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRsvpModalOpen(false);
                    setSelectedEvent(null);
                  }}
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
    </div>
  );
};

export default Events; 
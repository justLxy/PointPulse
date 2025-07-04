import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../../hooks/useEvents';
import { useAuth } from '../../contexts/AuthContext';
import EventFilters from '../../components/events/EventFilters';
import EventList from '../../components/events/EventList';
import { CreateEventModal, EditEventModal, DeleteEventModal, RsvpEventModal } from '../../components/events/EventModals';
import EventService from '../../services/event.service';
import { API_URL } from '../../services/api';
import toast from 'react-hot-toast';

const Events = () => {
  const { activeRole } = useAuth();
  const isManager = ['manager', 'superuser'].includes(activeRole);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize filters from search params or defaults
  const [filters, setFilters] = useState(() => {
    // First try to get filters from sessionStorage if coming back from detail page
    const savedFilters = sessionStorage.getItem('events-filters');
    
    if (savedFilters) {
      try {
        // Parse saved filters and use them
        const parsedFilters = JSON.parse(savedFilters);
        // Clean sessionStorage to prevent using these filters on a fresh visit
        sessionStorage.removeItem('events-filters');
        return parsedFilters;
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }
    
    // Fall back to URL params or defaults if no saved filters
    const initialFilters = {
      name: searchParams.get('name') || '',
      location: searchParams.get('location') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: 9,
      status: searchParams.get('status') || '',
      capacityStatus: searchParams.get('capacityStatus') || 'available',
      publishedStatus: searchParams.get('publishedStatus') || '',
    };
    // Derive boolean started/ended from status for getApiParams if needed, but keep status string in state
    return initialFilters;
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
    backgroundUrl: '',
  });
  
  // Background image state
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  
  // Effect to update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (filters.name) newParams.set('name', filters.name);
    if (filters.location) newParams.set('location', filters.location);
    if (filters.page > 1) newParams.set('page', filters.page.toString());
    if (filters.status) newParams.set('status', filters.status);
    if (filters.capacityStatus && filters.capacityStatus !== 'available') newParams.set('capacityStatus', filters.capacityStatus);
    if (isManager && filters.publishedStatus) newParams.set('publishedStatus', filters.publishedStatus);
    
    setSearchParams(newParams, { replace: true });
    
    // Save current filters to sessionStorage
    sessionStorage.setItem('events-filters', JSON.stringify(filters));
  }, [filters, setSearchParams, isManager]);
  
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
        apiParams.attending = true; // Send attending=true to backend
      } else if (filters.status === 'organizing') {
        apiParams.organizing = true; // Send organizing=true to backend
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
    
    // Add capacity filter (showFull parameter)
    if (filters.capacityStatus === 'available') {
      apiParams.showFull = false;
    } else { // 'all'
      apiParams.showFull = true;
    }
    
    // includeMyOrganizedEvents is likely redundant now backend handles organizing param, but harmless to keep
    // apiParams.includeMyOrganizedEvents = true; 
    
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
    isCancellingRsvp,
    refetch
  } = useEvents(getApiParams());
  
  // Calculate pagination values based on API results
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(startIndex + (events?.length || 0) - 1, totalCount);
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
  
  // Format date in a more compact way for event cards (YYYY/MM/DD)
  const formatCompactDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}/${month}/${day}`;
    } catch (error) {
      console.error('Error formatting compact date:', error);
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
  
  // Calculate event status for card badge
  const getEventStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    
    if (start > now) {
      return { text: 'Upcoming', color: '#F39C12' }; // Amber for upcoming
    }
    if (end && end < now) {
      return { text: 'Past', color: '#e74c3c' }; // Red for past
    }
    return { text: 'Ongoing', color: '#2ecc71' }; // Green for ongoing
  };
  const isEventEnded = (endTime) => {
    return new Date(endTime) < new Date();
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
      backgroundUrl: '',
    });
    setBackgroundFile(null);
    setBackgroundPreview(null);
    setSelectedEvent(null);
  };
  
  // Set up event for editing
  // Helper function to convert UTC datetime to local datetime-local format
  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    // Adjust for timezone offset to get local time
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16);
  };

  const handleEditEvent = (event) => {
    console.log("Original event data:", event);
    
    // Immediately set the selected event and what we have
    setSelectedEvent(event);
    
    // Try to get the best points value from the event object
    const initialPointsValue = 
      // Original points allocation takes precedence
      typeof event.points === 'number' ? event.points : 
      // Fallback to other possible properties
      typeof event.pointsTotal === 'number' ? event.pointsTotal :
      // If we have both awarded and remaining, we can calculate the total
      (typeof event.pointsAwarded === 'number' && typeof event.pointsRemain === 'number') 
        ? (event.pointsAwarded + event.pointsRemain) :
      // Last resort, just use the remaining points
      typeof event.pointsRemain === 'number' ? event.pointsRemain : '';
    
    // Create a new object for the form data to ensure React detects the change
    const initialFormData = {
      name: event.name || '',
      description: event.description || '',
      location: event.location || '',
      capacity: event.capacity || '',
      points: initialPointsValue,
      startTime: formatDateTimeForInput(event.startTime),
      endTime: formatDateTimeForInput(event.endTime),
      published: event.published || false,
      backgroundUrl: event.backgroundUrl || '',
    };
    
    // Reset background image state for editing
    setBackgroundFile(null);
    
    // Set background preview from existing URL if available
    if (event.backgroundUrl) {
      const getBackgroundUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
      };
      setBackgroundPreview(getBackgroundUrl(event.backgroundUrl));
    } else {
      setBackgroundPreview(null);
    }
    
    // Set initial form data
    setEventData(initialFormData);
    
    // Always open the modal immediately 
    setEditModalOpen(true);
    
    // Then fetch full event data to update fields if needed
    if (event.id) {
      console.log("Fetching complete event data for ID:", event.id);
      
      // Use the service directly to get full event details
      EventService.getEvent(event.id)
        .then(fullEvent => {
          console.log("Received complete event data:", fullEvent);
          
          // Get the best points value from the complete event data
          const fullPointsValue = 
            // Original points allocation takes precedence
            typeof fullEvent.points === 'number' ? fullEvent.points : 
            // Fallback to other possible properties
            typeof fullEvent.pointsTotal === 'number' ? fullEvent.pointsTotal :
            // If we have both awarded and remaining, we can calculate the total
            (typeof fullEvent.pointsAwarded === 'number' && typeof fullEvent.pointsRemain === 'number') 
              ? (fullEvent.pointsAwarded + fullEvent.pointsRemain) :
            // Last resort, just use the remaining points
            typeof fullEvent.pointsRemain === 'number' ? fullEvent.pointsRemain : 
            // If we couldn't get a better value from the full event data, use what we had initially
            initialFormData.points;
          
          // Update the form if we got new data
          if (fullEvent) {
            setEventData(prevData => ({
              ...prevData,
              description: fullEvent.description || '',
              // Update any other fields that might have more complete data
              name: fullEvent.name || prevData.name,
              location: fullEvent.location || prevData.location,
              points: fullPointsValue
            }));
          }
        })
        .catch(err => {
          console.error("Error fetching complete event:", err);
          // Continue with what we have
        });
    }
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
    // Local validation for past dates
    const now = new Date();
    const startDate = new Date(eventData.startTime);
    const endDate = new Date(eventData.endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error('Please provide valid start and end times');
      return;
    }

    if (startDate < now) {
      toast.error('Start time cannot be in the past');
      return;
    }

    if (endDate < now) {
      toast.error('End time cannot be in the past');
      return;
    }

    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    // Format data for API
    const formattedData = {
      ...eventData,
      capacity: eventData.capacity && String(eventData.capacity).trim() !== '' ? parseInt(eventData.capacity) : null,
      points: eventData.points ? parseInt(eventData.points) : 0,
    };
    
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
    
    createEvent(submitData, {
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
    let formattedData = {
      ...eventData,
      capacity: eventData.capacity && String(eventData.capacity).trim() !== '' ? parseInt(eventData.capacity) : null,
    };
    
    // Only managers can update points and publication status
    if (isManager) {
      formattedData.points = eventData.points ? parseInt(eventData.points) : 0;
      
      // Only include published status if it was changed and user is a manager
      if (eventData.published && !selectedEvent.published) {
        formattedData.published = true;
      }
    } else {
      // Ensure restricted fields are removed to prevent backend rejection
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
      { id: selectedEvent.id, data: submitData },
      {
        onSuccess: (responseData) => {
          // Update local preview state if background was updated
          if (backgroundFile && responseData && responseData.backgroundUrl) {
            // Clear the background preview since we now have the real URL
            setBackgroundPreview(null);
          }
          
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
        // Close the modal and clear selection
        setRsvpModalOpen(false);
        
        // Navigate to event detail with the fromRsvp flag
        navigate(`/events/${selectedEvent.id}`, { state: { fromRsvp: true } });
        
        // Clear the selected event after navigation
        setSelectedEvent(null);
        
        // Trigger a refetch to update the UI state
        setTimeout(() => {
          // Force a refetch to get latest data from server
          refetch();
        }, 100);
      },
    });
  };
  
  // Cancel RSVP
  const handleCancelRsvp = () => {
    if (!selectedEvent) return;
    
    cancelRsvp(selectedEvent.id, {
      onSuccess: () => {
        // Close the modal and clear selection
        setRsvpModalOpen(false);
        setSelectedEvent(null);
        
        // Manually trigger a refetch to update the UI state
        setTimeout(() => {
          // Find the event in the list and update its status
          const eventIndex = events.findIndex(e => e.id === selectedEvent.id);
          if (eventIndex !== -1) {
            const updatedEvents = [...events];
            updatedEvents[eventIndex] = {
              ...updatedEvents[eventIndex],
              isAttending: false
            };
          }
          // Force a refetch to get latest data from server
          refetch();
        }, 100);
      },
      onError: (error) => {
        // onError logic for UI updates, but no toast.error here
        // Close the modal
        setRsvpModalOpen(false);
      }
    });
  };
  
  // Check if user is RSVP'd to event
  const isRsvpd = (event) => {
    return event && event.isAttending || false;
  };
  
  // Function to navigate to event detail
  const navigateToEventDetail = (eventId) => {
    // Save current filters before navigating
    sessionStorage.setItem('events-filters', JSON.stringify(filters));
    navigate(`/events/${eventId}`);
  };
  
  return (
    <div>
      <EventFilters 
        isManager={isManager}
        filters={filters}
        onFilterChange={handleFilterChange}
        onCreateClick={() => setCreateModalOpen(true)}
      />
      
      <EventList
        isLoading={isLoading}
        events={events}
        isManager={isManager}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCount={totalCount}
        totalPages={totalPages}
        filters={filters}
        onFilterChange={handleFilterChange}
        formatCompactDate={formatCompactDate}
        formatTime={formatTime}
        getEventCardDate={getEventCardDate}
        getEventStatus={getEventStatus}
        isRsvpd={(event) => !!event.isAttending}
        navigateToEventDetail={navigateToEventDetail}
        handleEditEvent={handleEditEvent}
        handleDeleteEventClick={handleDeleteEventClick}
        handleRsvpClick={handleRsvpClick}
        activeRole={activeRole}
      />
      
      {/* Modals */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetForm();
        }}
        eventData={eventData}
        handleFormChange={handleFormChange}
        handleCreateEvent={handleCreateEvent}
        isCreating={isCreating}
        isManager={isManager}
        backgroundFile={backgroundFile}
        setBackgroundFile={setBackgroundFile}
        backgroundPreview={backgroundPreview}
        setBackgroundPreview={setBackgroundPreview}
      />
      
      <EditEventModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          resetForm();
        }}
        eventData={eventData}
        selectedEvent={selectedEvent}
        handleFormChange={handleFormChange}
        handleUpdateEvent={handleUpdateEvent}
        isUpdating={isUpdating}
        isManager={isManager}
        isDisabled={selectedEvent && isEventEnded(selectedEvent.endTime)}
        backgroundFile={backgroundFile}
        setBackgroundFile={setBackgroundFile}
        backgroundPreview={backgroundPreview}
        setBackgroundPreview={setBackgroundPreview}
      />
      
      <DeleteEventModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedEvent(null);
        }}
        selectedEvent={selectedEvent}
        handleDeleteEvent={handleDeleteEvent}
        isDeleting={isDeleting}
      />
      
      <RsvpEventModal
        isOpen={rsvpModalOpen}
        onClose={() => {
          setRsvpModalOpen(false);
          setSelectedEvent(null);
        }}
        selectedEvent={selectedEvent}
        isRsvpd={(event) => !!(event && event.isAttending)}
        handleRsvp={handleRsvp}
        handleCancelRsvp={handleCancelRsvp}
        isRsvping={isRsvping}
        isCancellingRsvp={isCancellingRsvp}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    </div>
  );
};

export default Events; 
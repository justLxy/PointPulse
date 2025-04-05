import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import EventService from '../services/event.service';
import { useAuth } from '../contexts/AuthContext';

export const useEvents = (params = {}) => {
  const queryClient = useQueryClient();
  const { activeRole } = useAuth();
  
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  // Convert any 'upcoming' parameter to the correct API parameters
  const apiParams = { ...params };
  
  // If the outdated 'upcoming' parameter is used, convert it to the correct parameters
  if ('upcoming' in apiParams) {
    if (apiParams.upcoming === true) {
      apiParams.ended = false;
      // Don't set 'started' parameter to allow both upcoming and ongoing events
    }
    delete apiParams.upcoming;
  }
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['events', apiParams],
    queryFn: () => EventService.getEvents(apiParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const useGetEvent = (id) => {
    const { activeRole, user } = useAuth();
  
    const isElevated = ['manager', 'superuser'].includes(activeRole);
  
    return useQuery({
      queryKey: ['event', id],
      queryFn: async () => {
        try {
         
          const result = await EventService.getEvent(id, {
            includeAsOrganizer: isElevated, 
          });
          return result;
        } catch (error) {
         
          if (
            error?.response?.status === 403 ||
            error?.response?.status === 404
          ) {
            return await EventService.getEvent(id); 
          } else {
            throw error;
          }
        }
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  };
  
  
  
  // RSVP mutations for all users
  const rsvpToEventMutation = useMutation({
    mutationFn: (eventId) => EventService.rsvpToEvent(eventId),
    onSuccess: (_, eventId) => {
      toast.success('Successfully RSVP\'d to event');
      // Invalidate both the specific event and the events list
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to RSVP to event');
    },
  });
  
  const cancelRsvpMutation = useMutation({
    mutationFn: (eventId) => EventService.cancelRsvp(eventId),
    onSuccess: (_, eventId) => {
      toast.success('Successfully cancelled RSVP');
      // Invalidate both the specific event and the events list
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel RSVP');
    },
  });
  
  // Mutations for managers/organizers
  const createEventMutation = useMutation({
    mutationFn: EventService.createEvent,
    onSuccess: () => {
      toast.success('Event created successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });
  
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }) => EventService.updateEvent(id, data),
    onSuccess: (_, variables) => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });
  
  const deleteEventMutation = useMutation({
    mutationFn: (id) => EventService.deleteEvent(id),
    onSuccess: (_, id) => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.removeQueries({ queryKey: ['event', id] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });
  
  const addOrganizerMutation = useMutation({
    mutationFn: ({ eventId, utorid }) => EventService.addOrganizer(eventId, utorid),
    onSuccess: (_, variables) => {
      toast.success('Organizer added successfully');
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add organizer');
    },
  });
  
  const removeOrganizerMutation = useMutation({
    mutationFn: ({ eventId, userId }) => EventService.removeOrganizer(eventId, userId),
    onSuccess: (_, variables) => {
      toast.success('Organizer removed successfully');
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove organizer');
    },
  });
  
  const addGuestMutation = useMutation({
    mutationFn: ({ eventId, utorid }) => EventService.addGuest(eventId, utorid),
    onSuccess: (_, variables) => {
      toast.success('Guest added successfully');
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add guest');
    },
  });
  
  const removeGuestMutation = useMutation({
    mutationFn: ({ eventId, userId }) => EventService.removeGuest(eventId, userId),
    onSuccess: (_, variables) => {
      toast.success('Guest removed successfully');
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove guest');
    },
  });
  
  const awardPointsMutation = useMutation({
    mutationFn: ({ eventId, userId, points }) => EventService.awardPoints(eventId, userId, points),
    onSuccess: (_, variables) => {
      toast.success('Points awarded successfully');
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to award points');
    },
  });
  
 
  const baseReturn = {
    events: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    getEvent: useGetEvent,
    // Available to all users
    rsvpToEvent: rsvpToEventMutation.mutate,
    isRsvping: rsvpToEventMutation.isPending,
    cancelRsvp: cancelRsvpMutation.mutate,
    isCancellingRsvp: cancelRsvpMutation.isPending,
 
    updateEvent: updateEventMutation.mutate,
    isUpdating: updateEventMutation.isPending,
  };
  
 
  if (isManager) {
    return {
      ...baseReturn,
      createEvent: createEventMutation.mutate,
      isCreating: createEventMutation.isPending,
      deleteEvent: deleteEventMutation.mutate,
      isDeleting: deleteEventMutation.isPending,
      addOrganizer: addOrganizerMutation.mutate,
      isAddingOrganizer: addOrganizerMutation.isPending,
      removeOrganizer: removeOrganizerMutation.mutate,
      isRemovingOrganizer: removeOrganizerMutation.isPending,
      addGuest: addGuestMutation.mutate,
      isAddingGuest: addGuestMutation.isPending,
      removeGuest: removeGuestMutation.mutate,
      isRemovingGuest: removeGuestMutation.isPending,
      awardPoints: awardPointsMutation.mutate,
      isAwardingPoints: awardPointsMutation.isPending,
    };
  }
  

  return {
    ...baseReturn,
    addGuest: addGuestMutation.mutate,
    isAddingGuest: addGuestMutation.isPending,
    removeGuest: removeGuestMutation.mutate,
    isRemovingGuest: removeGuestMutation.isPending,
    awardPoints: awardPointsMutation.mutate,
    isAwardingPoints: awardPointsMutation.isPending,
  };
};

export default useEvents;
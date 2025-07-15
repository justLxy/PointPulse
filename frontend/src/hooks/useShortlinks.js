import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import ShortlinkService from '../services/shortlink.service';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for managing shortlinks
 * @param {Object} params - Query parameters for filtering
 * @returns {Object} Shortlinks data and mutation functions
 */
export const useShortlinks = (params = {}) => {
  const queryClient = useQueryClient();
  const { activeRole } = useAuth();

  const isManager = ['manager', 'superuser'].includes(activeRole);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shortlinks', params],
    queryFn: () => ShortlinkService.getShortlinks(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: isManager || activeRole === 'regular', // Only fetch if user has permission
  });

  const createShortlinkMutation = useMutation({
    mutationFn: (shortlinkData) => ShortlinkService.createShortlink(shortlinkData),
    onSuccess: (data) => {
      toast.success('Shortlink created successfully');
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
      queryClient.invalidateQueries({ queryKey: ['eventShortlinks'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create shortlink');
    },
  });

  const updateShortlinkMutation = useMutation({
    mutationFn: ({ id, updateData }) => ShortlinkService.updateShortlink(id, updateData),
    onSuccess: (data) => {
      toast.success('Shortlink updated successfully');
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
      queryClient.invalidateQueries({ queryKey: ['shortlink', data.id] });
      queryClient.invalidateQueries({ queryKey: ['eventShortlinks'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update shortlink');
    },
  });

  const deleteShortlinkMutation = useMutation({
    mutationFn: (id) => ShortlinkService.deleteShortlink(id),
    onSuccess: () => {
      toast.success('Shortlink deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
      queryClient.invalidateQueries({ queryKey: ['eventShortlinks'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete shortlink');
    },
  });

  return {
    shortlinks: data?.shortlinks || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch,
    createShortlink: createShortlinkMutation.mutateAsync,
    updateShortlink: updateShortlinkMutation.mutateAsync,
    deleteShortlink: deleteShortlinkMutation.mutateAsync,
    isCreating: createShortlinkMutation.isPending,
    isUpdating: updateShortlinkMutation.isPending,
    isDeleting: deleteShortlinkMutation.isPending,
  };
};

/**
 * Hook for getting a single shortlink
 * @param {number} id - The shortlink ID
 * @returns {Object} Shortlink data
 */
export const useShortlink = (id) => {
  const {
    data: shortlink,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['shortlink', id],
    queryFn: () => ShortlinkService.getShortlink(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    shortlink,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for managing event shortlinks
 * @param {number} eventId - The event ID
 * @returns {Object} Event shortlinks data and mutation functions
 */
export const useEventShortlinks = (eventId) => {
  const queryClient = useQueryClient();

  const {
    data: shortlinks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['eventShortlinks', eventId],
    queryFn: () => ShortlinkService.getEventShortlinks(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const createEventShortlinkMutation = useMutation({
    mutationFn: (shortlinkData) => ShortlinkService.createShortlink({
      ...shortlinkData,
      eventId: eventId,
    }),
    onSuccess: (data) => {
      toast.success('Event shortlink created successfully');
      queryClient.invalidateQueries({ queryKey: ['eventShortlinks', eventId] });
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create event shortlink');
    },
  });

  const updateEventShortlinkMutation = useMutation({
    mutationFn: ({ id, updateData }) => ShortlinkService.updateShortlink(id, updateData),
    onSuccess: (data) => {
      toast.success('Event shortlink updated successfully');
      queryClient.invalidateQueries({ queryKey: ['eventShortlinks', eventId] });
      queryClient.invalidateQueries({ queryKey: ['shortlink', data.id] });
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update event shortlink');
    },
  });

  const deleteEventShortlinkMutation = useMutation({
    mutationFn: (id) => ShortlinkService.deleteShortlink(id),
    onSuccess: () => {
      toast.success('Event shortlink deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['eventShortlinks', eventId] });
      queryClient.invalidateQueries({ queryKey: ['shortlinks'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event shortlink');
    },
  });

  return {
    shortlinks: shortlinks || [],
    isLoading,
    error,
    refetch,
    createEventShortlink: createEventShortlinkMutation.mutateAsync,
    updateEventShortlink: updateEventShortlinkMutation.mutateAsync,
    deleteEventShortlink: deleteEventShortlinkMutation.mutateAsync,
    isCreating: createEventShortlinkMutation.isPending,
    isUpdating: updateEventShortlinkMutation.isPending,
    isDeleting: deleteEventShortlinkMutation.isPending,
  };
};

export default useShortlinks; 
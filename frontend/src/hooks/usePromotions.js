import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import PromotionService from '../services/promotion.service';
import { useAuth } from '../contexts/AuthContext';

export const usePromotions = (params = {}) => {
  const queryClient = useQueryClient();
  const { activeRole } = useAuth();
  
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['promotions', params],
    queryFn: () => PromotionService.getPromotions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const useGetPromotion = (id) => {
    return useQuery({
      queryKey: ['promotion', id],
      queryFn: () => PromotionService.getPromotion(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
  
  // Mutations for managers only
  const createPromotionMutation = useMutation({
    mutationFn: PromotionService.createPromotion,
    onSuccess: () => {
      toast.success('Promotion created successfully');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create promotion');
    },
  });
  
  const updatePromotionMutation = useMutation({
    mutationFn: ({ id, data }) => PromotionService.updatePromotion(id, data),
    onSuccess: (_, variables) => {
      toast.success('Promotion updated successfully');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({ queryKey: ['promotion', variables.id] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update promotion');
    },
  });
  
  const deletePromotionMutation = useMutation({
    mutationFn: (id) => PromotionService.deletePromotion(id),
    onSuccess: (_, id) => {
      toast.success('Promotion deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.removeQueries({ queryKey: ['promotion', id] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete promotion');
    },
  });
  
  return {
    promotions: data?.results || [],
    totalCount: data?.count || 0,
    isLoading,
    error,
    refetch,
    getPromotion: useGetPromotion,
    // Only expose these functions to managers
    ...(isManager ? {
      createPromotion: createPromotionMutation.mutate,
      isCreating: createPromotionMutation.isPending,
      updatePromotion: updatePromotionMutation.mutate,
      isUpdating: updatePromotionMutation.isPending,
      deletePromotion: deletePromotionMutation.mutate,
      isDeleting: deletePromotionMutation.isPending,
    } : {}),
  };
};

export default usePromotions; 
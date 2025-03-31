import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { usePromotions } from '../../hooks/usePromotions';
import { useAuth } from '../../contexts/AuthContext';
import PromotionService from '../../services/promotion.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import theme from '../../styles/theme';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaPercent, FaTags, FaCoins, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PromotionFilters from '../../components/promotions/PromotionFilters';
import PromotionList from '../../components/promotions/PromotionList';
import {
  CreatePromotionModal,
  EditPromotionModal,
  DeletePromotionModal
} from '../../components/promotions/PromotionModals';

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
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

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
`;

const Promotions = () => {
  const { activeRole } = useAuth();
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    page: 1,
    limit: 9,
    // For regular users, we want to show only active promotions they haven't used
    // Active means started=true and ended=false
    ...(!isManager ? {
      started: true,
      ended: false
    } : {
      started: null,
      ended: null
    })
  });
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [editingPromotionId, setEditingPromotionId] = useState(null);
  
  // Form state
  const [promotionData, setPromotionData] = useState({
    name: '',
    description: '',
    type: 'automatic',
    minSpending: '',
    rate: '',
    points: '',
    startDate: '',
    endDate: '',
  });
  
  // Get promotions with current filters
  const { 
    promotions, 
    totalCount, 
    isLoading, 
    getPromotion,
    createPromotion, 
    updatePromotion, 
    deletePromotion, 
    isCreating, 
    isUpdating, 
    isDeleting 
  } = usePromotions(filters);
  
  // Calculate pagination
  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(startIndex + filters.limit - 1, totalCount);
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    // Handle special case for started and ended filters
    // Backend returns 400 if both are specified
    if (key === 'started' && value === true) {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        // When setting started=true, ensure ended=null or ended=false
        ...(prev.ended === true ? { ended: null } : {}),
        ...(key !== 'page' ? { page: 1 } : {}),
      }));
    } else if (key === 'ended' && value === true) {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        // When setting ended=true, ensure started=null
        started: null,
        ...(key !== 'page' ? { page: 1 } : {}),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        ...(key !== 'page' ? { page: 1 } : {}),
      }));
    }
  };
  
  // Format date for datetime-local input
  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return '';
    }
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-CA', { // YYYY-MM-DD format
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };
  
  // Handle form changes
  const handleFormChange = (key, value) => {
    setPromotionData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  // Reset form
  const resetForm = () => {
    setPromotionData({
      name: '',
      description: '',
      type: 'automatic',
      minSpending: '',
      rate: '',
      points: '',
      startDate: '',
      endDate: '',
    });
    setSelectedPromotion(null);
  };
  
  // Set up promotion for editing
  const handleEditPromotion = async (promotion) => {
    console.log("Original promotion data:", promotion);
    setSelectedPromotion(promotion);
    setEditingPromotionId(promotion.id);
    
    // First populate with available data
    setPromotionData({
      name: promotion.name || '',
      description: promotion.description || '',
      type: promotion.type || 'automatic',
      minSpending: promotion.minSpending === null ? '' : promotion.minSpending,
      rate: promotion.rate === null ? '' : promotion.rate,
      points: promotion.points === null ? '' : promotion.points,
      startDate: promotion.startTime ? formatDateTimeLocal(promotion.startTime) : '',
      endDate: promotion.endTime ? formatDateTimeLocal(promotion.endTime) : '',
    });
    
    // Open modal right away with available data
    setEditModalOpen(true);
    
    try {
      // Use the promotion service directly to fetch the complete data
      const completeData = await PromotionService.getPromotion(promotion.id);
      console.log("Fetched complete promotion data:", completeData);
      
      if (completeData) {
        // Update with complete data after modal is already open
        setPromotionData(prevData => ({
          ...prevData,
          description: completeData.description || '',
          startDate: completeData.startTime ? formatDateTimeLocal(completeData.startTime) : prevData.startDate,
          endDate: completeData.endTime ? formatDateTimeLocal(completeData.endTime) : prevData.endDate,
        }));
      }
    } catch (error) {
      console.error("Error fetching complete promotion data:", error);
    }
  };
  
  // Reset editing state when modal closes
  useEffect(() => {
    if (!editModalOpen) {
      setEditingPromotionId(null);
    }
  }, [editModalOpen]);
  
  // Set up promotion for deletion
  const handleDeletePromotionClick = (promotion) => {
    setSelectedPromotion(promotion);
    setDeleteModalOpen(true);
  };
  
  // Create promotion
  const handleCreatePromotion = () => {
    const formattedData = {
      ...promotionData,
      minSpending: promotionData.minSpending ? parseFloat(promotionData.minSpending) : null,
      rate: promotionData.rate ? parseFloat(promotionData.rate) : null,
      points: promotionData.points ? parseInt(promotionData.points) : null,
      startTime: promotionData.startDate ? new Date(promotionData.startDate).toISOString() : null,
      endTime: promotionData.endDate ? new Date(promotionData.endDate).toISOString() : null,
    };
    
    // 移除空的日期字段
    if (!formattedData.startTime) delete formattedData.startTime;
    if (!formattedData.endTime) delete formattedData.endTime;
    
    createPromotion(formattedData, {
      onSuccess: () => {
        setCreateModalOpen(false);
        resetForm();
      },
    });
  };
  
  // Update promotion
  const handleUpdatePromotion = () => {
    if (!selectedPromotion) return;
    
    const formattedData = {
      ...promotionData,
      minSpending: promotionData.minSpending ? parseFloat(promotionData.minSpending) : null,
      rate: promotionData.rate ? parseFloat(promotionData.rate) : null,
      points: promotionData.points ? parseInt(promotionData.points) : null,
      startTime: promotionData.startDate ? new Date(promotionData.startDate).toISOString() : null,
      endTime: promotionData.endDate ? new Date(promotionData.endDate).toISOString() : null,
    };
    
    // 移除空的日期字段
    if (!formattedData.startTime) delete formattedData.startTime;
    if (!formattedData.endTime) delete formattedData.endTime;
    
    updatePromotion(
      { id: selectedPromotion.id, data: formattedData },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          resetForm();
        },
      }
    );
  };
  
  // Delete promotion
  const handleDeletePromotion = () => {
    if (!selectedPromotion) return;
    
    deletePromotion(selectedPromotion.id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedPromotion(null);
      },
    });
  };

  return (
    <div>
      <PageTitle>Promotions</PageTitle>
      
      <PromotionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isManager={isManager}
        onCreateClick={() => setCreateModalOpen(true)}
      />
      
      {isLoading ? (
        <LoadingSpinner text="Loading promotions..." />
      ) : promotions && promotions.length > 0 ? (
        <>
          <PromotionList
            promotions={promotions}
            isManager={isManager}
            onEdit={handleEditPromotion}
            onDelete={handleDeletePromotionClick}
            formatDate={formatDate}
          />
          
          <PageControls>
            <PageInfo>
              Showing {startIndex} to {endIndex} of {totalCount} promotions
            </PageInfo>
            
            <Pagination>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleFilterChange('page', filters.page - 1)}
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              
              <PageInfo>
                Page {filters.page} of {totalPages || 1}
              </PageInfo>
              
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page >= totalPages}
              >
                Next
              </Button>
            </Pagination>
          </PageControls>
        </>
      ) : (
        <EmptyState>
          <p>No promotions found.</p>
          {Object.values(filters).some(v => v && v !== filters.page && v !== filters.limit) ? (
            <p>Try adjusting your filters.</p>
          ) : (
            isManager && <Button onClick={() => setCreateModalOpen(true)}>Create First Promotion</Button>
          )}
        </EmptyState>
      )}
      
      {/* Modals */}
      <CreatePromotionModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetForm();
        }}
        promotionData={promotionData}
        onChange={handleFormChange}
        onSubmit={handleCreatePromotion}
        isLoading={isCreating}
      />
      
      <EditPromotionModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          resetForm();
        }}
        selectedPromotion={selectedPromotion}
        promotionData={promotionData}
        onChange={handleFormChange}
        onSubmit={handleUpdatePromotion}
        isLoading={isUpdating}
      />
      
      <DeletePromotionModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedPromotion(null);
        }}
        selectedPromotion={selectedPromotion}
        onDelete={handleDeletePromotion}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Promotions; 
// pages/promotions/Promotions.jsx
import React, { useState } from 'react';
import { usePromotions } from '../../hooks/usePromotions';
import { useAuth } from '../../contexts/AuthContext';
import { CreatePromotionModal, EditPromotionModal, DeletePromotionModal } from '../../components/Promotions/PromotionModals';
import PromotionFilters from '../../components/Promotions/PromotionFilters';
import PromotionList from '../../components/Promotions/PromotionList';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Promotions = () => {
  const { activeRole } = useAuth();
  const isManager = ['manager', 'superuser'].includes(activeRole);

  const [filters, setFilters] = useState({
    name: '',
    type: '',
    page: 1,
    limit: 9,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

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

  const {
    promotions,
    totalCount,
    isLoading,
    createPromotion,
    updatePromotion,
    deletePromotion,
    isCreating,
    isUpdating,
    isDeleting,
  } = usePromotions(filters);

  const totalPages = Math.ceil(totalCount / filters.limit);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  const handleFormChange = (key, value) => {
    setPromotionData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

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

  const handleEditPromotion = (promo) => {
    setSelectedPromotion(promo);
    setPromotionData({
      name: promo.name,
      description: promo.description,
      type: promo.type,
      minSpending: promo.minSpending || '',
      rate: promo.rate || '',
      points: promo.points || '',
      startDate: promo.startTime?.split('T')[0] || '',
      endDate: promo.endTime?.split('T')[0] || '',
    });
    setEditModalOpen(true);
  };

  const handleDeletePromotionClick = (promo) => {
    setSelectedPromotion(promo);
    setDeleteModalOpen(true);
  };

  const handleCreatePromotion = () => {
    const data = {
      name: promotionData.name,
      description: promotionData.description,
      type: promotionData.type,
      minSpending: promotionData.minSpending ? parseFloat(promotionData.minSpending) : null,
      rate: promotionData.rate ? parseFloat(promotionData.rate) : null,
      points: promotionData.points ? parseInt(promotionData.points) : null,
      startTime: promotionData.startDate ? new Date(promotionData.startDate) : null,
      endTime: promotionData.endDate ? new Date(promotionData.endDate) : null,
    };
    createPromotion(data, {
      onSuccess: () => {
        setCreateModalOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdatePromotion = () => {
    if (!selectedPromotion) return;
    const data = {
      name: promotionData.name,
      description: promotionData.description,
      type: promotionData.type,
      minSpending: promotionData.minSpending ? parseFloat(promotionData.minSpending) : null,
      rate: promotionData.rate ? parseFloat(promotionData.rate) : null,
      points: promotionData.points ? parseInt(promotionData.points) : null,
      startTime: promotionData.startDate ? new Date(promotionData.startDate) : null,
      endTime: promotionData.endDate ? new Date(promotionData.endDate) : null,
    };
    updatePromotion({ id: selectedPromotion.id, data }, {
      onSuccess: () => {
        setEditModalOpen(false);
        resetForm();
      },
    });
  };

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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Promotions</h1>

      <PromotionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isManager={isManager}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      {isLoading ? (
        <LoadingSpinner text="Loading promotions..." />
      ) : (
        <>
          {promotions.length > 0 ? (
            <PromotionList
              promotions={promotions}
              isManager={isManager}
              onEdit={handleEditPromotion}
              onDelete={handleDeletePromotionClick}
              formatDate={formatDate}
            />
          ) : (
            <p className="text-center text-gray-500">No promotions found.</p>
          )}

          {/* Pagination (可选) */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="text-sm underline disabled:text-gray-300"
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {filters.page} of {totalPages}</span>
              <button
                className="text-sm underline disabled:text-gray-300"
                onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                disabled={filters.page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
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
        promotionData={promotionData}
        selectedPromotion={selectedPromotion}
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

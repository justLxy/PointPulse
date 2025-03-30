import { useState } from 'react';
import styled from '@emotion/styled';
import { usePromotions } from '../../hooks/usePromotions';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import theme from '../../styles/theme';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaPercent, FaTags, FaCoins, FaFilter } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

const PromotionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.md};
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PromotionCard = styled(Card)`
  height: 100%;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const PromotionHeader = styled(Card.Header)`
  background-color: ${({ type }) => 
    type === 'automatic' 
      ? theme.colors.accent.light 
      : theme.colors.primary.light};
  color: ${({ type }) => 
    type === 'automatic' 
      ? theme.colors.accent.dark 
      : theme.colors.primary.dark};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
`;

const PromotionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.radius.full};
  background-color: ${({ type }) => 
    type === 'automatic' 
      ? theme.colors.accent.main
      : theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
`;

const PromotionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: ${theme.spacing.xs};
`;

const PromotionDescription = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PromotionDetails = styled.div`
  margin-top: ${theme.spacing.sm};
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const PromotionDetail = styled.div`
  display: flex;
  align-items: center;
  font-size: ${theme.typography.fontSize.sm};
  
  svg {
    margin-right: ${theme.spacing.xs};
    color: ${theme.colors.text.secondary};
    font-size: 14px;
  }
`;

const PromotionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
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

const Promotions = () => {
  const { activeRole } = useAuth();
  const isManager = ['manager', 'superuser'].includes(activeRole);
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    page: 1,
    limit: 9,
    ...(isManager ? {
      // 管理员可以使用的额外过滤条件，但默认不设置
      started: null,
      ended: null
    } : {})
  });
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  
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
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset page when filters change
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    
    try {
      // 直接处理ISO格式的日期字符串
      const date = new Date(dateStr);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateStr);
        return 'Invalid Date';
      }
      
      // 使用UTC时区确保日期显示正确
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // 关键是使用UTC时区
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date Error';
    }
  };
  
  // Handle create/edit form changes
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
  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    
    setPromotionData({
      name: promotion.name || '',
      description: promotion.description || '',
      type: promotion.type || 'automatic',
      minSpending: promotion.minSpending || '',
      rate: promotion.rate || '',
      points: promotion.points || '',
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
    });
    
    setEditModalOpen(true);
  };
  
  // Set up promotion for deletion
  const handleDeletePromotionClick = (promotion) => {
    setSelectedPromotion(promotion);
    setDeleteModalOpen(true);
  };
  
  // Create promotion
  const handleCreatePromotion = () => {
    // Format data for API
    const formattedData = {
      ...promotionData,
      minSpending: promotionData.minSpending ? parseFloat(promotionData.minSpending) : null,
      rate: promotionData.rate ? parseFloat(promotionData.rate) : null,
      points: promotionData.points ? parseInt(promotionData.points) : null,
    };
    
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
    
    // Format data for API
    const formattedData = {
      ...promotionData,
      minSpending: promotionData.minSpending ? parseFloat(promotionData.minSpending) : null,
      rate: promotionData.rate ? parseFloat(promotionData.rate) : null,
      points: promotionData.points ? parseInt(promotionData.points) : null,
    };
    
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
      
      <FilterSection>
        <FilterInput>
          <Input
            placeholder="Search by name"
            value={filters.name || ''}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            leftIcon={<FaFilter />}
          />
        </FilterInput>
        
        <FilterInput>
          <Select
            placeholder="Type"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="automatic">Automatic</option>
            <option value="one-time">One-time</option>
          </Select>
        </FilterInput>

        {isManager && (
          <>
            <FilterInput>
              <Select
                placeholder="Status"
                value={filters.status || ''}
                onChange={(e) => {
                  const status = e.target.value;
                  // 根据UI友好的状态选项设置API参数
                  let newFilters = {};
                  
                  // 清除之前可能设置的状态相关过滤条件
                  const updatedFilters = { ...filters };
                  delete updatedFilters.started;
                  delete updatedFilters.ended;
                  delete updatedFilters.status;
                  
                  if (status === 'active') {
                    // 活跃促销：已开始但未结束
                    newFilters = { started: true, ended: false };
                  } else if (status === 'upcoming') {
                    // 即将到来的促销：尚未开始
                    newFilters = { started: false };
                  } else if (status === 'expired') {
                    // 已过期促销：已结束
                    newFilters = { ended: true };
                  }
                  
                  // 应用新过滤条件和状态
                  setFilters({
                    ...updatedFilters,
                    ...newFilters,
                    status,
                    page: 1, // 重置页码
                  });
                }}
              >
                <option value="">Any Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </Select>
            </FilterInput>
          </>
        )}
        
        {isManager && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <FaPlus /> Create Promotion
          </Button>
        )}
      </FilterSection>
      
      {isLoading ? (
        <LoadingSpinner text="Loading promotions..." />
      ) : promotions && promotions.length > 0 ? (
        <PromotionsGrid>
          {promotions.map((promotion) => (
            <PromotionCard key={promotion.id}>
              <PromotionHeader type={promotion.type}>
                <Card.Title>{promotion.type === 'automatic' ? 'Automatic' : 'One-time'}</Card.Title>
                <PromotionIcon type={promotion.type}>
                  {promotion.type === 'automatic' ? <FaPercent /> : <FaCoins />}
                </PromotionIcon>
              </PromotionHeader>
              
              <Card.Body style={{ padding: `${theme.spacing.md} ${theme.spacing.md}` }}>
                <PromotionTitle>{promotion.name}</PromotionTitle>
                <PromotionDescription>{promotion.description}</PromotionDescription>
                
                <PromotionDetails>
                  {promotion.minSpending !== null && (
                    <PromotionDetail>
                      <FaTags />
                      Min. Spending: ${promotion.minSpending.toFixed(2)}
                    </PromotionDetail>
                  )}
                  
                  {promotion.rate !== null && (
                    <PromotionDetail>
                      <FaPercent />
                      Rate: {promotion.rate}x points
                    </PromotionDetail>
                  )}
                  
                  {promotion.points !== null && (
                    <PromotionDetail>
                      <FaCoins />
                      Points: {promotion.points}
                    </PromotionDetail>
                  )}
                  
                  {promotion.startDate && (
                    <PromotionDetail>
                      <FaCalendarAlt />
                      Valid from: {formatDate(promotion.startDate)} 
                      {promotion.endDate ? ` to ${formatDate(promotion.endDate)}` : ' (no end date)'}
                    </PromotionDetail>
                  )}
                </PromotionDetails>
                
                {isManager && (
                  <PromotionActions>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleEditPromotion(promotion)}
                    >
                      <FaEdit />
                    </Button>
                    
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleDeletePromotionClick(promotion)}
                    >
                      <FaTrash />
                    </Button>
                  </PromotionActions>
                )}
              </Card.Body>
            </PromotionCard>
          ))}
        </PromotionsGrid>
      ) : (
        <EmptyState>No promotions found</EmptyState>
      )}
      
      {totalCount > 0 && (
        <PageControls>
          <PageInfo>
            Showing {startIndex} to {endIndex} of {totalCount} promotions
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
              Page {filters.page} of {totalPages}
            </PageInfo>
            
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page === totalPages}
            >
              Next
            </Button>
          </Pagination>
        </PageControls>
      )}
      
      {/* Create Promotion Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Promotion"
        size="medium"
      >
        <ModalContent>
          <ModalForm>
            <Input
              label="Name"
              value={promotionData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Enter promotion name"
              required
            />
            
            <Input
              label="Description"
              value={promotionData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Enter promotion description"
              multiline
              rows={3}
              required
            />
            
            <Select
              label="Type"
              value={promotionData.type}
              onChange={(e) => handleFormChange('type', e.target.value)}
              required
            >
              <option value="automatic">Automatic (applies automatically)</option>
              <option value="one-time">One-time (applied by cashier)</option>
            </Select>
            
            {promotionData.type === 'automatic' && (
              <>
                <Input
                  label="Minimum Spending ($)"
                  type="number"
                  value={promotionData.minSpending}
                  onChange={(e) => handleFormChange('minSpending', e.target.value)}
                  placeholder="Minimum amount to apply promotion (optional)"
                  helperText="Leave empty for no minimum"
                />
                
                <Input
                  label="Rate (multiplier)"
                  type="number"
                  step="0.1"
                  value={promotionData.rate}
                  onChange={(e) => handleFormChange('rate', e.target.value)}
                  placeholder="Points multiplier, e.g. 2 for double points"
                  helperText="Required for automatic promotions"
                  required={promotionData.type === 'automatic'}
                />
              </>
            )}
            
            {promotionData.type === 'one-time' && (
              <Input
                label="Points"
                type="number"
                value={promotionData.points}
                onChange={(e) => handleFormChange('points', e.target.value)}
                placeholder="Fixed points amount"
                helperText="Required for one-time promotions"
                required={promotionData.type === 'one-time'}
              />
            )}
            
            <Input
              label="Start Date"
              type="date"
              value={promotionData.startDate}
              onChange={(e) => handleFormChange('startDate', e.target.value)}
              helperText="When the promotion becomes active"
            />
            
            <Input
              label="End Date"
              type="date"
              value={promotionData.endDate}
              onChange={(e) => handleFormChange('endDate', e.target.value)}
              helperText="When the promotion expires (leave empty for no expiration)"
            />
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
              onClick={handleCreatePromotion}
              loading={isCreating}
            >
              Create Promotion
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* Edit Promotion Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          resetForm();
        }}
        title={`Edit Promotion: ${selectedPromotion?.name || ''}`}
        size="medium"
      >
        <ModalContent>
          <ModalForm>
            <Input
              label="Name"
              value={promotionData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Enter promotion name"
              required
            />
            
            <Input
              label="Description"
              value={promotionData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Enter promotion description"
              multiline
              rows={3}
              required
            />
            
            <Select
              label="Type"
              value={promotionData.type}
              onChange={(e) => handleFormChange('type', e.target.value)}
              required
            >
              <option value="automatic">Automatic (applies automatically)</option>
              <option value="one-time">One-time (applied by cashier)</option>
            </Select>
            
            {promotionData.type === 'automatic' && (
              <>
                <Input
                  label="Minimum Spending ($)"
                  type="number"
                  value={promotionData.minSpending}
                  onChange={(e) => handleFormChange('minSpending', e.target.value)}
                  placeholder="Minimum amount to apply promotion (optional)"
                  helperText="Leave empty for no minimum"
                />
                
                <Input
                  label="Rate (multiplier)"
                  type="number"
                  step="0.1"
                  value={promotionData.rate}
                  onChange={(e) => handleFormChange('rate', e.target.value)}
                  placeholder="Points multiplier, e.g. 2 for double points"
                  helperText="Required for automatic promotions"
                  required={promotionData.type === 'automatic'}
                />
              </>
            )}
            
            {promotionData.type === 'one-time' && (
              <Input
                label="Points"
                type="number"
                value={promotionData.points}
                onChange={(e) => handleFormChange('points', e.target.value)}
                placeholder="Fixed points amount"
                helperText="Required for one-time promotions"
                required={promotionData.type === 'one-time'}
              />
            )}
            
            <Input
              label="Start Date"
              type="date"
              value={promotionData.startDate}
              onChange={(e) => handleFormChange('startDate', e.target.value)}
              helperText="When the promotion becomes active"
            />
            
            <Input
              label="End Date"
              type="date"
              value={promotionData.endDate}
              onChange={(e) => handleFormChange('endDate', e.target.value)}
              helperText="When the promotion expires (leave empty for no expiration)"
            />
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
              onClick={handleUpdatePromotion}
              loading={isUpdating}
            >
              Update Promotion
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* Delete Promotion Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedPromotion(null);
        }}
        title="Delete Promotion"
        size="small"
      >
        <ModalContent>
          <p>Are you sure you want to delete this promotion?</p>
          <p><strong>{selectedPromotion?.name}</strong></p>
          <p>This action cannot be undone.</p>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedPromotion(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={handleDeletePromotion}
              loading={isDeleting}
            >
              Delete
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Promotions; 
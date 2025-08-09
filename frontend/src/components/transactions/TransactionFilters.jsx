import React from 'react';
import styled from '@emotion/styled';
import Input from '../common/Input';
import Select from '../common/Select';
import theme from '../../styles/theme';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
  }
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const PageActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const CreateButton = styled(Button)`
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.dark});
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  svg {
    margin-right: ${theme.spacing.xs};
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const FilterContainer = styled.div`
  background: white;
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const EnhancedInput = styled(Input)`
  border-radius: ${theme.radius.md};
  
  input {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.colors.border.light};
    transition: all 0.2s ease;
    
    &:focus {
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 2px ${theme.colors.primary.light};
    }
  }

  &.disabled-input {
    background-color: #f0f0f0;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const EnhancedSelect = styled(Select)`
  border-radius: ${theme.radius.md};
  
  select {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border: 1px solid ${theme.colors.border.light};
    transition: all 0.2s ease;
    
    &:focus {
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 2px ${theme.colors.primary.light};
    }
  }
`;

const TransactionFilters = ({ 
  filters, 
  handleFilterChange, 
  isSuperuser,
  isManager,
  isRelatedIdEditable,
  title = "Transactions"
}) => {
  return (
    <>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        {isManager && (
          <PageActions>
            <CreateButton as={Link} to="/transactions/adjustment">
              <FaPlus /> Create Adjustment
            </CreateButton>
          </PageActions>
        )}
      </PageHeader>
      
      <FilterContainer>
        <FilterGrid>
          {isManager && (
            <FilterGroup>
              <FilterLabel>User</FilterLabel>
              <EnhancedInput
                placeholder="Search by utorid or name"
                value={filters.name || ''}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                leftIcon={<FaSearch size={16} />}
              />
            </FilterGroup>
          )}
          
          {isManager && (
            <FilterGroup>
              <FilterLabel>Created By</FilterLabel>
              <EnhancedInput
                placeholder="Creator's username"
                value={filters.createdBy || ''}
                onChange={(e) => handleFilterChange('createdBy', e.target.value)}
              />
            </FilterGroup>
          )}
          
          <FilterGroup>
            <FilterLabel>Transaction Type</FilterLabel>
            <EnhancedSelect
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="redemption">Redemption</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjustment</option>
              <option value="event">Event</option>
            </EnhancedSelect>
          </FilterGroup>
          
          {/* {filters.type && ( */}
          <FilterGroup>
            <FilterLabel>Related ID</FilterLabel>
            <EnhancedInput
              placeholder="Related ID"
              value={isRelatedIdEditable ? filters.relatedId : ''}
              onChange={(e) => handleFilterChange('relatedId', e.target.value)}
              type="number"
              disabled={!isRelatedIdEditable}
              className={!isRelatedIdEditable ? "disabled-input" : ""}
            />
          </FilterGroup>

          {/* )} */}
          
          <FilterGroup>
            <FilterLabel>Promotion</FilterLabel>
            <EnhancedInput
              placeholder="Promotion ID"
              value={filters.promotionId || ''}
              onChange={(e) => handleFilterChange('promotionId', e.target.value)}
              type="number"
            />
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Amount Filter</FilterLabel>
            <EnhancedSelect
              value={filters.operator || 'gte'}
              onChange={(e) => handleFilterChange('operator', e.target.value)}
            >
              <option value="gte">Greater than or equal</option>
              <option value="lte">Less than or equal</option>
            </EnhancedSelect>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel>Points Amount</FilterLabel>
            <EnhancedInput
              placeholder="Amount"
              value={filters.amount || ''}
              onChange={(e) => handleFilterChange('amount', e.target.value)}
              type="number"
            />
          </FilterGroup>
          
          {isManager && (
            <FilterGroup>
              <FilterLabel>Transaction Status</FilterLabel>
              <EnhancedSelect
                value={filters.suspicious || ''}
                onChange={(e) => handleFilterChange('suspicious', e.target.value)}
              >
                <option value="">All Transactions</option>
                <option value="true">Suspicious Only</option>
                <option value="false">Normal Only</option>
              </EnhancedSelect>
            </FilterGroup>
          )}
        </FilterGrid>
      </FilterContainer>
    </>
  );
};

export default TransactionFilters;
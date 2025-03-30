import React from 'react';
import styled from '@emotion/styled';
import Input from '../common/Input';
import Select from '../common/Select';
import theme from '../../styles/theme';
import { FaSearch, FaFilter } from 'react-icons/fa';

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

const FilterContainer = styled.div`
  background: white;
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterInput = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const EnhancedInput = styled(Input)`
  border-radius: ${theme.radius.md};
  
  input {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
`;

const EnhancedSelect = styled(Select)`
  border-radius: ${theme.radius.md};
  
  select {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
`;

const TransactionFilters = ({ 
  filters, 
  handleFilterChange, 
  isSuperuser,
  title = "Transactions"
}) => {
  return (
    <>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
      </PageHeader>
      
      <FilterContainer>
        <FilterSection>
          {isSuperuser && (
            <FilterInput>
              <EnhancedInput
                placeholder="Search by ID or description"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                leftIcon={<FaSearch size={16} />}
              />
            </FilterInput>
          )}
          
          <FilterInput>
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
          </FilterInput>
          
          <FilterInput>
            <EnhancedSelect
              value={filters.operator || 'gte'}
              onChange={(e) => handleFilterChange('operator', e.target.value)}
            >
              <option value="gte">Greater than or equal</option>
              <option value="lte">Less than or equal</option>
            </EnhancedSelect>
          </FilterInput>
          
          <FilterInput>
            <EnhancedInput
              placeholder="Amount"
              value={filters.amount || ''}
              onChange={(e) => handleFilterChange('amount', e.target.value)}
              type="number"
            />
          </FilterInput>
          
          {isSuperuser && (
            <FilterInput>
              <EnhancedSelect
                value={filters.suspicious || ''}
                onChange={(e) => handleFilterChange('suspicious', e.target.value)}
              >
                <option value="">All Transactions</option>
                <option value="true">Suspicious Only</option>
                <option value="false">Normal Only</option>
              </EnhancedSelect>
            </FilterInput>
          )}
          
          {isSuperuser && (
            <FilterInput>
              <EnhancedSelect
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </EnhancedSelect>
            </FilterInput>
          )}
          
          <FilterInput>
            <EnhancedSelect
              value={filters.sortBy || 'createdAt:desc'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="createdAt:asc">Oldest First</option>
              <option value="amount:desc">Highest Amount</option>
              <option value="amount:asc">Lowest Amount</option>
            </EnhancedSelect>
          </FilterInput>
        </FilterSection>
      </FilterContainer>
    </>
  );
};

export default TransactionFilters; 
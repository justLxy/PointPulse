import React from 'react';
import styled from '@emotion/styled';
import Input from '../common/Input';
import Select from '../common/Select';
import theme from '../../styles/theme';
import { FaSearch, FaFilter } from 'react-icons/fa';

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
  background: white;
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 250px;
`;

const FilterInput = styled.div`
  width: 200px;
  
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
      <PageTitle>{title}</PageTitle>
      
      <FilterSection>
        <SearchInput>
          <EnhancedInput
            placeholder="Search by ID or description"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            leftIcon={<FaSearch size={16} />}
          />
        </SearchInput>
        
        <FilterInput>
          <EnhancedSelect
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            placeholder="Transaction Type"
            leftIcon={<FaFilter size={16} />}
          >
            <option value="">All Types</option>
            <option value="purchase">Purchases</option>
            <option value="redemption">Redemptions</option>
            <option value="transfer">Transfers</option>
            <option value="adjustment">Adjustments</option>
            <option value="event">Event Points</option>
          </EnhancedSelect>
        </FilterInput>
        
        {isSuperuser && (
          <FilterInput>
            <EnhancedSelect
              value={filters.suspicious}
              onChange={(e) => handleFilterChange('suspicious', e.target.value)}
              placeholder="Status"
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
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              placeholder="Approval Status"
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
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            placeholder="Sort By"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="amount:desc">Highest Amount</option>
            <option value="amount:asc">Lowest Amount</option>
          </EnhancedSelect>
        </FilterInput>
      </FilterSection>
    </>
  );
};

export default TransactionFilters; 
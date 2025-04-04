import React from 'react';
import styled from '@emotion/styled';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { FaPlus, FaSearch, FaUserPlus } from 'react-icons/fa';
import theme from '../../styles/theme';

const FilterContainer = styled.div`
  background: white;
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
`;

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
    margin-top: ${theme.spacing.md};
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

const UserFilters = ({ 
  isSuperuser, 
  isManager, 
  filters, 
  onFilterChange, 
  onCreateClick 
}) => {
  // Either superuser or manager can create users
  const canCreateUser = isSuperuser || isManager;
  
  return (
    <>
      <PageHeader>
        <PageTitle>User Management</PageTitle>
        {canCreateUser && (
          <CreateButton onClick={onCreateClick}>
            <FaUserPlus /> Create User
          </CreateButton>
        )}
      </PageHeader>
      
      <FilterContainer>
        <FilterSection>
          <FilterInput>
            <EnhancedInput
              placeholder="Search by name or utorid"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              leftIcon={<FaSearch size={16} />}
            />
          </FilterInput>
          
          <FilterInput>
            <EnhancedSelect
              value={filters.role}
              onChange={(e) => onFilterChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="superuser">Superuser</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              <option value="regular">Regular</option>
            </EnhancedSelect>
          </FilterInput>
          
          <FilterInput>
            <EnhancedSelect
              value={filters.verified}
              onChange={(e) => onFilterChange('verified', e.target.value)}
            >
              <option value="">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </EnhancedSelect>
          </FilterInput>
          
          <FilterInput>
            <EnhancedSelect
              value={filters.active}
              onChange={(e) => onFilterChange('active', e.target.value)}
            >
              <option value="">All Activity</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </EnhancedSelect>
          </FilterInput>
        </FilterSection>
      </FilterContainer>
    </>
  );
};

export default UserFilters; 
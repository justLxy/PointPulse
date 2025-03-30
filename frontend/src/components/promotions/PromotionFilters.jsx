import React from 'react';
import styled from '@emotion/styled';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { FaPlus, FaSearch } from 'react-icons/fa';
import theme from '../../styles/theme';

const FilterContainer = styled.div`
  background: white;
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.md};

  h2 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.text.primary};
    margin: 0;
  }
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

const PromotionFilters = ({ filters, onFilterChange, isManager, onCreateClick }) => {
  return (
    <FilterContainer>
      <FilterSection>
        <FilterInput>
          <EnhancedInput
            placeholder="Search by name"
            value={filters.name || ''}
            onChange={(e) => onFilterChange('name', e.target.value)}
            leftIcon={<FaSearch />}
          />
        </FilterInput>

        <FilterInput>
          <EnhancedSelect
            placeholder="Type"
            value={filters.type || ''}
            onChange={(e) => onFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="automatic">Automatic</option>
            <option value="one-time">One-time</option>
          </EnhancedSelect>
        </FilterInput>

        {isManager && (
          <CreateButton onClick={onCreateClick}>
            <FaPlus /> Create Promotion
          </CreateButton>
        )}
      </FilterSection>
    </FilterContainer>
  );
};

export default PromotionFilters;

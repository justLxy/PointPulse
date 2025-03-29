import React from 'react';
import styled from '@emotion/styled';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { FaFilter, FaPlus } from 'react-icons/fa';
import theme from '../../styles/theme';

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

const PromotionFilters = ({ filters, onFilterChange, isManager, onCreateClick }) => {
  return (
    <FilterSection>
      <FilterInput>
        <Input
          placeholder="Search by name"
          value={filters.name || ''}
          onChange={(e) => onFilterChange('name', e.target.value)}
          leftIcon={<FaFilter />}
        />
      </FilterInput>

      <FilterInput>
        <Select
          placeholder="Type"
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          <option value="automatic">Automatic</option>
          <option value="one-time">One-time</option>
        </Select>
      </FilterInput>

      {isManager && (
        <Button onClick={onCreateClick}>
          <FaPlus /> Create Promotion
        </Button>
      )}
    </FilterSection>
  );
};

export default PromotionFilters;

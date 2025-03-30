import React from 'react';
import styled from '@emotion/styled';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { FaPlus, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
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

const EventFilters = ({ 
  isManager, 
  filters, 
  onFilterChange, 
  onCreateClick 
}) => {
  return (
    <>
      <PageHeader>
        <PageTitle>Events</PageTitle>
        {isManager && (
          <CreateButton onClick={onCreateClick}>
            <FaPlus /> Create Event
          </CreateButton>
        )}
      </PageHeader>
      
      <FilterContainer>
        <FilterSection>
          <FilterInput>
            <EnhancedInput
              placeholder="Search by name"
              value={filters.name}
              onChange={(e) => onFilterChange('name', e.target.value)}
              leftIcon={<FaSearch size={16} />}
            />
          </FilterInput>
          
          <FilterInput>
            <EnhancedInput
              placeholder="Search by location"
              value={filters.location}
              onChange={(e) => onFilterChange('location', e.target.value)}
              leftIcon={<FaMapMarkerAlt size={16} />}
            />
          </FilterInput>
          
          <FilterInput>
            <EnhancedSelect
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              placeholder="Event Status"
            >
              <option value="">All Events</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="ongoing">Ongoing Events</option>
              <option value="past">Past Events</option>
              <option value="attending">My RSVPs</option>
            </EnhancedSelect>
          </FilterInput>
          
          {isManager && (
            <FilterInput>
              <EnhancedSelect
                value={filters.publishedStatus}
                onChange={(e) => onFilterChange('publishedStatus', e.target.value)}
                placeholder="Published Status"
              >
                <option value="">All Visibility</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </EnhancedSelect>
            </FilterInput>
          )}
          
          <FilterInput>
            <EnhancedSelect
              value={filters.capacityStatus}
              onChange={(e) => onFilterChange('capacityStatus', e.target.value)}
              placeholder="Capacity"
            >
              <option value="available">Available Only</option>
              <option value="all">Show Full Events</option>
            </EnhancedSelect>
          </FilterInput>
        </FilterSection>
      </FilterContainer>
    </>
  );
};

export default EventFilters; 
import React from 'react';
import styled from '@emotion/styled';
import Button from '../common/Button';
import { motion } from 'framer-motion';
import { FaInfoCircle } from 'react-icons/fa';
import theme from '../../styles/theme';
import EventCardItem from './EventCardItem';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext'; 




const EventsContainer = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.xl};
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
    align-items: flex-start;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const PageInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: 768px) {
    text-align: center;
    width: 100%;
  }
`;

const EmptyState = styled.div`
  background-color: white;
  border-radius: ${theme.radius.lg};
  padding: ${theme.spacing.xl};
  text-align: center;
  margin: ${theme.spacing.xl} 0;
  box-shadow: ${theme.shadows.md};
  
  svg {
    font-size: 48px;
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.md};
  }
  
  h3 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: ${theme.colors.text.primary};
    margin-bottom: ${theme.spacing.sm};
  }
  
  p {
    color: ${theme.colors.text.secondary};
    max-width: 500px;
    margin: 0 auto;
  }
`;

// Animation variants for cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const EventList = ({
  isLoading,
  events,
  isManager,
  startIndex,
  endIndex,
  totalCount,
  totalPages,
  filters,
  onFilterChange,
  formatCompactDate,
  formatTime,
  getEventCardDate,
  getEventStatus,
  isRsvpd,
  handleEditEvent,
  handleDeleteEventClick,
  handleRsvpClick
}) => {
  const { user, activeRole } = useAuth();

  if (isLoading) {
    return <LoadingSpinner text="Loading events..." />;
  }

  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <EmptyState>
        <FaInfoCircle />
        <h3>No events found</h3>
        <p>
          {isManager
            ? "No visible events match your filters. Try different filter settings or create a new event."
            : "No published events found. Check back later for upcoming events!"}
        </p>
      </EmptyState>
    );
  }
  
  return (
    <EventsContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <EventsGrid>
        {events.map((event) => {
  const isOrganizer = event.organizers?.some(org => org.id === user.id);

  return (
    <motion.div key={event.id || 'unknown'} variants={itemVariants}>
      <EventCardItem
        event={{ ...event, isOrganizer }} 
        isManager={isManager}
        activeRole={activeRole}
        formatCompactDate={formatCompactDate}
        formatTime={formatTime}
        getEventCardDate={getEventCardDate}
        getEventStatus={getEventStatus}
        isRsvpd={isRsvpd}
        handleEditEvent={handleEditEvent}
        handleDeleteEventClick={handleDeleteEventClick}
        handleRsvpClick={handleRsvpClick}
      />
    </motion.div>
  );
})}

        </EventsGrid>
      </motion.div>
      
      <PageControls>
        <PageInfo>
          Showing {startIndex} to {Math.min(endIndex, totalCount)} of {totalCount} events
          {!isManager && (
            <span style={{ marginLeft: theme.spacing.sm, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.hint }}>
              (Only showing published events)
            </span>
          )}
        </PageInfo>
        
        <Pagination>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onFilterChange('page', Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            style={{ minWidth: '80px' }}
          >
            Previous
          </Button>
          
          <PageInfo style={{ 
            minWidth: '100px', 
            textAlign: 'center', 
            whiteSpace: 'nowrap' 
          }}>
            Page {filters.page} of {totalPages > 0 ? totalPages : 1}
          </PageInfo>
          
          <Button
            size="small"
            variant="outlined"
            onClick={() => onFilterChange('page', filters.page + 1)}
            disabled={filters.page >= totalPages}
            style={{ minWidth: '80px' }}
          >
            Next
          </Button>
        </Pagination>
      </PageControls>
    </EventsContainer>
  );
};

export default EventList; 
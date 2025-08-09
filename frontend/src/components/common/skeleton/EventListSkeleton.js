import React from 'react';
import styled from '@emotion/styled';
import { Skeleton, SkeletonText, SkeletonCard } from './index';
import theme from '../../../styles/theme';



const EventsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

const EventCardSkeleton = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.md};
  border: none;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
`;

const EventBackgroundSkeleton = styled.div`
  position: relative;
  width: calc(100% - 4px);
  height: 185px;
  margin: 2px 2px ${theme.spacing.sm} 2px;
  border-radius: ${theme.radius.md};
  background: ${theme.colors.background.default};
  display: flex;
  align-items: flex-end;
  padding: ${theme.spacing.md};
  overflow: hidden;
`;

const EventContentBottomSkeleton = styled.div`
  color: ${theme.colors.text.primary};
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: ${theme.spacing.md};
  position: relative;
  z-index: 4;
`;

const EventDateSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: ${theme.radius.md};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
`;

const EventTitleAreaSkeleton = styled.div`
  flex: 1;
  min-width: 0;
  margin-bottom: ${theme.spacing.xs};
`;

const EventBodySkeleton = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
`;

const EventContentSkeleton = styled.div`
  flex-grow: 1;
`;

const EventDetailsSkeleton = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const EventActionsSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
  flex-shrink: 0;
`;

const BadgeAreaSkeleton = styled.div`
  display: flex;
  gap: 4px;
  margin-top: ${theme.spacing.sm};
  flex-wrap: wrap;
  max-width: 100%;
  overflow: hidden;
`;

const PaginationSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const PaginationControlsSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

// Event list skeleton component - only for data content
const EventListSkeleton = ({ 
  itemsCount = 6,
  showPagination = true
}) => {
  return (
    <div>
      {/* Events grid */}
      <EventsGrid>
        {Array.from({ length: itemsCount }, (_, index) => (
          <EventCardSkeleton key={index}>
            {/* Background area */}
            <EventBackgroundSkeleton>
              <EventContentBottomSkeleton>
                {/* Date skeleton */}
                <EventDateSkeleton>
                  <div style={{
                    height: '12px',
                    width: '30px',
                    backgroundColor: theme.colors.text.secondary,
                    borderRadius: theme.radius.sm,
                    marginBottom: '2px',
                    opacity: 0.7
                  }} />
                  <div style={{
                    height: '24px',
                    width: '20px',
                    backgroundColor: theme.colors.text.primary,
                    borderRadius: theme.radius.sm,
                    opacity: 0.8
                  }} />
                </EventDateSkeleton>
                
                {/* Title and badges area */}
                <EventTitleAreaSkeleton>
                  {/* Event title */}
                  <div style={{
                    height: '20px',
                    width: index === 0 ? '85%' : index === 1 ? '75%' : '90%',
                    backgroundColor: theme.colors.border.light,
                    borderRadius: theme.radius.sm,
                    marginBottom: theme.spacing.xs
                  }} />
                  
                  {/* Badges area */}
                  <BadgeAreaSkeleton>
                    {/* Status badge */}
                    <div style={{
                      height: '18px',
                      width: '60px',
                      backgroundColor: index % 3 === 0 ? '#F39C12' : index % 3 === 1 ? '#2ecc71' : '#e74c3c',
                      borderRadius: theme.radius.sm,
                      opacity: 0.9
                    }} />
                    
                    {/* RSVP badge (sometimes) */}
                    {index % 2 === 0 && (
                      <div style={{
                        height: '18px',
                        width: '50px',
                        backgroundColor: theme.colors.primary.light,
                        borderRadius: theme.radius.sm,
                        opacity: 0.8
                      }} />
                    )}
                    
                    {/* Organizer badge (sometimes) */}
                    {index % 3 === 0 && (
                      <div style={{
                        height: '18px',
                        width: '65px',
                        backgroundColor: theme.colors.primary.main,
                        borderRadius: theme.radius.sm,
                        opacity: 0.8
                      }} />
                    )}
                  </BadgeAreaSkeleton>
                </EventTitleAreaSkeleton>
              </EventContentBottomSkeleton>
            </EventBackgroundSkeleton>
            
            {/* Card body */}
            <EventBodySkeleton>
              <EventContentSkeleton>
                {/* Description */}
                <div style={{ marginBottom: theme.spacing.md }}>
                  <div style={{
                    height: '16px',
                    width: '95%',
                    backgroundColor: theme.colors.border.light,
                    borderRadius: theme.radius.sm,
                    marginBottom: theme.spacing.xs
                  }} />
                  <div style={{
                    height: '16px',
                    width: index === 0 ? '70%' : index === 1 ? '80%' : '65%',
                    backgroundColor: theme.colors.border.light,
                    borderRadius: theme.radius.sm,
                    marginBottom: theme.spacing.xs,
                    opacity: 0.8
                  }} />
                  <div style={{
                    height: '16px',
                    width: '50%',
                    backgroundColor: theme.colors.border.light,
                    borderRadius: theme.radius.sm,
                    opacity: 0.6
                  }} />
                </div>
                
                {/* Event details */}
                <EventDetailsSkeleton>
                  {/* Location */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: theme.colors.text.secondary,
                      borderRadius: '2px',
                      opacity: 0.6
                    }} />
                    <div style={{
                      height: '14px',
                      width: index === 0 ? '70%' : '75%',
                      backgroundColor: theme.colors.border.light,
                      borderRadius: theme.radius.sm
                    }} />
                  </div>
                  
                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: theme.colors.text.secondary,
                      borderRadius: '2px',
                      opacity: 0.6
                    }} />
                    <div style={{
                      height: '14px',
                      width: '60%',
                      backgroundColor: theme.colors.border.light,
                      borderRadius: theme.radius.sm
                    }} />
                  </div>
                  
                  {/* Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: theme.colors.text.secondary,
                      borderRadius: '2px',
                      opacity: 0.6
                    }} />
                    <div style={{
                      height: '14px',
                      width: '55%',
                      backgroundColor: theme.colors.border.light,
                      borderRadius: theme.radius.sm
                    }} />
                  </div>
                  
                  {/* Attendees */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: theme.colors.text.secondary,
                      borderRadius: '2px',
                      opacity: 0.6
                    }} />
                    <div style={{
                      height: '14px',
                      width: '65%',
                      backgroundColor: theme.colors.border.light,
                      borderRadius: theme.radius.sm
                    }} />
                  </div>
                  
                  {/* Points (for managers) */}
                  {index % 2 === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: theme.colors.accent.main,
                        borderRadius: '2px',
                        opacity: 0.7
                      }} />
                      <div style={{
                        height: '14px',
                        width: '70%',
                        backgroundColor: theme.colors.border.light,
                        borderRadius: theme.radius.sm
                      }} />
                    </div>
                  )}
                </EventDetailsSkeleton>
              </EventContentSkeleton>
              
              {/* Action buttons */}
              <EventActionsSkeleton>
                <div>
                  <div style={{
                    height: '32px',
                    width: '90px',
                    backgroundColor: theme.colors.border.light,
                    borderRadius: theme.radius.md
                  }} />
                </div>
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                  <div style={{
                    height: '32px',
                    width: index === 0 ? '60px' : '50px',
                    backgroundColor: theme.colors.border.light,
                    borderRadius: theme.radius.md
                  }} />
                  {index % 2 === 0 && (
                    <div style={{
                      height: '32px',
                      width: '40px',
                      backgroundColor: theme.colors.border.light,
                      borderRadius: theme.radius.md
                    }} />
                  )}
                </div>
              </EventActionsSkeleton>
            </EventBodySkeleton>
          </EventCardSkeleton>
        ))}
      </EventsGrid>
      
      {/* Pagination */}
      {showPagination && (
        <PaginationSkeleton>
          <SkeletonText width="200px" />
          <PaginationControlsSkeleton>
            <Skeleton width="80px" height="36px" rounded={theme.radius.md} />
            <SkeletonText width="100px" />
            <Skeleton width="80px" height="36px" rounded={theme.radius.md} />
          </PaginationControlsSkeleton>
        </PaginationSkeleton>
      )}
    </div>
  );
};

export default EventListSkeleton;

import React from 'react';
import styled from '@emotion/styled';
import { Skeleton, SkeletonText } from './index';
import theme from '../../../styles/theme';



const PromotionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

const PromotionCardSkeleton = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.md};
  border: none;
  transition: transform ${theme.transitions.default}, box-shadow ${theme.transitions.default};
  min-height: 350px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const PromotionBadgeSkeleton = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  z-index: 1;
`;

const CardGradientHeaderSkeleton = styled.div`
  height: 100px;
  background: ${({ index }) => index % 2 === 0 ? 
    `linear-gradient(135deg, ${theme.colors.accent.light}, ${theme.colors.accent.dark})` : 
    `linear-gradient(135deg, ${theme.colors.primary.light}, ${theme.colors.primary.dark})`};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconCircleSkeleton = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${theme.radius.full};
  background-color: rgba(255, 255, 255, 0.9);
  position: absolute;
  bottom: -32px;
  left: ${theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.md};
`;

const PromotionContentSkeleton = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.md};
  margin-top: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const PromotionDetailsSkeleton = styled.div`
  background-color: ${theme.colors.background.hover};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const PromotionDetailItemSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.xs} 0;
`;

const PromotionActionsSkeleton = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
  margin-top: auto;
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

// Promotion list skeleton component - only for data content
const PromotionListSkeleton = ({ 
  itemsCount = 6,
  showPagination = true,
  showCreateButton = false,
}) => {
  return (
    <div>
      {/* Promotions grid */}
      <PromotionsGrid>
        {Array.from({ length: itemsCount }, (_, index) => (
          <PromotionCardSkeleton key={index}>
            {/* Badge in top right corner */}
            <PromotionBadgeSkeleton>
              <Skeleton 
                width="80px" 
                height="24px" 
                rounded={theme.radius.full}
                style={{
                  backgroundColor: index % 2 === 0 ? theme.colors.accent.main : theme.colors.primary.main,
                  opacity: 0.8
                }}
              />
            </PromotionBadgeSkeleton>
            
            {/* Gradient header with icon */}
            <CardGradientHeaderSkeleton index={index}>
              <IconCircleSkeleton>
                <div style={{
                  width: '28px',
                  height: '28px',
                  backgroundColor: index % 2 === 0 ? theme.colors.accent.main : theme.colors.primary.main,
                  borderRadius: '4px',
                  opacity: 0.6
                }} />
              </IconCircleSkeleton>
            </CardGradientHeaderSkeleton>
            
            {/* Content area */}
            <PromotionContentSkeleton>
              {/* Title */}
              <SkeletonText width="85%" variant="heading" style={{ marginBottom: theme.spacing.sm }} />
              
              {/* Description */}
              <div style={{ marginBottom: theme.spacing.md }}>
                <SkeletonText width="95%" style={{ marginBottom: theme.spacing.xs }} />
                <SkeletonText width="70%" />
              </div>
              
              {/* Details container */}
              <PromotionDetailsSkeleton>
                {Array.from({ length: 4 }, (_, detailIndex) => (
                  <PromotionDetailItemSkeleton key={detailIndex}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: index % 2 === 0 ? theme.colors.accent.main : theme.colors.primary.main,
                      borderRadius: '2px',
                      opacity: 0.7
                    }} />
                    <SkeletonText 
                      width={
                        detailIndex === 0 ? '120px' : 
                        detailIndex === 1 ? '100px' : 
                        detailIndex === 2 ? '110px' : '130px'
                      } 
                    />
                  </PromotionDetailItemSkeleton>
                ))}
              </PromotionDetailsSkeleton>
              
              {/* Action buttons for managers */}
              {showCreateButton && (
                <PromotionActionsSkeleton>
                  <Skeleton width="40px" height="32px" rounded={theme.radius.md} />
                  <Skeleton width="40px" height="32px" rounded={theme.radius.md} />
                </PromotionActionsSkeleton>
              )}
            </PromotionContentSkeleton>
          </PromotionCardSkeleton>
        ))}
      </PromotionsGrid>
      
      {/* Pagination */}
      {showPagination && (
        <PaginationSkeleton>
          <SkeletonText width="250px" />
          <PaginationControlsSkeleton>
            <Skeleton width="80px" height="36px" rounded={theme.radius.md} />
            <SkeletonText width="120px" />
            <Skeleton width="80px" height="36px" rounded={theme.radius.md} />
          </PaginationControlsSkeleton>
        </PaginationSkeleton>
      )}
    </div>
  );
};

export default PromotionListSkeleton;

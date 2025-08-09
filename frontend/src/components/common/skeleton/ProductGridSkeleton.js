import React from 'react';
import styled from '@emotion/styled';
import { Skeleton, SkeletonText } from './index';
import theme from '../../../styles/theme';

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

const ProductCardSkeleton = styled.div`
  background: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.light};
  transition: all ${theme.transitions.normal};
  
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const ProductImageSkeleton = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
`;

const ProductBadgesSkeleton = styled.div`
  position: absolute;
  top: ${theme.spacing.sm};
  right: ${theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const ProductContentSkeleton = styled.div`
  padding: ${theme.spacing.md};
`;

const ProductHeaderSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.sm};
  gap: ${theme.spacing.sm};
`;

const ProductPricingSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.md};
  gap: ${theme.spacing.sm};
`;

const PricingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const PaginationSkeleton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background.paper};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.sm};
  
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

// Product grid skeleton component - only for data content
const ProductGridSkeleton = ({ 
  itemsCount = 12,
  showPagination = true
}) => {
  return (
    <div>
      {/* Products grid */}
      <ProductsGrid>
        {Array.from({ length: itemsCount }, (_, index) => (
          <ProductCardSkeleton key={index}>
            <ProductImageSkeleton>
              <Skeleton width="100%" height="100%" />
              <ProductBadgesSkeleton>
                <Skeleton width="60px" height="20px" rounded={theme.radius.md} />
                <Skeleton width="80px" height="20px" rounded={theme.radius.md} />
              </ProductBadgesSkeleton>
            </ProductImageSkeleton>
            
            <ProductContentSkeleton>
              <ProductHeaderSkeleton>
                <SkeletonText width="85%" variant="heading" />
                <Skeleton width="24px" height="24px" />
              </ProductHeaderSkeleton>
              
              <SkeletonText lines={2} />
              
              <div style={{ display: 'flex', gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
                <Skeleton width="60px" height="20px" rounded={theme.radius.md} />
                <Skeleton width="50px" height="20px" rounded={theme.radius.md} />
              </div>
              
              <ProductPricingSkeleton>
                <PricingInfo>
                  <SkeletonText width="80px" variant="heading" />
                  <SkeletonText width="60px" variant="caption" />
                </PricingInfo>
                <Skeleton width="100px" height="36px" rounded={theme.radius.md} />
              </ProductPricingSkeleton>
            </ProductContentSkeleton>
          </ProductCardSkeleton>
        ))}
      </ProductsGrid>
      
      {/* Pagination */}
      {showPagination && (
        <PaginationSkeleton>
          <SkeletonText width="250px" />
          <PaginationControlsSkeleton>
            <Skeleton width="100px" height="36px" rounded={theme.radius.md} />
            <SkeletonText width="120px" />
            <Skeleton width="80px" height="36px" rounded={theme.radius.md} />
          </PaginationControlsSkeleton>
        </PaginationSkeleton>
      )}
    </div>
  );
};

export default ProductGridSkeleton;
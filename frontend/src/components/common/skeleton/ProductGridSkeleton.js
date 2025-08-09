import React from 'react';
import styled from '@emotion/styled';
import { Skeleton, SkeletonText } from './index';
import theme from '../../../styles/theme';

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

const ProductCardSkeleton = styled.div`
  background: ${theme.colors.background.paper};
  border-radius: ${theme.radius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.default};
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const ProductImageSkeleton = styled.div`
  width: 100%;
  height: 220px;
  position: relative;
  overflow: hidden;
  background: ${theme.colors.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryBadgeSkeleton = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  width: 80px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: ${theme.radius.full};
`;

const StockBadgeSkeleton = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  width: 70px;
  height: 24px;
  background: linear-gradient(135deg, ${theme.colors.success.main}, ${theme.colors.success.light});
  border-radius: ${theme.radius.full};
`;

const ProductContentSkeleton = styled.div`
  padding: ${theme.spacing.lg};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProductTitleSkeleton = styled.div`
  margin-bottom: ${theme.spacing.xs};
`;

const ProductDescriptionSkeleton = styled.div`
  margin-bottom: ${theme.spacing.lg};
  flex: 1;
`;

const VariantSelectorSkeleton = styled.div`
  align-self: flex-end;
  margin-bottom: ${theme.spacing.sm};
  width: 120px;
  height: 28px;
  background: ${theme.colors.background.paper};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.radius.sm};
`;

const PriceSectionSkeleton = styled.div`
  margin-top: auto;
`;

const PriceContainerSkeleton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.sm};
`;

const PriceDisplaySkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const PriceItemSkeleton = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const PriceTypeTagSkeleton = styled.div`
  width: 80px;
  height: 24px;
  background: linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.light});
  border-radius: ${theme.radius.sm};
`;

const ProductMetaSkeleton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
  margin-top: ${theme.spacing.sm};
`;

const StockInfoSkeleton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: ${theme.spacing.xs};
`;

const RatingDisplaySkeleton = styled.div`
  display: flex;
  align-items: center;
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
  // Helper function to get price type based on index
  const getPriceType = (index) => {
    const types = ['cash', 'points', 'both'];
    return types[index % 3];
  };

  // Helper function to get description line count variation
  const getDescriptionLines = (index) => {
    const lines = [2, 3, 4];
    return lines[index % 3];
  };

  // Helper function to get title width variation
  const getTitleWidth = (index) => {
    const widths = ['70%', '85%', '95%', '60%'];
    return widths[index % 4];
  };

  // Helper function to determine if product has rating
  const hasRating = (index) => {
    return index % 4 !== 3; // 75% of products have ratings
  };

  return (
    <div>
      {/* Products grid */}
      <ProductsGrid>
        {Array.from({ length: itemsCount }, (_, index) => {
          const priceType = getPriceType(index);
          const descriptionLines = getDescriptionLines(index);
          const titleWidth = getTitleWidth(index);
          const showRating = hasRating(index);
          
          return (
            <ProductCardSkeleton key={index}>
              <ProductImageSkeleton>
                <Skeleton width="100%" height="100%" />
                <CategoryBadgeSkeleton />
                <StockBadgeSkeleton />
              </ProductImageSkeleton>
              
              <ProductContentSkeleton>
                <ProductTitleSkeleton>
                  <SkeletonText width={titleWidth} variant="heading" />
                </ProductTitleSkeleton>
                
                <ProductDescriptionSkeleton>
                  <SkeletonText lines={descriptionLines} />
                </ProductDescriptionSkeleton>

                {/* Variant selector (occasionally show) */}
                {index % 4 === 0 && (
                  <VariantSelectorSkeleton />
                )}
                
                <PriceSectionSkeleton>
                  <PriceContainerSkeleton>
                    <PriceDisplaySkeleton>
                      {/* Cash Only */}
                      {priceType === 'cash' && (
                        <PriceItemSkeleton>
                          <Skeleton width="16px" height="16px" />
                          <SkeletonText width="60px" variant="heading" />
                        </PriceItemSkeleton>
                      )}
                      
                      {/* Points Only */}
                      {priceType === 'points' && (
                        <PriceItemSkeleton>
                          <Skeleton width="16px" height="16px" />
                          <SkeletonText width="90px" variant="heading" />
                        </PriceItemSkeleton>
                      )}
                      
                      {/* Both Cash and Points */}
                      {priceType === 'both' && (
                        <>
                          <PriceItemSkeleton>
                            <Skeleton width="16px" height="16px" />
                            <SkeletonText width="60px" variant="heading" />
                          </PriceItemSkeleton>
                          <PriceItemSkeleton>
                            <Skeleton width="16px" height="16px" />
                            <SkeletonText width="90px" variant="body" />
                          </PriceItemSkeleton>
                        </>
                      )}
                    </PriceDisplaySkeleton>
                    
                    <PriceTypeTagSkeleton 
                      style={{
                        background: priceType === 'cash' 
                          ? `linear-gradient(135deg, ${theme.colors.success.main}, ${theme.colors.success.light})`
                          : priceType === 'points'
                          ? `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.light})`
                          : `linear-gradient(135deg, ${theme.colors.accent.main}, ${theme.colors.accent.light})`
                      }}
                    />
                  </PriceContainerSkeleton>

                  <ProductMetaSkeleton>
                    <StockInfoSkeleton>
                      <SkeletonText width={index % 2 === 0 ? "90px" : "70px"} variant="caption" />
                      {index % 5 === 0 && (
                        <SkeletonText width="100px" variant="caption" />
                      )}
                    </StockInfoSkeleton>
                    
                    {/* Show rating for most products */}
                    {showRating ? (
                      <RatingDisplaySkeleton>
                        <Skeleton width="14px" height="14px" />
                        <SkeletonText width="30px" variant="caption" />
                        <SkeletonText width="25px" variant="caption" />
                      </RatingDisplaySkeleton>
                    ) : (
                      <div style={{ width: '70px' }} /> // Empty space for layout consistency
                    )}
                  </ProductMetaSkeleton>
                </PriceSectionSkeleton>
              </ProductContentSkeleton>
            </ProductCardSkeleton>
          );
        })}
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
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiDollarSign, FiGift, FiStar, FiPackage, FiLock } from 'react-icons/fi';
import theme from '../../styles/theme';
import Badge from '../common/Badge';
import { TIER_ORDER } from '../../utils/tierUtils';

const CardContainer = styled(motion.div)`
  background: ${({ inStock }) => 
    inStock 
      ? theme.colors.background.paper 
      : '#f5f5f5'
  };
  border-radius: ${theme.radius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.default};
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    ${({ inStock }) => inStock && `
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.lg};
    `}
  }
  
  &:hover .product-image {
    ${({ inStock }) => inStock && `
    transform: scale(1.05);
    `}
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: ${theme.colors.background.paper};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: containimage.png;
  transition: transform ${theme.transitions.default};
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${theme.colors.background.default};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: ${theme.spacing.xs};
  
  svg {
    font-size: 2rem;
    color: ${theme.colors.text.secondary};
  }
  
  .placeholder-text {
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.text.secondary};
    font-weight: ${theme.typography.fontWeights.medium};
    text-align: center;
  }
`;

const StockBadge = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background: ${({ inStock }) => 
    inStock 
      ? `linear-gradient(135deg, ${theme.colors.success.main}, ${theme.colors.success.light})` 
      : `linear-gradient(135deg, ${theme.colors.error.main}, ${theme.colors.error.light})`
  };
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CategoryBadge = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  left: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  text-transform: capitalize;
`;

const CardContent = styled.div`
  padding: ${theme.spacing.lg};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProductTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing.xs} 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`;

const PriceSection = styled.div`
  margin-top: auto;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.sm};
`;

const PriceDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const CashPrice = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.success.dark};
  
  svg {
    font-size: 1rem;
  }
`;

const PointsPrice = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.primary.main};
  
  svg {
    font-size: 1rem;
  }
`;

const PriceTypeTag = styled.div`
  background: ${({ type }) => {
    switch (type) {
      case 'points':
        return `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.light})`;
      case 'cash':
        return `linear-gradient(135deg, ${theme.colors.success.main}, ${theme.colors.success.light})`;
      case 'both':
        return `linear-gradient(135deg, ${theme.colors.accent.main}, ${theme.colors.accent.light})`;
      default:
        return theme.colors.text.secondary;
    }
  }};
  color: white;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
  margin-top: ${theme.spacing.sm};
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.accent.main};
  
  svg {
    font-size: 0.875rem;
  }
`;

// Helper function to check if user meets minimum tier requirement
const checkTierEligibility = (userTier, requiredTier) => {
  if (!requiredTier || requiredTier === null) return true; // No tier restriction
  if (!userTier) return false; // User has no tier, can't access restricted items
  
  const userTierIndex = TIER_ORDER.indexOf(userTier);
  const requiredTierIndex = TIER_ORDER.indexOf(requiredTier);
  
  // User must have equal or higher tier (higher index in TIER_ORDER)
  return userTierIndex >= requiredTierIndex;
};

const ProductCard = ({ product, userTier = null }) => {
  const {
    id,
    name,
    description,
    category,
    imageUrl,
    rating,
    reviewCount,
    variations = [],
  } = product;

  // Find index of first in-stock variation, defaulting to 0
  const initialVariantIndex = Math.max(0, variations.findIndex(v => v.inStock));

  // State to track selected variation index
  const [variantIndex, setVariantIndex] = useState(initialVariantIndex);

  const currentVar = variations[variantIndex] || {};
  const {
    cashPrice,
    pointsPrice,
    inStock = true,
    stockQuantity,
    redemptionType = 'cash', // Get redemption type from current variation
    minimumTier = 'BRONZE', // Get minimum tier from current variation
  } = currentVar;

  // Check if user meets tier requirement
  const meetsTierRequirement = checkTierEligibility(userTier, minimumTier);
  
  // Product is effectively "available" only if in stock AND user meets tier requirement
  const isEffectivelyAvailable = inStock && meetsTierRequirement;

  // Use redemption type from current variation as priceType
  const priceType = redemptionType;

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setImageLoading(false);
    }
  }, [imageUrl]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatPoints = (points) => {
    return new Intl.NumberFormat('en-CA').format(points);
  };

  const getPriceTypeLabel = (type) => {
    switch (type) {
      case 'cash':
        return 'Cash Only';
      case 'points':
        return 'Points Only';
      case 'both':
        return 'Cash & Points';
      default:
        return '';
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  return (
    <CardContainer
      inStock={isEffectivelyAvailable}
      whileHover={isEffectivelyAvailable ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
    >
      <ImageContainer>
        {imageUrl && !imageError ? (
          <ProductImage 
            src={imageUrl} 
            alt={name} 
            className="product-image"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ 
              opacity: imageLoading ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}
          />
        ) : null}
        
        {(!imageUrl || imageError || imageLoading) && (
          <ImagePlaceholder>
            <FiPackage />
            {!imageLoading && (imageError || !imageUrl) && (
              <span className="placeholder-text">No Image</span>
            )}
          </ImagePlaceholder>
        )}
        
        <CategoryBadge>{category}</CategoryBadge>
        

        
        <StockBadge inStock={isEffectivelyAvailable}>
          {isEffectivelyAvailable ? 'In Stock' : (
            !inStock ? 'Out of Stock' : 'Tier Restricted'
          )}
        </StockBadge>
      </ImageContainer>

      <CardContent>
        <ProductTitle>{name}</ProductTitle>
        
        {description && (
          <ProductDescription>{description}</ProductDescription>
        )}

        {/* Variant selector */}
        {variations.length > 1 && (
          <select
            value={variantIndex}
            onChange={(e) => setVariantIndex(parseInt(e.target.value, 10))}
            style={{
              alignSelf: 'flex-end',
              marginBottom: theme.spacing.sm,
              padding: '4px 8px',
              borderRadius: theme.radius.sm,
              border: `1px solid ${theme.colors.border.main}`,
              fontSize: theme.typography.fontSize.xs,
              backgroundColor: theme.colors.background.paper,
              color: theme.colors.text.primary,
            }}
          >
            {variations.map((v, idx) => {
              const isOutOfStock = !v.inStock || (v.stockQuantity !== undefined && v.stockQuantity <= 0);
              const displayName = isOutOfStock ? `${v.name} (Out of Stock)` : v.name;
              
              return (
                <option 
                  key={v.id} 
                  value={idx}
                  style={{
                    color: isOutOfStock ? '#999' : 'inherit',
                    fontStyle: isOutOfStock ? 'italic' : 'normal'
                  }}
                >
                  {displayName}
                </option>
              );
            })}
          </select>
        )}

        <PriceSection>
          <PriceContainer>
            <PriceDisplay>
              {priceType === 'cash' && cashPrice !== undefined && cashPrice !== null && (
                <CashPrice>
                  <FiDollarSign />
                  {formatPrice(cashPrice)}
                </CashPrice>
              )}
              
              {priceType === 'points' && pointsPrice !== undefined && pointsPrice !== null && (
                <PointsPrice>
                  <FiGift />
                  {formatPoints(pointsPrice)} points
                </PointsPrice>
              )}
              
              {priceType === 'both' && (
                <>
                  {cashPrice !== undefined && cashPrice !== null && (
                    <CashPrice>
                      <FiDollarSign />
                      {formatPrice(cashPrice)}
                    </CashPrice>
                  )}
                  {pointsPrice !== undefined && pointsPrice !== null && (
                    <PointsPrice>
                      <FiGift />
                      {formatPoints(pointsPrice)} points
                    </PointsPrice>
                  )}
                </>
              )}
            </PriceDisplay>
            
            <PriceTypeTag type={priceType}>
              {getPriceTypeLabel(priceType)}
            </PriceTypeTag>
          </PriceContainer>

          <ProductMeta>
            <StockInfo>
              <div>
                {stockQuantity !== undefined && (
                  <span>
                    {isEffectivelyAvailable && stockQuantity > 0 
                      ? `${stockQuantity} available` 
                      : 'Out of stock'}
                  </span>
                )}
              </div>
              {/* Show tier requirement on the right side */}
              {!meetsTierRequirement && minimumTier && minimumTier !== 'BRONZE' && (
                <span style={{ 
                  color: '#e74c3c',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FiLock size={12} />
                  {minimumTier} Required
                </span>
              )}
            </StockInfo>
            
            {rating && (
              <RatingDisplay>
                <FiStar />
                <span>{rating.toFixed(1)}</span>
                {reviewCount && <span>({reviewCount})</span>}
              </RatingDisplay>
            )}
          </ProductMeta>
        </PriceSection>
      </CardContent>
    </CardContainer>
  );
};

export default ProductCard; 
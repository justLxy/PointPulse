import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiDollarSign, FiGift, FiPackage } from 'react-icons/fi';
import theme from '../../styles/theme';
import Badge from '../common/Badge';

const CardContainer = styled(motion.div)`
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
  
  &:hover .product-image {
    transform: scale(1.05);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform ${theme.transitions.default};
`;

const ImagePlaceholder = styled.div`
  width: 120px;
  height: 100px;
  border-radius: ${theme.radius.lg};
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
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
  
  ${({ loading }) => loading && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
      animation: shimmer 1.5s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `}
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
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;



const ProductCard = ({ product }) => {
  const {
    id,
    name,
    description,
    category,
    cashPrice,
    pointsPrice,
    priceType,
    imageUrl,
    inStock = true,
    stockQuantity
  } = product;

  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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
      whileHover={{ y: -4 }}
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
          <ImagePlaceholder loading={imageLoading}>
            <FiPackage />
            {imageError && !imageLoading && (
              <span className="placeholder-text">No Image</span>
            )}
          </ImagePlaceholder>
        )}
        
        <CategoryBadge>{category}</CategoryBadge>
        
        <StockBadge inStock={inStock}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </StockBadge>
      </ImageContainer>

      <CardContent>
        <ProductTitle>{name}</ProductTitle>
        
        {description && (
          <ProductDescription>{description}</ProductDescription>
        )}

        <PriceSection>
          <PriceContainer>
            <PriceDisplay>
              {priceType === 'cash' && (
                <CashPrice>
                  <FiDollarSign />
                  {formatPrice(cashPrice)}
                </CashPrice>
              )}
              
              {priceType === 'points' && (
                <PointsPrice>
                  <FiGift />
                  {formatPoints(pointsPrice)} points
                </PointsPrice>
              )}
              
              {priceType === 'both' && (
                <>
                  <CashPrice>
                    <FiDollarSign />
                    {formatPrice(cashPrice)}
                  </CashPrice>
                  <PointsPrice>
                    <FiGift />
                    {formatPoints(pointsPrice)} points
                  </PointsPrice>
                </>
              )}
            </PriceDisplay>
            
            <PriceTypeTag type={priceType}>
              {getPriceTypeLabel(priceType)}
            </PriceTypeTag>
          </PriceContainer>

          <ProductMeta>
            <StockInfo>
              {stockQuantity !== undefined && (
                <span>
                  {inStock && stockQuantity > 0 
                    ? `${stockQuantity} available` 
                    : 'Out of stock'
                  }
                </span>
              )}
            </StockInfo>
            

          </ProductMeta>
        </PriceSection>
      </CardContent>
    </CardContainer>
  );
};

export default ProductCard; 
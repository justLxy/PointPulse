import React from "react";
import { FaEdit, FaTrash, FaCalendarAlt, FaPercent, FaTags, FaCoins, FaClock } from "react-icons/fa";
import Card from '../common/Card';
import Button from '../common/Button';
import theme from '../../styles/theme';
import styled from '@emotion/styled';

const PromotionCard = styled(Card)`
  position: relative;
  height: 100%;
  overflow: hidden;
  border-radius: ${theme.radius.lg};
  border: none;
  box-shadow: ${theme.shadows.md};
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.xl};
  }
`;

const PromotionBadge = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radius.full};
  background-color: ${({ type }) =>
    type === "automatic" ? theme.colors.accent.main : theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.semiBold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
`;

const CardGradientHeader = styled.div`
  height: 100px;
  background: linear-gradient(
    135deg, 
    ${({ type }) => type === "automatic" ? 
      `${theme.colors.accent.light}, ${theme.colors.accent.dark}` : 
      `${theme.colors.primary.light}, ${theme.colors.primary.dark}`}
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconCircle = styled.div`
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
  color: ${({ type }) =>
    type === "automatic" ? theme.colors.accent.main : theme.colors.primary.main};
  font-size: 28px;
  box-shadow: ${theme.shadows.md};
`;

const PromotionContent = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.md};
  margin-top: 20px;
`;

const PromotionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.bold};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
`;

const PromotionDescription = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PromotionDetails = styled.div`
  background-color: ${theme.colors.background.hover};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.md};
`;

const PromotionDetail = styled.div`
  display: flex;
  align-items: center;
  font-size: ${theme.typography.fontSize.sm};
  padding: ${theme.spacing.xs} 0;
  
  svg {
    margin-right: ${theme.spacing.sm};
    color: ${({ type }) => 
      type === "automatic" ? theme.colors.accent.main : theme.colors.primary.main};
    font-size: 16px;
  }
`;

const ValueText = styled.span`
  font-weight: ${theme.typography.fontWeights.medium};
`;

const PromotionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
`;

const ActionButton = styled(Button)`
  transition: all 0.2s ease-out;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const PromotionCardItem = ({ promotion, isManager, onEdit, onDelete, formatDate }) => {
  return (
    <PromotionCard>
      <PromotionBadge type={promotion.type}>
        {promotion.type === "automatic" ? "Automatic" : "One-time"}
      </PromotionBadge>
      
      <CardGradientHeader type={promotion.type}>
        <IconCircle type={promotion.type}>
          {promotion.type === "automatic" ? <FaPercent /> : <FaCoins />}
        </IconCircle>
      </CardGradientHeader>

      <PromotionContent>
        <PromotionTitle>{promotion.name}</PromotionTitle>
        <PromotionDescription>{promotion.description}</PromotionDescription>

        <PromotionDetails>
          {promotion.minSpending !== null && (
            <PromotionDetail type={promotion.type}>
              <FaTags />
              <div>
                Minimum Spend: <ValueText>${promotion.minSpending.toFixed(2)}</ValueText>
              </div>
            </PromotionDetail>
          )}
          
          {promotion.rate !== null && (
            <PromotionDetail type={promotion.type}>
              <FaPercent />
              <div>
                Rate: <ValueText>{promotion.rate}x points</ValueText>
              </div>
            </PromotionDetail>
          )}
          
          {promotion.points !== null && (
            <PromotionDetail type={promotion.type}>
              <FaCoins />
              <div>
                Bonus: <ValueText>{promotion.points} points</ValueText>
              </div>
            </PromotionDetail>
          )}
          
          {promotion.startDate && (
            <PromotionDetail type={promotion.type}>
              <FaClock />
              <div>
                <ValueText>
                  {formatDate(promotion.startDate)}
                  {promotion.endDate ? ` - ${formatDate(promotion.endDate)}` : ""}
                </ValueText>
              </div>
            </PromotionDetail>
          )}
        </PromotionDetails>

        {isManager && (
          <PromotionActions>
            <ActionButton
              size="small"
              variant="outlined"
              onClick={() => onEdit(promotion)}
            >
              <FaEdit />
            </ActionButton>
            <ActionButton
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onDelete(promotion)}
            >
              <FaTrash />
            </ActionButton>
          </PromotionActions>
        )}
      </PromotionContent>
    </PromotionCard>
  );
};

export default PromotionCardItem;

import React from "react";
import { FaEdit, FaTrash, FaCalendarAlt, FaPercent, FaTags, FaCoins } from "react-icons/fa";
import Card from '../common/Card';
import Button from '../common/Button';
import theme from '../../styles/theme';
import styled from '@emotion/styled';


const PromotionCard = styled(Card)`
  height: 100%;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows.lg};
  }
`;

const PromotionHeader = styled(Card.Header)`
  background-color: ${({ type }) =>
    type === "automatic" ? theme.colors.accent.light : theme.colors.primary.light};
  color: ${({ type }) =>
    type === "automatic" ? theme.colors.accent.dark : theme.colors.primary.dark};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
`;

const PromotionIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.radius.full};
  background-color: ${({ type }) =>
    type === "automatic" ? theme.colors.accent.main : theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
`;

const PromotionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: ${theme.spacing.xs};
`;

const PromotionDescription = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.sm};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PromotionDetails = styled.div`
  margin-top: ${theme.spacing.sm};
  padding-top: ${theme.spacing.sm};
  border-top: 1px solid ${theme.colors.border.light};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const PromotionDetail = styled.div`
  display: flex;
  align-items: center;
  font-size: ${theme.typography.fontSize.sm};
  svg {
    margin-right: ${theme.spacing.xs};
    color: ${theme.colors.text.secondary};
    font-size: 14px;
  }
`;

const PromotionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const PromotionCardItem = ({ promotion, isManager, onEdit, onDelete, formatDate }) => {
  return (
    <PromotionCard>
      <PromotionHeader type={promotion.type}>
        <Card.Title>{promotion.type === "automatic" ? "Automatic" : "One-time"}</Card.Title>
        <PromotionIcon type={promotion.type}>
          {promotion.type === "automatic" ? <FaPercent /> : <FaCoins />}
        </PromotionIcon>
      </PromotionHeader>

      <Card.Body style={{ padding: `${theme.spacing.md} ${theme.spacing.md}` }}>
        <PromotionTitle>{promotion.name}</PromotionTitle>
        <PromotionDescription>{promotion.description}</PromotionDescription>

        <PromotionDetails>
          {promotion.minSpending !== null && (
            <PromotionDetail>
              <FaTags />
              Min. Spending: ${promotion.minSpending.toFixed(2)}
            </PromotionDetail>
          )}
          {promotion.rate !== null && (
            <PromotionDetail>
              <FaPercent />
              Rate: {promotion.rate}x points
            </PromotionDetail>
          )}
          {promotion.points !== null && (
            <PromotionDetail>
              <FaCoins />
              Points: {promotion.points}
            </PromotionDetail>
          )}
          {promotion.startDate && (
            <PromotionDetail>
              <FaCalendarAlt />
              Valid from: {formatDate(promotion.startDate)}
              {promotion.endDate ? ` to ${formatDate(promotion.endDate)}` : ""}
            </PromotionDetail>
          )}
        </PromotionDetails>

        {isManager && (
          <PromotionActions>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onEdit(promotion)}
            >
              <FaEdit />
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onDelete(promotion)}
            >
              <FaTrash />
            </Button>
          </PromotionActions>
        )}
      </Card.Body>
    </PromotionCard>
  );
};

export default PromotionCardItem;

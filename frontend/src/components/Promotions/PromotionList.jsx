import React from 'react';
import styled from '@emotion/styled';
import theme from '../../styles/theme';
import PromotionCardItem from './PromotionCardItem';

const PromotionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.md};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PromotionList = ({ promotions, isManager, onEdit, onDelete, formatDate }) => {
  return (
    <PromotionsGrid>
      {promotions.map((promotion) => (
        <PromotionCardItem
          key={promotion.id}
          promotion={promotion}
          isManager={isManager}
          onEdit={onEdit}
          onDelete={onDelete}
          formatDate={formatDate}
        />
      ))}
    </PromotionsGrid>
  );
};

export default PromotionList;

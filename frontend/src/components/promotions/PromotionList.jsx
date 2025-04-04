import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FaInfoCircle } from 'react-icons/fa';
import theme from '../../styles/theme';
import PromotionCardItem from './PromotionCardItem';

const PromotionsContainer = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const PromotionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${theme.spacing.lg};

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
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

const PromotionList = ({ promotions, isManager, onEdit, onDelete, formatDate }) => {
  if (!promotions || promotions.length === 0) {
    return (
      <EmptyState>
        <FaInfoCircle />
        <h3>No promotions found</h3>
        <p>
          {isManager 
            ? "Start by creating a new promotion to help users earn more points!"
            : "There are no active promotions right now. Check back later for new offers."}
        </p>
      </EmptyState>
    );
  }

  return (
    <PromotionsContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <PromotionsGrid>
          {promotions.map((promotion) => (
            <motion.div key={promotion.id} variants={itemVariants}>
              <PromotionCardItem
                promotion={promotion}
                isManager={isManager}
                onEdit={onEdit}
                onDelete={onDelete}
                formatDate={formatDate}
              />
            </motion.div>
          ))}
        </PromotionsGrid>
      </motion.div>
    </PromotionsContainer>
  );
};

export default PromotionList;

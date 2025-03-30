import React from 'react';
import styled from '@emotion/styled';
import Button from '../common/Button';
import Card from '../common/Card';
import theme from '../../styles/theme';
import TransactionItem from './TransactionItem';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaInfoCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const TableContainer = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 150px 120px 150px;
  padding: ${theme.spacing.md};
  font-weight: ${theme.typography.fontWeights.semiBold};
  background-color: ${theme.colors.background.default};
  border-bottom: 1px solid ${theme.colors.border.light};
  
  @media (max-width: 1200px) {
    grid-template-columns: 80px 1fr 1fr 120px 120px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const PageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
    align-items: flex-start;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const PageInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const EmptyState = styled(Card)`
  padding: ${theme.spacing.xl};
  text-align: center;
  margin: ${theme.spacing.xl} 0;
  
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

const TransactionList = ({
  isLoading,
  transactions,
  startIndex,
  endIndex,
  totalCount,
  totalPages,
  filters,
  handleFilterChange,
  formatDate,
  formatTime,
  getTransactionIcon,
  getRelatedDescription,
  isSuperuser,
  handleViewTransaction,
  handleMarkAsSuspiciousClick,
  handleApproveTransactionClick
}) => {
  if (isLoading) {
    return <LoadingSpinner text="Loading transactions..." />;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState>
        <FaInfoCircle />
        <h3>No transactions found</h3>
        <p>
          No transactions match your search criteria. Try different search terms or filters.
        </p>
      </EmptyState>
    );
  }
  
  return (
    <>
      <TableContainer>
        <Card.Body>
          <TableHeader>
            <div>Type</div>
            <div>ID</div>
            <div>User</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Actions</div>
          </TableHeader>
          
          {transactions.map(transaction => (
            <TransactionItem 
              key={transaction.id}
              transaction={transaction}
              formatDate={formatDate}
              formatTime={formatTime}
              getTransactionIcon={getTransactionIcon}
              getRelatedDescription={getRelatedDescription}
              isSuperuser={isSuperuser}
              handleViewTransaction={handleViewTransaction}
              handleMarkAsSuspiciousClick={handleMarkAsSuspiciousClick}
              handleApproveTransactionClick={handleApproveTransactionClick}
            />
          ))}
        </Card.Body>
      </TableContainer>
      
      <PageControls>
        <PageInfo>
          Showing {startIndex} to {Math.min(endIndex, totalCount)} of {totalCount} transactions
        </PageInfo>
        
        <Pagination>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
          >
            <FaChevronLeft /> Previous
          </Button>
          
          <PageInfo>
            Page {filters.page} of {totalPages > 0 ? totalPages : 1}
          </PageInfo>
          
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleFilterChange('page', filters.page + 1)}
            disabled={filters.page >= totalPages}
          >
            Next <FaChevronRight />
          </Button>
        </Pagination>
      </PageControls>
    </>
  );
};

export default TransactionList; 
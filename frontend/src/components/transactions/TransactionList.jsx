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
  grid-template-columns: 80px 1fr 1fr 150px 150px;
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
  
  @media (max-width: 768px) {
    text-align: center;
    width: 100%;
  }
`;

const EmptyState = styled(Card)`
  padding: ${theme.spacing.xl};
  text-align: center;
  margin: ${theme.spacing.xl} 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  
  svg {
    font-size: 48px;
    color: ${theme.colors.text.secondary};
    opacity: 0.6;
  }
  
  h3 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: ${theme.colors.text.primary};
    margin: 0;
  }
  
  p {
    color: ${theme.colors.text.secondary};
    max-width: 500px;
    margin: 0;
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
  getTransactionIcon,
  getTransactionDetailsLabel,
  isSuperuser,
  isManager,
  handleViewTransaction,
  handleMarkAsSuspiciousClick,
  handleApproveTransactionClick,
  formatDate,
  formatTime
}) => {


  
  return (
    <>
      <TableContainer>
        <Card.Body>
          <TableHeader>
            <div style={{ textAlign: 'center' }}>Type</div>
            <div>Transaction</div>
            <div>Details</div>
            <div style={{ textAlign: 'center' }}>Amount</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </TableHeader>
          
          {/* Transaction Content with separate loading state */}
          {isLoading ? (
            // Simple skeleton rows without header
            Array.from({ length: 5 }, (_, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 1fr 150px 150px',
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                borderBottom: '1px solid ' + theme.colors.border.light,
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    backgroundColor: theme.colors.border.light, 
                    borderRadius: theme.radius.full 
                  }} />
                </div>
                <div>
                  <div style={{ 
                    height: '16px', 
                    width: '75%', 
                    backgroundColor: theme.colors.border.light, 
                    borderRadius: theme.radius.sm,
                    marginBottom: theme.spacing.xs 
                  }} />
                  <div style={{ 
                    height: '12px', 
                    width: '60%', 
                    backgroundColor: theme.colors.border.light, 
                    borderRadius: theme.radius.sm 
                  }} />
                </div>
                <div style={{ 
                  height: '16px', 
                  width: '80%', 
                  backgroundColor: theme.colors.border.light, 
                  borderRadius: theme.radius.sm 
                }} />
                <div style={{ 
                  height: '16px', 
                  width: '80px', 
                  backgroundColor: theme.colors.border.light, 
                  borderRadius: theme.radius.sm,
                  margin: '0 auto'
                }} />
                <div style={{ display: 'flex', gap: theme.spacing.xs, justifyContent: 'center' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: theme.colors.border.light, 
                    borderRadius: theme.radius.sm 
                  }} />
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: theme.colors.border.light, 
                    borderRadius: theme.radius.sm 
                  }} />
                </div>
              </div>
            ))
          ) : (!transactions || transactions.length === 0) ? (
            <EmptyState>
              <FaInfoCircle />
              <h3>No transactions found</h3>
              <p>
                No transactions match your search criteria. Try different search terms or filters.
              </p>
            </EmptyState>
          ) : (
            transactions.map(transaction => (
              <TransactionItem 
                key={transaction.id}
                transaction={transaction}
                getTransactionIcon={getTransactionIcon}
                getTransactionDetailsLabel={getTransactionDetailsLabel}
                isSuperuser={isSuperuser}
                isManager={isManager}
                handleViewTransaction={handleViewTransaction}
                handleMarkAsSuspiciousClick={handleMarkAsSuspiciousClick}
                handleApproveTransactionClick={handleApproveTransactionClick}
                formatDate={formatDate}
                formatTime={formatTime}
              />
            ))
          )}
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
            style={{ minWidth: '80px' }}
          >
            <FaChevronLeft /> Previous
          </Button>
          
          <PageInfo style={{ 
            minWidth: '100px', 
            textAlign: 'center', 
            whiteSpace: 'nowrap' 
          }}>
            Page {filters.page} of {totalPages > 0 ? totalPages : 1}
          </PageInfo>
          
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleFilterChange('page', filters.page + 1)}
            disabled={filters.page >= totalPages}
            style={{ minWidth: '80px' }}
          >
            Next <FaChevronRight />
          </Button>
        </Pagination>
      </PageControls>
    </>
  );
};

export default TransactionList; 
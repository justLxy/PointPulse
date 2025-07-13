import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import useUserTransactions from '../../hooks/useUserTransactions';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';
import {
  FaPlus,
  FaMinus,
  FaExchangeAlt,
  FaCalendarAlt,
  FaChevronRight,
  FaChevronLeft,
  FaInfoCircle
} from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TransactionFilters from '../../components/transactions/TransactionFilters';

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterInput = styled.div`
  width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
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
    align-items: center;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const PageInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: 768px) {
    text-align: center;
    width: 100%;
    margin-bottom: ${theme.spacing.sm};
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 150px;
  padding: ${theme.spacing.md};
  font-weight: ${theme.typography.fontWeights.semiBold};
  background-color: ${theme.colors.background.default};
  border-bottom: 1px solid ${theme.colors.border.light};
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 150px;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.light};
  align-items: center;
  
  &:hover {
    background-color: ${theme.colors.background.default};
  }
  
  // @media (max-width: 768px) {
  //   display: flex;
  //   flex-direction: column;
  //   gap: ${theme.spacing.sm};
  //   padding: ${theme.spacing.md};
    
  //   &:not(:last-child) {
  //     border-bottom: 1px solid ${theme.colors.border.light};
  //   }

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "icon header"
      "details details"
      "amount amount"
      "actions actions";
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    
    &:not(:last-child) {
      border-bottom: 1px solid ${theme.colors.border.light};
    }
  }
`;

const TransactionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${({ type }) => {
    switch (type) {
      case 'purchase':
        return css`
          background-color: ${theme.colors.secondary.light};
          color: ${theme.colors.secondary.dark};
        `;
      case 'redemption':
        return css`
          background-color: ${theme.colors.accent.light};
          color: ${theme.colors.accent.dark};
        `;
      case 'transfer':
        return css`
          background-color: ${theme.colors.primary.light};
          color: ${theme.colors.primary.dark};
        `;
      case 'adjustment':
        return css`
          background-color: ${theme.colors.info.light};
          color: ${theme.colors.info.dark};
        `;
      case 'event':
        return css`
          background-color: ${theme.colors.success.light};
          color: ${theme.colors.success.dark};
        `;
      default:
        return css`
          background-color: ${theme.colors.border.light};
          color: ${theme.colors.text.secondary};
        `;
    }
  }}

  @media (max-width: 768px) {
    grid-area: icon;
    align-self: start;
  }
`;

const MobileLabel = styled.span`
  display: none;
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    display: inline-block;
    margin-bottom: ${theme.spacing.xs};
    font-size: ${theme.typography.fontSize.sm};
  }
    
  // margin-right: ${theme.spacing.sm};
  
  // @media (max-width: 768px) {
  //   display: inline;
  // }
`;

const TransactionInfo = styled.div`
  // @media (max-width: 768px) {
  //   display: flex;
  //   justify-content: space-between;
  //   width: 100%;
  //   margin-bottom: ${theme.spacing.sm};
  // }

  @media (max-width: 768px) {
    grid-area: header;
    display: flex;
    flex-direction: column;
  }
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.xs};
  }
`;

const TransactionId = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
`;

const TransactionType = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  text-transform: capitalize;
`;

const BadgesContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

const TransactionDetails = styled.div`
  // @media (max-width: 768px) {
  //   margin-bottom: ${theme.spacing.sm};
  // }
  @media (max-width: 768px) {
    grid-area: details;
    padding: ${theme.spacing.sm} 0;
    border-top: 1px dashed ${theme.colors.border.light};
    border-bottom: 1px dashed ${theme.colors.border.light};
  }
`;

const InfoLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-right: ${theme.spacing.xs};
  
  // @media (max-width: 768px) {
  //   display: block;
  //   margin-bottom: ${theme.spacing.xs};
  // }
`;

const TransactionAmount = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${({ positive }) => positive ? theme.colors.success.main : theme.colors.error.main};

  @media (max-width: 768px) {
    grid-area: amount;
    font-size: ${theme.typography.fontSize.lg};
    padding: ${theme.spacing.xs} 0;
  }
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  
  svg {
    color: ${theme.colors.text.secondary};
    opacity: 0.6;
  }
  
  p {
    margin: 0;
  }
`;

const RemarkInfo = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  margin-top: ${theme.spacing.xs};
`;

const UserTransactions = () => {
  // State for filters and pagination
  // const [filters, setFilters] = useState({
  //   type: '',
  //   amount: '',
  //   operator: 'gte',
  //   page: 1,
  //   limit: 10
  // });

  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    amount: searchParams.get('amount') || '',
    operator: searchParams.get('operator') || 'gte',
    page: 1,
    limit: 10,
    promotionId: searchParams.get('promotionId') || '',
    relatedId: searchParams.get('relatedId') || '',
  });

  useEffect(() => {
    const newParams = new URLSearchParams();
  
    if (filters.type) newParams.set('type', filters.type);
    if (filters.amount) newParams.set('amount', filters.amount);
    if (filters.operator) newParams.set('operator', filters.operator);
    if (filters.promotionId) newParams.set('promotionId', filters.promotionId);
    if (filters.relatedId) newParams.set('relatedId', filters.relatedId);
    // newParams.set('page', filters.page);
    // newParams.set('limit', filters.limit);
  
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  
  // Fetch transactions with the current filters
  const { 
    transactions, 
    totalCount, 
    isLoading 
  } = useUserTransactions(filters);
  
  // Handle filter changes
  // const handleFilterChange = (key, value) => {
  //   setFilters(prev => {
  //     // If changing a filter value, reset to page 1
  //     const newFilters = key === 'page' ? { ...prev, [key]: value } : { ...prev, [key]: value, page: 1 };
  //     return newFilters;
  //   });
  // };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Reset to page 1 when changing any filter except page/limit
      if (key !== 'page' && key !== 'limit') {
        newFilters.page = 1;
      }
      
      return newFilters;
    });
  };
  const isRelatedIdEditable = filters.type !== '';
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format time for display
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get the appropriate icon for a transaction type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <FaPlus />;
      case 'redemption':
        return <FaMinus />;
      case 'transfer':
        return <FaExchangeAlt />;
      case 'adjustment':
        return <FaExchangeAlt />;
      case 'event':
        return <FaCalendarAlt />;
      default:
        return <FaExchangeAlt />;
    }
  };
  
  // Format transaction label for display
  const getTransactionLabel = (transaction) => {
    switch (transaction.type) {
      case 'purchase':
        return `Purchase - $${transaction.spent?.toFixed(2) || '0.00'}`;
      case 'redemption':
        if (transaction.processedBy) {
          return `Redemption - Completed`;
        }
        return `Redemption - Pending`;
      case 'transfer':
        if (transaction.amount > 0) {
          if (transaction.senderName && transaction.sender) {
            return `Transfer from ${transaction.senderName} (${transaction.sender})`;
          }
          return `Transfer from ${transaction.sender || transaction.senderName || 'user'}`;
        }
        if (transaction.recipientName && transaction.recipient) {
          return `Transfer to ${transaction.recipientName} (${transaction.recipient})`;
        }
        return `Transfer to ${transaction.recipient || transaction.recipientName || 'user'}`;
      case 'adjustment':
        return `Adjustment from ${transaction.createdBy || 'manager'}`;
      case 'event':
        return `Event Reward - ${transaction.relatedId || 'Event'}`;
      default:
        return 'Transaction';
    }
  };
  
  // Check if transaction amount is positive
  const isPositiveTransaction = (transaction) => {
    return transaction.amount > 0;
  };
  
  // Format amount for display
  const formatAmount = (amount) => {
    return `${amount > 0 ? '+' : ''}${amount} pts`;
  };
  
  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(filters.page * filters.limit, totalCount);
  
  return (
    <div>
      <TransactionFilters
        filters={filters}
        handleFilterChange={handleFilterChange}
        isRelatedIdEditable={isRelatedIdEditable}
        title="My Transactions"
      />
      
      <Card>
        {isLoading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : transactions.length > 0 ? (
          <>
            <TableHeader>
              <div>Type</div>
              <div>Transaction</div>
              <div>Details</div>
              <div>Amount</div>
            </TableHeader>
            
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TransactionIcon type={transaction.type}>
                  {getTransactionIcon(transaction.type)}
                </TransactionIcon>
                
                {/* <TransactionInfo>
                  <MobileLabel>Transaction:</MobileLabel>
                  <div>
                    <TransactionId>Transaction #{transaction.id}</TransactionId>
                    <TransactionType>{transaction.type}</TransactionType>
                  </div>
                </TransactionInfo> */}

                <TransactionInfo>
                  <TransactionId>Transaction #{transaction.id}</TransactionId>
                  <TransactionType>{transaction.type}</TransactionType>
                </TransactionInfo>
                
                <TransactionDetails>
                  <MobileLabel>Details:</MobileLabel>
                  <div>
                    <div>
                      <TransactionType>{getTransactionLabel(transaction)}</TransactionType>
                    </div>
                    {transaction.remark && (
                      <RemarkInfo>
                        <InfoLabel>Remark:</InfoLabel> {transaction.remark}
                      </RemarkInfo>
                    )}
                    {transaction.createdAt && (
                      <div>
                        <InfoLabel>Date:</InfoLabel> {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
                      </div>
                    )}
                  </div>
                </TransactionDetails>
                
                <TransactionAmount positive={isPositiveTransaction(transaction)}>
                  <MobileLabel>Amount:</MobileLabel>
                  {formatAmount(transaction.amount)}
                </TransactionAmount>
              </TableRow>
            ))}
          </>
        ) : (
          <EmptyState>
            <FaInfoCircle size={48} />
            <p>No transactions found matching your criteria.</p>
          </EmptyState>
        )}
      </Card>
      
      {transactions.length > 0 && (
        <PageControls>
          <PageInfo>
            Showing {startIndex} to {endIndex} of {totalCount} transactions
          </PageInfo>
          
          <Pagination>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleFilterChange('page', filters.page - 1)}
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
              Page {filters.page} of {totalPages}
            </PageInfo>
            
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page === totalPages}
              style={{ minWidth: '80px' }}
            >
              Next <FaChevronRight />
            </Button>
          </Pagination>
        </PageControls>
      )}
    </div>
  );
};

export default UserTransactions; 
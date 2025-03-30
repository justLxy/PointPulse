import React from 'react';
import styled from '@emotion/styled';
import Button from '../common/Button';
import Badge from '../common/Badge';
import theme from '../../styles/theme';
import { 
  FaCheck, 
  FaEye, 
  FaPlus, 
  FaMinus, 
  FaExchangeAlt, 
  FaExclamationTriangle
} from 'react-icons/fa';

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr 1fr 150px 120px 150px;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.light};
  align-items: center;
  
  &:hover {
    background-color: ${theme.colors.background.default};
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 80px 1fr 1fr 120px 120px;
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
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
        return `
          background-color: ${theme.colors.secondary.light};
          color: ${theme.colors.secondary.dark};
        `;
      case 'redemption':
        return `
          background-color: ${theme.colors.accent.light};
          color: ${theme.colors.accent.dark};
        `;
      case 'transfer':
        return `
          background-color: ${theme.colors.primary.light};
          color: ${theme.colors.primary.dark};
        `;
      case 'adjustment':
        return `
          background-color: ${theme.colors.info.light};
          color: ${theme.colors.info.dark};
        `;
      case 'event':
        return `
          background-color: ${theme.colors.success.light};
          color: ${theme.colors.success.dark};
        `;
      default:
        return `
          background-color: ${theme.colors.border.light};
          color: ${theme.colors.text.secondary};
        `;
    }
  }}
`;

const MobileLabel = styled.span`
  display: none;
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-right: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    display: inline;
  }
`;

const TransactionInfo = styled.div`
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: ${theme.spacing.sm};
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

const TransactionUser = styled.div`
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.sm};
  }
`;

const TransactionAmount = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${({ positive }) => positive ? theme.colors.success.main : theme.colors.error.main};
`;

const TransactionDate = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.sm};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    width: 100%;
    justify-content: flex-end;
  }
`;

const TransactionItem = ({ 
  transaction, 
  formatDate, 
  formatTime, 
  getTransactionIcon, 
  getRelatedDescription, 
  isSuperuser, 
  handleViewTransaction, 
  handleMarkAsSuspiciousClick, 
  handleApproveTransactionClick 
}) => {
  // Check if transaction exists
  if (!transaction) return null;
  
  // For formatting positive/negative amounts
  const isPositive = ['purchase', 'transfer_in', 'adjustment_add', 'event'].includes(transaction.type);
  
  // Display transaction type in more user-friendly format
  const formatTransactionType = (type) => {
    switch (type) {
      case 'transfer_in': return 'Transfer In';
      case 'transfer_out': return 'Transfer Out';
      case 'adjustment_add': return 'Point Increase';
      case 'adjustment_remove': return 'Point Decrease';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  return (
    <TableRow>
      <TransactionIcon type={transaction.type.split('_')[0]}>
        {getTransactionIcon(transaction.type)}
      </TransactionIcon>
      
      <TransactionInfo>
        <div>
          <MobileLabel>ID:</MobileLabel>
          <TransactionId>{transaction.id}</TransactionId>
          <TransactionType>{formatTransactionType(transaction.type)}</TransactionType>
        </div>
        {transaction.suspicious && (
          <Badge color="error">Suspicious</Badge>
        )}
        {transaction.type === 'redemption' && transaction.status === 'pending' && (
          <Badge color="warning">Pending</Badge>
        )}
        {transaction.type === 'redemption' && transaction.status === 'approved' && (
          <Badge color="success">Approved</Badge>
        )}
        {transaction.type === 'redemption' && transaction.status === 'rejected' && (
          <Badge color="error">Rejected</Badge>
        )}
      </TransactionInfo>
      
      <TransactionUser>
        <MobileLabel>User:</MobileLabel>
        <div>{transaction.userName || transaction.userEmail || 'Unknown User'}</div>
        <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
          {getRelatedDescription(transaction)}
        </div>
      </TransactionUser>
      
      <TransactionAmount positive={isPositive}>
        <MobileLabel>Amount:</MobileLabel>
        {isPositive ? '+' : '-'} {Math.abs(transaction.amount)} points
      </TransactionAmount>
      
      <TransactionDate>
        <MobileLabel>Date:</MobileLabel>
        <div>{formatDate(transaction.createdAt)}</div>
        <div>{formatTime(transaction.createdAt)}</div>
      </TransactionDate>
      
      <ActionButtons>
        <Button size="small" variant="outlined" onClick={() => handleViewTransaction(transaction)}>
          <FaEye />
        </Button>
        
        {isSuperuser && transaction.type === 'redemption' && transaction.status === 'pending' && (
          <Button 
            size="small" 
            variant="outlined" 
            color="success" 
            onClick={() => handleApproveTransactionClick(transaction)}
          >
            <FaCheck />
          </Button>
        )}
        
        {isSuperuser && !transaction.suspicious && (
          <Button 
            size="small" 
            variant="outlined" 
            color="error"
            onClick={() => handleMarkAsSuspiciousClick(transaction)}
          >
            <FaExclamationTriangle />
          </Button>
        )}
      </ActionButtons>
    </TableRow>
  );
};

export default TransactionItem; 
import React from 'react';
import styled from '@emotion/styled';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import theme from '../../styles/theme';
import { FaExclamationTriangle } from 'react-icons/fa';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const ModalSection = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.primary};
`;

const DetailRow = styled.div`
  display: flex;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-of-type {
    border-bottom: none;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: ${theme.spacing.xs};
  }
`;

const DetailLabel = styled.div`
  width: 150px;
  min-width: 150px;
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.secondary};
  
  @media (max-width: 640px) {
    width: 100%;
  }
`;

const DetailValue = styled.div`
  flex: 1;
`;

const TransactionAmount = styled.div`
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${({ positive }) => positive ? theme.colors.success.main : theme.colors.error.main};
  font-size: ${theme.typography.fontSize.lg};
`;

const TypeBadge = styled(Badge)`
  text-transform: capitalize;
`;

const WarningBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
  background-color: ${theme.colors.error.light}20;
  border-radius: ${theme.radius.md};
  
  svg {
    color: ${theme.colors.error.main};
    font-size: 24px;
    margin-bottom: ${theme.spacing.sm};
  }
  
  strong {
    font-size: ${theme.typography.fontSize.lg};
    margin-bottom: ${theme.spacing.sm};
  }
  
  p {
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.sm};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  justify-content: flex-end;
  
  button {
    flex: 1;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const ViewTransactionModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  formatDate, 
  formatTime 
}) => {
  if (!transaction) return null;
  
  // For formatting positive/negative amounts
  const isPositive = ['purchase', 'transfer_in', 'adjustment_add', 'event'].includes(transaction.type);
  
  // Format transaction type for display
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transaction Details: ${transaction.id}`}
      size="medium"
    >
      <ModalContent>
        <ModalSection>
          <DetailRow>
            <DetailLabel>Transaction Type</DetailLabel>
            <DetailValue>
              <TypeBadge color={
                transaction.type.includes('purchase') ? 'secondary' :
                transaction.type.includes('redemption') ? 'accent' :
                transaction.type.includes('transfer') ? 'primary' :
                transaction.type.includes('adjustment') ? 'info' :
                transaction.type.includes('event') ? 'success' : 'default'
              }>
                {formatTransactionType(transaction.type)}
              </TypeBadge>
              
              {transaction.suspicious && (
                <Badge color="error" style={{ marginLeft: theme.spacing.sm }}>Suspicious</Badge>
              )}
              
              {transaction.type === 'redemption' && transaction.status && (
                <Badge 
                  color={
                    transaction.status === 'pending' ? 'warning' :
                    transaction.status === 'approved' ? 'success' :
                    transaction.status === 'rejected' ? 'error' : 'default'
                  }
                  style={{ marginLeft: theme.spacing.sm }}
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              )}
            </DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Amount</DetailLabel>
            <DetailValue>
              <TransactionAmount positive={isPositive}>
                {isPositive ? '+' : '-'} {Math.abs(transaction.amount)} points
              </TransactionAmount>
            </DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>Date & Time</DetailLabel>
            <DetailValue>
              {formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}
            </DetailValue>
          </DetailRow>
          
          <DetailRow>
            <DetailLabel>User</DetailLabel>
            <DetailValue>{transaction.userName || transaction.userEmail || 'Unknown User'}</DetailValue>
          </DetailRow>
          
          {transaction.relatedPromotion && (
            <DetailRow>
              <DetailLabel>Promotion</DetailLabel>
              <DetailValue>{transaction.relatedPromotion.name || transaction.relatedPromotion.id}</DetailValue>
            </DetailRow>
          )}
          
          {transaction.relatedEvent && (
            <DetailRow>
              <DetailLabel>Event</DetailLabel>
              <DetailValue>{transaction.relatedEvent.name || transaction.relatedEvent.id}</DetailValue>
            </DetailRow>
          )}
          
          {transaction.description && (
            <DetailRow>
              <DetailLabel>Description</DetailLabel>
              <DetailValue>{transaction.description}</DetailValue>
            </DetailRow>
          )}
          
          {transaction.note && (
            <DetailRow>
              <DetailLabel>Note</DetailLabel>
              <DetailValue>{transaction.note}</DetailValue>
            </DetailRow>
          )}
        </ModalSection>
        
        <ModalActions>
          <Button onClick={onClose}>Close</Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export const MarkSuspiciousModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  handleMarkAsSuspicious,
  isMarkingAsSuspicious
}) => {
  if (!transaction) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Transaction as Suspicious"
      size="small"
    >
      <ModalContent>
        <WarningBox>
          <FaExclamationTriangle />
          <strong>Confirm Action</strong>
          <p>
            Are you sure you want to mark transaction <strong>{transaction.id}</strong> as suspicious?
          </p>
          <p>
            This action will flag the transaction for further review and may trigger additional verification processes.
          </p>
        </WarningBox>
        
        <ModalActions>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isMarkingAsSuspicious}
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleMarkAsSuspicious}
            loading={isMarkingAsSuspicious}
          >
            Mark as Suspicious
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export const ApproveRedemptionModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  handleApproveTransaction, 
  isApprovingTransaction 
}) => {
  if (!transaction) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Redemption"
      size="small"
    >
      <ModalContent>
        <DetailRow>
          <DetailLabel>Transaction ID</DetailLabel>
          <DetailValue>{transaction.id}</DetailValue>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>User</DetailLabel>
          <DetailValue>{transaction.userName || transaction.userEmail || 'Unknown User'}</DetailValue>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>Amount</DetailLabel>
          <DetailValue>
            <TransactionAmount positive={false}>
              - {Math.abs(transaction.amount)} points
            </TransactionAmount>
          </DetailValue>
        </DetailRow>
        
        <DetailRow>
          <DetailLabel>Promotion</DetailLabel>
          <DetailValue>
            {transaction.relatedPromotion ? transaction.relatedPromotion.name : 'Unknown Promotion'}
          </DetailValue>
        </DetailRow>
        
        <ModalActions>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isApprovingTransaction}
          >
            Cancel
          </Button>
          <Button
            color="success"
            onClick={handleApproveTransaction}
            loading={isApprovingTransaction}
          >
            Approve Redemption
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

export default {
  ViewTransactionModal,
  MarkSuspiciousModal,
  ApproveRedemptionModal
}; 
import { useState } from 'react';
import styled from '@emotion/styled';
import { useTransactions } from '../../hooks/useTransactions';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import theme from '../../styles/theme';
import { 
  FaSearch, 
  FaExclamationTriangle, 
  FaCheck, 
  FaEye, 
  FaPlus, 
  FaMinus, 
  FaExchangeAlt,
  FaCalendarAlt,
  FaFilter,
  FaUser,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

const SearchInput = styled.div`
  flex: 1;
  min-width: 250px;
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
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const PageInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
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

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  
  button {
    flex: 1;
  }
`;

const DetailItem = styled.div`
  padding: ${theme.spacing.md} 0;
  display: flex;
  justify-content: space-between;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border.light};
  }
  
  strong {
    color: ${theme.colors.text.primary};
  }
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.sm};
  }
`;

const RelatedInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  
  svg {
    color: ${theme.colors.text.secondary};
  }
  
  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${theme.typography.fontWeights.medium};
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  background-color: ${props => 
    props.status === 'suspicious' ? '#FFEBEE' : 
    props.status === 'verified' ? '#E8F5E9' : '#E3F2FD'};
  color: ${props => 
    props.status === 'suspicious' ? '#D32F2F' : 
    props.status === 'verified' ? '#388E3C' : '#1976D2'};
`;

const InfoLabel = styled.span`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-right: ${theme.spacing.xs};
  
  @media (max-width: 768px) {
    display: block;
    margin-bottom: ${theme.spacing.xs};
  }
`;

const Transactions = () => {
  // State for filters and pagination
  const [filters, setFilters] = useState({
    name: '',
    createdBy: '',
    type: '',
    suspicious: '',
    promotionId: '',
    relatedId: '',
    amount: '',
    operator: 'gte',
    page: 1,
    limit: 10,
  });
  
  // Modals state
  const [viewTransactionDetails, setViewTransactionDetails] = useState(false);
  const [markSuspiciousModal, setMarkSuspiciousModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Get transactions with current filters
  const { 
    transactions, 
    totalCount, 
    isLoading, 
    markAsSuspicious, 
    isMarkingAsSuspicious 
  } = useTransactions(filters);
  
  // Calculate pagination
  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(startIndex + filters.limit - 1, totalCount);
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset page when filters change
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get transaction icon
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
  
  // Get related entity description based on transaction type
  const getRelatedDescription = (transaction) => {
    if (!transaction.relatedId) return null;
    
    switch (transaction.type) {
      case 'adjustment':
        return `Transaction #${transaction.relatedId}`;
      case 'transfer':
        // For transfers, relatedId is the other user's ID
        return `User ID: ${transaction.relatedId}`;
      case 'redemption':
        // For redemptions, relatedId is the cashier ID who processed it
        return transaction.relatedId ? `Processed by: ${transaction.relatedId}` : 'Not processed';
      case 'event':
        // For events, relatedId is the event ID
        return `Event #${transaction.relatedId}`;
      default:
        return `Related ID: ${transaction.relatedId}`;
    }
  };
  
  // View transaction details
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setViewTransactionDetails(true);
  };
  
  // Set up transaction for marking as suspicious
  const handleMarkAsSuspiciousClick = (transaction) => {
    setSelectedTransaction(transaction);
    setMarkSuspiciousModal(true);
  };
  
  // Mark transaction as suspicious
  const handleMarkAsSuspicious = () => {
    if (!selectedTransaction) return;
    
    markAsSuspicious(
      { 
        transactionId: selectedTransaction.id, 
        suspicious: !selectedTransaction.suspicious 
      },
      {
        onSuccess: () => {
          setMarkSuspiciousModal(false);
          setSelectedTransaction(null);
        },
      }
    );
  };
  
  return (
    <div>
      <PageTitle>All Transactions</PageTitle>
      
      <FilterSection>
        <SearchInput>
          <Input
            placeholder="Search by user name or UTORid"
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            leftIcon={<FaSearch />}
          />
        </SearchInput>
        
        <FilterInput>
          <Input
            placeholder="Created by (UTORid)"
            value={filters.createdBy}
            onChange={(e) => handleFilterChange('createdBy', e.target.value)}
          />
        </FilterInput>
        
        <FilterInput>
          <Select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            placeholder="Transaction Type"
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="redemption">Redemption</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
            <option value="event">Event</option>
          </Select>
        </FilterInput>
        
        <FilterInput>
          <Select
            value={filters.suspicious}
            onChange={(e) => handleFilterChange('suspicious', e.target.value)}
            placeholder="Status"
          >
            <option value="">All Status</option>
            <option value="true">Suspicious</option>
            <option value="false">Verified</option>
          </Select>
        </FilterInput>

        <FilterInput>
          <Input
            placeholder="Promotion ID"
            type="number"
            value={filters.promotionId}
            onChange={(e) => handleFilterChange('promotionId', e.target.value ? Number(e.target.value) : '')}
          />
        </FilterInput>

        {filters.type && (
          <FilterInput>
            <Input
              placeholder="Related ID"
              type="number"
              value={filters.relatedId}
              onChange={(e) => handleFilterChange('relatedId', e.target.value ? Number(e.target.value) : '')}
            />
          </FilterInput>
        )}
        
        <FilterInput>
          <Select
            value={filters.operator}
            onChange={(e) => handleFilterChange('operator', e.target.value)}
            placeholder="Amount Operator"
          >
            <option value="gte">Greater than or equal to</option>
            <option value="lte">Less than or equal to</option>
          </Select>
        </FilterInput>
        
        <FilterInput>
          <Input
            placeholder="Amount"
            type="number"
            value={filters.amount}
            onChange={(e) => handleFilterChange('amount', e.target.value ? Number(e.target.value) : '')}
          />
        </FilterInput>
      </FilterSection>
      
      <Card>
        {isLoading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : transactions.length > 0 ? (
          <>
            <TableHeader>
              <div>Type</div>
              <div>User</div>
              <div>Details</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Actions</div>
            </TableHeader>
            
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TransactionIcon type={transaction.type}>
                  {getTransactionIcon(transaction.type)}
                </TransactionIcon>
                
                <TransactionUser>
                  <MobileLabel>User:</MobileLabel>
                  <TransactionId>{transaction.utorid}</TransactionId>
                  <TransactionType>{transaction.type}</TransactionType>
                </TransactionUser>
                
                <TransactionInfo>
                  <MobileLabel>Details:</MobileLabel>
                  <div>
                    {transaction.createdAt && (
                      <div>
                        <InfoLabel>Created:</InfoLabel> 
                        {formatDate(transaction.createdAt)} {formatTime(transaction.createdAt)}
                      </div>
                    )}
                    {transaction.remark && (
                      <div>
                        <InfoLabel>Remark:</InfoLabel> {transaction.remark}
                      </div>
                    )}
                    {getRelatedDescription(transaction) && (
                      <RelatedInfo>
                        <InfoLabel>Related:</InfoLabel> {getRelatedDescription(transaction)}
                      </RelatedInfo>
                    )}
                  </div>
                </TransactionInfo>
                
                <TransactionAmount positive={transaction.amount > 0}>
                  <MobileLabel>Amount:</MobileLabel>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} pts
                  {transaction.spent && (
                    <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      ${transaction.spent.toFixed(2)}
                    </div>
                  )}
                </TransactionAmount>
                
                <BadgeContainer>
                  <MobileLabel>Status:</MobileLabel>
                  <StatusBadge 
                    status={transaction.suspicious ? 'suspicious' : 'verified'}
                  >
                    {transaction.suspicious ? 'Suspicious' : 'Verified'}
                  </StatusBadge>
                </BadgeContainer>
                
                <ActionButtons>
                  <Button 
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewTransaction(transaction)}
                    title="View Details"
                  >
                    <FaEye />
                  </Button>
                  
                  <Button 
                    size="small"
                    variant="outlined"
                    color={transaction.suspicious ? 'success' : 'error'}
                    onClick={() => handleMarkAsSuspiciousClick(transaction)}
                    title={transaction.suspicious ? 'Mark as Verified' : 'Mark as Suspicious'}
                  >
                    {transaction.suspicious ? <FaCheck /> : <FaExclamationTriangle />}
                  </Button>
                </ActionButtons>
              </TableRow>
            ))}
            
            <PageControls>
              <PageInfo>
                Showing {startIndex} to {endIndex} of {totalCount} transaction{totalCount !== 1 ? 's' : ''}
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
                  Page {filters.page} of {totalPages || 1}
                </PageInfo>
                
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page >= totalPages}
                >
                  Next <FaChevronRight />
                </Button>
              </Pagination>
            </PageControls>
          </>
        ) : (
          <EmptyState>
            <p>No transactions found</p>
            <p style={{ fontSize: theme.typography.fontSize.sm }}>Try adjusting your filters to see more results.</p>
          </EmptyState>
        )}
      </Card>
      
      {/* Transaction Detail Modal */}
      <Modal
        isOpen={viewTransactionDetails}
        onClose={() => setViewTransactionDetails(false)}
        title={`Transaction #${selectedTransaction?.id || ''}`}
      >
        {selectedTransaction && (
          <ModalContent>
            <DetailItem>
              <strong>Type</strong>
              <span style={{ textTransform: 'capitalize' }}>{selectedTransaction.type}</span>
            </DetailItem>
            
            <DetailItem>
              <strong>User</strong>
              <span>{selectedTransaction.utorid}</span>
            </DetailItem>
            
            <DetailItem>
              <strong>Amount</strong>
              <span style={{ 
                color: selectedTransaction.amount > 0 ? theme.colors.success.main : theme.colors.error.main,
                fontWeight: theme.typography.fontWeights.medium
              }}>
                {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount} pts
              </span>
            </DetailItem>
            
            {selectedTransaction.spent && (
              <DetailItem>
                <strong>Spent</strong>
                <span>${selectedTransaction.spent.toFixed(2)}</span>
              </DetailItem>
            )}
            
            {selectedTransaction.redeemed && (
              <DetailItem>
                <strong>Redeemed</strong>
                <span>{selectedTransaction.redeemed} pts</span>
              </DetailItem>
            )}
            
            {selectedTransaction.createdBy && (
              <DetailItem>
                <strong>Created By</strong>
                <span>{selectedTransaction.createdBy}</span>
              </DetailItem>
            )}
            
            {selectedTransaction.relatedId && (
              <DetailItem>
                <strong>Related ID</strong>
                <span>{getRelatedDescription(selectedTransaction)}</span>
              </DetailItem>
            )}
            
            {selectedTransaction.promotionIds && selectedTransaction.promotionIds.length > 0 && (
              <DetailItem>
                <strong>Promotions</strong>
                <div>
                  {selectedTransaction.promotionIds.map((id) => (
                    <Badge key={id}>Promotion #{id}</Badge>
                  ))}
                </div>
              </DetailItem>
            )}
            
            <DetailItem>
              <strong>Status</strong>
              <StatusBadge 
                status={selectedTransaction.suspicious ? 'suspicious' : 'verified'}
              >
                {selectedTransaction.suspicious ? 'Suspicious' : 'Verified'}
              </StatusBadge>
            </DetailItem>
            
            {selectedTransaction.remark && (
              <DetailItem>
                <strong>Remark</strong>
                <span>{selectedTransaction.remark}</span>
              </DetailItem>
            )}
            
            {selectedTransaction.createdAt && (
              <DetailItem>
                <strong>Date</strong>
                <span>{formatDate(selectedTransaction.createdAt)} {formatTime(selectedTransaction.createdAt)}</span>
              </DetailItem>
            )}
            
            <ModalActions>
              <Button onClick={() => setViewTransactionDetails(false)}>
                Close
              </Button>
              
              <Button
                onClick={() => {
                  setViewTransactionDetails(false);
                  handleMarkAsSuspiciousClick(selectedTransaction);
                }}
                variant="outlined"
                color={selectedTransaction.suspicious ? 'success' : 'error'}
              >
                {selectedTransaction.suspicious ? 'Mark as Verified' : 'Mark as Suspicious'}
              </Button>
            </ModalActions>
          </ModalContent>
        )}
      </Modal>
      
      {/* Mark as Suspicious Modal */}
      <Modal
        isOpen={markSuspiciousModal}
        onClose={() => setMarkSuspiciousModal(false)}
        title={selectedTransaction?.suspicious ? 'Mark Transaction as Verified' : 'Mark Transaction as Suspicious'}
      >
        {selectedTransaction && (
          <ModalContent>
            <p>
              Are you sure you want to mark transaction #{selectedTransaction.id} as 
              {selectedTransaction.suspicious ? ' verified' : ' suspicious'}?
            </p>
            
            {selectedTransaction.suspicious ? (
              <p>
                This will credit {Math.abs(selectedTransaction.amount)} points back to {selectedTransaction.utorid}'s account.
              </p>
            ) : (
              <p>
                This will deduct {Math.abs(selectedTransaction.amount)} points from {selectedTransaction.utorid}'s account.
              </p>
            )}
            
            <ModalActions>
              <Button variant="outlined" onClick={() => setMarkSuspiciousModal(false)}>
                Cancel
              </Button>
              
              <Button 
                onClick={handleMarkAsSuspicious} 
                loading={isMarkingAsSuspicious}
                color={selectedTransaction.suspicious ? 'success' : 'error'}
              >
                Confirm
              </Button>
            </ModalActions>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
};

export default Transactions; 
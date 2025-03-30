import { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuth } from '../../contexts/AuthContext';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import TransactionList from '../../components/transactions/TransactionList';
import { ViewTransactionModal, MarkSuspiciousModal, ApproveRedemptionModal } from '../../components/transactions/TransactionModals';
import { 
  FaPlus, 
  FaMinus, 
  FaExchangeAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

const Transactions = () => {
  const { activeRole } = useAuth();
  const isSuperuser = activeRole === 'superuser';
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    suspicious: '',
    status: '',
    sortBy: 'createdAt:desc',
    page: 1,
    limit: 10,
  });
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspiciousModalOpen, setSuspiciousModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      // If changing a filter value other than page, reset to page 1
      const newFilters = key === 'page' ? { ...prev, [key]: value } : { ...prev, [key]: value, page: 1 };
      return newFilters;
    });
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
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
  
  // Get icon for transaction type
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <FaPlus />;
      case 'redemption':
        return <FaMinus />;
      case 'transfer_in':
      case 'transfer_out':
        return <FaExchangeAlt />;
      case 'adjustment_add':
        return <FaPlus />;
      case 'adjustment_remove':
        return <FaMinus />;
      case 'event':
        return <FaPlus />;
      default:
        return <FaExclamationTriangle />;
    }
  };
  
  // Get description for related entity
  const getRelatedDescription = (transaction) => {
    if (transaction.type === 'purchase' && transaction.relatedPromotion) {
      return `${transaction.relatedPromotion.name || 'Promotion'}`;
    }
    
    if (transaction.type === 'redemption' && transaction.relatedPromotion) {
      return `${transaction.relatedPromotion.name || 'Redemption'}`;
    }
    
    if (transaction.type.includes('transfer')) {
      return `${transaction.type === 'transfer_in' ? 'From' : 'To'}: ${transaction.relatedUser?.name || transaction.relatedUser?.email || 'Unknown User'}`;
    }
    
    if (transaction.type.includes('adjustment')) {
      return transaction.note || (transaction.type === 'adjustment_add' ? 'Points added' : 'Points removed');
    }
    
    if (transaction.type === 'event' && transaction.relatedEvent) {
      return `Event: ${transaction.relatedEvent.name || 'Unknown Event'}`;
    }
    
    return transaction.description || '';
  };
  
  // Handle view transaction details
  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setViewModalOpen(true);
  };
  
  // Handle mark as suspicious click
  const handleMarkAsSuspiciousClick = (transaction) => {
    setSelectedTransaction(transaction);
    setSuspiciousModalOpen(true);
  };
  
  // Handle approve transaction click
  const handleApproveTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setApproveModalOpen(true);
  };
  
  // Mark transaction as suspicious
  const handleMarkAsSuspicious = () => {
    if (!selectedTransaction) return;
    
    markAsSuspicious(selectedTransaction.id, {
      onSuccess: () => {
        setSuspiciousModalOpen(false);
      },
    });
  };
  
  // Approve redemption transaction
  const handleApproveTransaction = () => {
    if (!selectedTransaction) return;
    
    approveRedemption(selectedTransaction.id, {
      onSuccess: () => {
        setApproveModalOpen(false);
      },
    });
  };
  
  // Fetch transactions using our hook
  const { 
    transactions, 
    isLoading, 
    totalCount,
    markAsSuspicious,
    approveRedemption,
    isMarkingAsSuspicious,
    isApprovingRedemption,
  } = useTransactions(filters);
  
  // Calculate table pagination values
  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = startIndex + transactions.length - 1;
  
  return (
    <div>
      <TransactionFilters 
        filters={filters}
        handleFilterChange={handleFilterChange}
        isSuperuser={isSuperuser}
      />
      
      <TransactionList 
        isLoading={isLoading}
        transactions={transactions}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCount={totalCount}
        totalPages={totalPages}
        filters={filters}
        handleFilterChange={handleFilterChange}
        formatDate={formatDate}
        formatTime={formatTime}
        getTransactionIcon={getTransactionIcon}
        getRelatedDescription={getRelatedDescription}
        isSuperuser={isSuperuser}
        handleViewTransaction={handleViewTransaction}
        handleMarkAsSuspiciousClick={handleMarkAsSuspiciousClick}
        handleApproveTransactionClick={handleApproveTransactionClick}
      />
      
      {/* Modals */}
      <ViewTransactionModal 
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        formatDate={formatDate}
        formatTime={formatTime}
      />
      
      <MarkSuspiciousModal 
        isOpen={suspiciousModalOpen}
        onClose={() => {
          setSuspiciousModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        handleMarkAsSuspicious={handleMarkAsSuspicious}
        isMarkingAsSuspicious={isMarkingAsSuspicious}
      />
      
      <ApproveRedemptionModal 
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        handleApproveTransaction={handleApproveTransaction}
        isApprovingTransaction={isApprovingRedemption}
      />
    </div>
  );
};

export default Transactions; 
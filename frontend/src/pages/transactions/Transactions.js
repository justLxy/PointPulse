import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
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
  const isManager = activeRole === 'manager' || activeRole === 'superuser';

  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for filters and pagination
  // const [filters, setFilters] = useState({
  //   name: '',
  //   createdBy: '',
  //   type: '',
  //   relatedId: '',
  //   promotionId: '',
  //   amount: '',
  //   operator: 'gte',
  //   suspicious: '',
  //   page: 1,
  //   limit: 10,
  // });

  const [filters, setFilters] = useState({
    name: searchParams.get('name') || '',
    createdBy: searchParams.get('createdBy') || '',
    type: searchParams.get('type') || '',
    relatedId: searchParams.get('relatedId') || '',
    promotionId: searchParams.get('promotionId') || '',
    amount: searchParams.get('amount') || '',
    operator: searchParams.get('operator') || 'gte',
    suspicious: searchParams.get('suspicious') || '',
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
  const getTransactionDetailsLabel = (transaction) => {
    if (transaction.type.includes('transfer')) {
      console.log('Inspecting transfer transaction:', transaction);
    }
    switch(transaction.type) {
      case 'purchase':
        return transaction.relatedPromotion 
          ? `Promotion: ${transaction.relatedPromotion.name || 'Applied'}` 
          : `Purchase - $${transaction.spent?.toFixed(2) || '0.00'}`;
      case 'redemption':
        const status = transaction.processedBy ? 'Completed' : 'Pending';
        return `Redemption - ${status}`;
      case 'transfer': 
        if (transaction.amount < 0) {
          return `Transfer to: ${transaction.relatedUser?.name || transaction.relatedUser?.utorid || 'Unknown User'}`;
        } else {
          return `Transfer from: ${transaction.relatedUser?.name || transaction.relatedUser?.utorid || 'Unknown User'}`;
        }
      case 'transfer_in':
        return `Transfer from: ${transaction.relatedUser?.name || transaction.relatedUser?.utorid || 'Unknown User'}`;
      case 'transfer_out':
        return `Transfer to: ${transaction.relatedUser?.name || transaction.relatedUser?.utorid || 'Unknown User'}`;
      case 'adjustment_add':
      case 'adjustment_remove':
        return transaction.note || (transaction.type === 'adjustment_add' ? 'Points Added' : 'Points Removed');
      case 'event':
        return `Event Reward: ${transaction.relatedEvent?.name || 'Event'}`;
      default:
        return transaction.description || '';
    }
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
  const handleMarkAsSuspicious = (newSuspiciousStatus) => {
    if (!selectedTransaction) return;
    
    markAsSuspicious(
      { 
        transactionId: selectedTransaction.id, 
        suspicious: newSuspiciousStatus
      }, 
      {
        onSuccess: () => {
          setSuspiciousModalOpen(false);
          // Optionally refetch transactions list after successful update
          refetch(); 
        },
      }
    );
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

  useEffect(() => {
    const newParams = new URLSearchParams();

    // Add filters to search params if they exist
    for (const [key, value] of Object.entries(filters)) {
      if (key !== 'page' && key !== 'limit' && value) {
        newParams.set(key, value);
      }
    }

    setSearchParams(newParams);
  }, [filters, setSearchParams]);
  
  // Fetch transactions using our hook
  const { 
    transactions, 
    isLoading, 
    totalCount,
    markAsSuspicious,
    approveRedemption,
    isMarkingAsSuspicious,
    isApprovingRedemption,
    refetch,
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
        isManager={isManager}
        isRelatedIdEditable={isRelatedIdEditable}
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
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import useUserTransactions from '../../hooks/useUserTransactions';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import theme from '../../styles/theme';
import { FaUser, FaExchangeAlt, FaCheck, FaSearch, FaCoins } from 'react-icons/fa';
import UserService from '../../services/user.service';
import { useAuth } from '../../contexts/AuthContext';

const TransferOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const TransferOption = styled.button`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.default};
  border: 2px solid ${({ active }) => active ? theme.colors.primary.main : theme.colors.border.light};
  border-radius: ${theme.radius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.quick};
  
  span:first-of-type {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.bold};
    color: ${theme.colors.primary.main};
    margin-bottom: ${theme.spacing.xs};
  }
  
  span:last-of-type {
    font-size: ${theme.typography.fontSize.xs};
    color: ${theme.colors.text.secondary};
  }
  
  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary.main};
    background-color: rgba(52, 152, 219, 0.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CustomOption = styled.div`
  margin-top: ${theme.spacing.md};
`;

const TransferSuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.radius.full};
  background-color: ${theme.colors.success.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${theme.typography.fontSize.xl};
  margin-bottom: ${theme.spacing.lg};
`;

const TransferInfo = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  
  p {
    margin: ${theme.spacing.xs} 0;
  }
  
  strong {
    color: ${theme.colors.primary.main};
    font-weight: ${theme.typography.fontWeights.semiBold};
  }
`;

const TransferInstructions = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing.md};
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 4px solid ${theme.colors.error.main};
  color: ${theme.colors.error.main};
  margin-bottom: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.sm};
  border-radius: ${theme.radius.sm};
`;

const SearchContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  align-items: flex-start;
  position: relative;
`;

const UserSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.lg};
  border: 1px solid ${theme.colors.border.light};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${theme.spacing.xs};
`;

const UserInfoText = styled.div`
  h3 {
    margin: 0;
    font-size: ${theme.typography.fontSize.lg};
    font-weight: ${theme.typography.fontWeights.semiBold};
  }
  
  p {
    margin: ${theme.spacing.xs} 0 0;
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.sm};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.radius.full};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrastText};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeights.bold};
  margin-right: ${theme.spacing.md};
`;

const TransferModal = ({ isOpen, onClose, availablePoints = 0 }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [receiverUtorid, setReceiverUtorid] = useState('');
  const [foundReceiver, setFoundReceiver] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [transferId, setTransferId] = useState(null);
  
  const { transferPoints, isTransferringPoints } = useUserTransactions();
  
  // Predefined amounts for quick selection
  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];
  
  // 当用户输入UTORid时，自动搜索用户
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (receiverUtorid.trim().length >= 3) {
        handleSearchUser();
      } else if (receiverUtorid.trim().length === 0) {
        setFoundReceiver(null);
      }
    }, 300); // 300ms防抖
    
    return () => clearTimeout(searchTimeout);
  }, [receiverUtorid]);
  
  const resetForm = () => {
    setStep(1);
    setSelectedAmount(null);
    setCustomAmount('');
    setReceiverUtorid('');
    setFoundReceiver(null);
    setRemark('');
    setError('');
    setTransferId(null);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSelectAmount = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setError('');
  };
  
  const handleCustomAmountChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/\D/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
    setError('');
  };
  
  const getTransferAmount = () => {
    return selectedAmount || (customAmount ? parseInt(customAmount) : 0);
  };
  
  const validateAmount = () => {
    const amount = getTransferAmount();
    
    if (!amount) {
      setError('Please select or enter a valid amount');
      return false;
    }
    
    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return false;
    }
    
    if (amount > availablePoints) {
      setError('You do not have enough points');
      return false;
    }
    
    return true;
  };
  
  const validateReceiver = () => {
    if (!foundReceiver) {
      setError('Please search for a valid user first');
      return false;
    }
    
    return true;
  };
  
  const handleSearchUser = async () => {
    if (!receiverUtorid.trim()) {
      return;
    }
    
    // Check if user is trying to transfer to themselves
    if (receiverUtorid.toLowerCase() === currentUser.utorid.toLowerCase()) {
      setError('You cannot transfer points to yourself');
      setFoundReceiver(null);
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      const user = await UserService.searchUserByUTORid(receiverUtorid);
      if (user) {
        // Double check that the user isn't transferring to themselves
        if (user.id === currentUser.id) {
          setError('You cannot transfer points to yourself');
          setFoundReceiver(null);
          return;
        }
        setFoundReceiver(user);
      } else {
        setFoundReceiver(null);
        if (receiverUtorid.trim().length >= 5) {
          setError('User not found. Please check the UTORid');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to search for user');
      setFoundReceiver(null);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleProceed = () => {
    if (validateAmount()) {
      setStep(2);
    }
  };
  
  const handleTransfer = async () => {
    try {
      if (!validateAmount() || !validateReceiver()) {
        return;
      }
      
      const amount = getTransferAmount();
      
      // 先关闭模态框，再调用转账函数
      handleClose();
      
      // 调用转账函数
      transferPoints({
        userId: foundReceiver.id,
        amount,
        remark,
      });
    } catch (err) {
      setError(err.message || 'Failed to transfer points');
    }
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const renderStep1 = () => (
    <>
      <TransferInstructions>
        Select the amount of points you'd like to transfer to another user.
      </TransferInstructions>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <TransferOptions>
        {presetAmounts.map((amount) => (
          <TransferOption
            key={amount}
            active={selectedAmount === amount}
            onClick={() => handleSelectAmount(amount)}
            disabled={amount > availablePoints}
          >
            <span>{amount}</span>
            <span>Points</span>
          </TransferOption>
        ))}
      </TransferOptions>
      
      <CustomOption>
        <Input
          label="Custom amount"
          value={customAmount}
          onChange={handleCustomAmountChange}
          placeholder="Enter points amount"
          helperText={`Maximum: ${availablePoints} points`}
          error={customAmount && (parseInt(customAmount) > availablePoints) ? 'Exceeds available points' : ''}
        />
      </CustomOption>
      
      <Button 
        onClick={handleProceed}
        disabled={!getTransferAmount() || getTransferAmount() > availablePoints}
        fullWidth
        style={{ marginTop: theme.spacing.lg }}
      >
        Continue
      </Button>
    </>
  );
  
  const renderStep2 = () => (
    <>
      <TransferInstructions>
        Enter the UTORid of the user you want to transfer {getTransferAmount()} points to.
      </TransferInstructions>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <SearchContainer>
        <Input
          label="Recipient UTORid"
          value={receiverUtorid}
          onChange={(e) => setReceiverUtorid(e.target.value)}
          placeholder="Enter recipient's UTORid"
          style={{ flex: 1 }}
        />
      </SearchContainer>
      
      {isSearching && <div style={{ textAlign: 'center', margin: '10px 0' }}>Searching...</div>}
      
      {foundReceiver && (
        <UserSection>
          <UserInfo>
            <Avatar>{getInitials(foundReceiver.name)}</Avatar>
            <UserInfoText>
              <h3>{foundReceiver.name}</h3>
              <p>
                {foundReceiver.utorid}
                <Badge verified={foundReceiver.verified}>
                  {foundReceiver.verified ? 'Verified' : 'Not Verified'}
                </Badge>
              </p>
              <p>Current Points: {foundReceiver.points || 0}</p>
            </UserInfoText>
          </UserInfo>
        </UserSection>
      )}
      
      <Input
        label="Remark (Optional)"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="Add a note about this transfer"
      />
      
      <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        <Button 
          variant="outlined"
          onClick={() => setStep(1)}
          style={{ flex: 1 }}
        >
          Back
        </Button>
        
        <Button 
          onClick={handleTransfer}
          disabled={!foundReceiver || isTransferringPoints}
          loading={isTransferringPoints}
          style={{ flex: 1 }}
        >
          Transfer Points
        </Button>
      </div>
    </>
  );
  
  const renderStep3 = () => (
    <TransferSuccessContainer>
      <SuccessIcon>
        <FaCheck />
      </SuccessIcon>
      
      <h2>Transfer Successful!</h2>
      <p>You have successfully transferred {getTransferAmount()} points to {foundReceiver?.name || 'the recipient'}.</p>
      
      <TransferInfo>
        <p><strong>Transaction ID:</strong> {transferId}</p>
        <p><strong>Amount:</strong> {getTransferAmount()} points</p>
        <p><strong>Recipient:</strong> {foundReceiver?.name} ({foundReceiver?.utorid})</p>
        {remark && <p><strong>Remark:</strong> {remark}</p>}
      </TransferInfo>
      
      <Button 
        onClick={handleClose}
        style={{ marginTop: theme.spacing.lg }}
      >
        Close
      </Button>
    </TransferSuccessContainer>
  );
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={step === 3 ? "Transfer Complete" : "Transfer Points"}
      size="medium"
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Modal>
  );
};

export default TransferModal; 
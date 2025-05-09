import { useState } from 'react';
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
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    margin: 0;
    border-radius: ${theme.radius.full};
  }
`;

const TransferModal = ({ isOpen, onClose, availablePoints = 0 }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [receiverUtorid, setReceiverUtorid] = useState('');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  
  const { transferPoints, isTransferringPoints } = useUserTransactions();
  
  // Predefined amounts for quick selection
  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];
  
  const resetForm = () => {
    setStep(1);
    setSelectedAmount(null);
    setCustomAmount('');
    setReceiverUtorid('');
    setRemark('');
    setError('');
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
  
  const handleProceed = () => {
    setError(''); // Clear previous errors
    if (validateAmount()) {
      setStep(2);
    }
  };
  
  const handleTransfer = async () => {
    setError(''); // Clear previous errors
    const recipientUtoridTrimmed = receiverUtorid.trim();

    if (!recipientUtoridTrimmed) {
      setError('Please enter the recipient UTORid');
      return;
    }

    if (recipientUtoridTrimmed.toLowerCase() === currentUser.utorid.toLowerCase()) {
      setError('You cannot transfer points to yourself');
      return;
    }

    if (!validateAmount()) {
      return;
    }
    
    const amount = getTransferAmount();
    
    try {
      // Call transferPoints directly with the UTORid string
      // The hook will handle success/error toasts and state updates
      await transferPoints({
        userId: recipientUtoridTrimmed, // Pass UTORid directly
        amount,
        remark,
      }, {
        onSuccess: () => {
          handleClose(); // Close modal on success
        },
        onError: (err) => {
          // Specific error handling for transfer can be done here if needed,
          // otherwise the hook's default error toast will show.
          setError(err.message || 'Failed to transfer points. Please check the UTORid and try again.');
        }
      });
    } catch (err) {
      // This catch block might be redundant if the mutation handles errors,
      // but kept for safety.
      setError(err.message || 'An unexpected error occurred during the transfer.');
    }
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
      
      <Input
        label="Recipient UTORid"
        value={receiverUtorid}
        onChange={(e) => setReceiverUtorid(e.target.value)}
        placeholder="Enter recipient's UTORid"
        required
      />
      
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
          disabled={isTransferringPoints} // Disable Back while processing
        >
          Back
        </Button>
        
        <Button 
          onClick={handleTransfer}
          // Enable if UTORid is entered and not transferring to self
          disabled={!receiverUtorid.trim() || receiverUtorid.trim().toLowerCase() === currentUser.utorid.toLowerCase() || isTransferringPoints}
          loading={isTransferringPoints}
          style={{ flex: 1 }}
        >
          Transfer Points
        </Button>
      </div>
    </>
  );
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={"Transfer Points"} // Simplified title
      size="medium"
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </Modal>
  );
};

export default TransferModal; 
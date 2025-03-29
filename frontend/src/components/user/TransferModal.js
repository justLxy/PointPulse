import { useState } from 'react';
import styled from '@emotion/styled';
import useUserTransactions from '../../hooks/useUserTransactions';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import theme from '../../styles/theme';
import { FaUser, FaExchangeAlt, FaCheck } from 'react-icons/fa';

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

const TransferModal = ({ isOpen, onClose, availablePoints = 0 }) => {
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [transferId, setTransferId] = useState(null);
  
  const { transferPoints, isTransferringPoints } = useUserTransactions();
  
  // Predefined amounts for quick selection
  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];
  
  const resetForm = () => {
    setStep(1);
    setSelectedAmount(null);
    setCustomAmount('');
    setReceiverId('');
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
    if (!receiverId.trim()) {
      setError('Please enter a valid UTORid');
      return false;
    }
    
    return true;
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
      
      const response = await transferPoints({
        userId: receiverId,
        amount,
        remark,
      });
      
      if (response && response.id) {
        setTransferId(response.id);
        setStep(3);
      }
    } catch (err) {
      setError(err.message || 'Failed to transfer points');
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
        fullWidth 
        onClick={handleProceed} 
        disabled={!getTransferAmount() || getTransferAmount() > availablePoints}
        style={{ marginTop: theme.spacing.lg }}
      >
        Proceed
      </Button>
    </>
  );
  
  const renderStep2 = () => (
    <>
      <TransferInstructions>
        You're about to transfer {getTransferAmount()} points to another user.
      </TransferInstructions>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Input
        label="Recipient's UTORid"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        placeholder="Enter UTORid"
        required
      />
      
      <Input
        label="Add a note (optional)"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="e.g., Thanks for helping with the project"
      />
      
      <div style={{ marginTop: theme.spacing.lg, display: 'flex', gap: theme.spacing.md }}>
        <Button 
          variant="outlined" 
          onClick={() => setStep(1)}
          style={{ flex: 1 }}
          disabled={isTransferringPoints}
        >
          Back
        </Button>
        <Button 
          style={{ flex: 1 }} 
          onClick={handleTransfer}
          loading={isTransferringPoints}
        >
          Confirm Transfer
        </Button>
      </div>
    </>
  );
  
  const renderStep3 = () => (
    <TransferSuccessContainer>
      <SuccessIcon>
        <FaCheck />
      </SuccessIcon>
      
      <h3>Transfer Successful!</h3>
      <p>You have successfully transferred points to {receiverId}</p>
      
      <TransferInfo>
        <p>Transfer ID: <strong>#{transferId}</strong></p>
        <p>Amount: <strong>{getTransferAmount()} points</strong></p>
        <p>Recipient: <strong>{receiverId}</strong></p>
      </TransferInfo>
      
      <Button 
        fullWidth 
        variant="outlined" 
        onClick={handleClose}
        style={{ marginTop: theme.spacing.lg }}
      >
        Done
      </Button>
    </TransferSuccessContainer>
  );
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 3
          ? "Transfer Successful"
          : "Transfer Points"
      }
      size="medium"
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Modal>
  );
};

export default TransferModal; 
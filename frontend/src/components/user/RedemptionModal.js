import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { QRCodeCanvas } from 'qrcode.react';
import UniversalQRCode from '../common/UniversalQRCode';
import useUserTransactions from '../../hooks/useUserTransactions';
import usePendingRedemptions from '../../hooks/usePendingRedemptions';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import theme from '../../styles/theme';
import { FaGift, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const RedemptionOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const RedemptionOption = styled.button`
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

const RedemptionSuccessContainer = styled.div`
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

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.md};
  margin: ${theme.spacing.lg} 0;
`;

const RedemptionInfo = styled.div`
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

const RedemptionInstructions = styled.p`
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

const RedemptionModal = ({ isOpen, onClose, availablePoints = 0 }) => {
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  const [redemptionId, setRedemptionId] = useState(null);
  
  const { createRedemption, isCreatingRedemption } = useUserTransactions();
  const { pendingTotal, refetch: refetchPending } = usePendingRedemptions();
  
  // Refetch pending redemptions data whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      refetchPending();
    }
  }, [isOpen, refetchPending]);
  
  // Calculate the real available points after pending redemptions
  const actualAvailablePoints = availablePoints - pendingTotal;
  
  // Predefined amounts for quick selection
  const presetAmounts = [100, 200, 500, 1000, 2000, 5000];
  
  const resetForm = () => {
    setStep(1);
    setSelectedAmount(null);
    setCustomAmount('');
    setRemark('');
    setError('');
    setRedemptionId(null);
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
  
  const getRedemptionAmount = () => {
    return selectedAmount || (customAmount ? parseInt(customAmount) : 0);
  };
  
  const validateAmount = () => {
    const amount = getRedemptionAmount();
    
    if (!amount) {
      setError('Please select or enter a valid amount');
      return false;
    }
    
    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return false;
    }
    
    if (amount > actualAvailablePoints) {
      setError(`You don't have enough available points. You have ${availablePoints} total points with ${pendingTotal} pending in other redemption requests.`);
      return false;
    }
    
    return true;
  };
  
  const handleProceed = () => {
    if (validateAmount()) {
      setStep(2);
    }
  };
  
  const handleRedemption = async () => {
    try {
      if (!validateAmount()) {
        return;
      }
      
      const amount = getRedemptionAmount();
      
      // Create redemption request and wait for it to complete before closing modal
      try {
        await createRedemption({
          amount,
          remark,
        });
        
        // Close modal after successfully creating the redemption
        handleClose();
        
      } catch (apiError) {
        // Show error notification if API request fails
        toast.error(apiError.message || 'Failed to process redemption request');
      }
    } catch (err) {
      // This catch catches errors that might be thrown by validateAmount and other functions
      setError(err.message || 'Failed to validate redemption request');
    }
  };
  
  const renderStep1 = () => (
    <>
      <RedemptionInstructions>
        Select the amount of points you'd like to redeem. Each point is worth $0.01 in discount.
        {pendingTotal > 0 && (
          <strong> You have {pendingTotal} points pending in other redemption requests.</strong>
        )}
      </RedemptionInstructions>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <div style={{ marginBottom: theme.spacing.md }}>
        <strong>Total Points:</strong> {availablePoints}
        {pendingTotal > 0 && (
          <>
            <br />
            <strong>Pending Redemptions:</strong> {pendingTotal}
            <br />
            <strong>Available for Redemption:</strong> {actualAvailablePoints}
          </>
        )}
      </div>
      
      <RedemptionOptions>
        {presetAmounts.map((amount) => (
          <RedemptionOption
            key={amount}
            active={selectedAmount === amount}
            onClick={() => handleSelectAmount(amount)}
            disabled={amount > actualAvailablePoints}
          >
            <span>{amount}</span>
            <span>Points (${(amount / 100).toFixed(2)})</span>
          </RedemptionOption>
        ))}
      </RedemptionOptions>
      
      <CustomOption>
        <Input
          label="Custom Amount"
          value={customAmount}
          onChange={handleCustomAmountChange}
          placeholder="Enter a custom amount"
          type="number"
          min="1"
          max={actualAvailablePoints}
        />
      </CustomOption>
      
      <Button
        onClick={handleProceed}
        disabled={!getRedemptionAmount() || getRedemptionAmount() > actualAvailablePoints}
        style={{ marginTop: theme.spacing.lg }}
        fullWidth
      >
        Continue
      </Button>
    </>
  );
  
  const renderStep2 = () => (
    <>
      <RedemptionInstructions>
        You're about to redeem {getRedemptionAmount()} points for a ${(getRedemptionAmount() / 100).toFixed(2)} discount.
      </RedemptionInstructions>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <Input
        label="Add a note (optional)"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder="e.g., Lunch discount"
      />
      
      <div style={{ marginTop: theme.spacing.lg, display: 'flex', gap: theme.spacing.md }}>
        <Button 
          variant="outlined" 
          onClick={() => setStep(1)}
          style={{ flex: 1 }}
          disabled={isCreatingRedemption}
        >
          Back
        </Button>
        <Button 
          style={{ flex: 1 }} 
          onClick={handleRedemption}
          loading={isCreatingRedemption}
        >
          Confirm Redemption
        </Button>
      </div>
    </>
  );
  
  const renderStep3 = () => (
    <RedemptionSuccessContainer>
      <SuccessIcon>
        <FaCheck />
      </SuccessIcon>
      
      <h3>Redemption Request Created!</h3>
      <p>Show this QR code to a cashier to process your redemption</p>
      
      <QRCodeContainer>
        <UniversalQRCode 
          redemptionId={redemptionId}
          size={200}
          label="Redemption QR Code"
          description="Show this to the cashier to process your redemption"
        />
      </QRCodeContainer>
      
      <RedemptionInfo>
        <p>Redemption ID: <strong>#{redemptionId}</strong></p>
        <p>Amount: <strong>{getRedemptionAmount()} points</strong></p>
        <p>Value: <strong>${(getRedemptionAmount() / 100).toFixed(2)}</strong></p>
      </RedemptionInfo>
      
      <Button 
        fullWidth 
        variant="outlined" 
        onClick={handleClose}
        style={{ marginTop: theme.spacing.lg }}
      >
        Done
      </Button>
    </RedemptionSuccessContainer>
  );
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 3
          ? "Redemption Successful"
          : "Redeem Points"
      }
      size="medium"
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Modal>
  );
};

export default RedemptionModal; 
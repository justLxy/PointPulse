import { useState } from 'react';
import styled from '@emotion/styled';
import { useTransactions } from '../../hooks/useTransactions';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import theme from '../../styles/theme';
import { FaSearch, FaCheck, FaExclamationCircle } from 'react-icons/fa';

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const PageDescription = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xl};
  max-width: 800px;
`;

const ScanContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  max-width: 600px;
  margin: 0 auto;
`;

const SearchContainer = styled.div`
  display: flex;
  width: 100%;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ManualInput = styled.div`
  flex: 1;
`;

const ResultContainer = styled.div`
  width: 100%;
  margin-top: ${theme.spacing.xl};
`;

const SuccessResult = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.success.light};
  border-radius: ${theme.radius.md};
  text-align: center;
  color: ${theme.colors.success.dark};
  margin-bottom: ${theme.spacing.xl};
`;

const ErrorResult = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.error.light};
  border-radius: ${theme.radius.md};
  text-align: center;
  color: ${theme.colors.error.dark};
  margin-bottom: ${theme.spacing.xl};
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
  margin: 0 auto ${theme.spacing.md};
`;

const ErrorIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${theme.radius.full};
  background-color: ${theme.colors.error.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${theme.typography.fontSize.xl};
  margin: 0 auto ${theme.spacing.md};
`;

const RedemptionDetails = styled.div`
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.lg};
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.border.light};
  }
  
  strong {
    color: ${theme.colors.text.primary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  
  button {
    flex: 1;
  }
`;

const ProcessRedemption = () => {
  const [redemptionId, setRedemptionId] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error'
  
  const { getTransaction, processRedemption, isProcessing } = useTransactions();
  
  const handleSearch = async () => {
    if (!redemptionId || isNaN(parseInt(redemptionId))) {
      setStatus('error');
      setResult({ message: 'Please enter a valid redemption ID' });
      return;
    }
    
    try {
      const data = await getTransaction(parseInt(redemptionId));
      
      if (!data) {
        setStatus('error');
        setResult({ message: 'Redemption not found' });
        return;
      }
      
      if (data.type !== 'redemption') {
        setStatus('error');
        setResult({ message: 'Transaction is not a redemption request' });
        return;
      }
      
      if (data.processedBy) {
        setStatus('error');
        setResult({ message: 'Redemption has already been processed' });
        return;
      }
      
      setStatus('found');
      setResult(data);
    } catch (error) {
      setStatus('error');
      setResult({ message: error.message || 'Failed to find redemption request' });
    }
  };
  
  const handleProcessRedemption = async () => {
    try {
      await processRedemption(parseInt(redemptionId));
      setStatus('success');
      setResult({
        ...result,
        processedBy: 'You',
        redeemed: result.amount,
      });
    } catch (error) {
      setStatus('error');
      setResult({ message: error.message || 'Failed to process redemption' });
    }
  };
  
  const handleReset = () => {
    setRedemptionId('');
    setResult(null);
    setStatus('idle');
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div>
      <PageTitle>Process Redemption</PageTitle>
      <PageDescription>
        Enter a redemption ID to process a customer's redemption request.
        The redemption ID should be provided by the customer via a QR code or verbally.
      </PageDescription>
      
      {status === 'success' && (
        <SuccessResult>
          <SuccessIcon>
            <FaCheck />
          </SuccessIcon>
          <h2>Redemption Processed Successfully!</h2>
          <p>You have successfully processed redemption #{result.id}.</p>
          <p>
            <strong>{result.redeemed} points</strong> have been 
            redeemed from user <strong>{result.utorid}</strong>.
          </p>
          <Button 
            onClick={handleReset} 
            style={{ marginTop: theme.spacing.lg }}
          >
            Process Another Redemption
          </Button>
        </SuccessResult>
      )}
      
      {status === 'error' && (
        <ErrorResult>
          <ErrorIcon>
            <FaExclamationCircle />
          </ErrorIcon>
          <h2>Error</h2>
          <p>{result.message}</p>
          <Button 
            onClick={handleReset} 
            style={{ marginTop: theme.spacing.lg }}
          >
            Try Again
          </Button>
        </ErrorResult>
      )}
      
      {(status === 'idle' || status === 'found') && (
        <Card>
          <Card.Header>
            <Card.Title>Process Redemption</Card.Title>
          </Card.Header>
          <Card.Body>
            <ScanContainer>
              <SearchContainer>
                <ManualInput>
                  <Input
                    value={redemptionId}
                    onChange={(e) => setRedemptionId(e.target.value)}
                    placeholder="Enter redemption ID"
                    leftIcon={<FaSearch />}
                    type="number"
                    min="1"
                  />
                </ManualInput>
                <Button onClick={handleSearch} disabled={!redemptionId || status === 'found'}>
                  Search
                </Button>
              </SearchContainer>
              
              {status === 'found' && result && (
                <ResultContainer>
                  <h3>Redemption Request Found</h3>
                  
                  <RedemptionDetails>
                    <DetailRow>
                      <strong>Redemption ID:</strong>
                      <span>#{result.id}</span>
                    </DetailRow>
                    <DetailRow>
                      <strong>User:</strong>
                      <span>{result.utorid}</span>
                    </DetailRow>
                    <DetailRow>
                      <strong>Amount:</strong>
                      <span>{result.amount} points (${(result.amount / 100).toFixed(2)})</span>
                    </DetailRow>
                    <DetailRow>
                      <strong>Requested:</strong>
                      <span>{formatDate(result.createdAt)}</span>
                    </DetailRow>
                    {result.remark && (
                      <DetailRow>
                        <strong>Remark:</strong>
                        <span>{result.remark}</span>
                      </DetailRow>
                    )}
                  </RedemptionDetails>
                  
                  <ActionButtons>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleProcessRedemption}
                      loading={isProcessing}
                    >
                      Process Redemption
                    </Button>
                  </ActionButtons>
                </ResultContainer>
              )}
            </ScanContainer>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ProcessRedemption; 
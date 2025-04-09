import { useState } from 'react';
import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useTransactions } from '../../hooks/useTransactions';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import theme from '../../styles/theme';
import { FaSearch, FaCheck, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import TransactionService from '../../services/transaction.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
  background-color: #e8f5e9;
  border-radius: ${theme.radius.md};
  text-align: center;
  color: #1b5e20;
  margin-bottom: ${theme.spacing.xl};
  
  h2 {
    font-size: ${theme.typography.fontSize['2xl']};
    margin-bottom: ${theme.spacing.md};
    font-weight: ${theme.typography.fontWeights.bold};
  }
  
  p {
    font-size: ${theme.typography.fontSize.md};
    margin-bottom: ${theme.spacing.sm};
  }
  
  strong {
    font-weight: ${theme.typography.fontWeights.bold};
    color: #2e7d32;
  }
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

const PendingRedemptionsSection = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const PendingRedemptionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const PendingRedemptionsTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  margin-bottom: 0;
`;

const RedemptionsList = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RedemptionCard = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
  
  ${props => props.isProcessing && `
    opacity: 0.5;
    transform: scale(0.98);
    pointer-events: none;
  `}
`;

const RedemptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  
  h3 {
    margin: 0;
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const RedemptionAmount = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.error.main};
`;

const RedemptionInfo = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  p {
    margin: ${theme.spacing.xs} 0;
    display: flex;
    justify-content: space-between;
    
    span:first-of-type {
      color: ${theme.colors.text.secondary};
    }
    
    span:last-of-type {
      font-weight: ${theme.typography.fontWeights.medium};
    }
  }
`;

const NoRedemptions = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

// Pagination related styles
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

const ProcessRedemption = () => {
  const [redemptionId, setRedemptionId] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error', 'found'
  const [processingError, setProcessingError] = useState(null); // Separate error state for processing
  const [processingIds, setProcessingIds] = useState([]); // Track which redemptions are being processed
  const [page, setPage] = useState(1); // Current page number
  const [limit, setLimit] = useState(9); // Change limit from 10 to 9
  
  const { processRedemption, isProcessing: isMutationLoading } = useTransactions(); // Rename isProcessing from hook to avoid clash
  
  // ADD: Use react-query to fetch pending redemptions
  const queryKey = ['pendingRedemptions', page, limit];
  const { 
    data: pendingData, 
    isLoading: isLoadingPending, // Use isLoading from useQuery
    error: pendingError // Use error from useQuery
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => TransactionService.getPendingRedemptions({ page, limit }),
    staleTime: 1 * 60 * 1000, // Data considered fresh for 1 minute
  });

  // ADD: Derive state from useQuery result
  const pendingRedemptions = pendingData?.results || [];
  const totalCount = pendingData?.count || 0;
  
  // Calculate total pages based on data from useQuery
  const totalPages = Math.ceil(totalCount / limit);
  
  // Calculate current display range
  const startIndex = totalCount > 0 ? (page - 1) * limit + 1 : 0;
  const endIndex = Math.min(page * limit, totalCount);
  
  const handleSearch = async () => {
    if (!redemptionId || isNaN(parseInt(redemptionId))) {
      setStatus('error');
      setResult({ message: 'Please enter a valid redemption ID' });
      return;
    }
    
    try {
      // Use the new cashier-specific lookup endpoint
      const data = await TransactionService.lookupRedemption(parseInt(redemptionId));
      
      if (!data) {
        setStatus('error');
        setResult({ message: 'Redemption not found' });
        return;
      }
      
      setStatus('found');
      setResult(data);
      setProcessingError(null); // Clear previous errors when a new one is found
    } catch (error) {
      setStatus('error');
      setResult({ message: error.message || 'Failed to find redemption request' });
    }
  };
  
  const handleProcessRedemption = async (id = null) => {
    const transactionId = id || parseInt(redemptionId);
    const isProcessingFromList = id !== null;
    
    setProcessingError(null); 
    
    if (isProcessingFromList) {
      setProcessingIds(prevIds => [...prevIds, transactionId]);
      console.log(`Processing redemption #${transactionId} from list.`);
    }

    try {
      const processedData = await processRedemption(transactionId); 
      console.log('Processed data:', processedData); 

      if (!isProcessingFromList) {
        setStatus('success');
        let redeemedAmount = 0;
        if (processedData && processedData.redeemed) {
          redeemedAmount = processedData.redeemed;
        } else if (processedData && processedData.amount) {
          redeemedAmount = Math.abs(processedData.amount);
        } else if (result && result.amount) {
          redeemedAmount = Math.abs(result.amount);
        } else if (result && result.redeemed) {
          redeemedAmount = result.redeemed;
        }
        setResult({
          ...(result && result.id === transactionId ? result : {}),
          ...processedData,
          processedBy: 'You', 
          redeemed: redeemedAmount, 
          id: transactionId 
        });
        setRedemptionId(''); 
      }
      
    } catch (error) {
      console.error(`Error processing redemption #${transactionId}:`, error);
      setProcessingError(error.message || 'Failed to process redemption'); 
      if (!isProcessingFromList) {
        setStatus('error');
        setResult({ message: error.message || 'Failed to process redemption' });
      }
    } finally {
      if (isProcessingFromList) {
        setProcessingIds(prevIds => prevIds.filter(pid => pid !== transactionId));
      }
    }
  };
  
  const handleReset = () => {
    setRedemptionId('');
    setResult(null);
    setStatus('idle');
    setProcessingError(null); // Clear processing errors on reset
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div>
      <PageTitle>Process Redemption</PageTitle>
      <PageDescription>
        Enter a redemption ID to process a customer's redemption request.
        The redemption ID should be provided by the customer via a QR code or verbally.
        Below you can also see all pending redemption requests that need to be processed.
      </PageDescription>
      
      {status === 'success' && (
        <SuccessResult>
          <SuccessIcon>
            <FaCheck />
          </SuccessIcon>
          <h2>Redemption Processed Successfully!</h2>
          <p>You have successfully processed redemption #{result.id}.</p>
          <p>
            <strong>{result.redeemed || (result.amount ? Math.abs(result.amount) : 0)} points</strong> have been 
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
            <Card.Title>Process Redemption by ID</Card.Title>
          </Card.Header>
          <Card.Body>
            <ScanContainer>
              <SearchContainer>
                <ManualInput>
                  <Input
                    value={redemptionId}
                    onChange={(e) => setRedemptionId(e.target.value)}
                    placeholder="Enter Redemption ID"
                    leftIcon={<FaSearch />}
                  />
                </ManualInput>
                <Button
                  onClick={handleSearch}
                >
                  Find Redemption
                </Button>
              </SearchContainer>
              
              {status === 'found' && result && (
                <ResultContainer>
                  <RedemptionDetails>
                    <DetailRow>
                      <strong>Redemption ID</strong>
                      <span>#{result.id}</span>
                    </DetailRow>
                    <DetailRow>
                      <strong>User</strong>
                      <span>{result.utorid}</span>
                    </DetailRow>
                    <DetailRow>
                      <strong>Points to Redeem</strong>
                      <span>{Math.abs(result.amount)}</span>
                    </DetailRow>
                    <DetailRow>
                      <strong>Date Requested</strong>
                      <span>{formatDate(result.createdAt)}</span>
                    </DetailRow>
                    {result.remark && (
                      <DetailRow>
                        <strong>Remark</strong>
                        <span>{result.remark}</span>
                      </DetailRow>
                    )}
                  </RedemptionDetails>
                  
                  <ActionButtons>
                    <Button
                      variant="outlined"
                      onClick={handleReset}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleProcessRedemption()}
                      loading={isMutationLoading}
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
      
      {/* New section for pending redemptions */}
      <PendingRedemptionsSection>
        <PendingRedemptionsHeader>
          <PendingRedemptionsTitle>Pending Redemption Requests</PendingRedemptionsTitle>
        </PendingRedemptionsHeader>
        
        {/* Display processing error specifically for the list */}
        {processingError && (
          <ErrorResult style={{ marginBottom: theme.spacing.md }}>
            <p>{processingError}</p>
          </ErrorResult>
        )}

        {isLoadingPending ? (
          <LoadingSpinner text="Loading pending redemptions..." />
        ) : pendingRedemptions.length > 0 ? (
          <RedemptionsList>
            {pendingRedemptions.map((redemption) => {
              console.log(`Rendering redemption card #${redemption.id}`);
              return (
                <RedemptionCard key={`redemption-${redemption.id}`} isProcessing={processingIds.includes(redemption.id)}>
                  <RedemptionHeader>
                    <h3>Redemption #{redemption.id}</h3>
                    <RedemptionAmount>-{redemption.redeemed || (redemption.amount ? Math.abs(redemption.amount) : 0)} pts</RedemptionAmount>
                  </RedemptionHeader>
                  
                  <RedemptionInfo>
                    <p>
                      <span>User:</span>
                      <span>{redemption.utorid}</span>
                    </p>
                    {redemption.createdAt && ( // Conditionally render the date
                      <p>
                        <span>Requested:</span>
                        <span>{formatDate(redemption.createdAt)}</span>
                      </p>
                    )}
                    {redemption.remark && (
                      <p>
                        <span>Remark:</span>
                        <span>{redemption.remark}</span>
                      </p>
                    )}
                  </RedemptionInfo>
                  
                  <Button
                    fullWidth
                    onClick={() => handleProcessRedemption(redemption.id)}
                    loading={processingIds.includes(redemption.id)}
                  >
                    Process Now
                  </Button>
                </RedemptionCard>
              );
            })}
          </RedemptionsList>
        ) : (
          <NoRedemptions>
            <p>No pending redemption requests found.</p>
          </NoRedemptions>
        )}
        
        {/* Add pagination control */}
        {totalCount > 0 && (
          <PageControls>
            <PageInfo>
              Showing {startIndex} to {endIndex} of {totalCount} redemption requests
            </PageInfo>
            
            <Pagination>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => setPage(Math.max(page - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <PageInfo>Page {page} of {totalPages}</PageInfo>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => setPage(Math.min(page + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </Pagination>
          </PageControls>
        )}
      </PendingRedemptionsSection>
    </div>
  );
};

export default ProcessRedemption; 
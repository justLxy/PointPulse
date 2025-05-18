import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTransactions } from '../../hooks/useTransactions';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import theme from '../../styles/theme';
import { FaSearch, FaCheck, FaExclamationCircle, FaSpinner, FaQrcode } from 'react-icons/fa';
import TransactionService from '../../services/transaction.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

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

// Add new styled components for scanner
const QrScanButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: ${theme.spacing.xs};
  }
`;

const ScannerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const ScannerWrapper = styled.div`
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1/1;
  position: relative;
  border-radius: ${theme.radius.md};
  overflow: hidden;
  box-shadow: ${theme.shadows.md};
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ScannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed ${theme.colors.primary.light};
  border-radius: ${theme.radius.md};
  pointer-events: none;
`;

const ProcessRedemption = () => {
  const [redemptionId, setRedemptionId] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error', 'found'
  const [processingError, setProcessingError] = useState(null); // Separate error state for processing
  const [processingIds, setProcessingIds] = useState([]); // Track which redemptions are being processed
  const [page, setPage] = useState(1); // Current page number
  const [limit, setLimit] = useState(9); // Change limit from 10 to 9
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef(null);
  const html5QrScannerRef = useRef(null);
  
  const queryClient = useQueryClient();
  const { processRedemption, isProcessing: isMutationLoading } = useTransactions(); // Rename isProcessing from hook to avoid clash
  
  // State to track if we're filtering by a specific user
  const [userFilter, setUserFilter] = useState(null);
  
  // ADD: Use react-query to fetch pending redemptions
  const queryKey = ['pendingRedemptions', page, limit, userFilter];
  const { 
    data: pendingData, 
    isLoading: isLoadingPending, // Use isLoading from useQuery
    error: pendingError // Use error from useQuery
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => {
      // If we have a user filter, fetch only that user's redemptions
      if (userFilter) {
        console.log(`Query function using user filter: ${userFilter}`);
        return TransactionService.getPendingRedemptionsByUtorid(userFilter)
          .then(results => {
            console.log(`Got ${results ? results.length : 0} results for user ${userFilter}`);
            
            // Check if results is empty or undefined
            if (!results || results.length === 0) {
              toast.error(`No pending redemptions found for user ${userFilter}`);
              // Set userFilter back to null after a short delay
              setTimeout(() => setUserFilter(null), 2000);
            }
            
            // Filter results to ensure we only show redemptions for this user
            const filteredResults = results ? results.filter(r => 
              r.utorid === userFilter || 
              r.userId === userFilter ||
              r.user?.utorid === userFilter
            ) : [];
            
            console.log(`After additional filtering: ${filteredResults.length} results`);
            
            return {
              results: filteredResults,
              count: filteredResults.length
            };
          })
          .catch(error => {
            console.error("Error fetching user redemptions:", error);
            toast.error(error.message || `Failed to find redemptions for user ${userFilter}`);
            // Set userFilter back to null after an error
            setTimeout(() => setUserFilter(null), 2000);
            // Return empty results to prevent the query from failing
            return { results: [], count: 0 };
          });
      }
      // Otherwise fetch all pending redemptions with pagination
      return TransactionService.getPendingRedemptions({ page, limit });
    },
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
  
  // Scanner setup and cleanup functions
  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    try {
      const html5QrScanner = new Html5Qrcode(scannerRef.current.id);
      html5QrScannerRef.current = html5QrScanner;
      
      await html5QrScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: 250
        },
        async (decodedText) => {
          // Log what we've scanned for debugging
          console.log("QR code scanned:", decodedText);
          
          // Stop scanner once a code is detected
          if (html5QrScannerRef.current) {
            await html5QrScannerRef.current.stop();
            setIsScannerActive(false);
          }
          
          // Close the modal
          setScannerModalOpen(false);
          
          // Process the scanned QR code
          // Trim whitespace that might be introduced during scanning
          await handleSearch(decodedText.trim());
        },
        (errorMessage) => {
          // This is a non-critical error, usually just means no QR found yet
          console.log("QR scanning in progress...");
        }
      );
      
      setIsScannerActive(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('Could not start camera. Please make sure you have granted camera permissions.');
    }
  };
  
  const stopScanner = async () => {
    if (html5QrScannerRef.current) {
      try {
        await html5QrScannerRef.current.stop();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
      html5QrScannerRef.current = null;
    }
    setIsScannerActive(false);
  };
  
  // Open the scanner modal
  const handleOpenScanner = () => {
    setScannerModalOpen(true);
    // Initialize scanner after a short delay to ensure the DOM element is ready
    setTimeout(() => {
      startScanner();
    }, 300);
  };
  
  // Close the scanner modal and clean up
  const handleCloseScanner = () => {
    stopScanner();
    setScannerModalOpen(false);
  };

  const handleSearch = async (qrData = null) => {
    let searchRedemptionId;
    let scannedUtorid;
    
    // If QR data is provided, try to extract redemption ID or utorid from it
    if (qrData) {
      console.log("Processing QR data:", qrData);
      try {
        // Check if the QR data is a URL
        if (qrData.trim().startsWith('http')) {
          console.log("Detected URL format QR code");
          try {
            const url = new URL(qrData.trim());
            
            // Handle transfer URLs directly
            if (url.pathname === '/transfer') {
              const dataParam = url.searchParams.get('data');
              if (dataParam) {
                try {
                  const decodedJson = JSON.parse(atob(decodeURIComponent(dataParam)));
                  if (decodedJson && decodedJson.utorid) {
                    scannedUtorid = decodedJson.utorid;
                    console.log("Extracted utorid from transfer URL:", scannedUtorid);
                  }
                } catch (decodeErr) {
                  console.warn('Base64 decode failed on transfer URL', decodeErr);
                }
              }
            } 
            // Handle redemption process URLs
            else if (url.pathname === '/transactions/process') {
              const dataParam = url.searchParams.get('data');
              if (dataParam) {
                try {
                  const decodedJson = JSON.parse(atob(decodeURIComponent(dataParam)));
                  if (decodedJson.context === 'redemption' && decodedJson.redemptionId) {
                    searchRedemptionId = decodedJson.redemptionId;
                    console.log("Extracted redemption ID from data param:", searchRedemptionId);
                  }
                } catch (decodeErr) {
                  console.warn('Base64 decode failed', decodeErr);
                  throw new Error('Invalid QR code format. Please use a valid PointPulse QR code.');
                }
              } else {
                throw new Error('Invalid QR code format. Missing data parameter.');
              }
            }
            // For any other URL, try to extract data parameter
            else {
              const dataParam = url.searchParams.get('data');
              if (dataParam) {
                try {
                  const decodedJson = JSON.parse(atob(decodeURIComponent(dataParam)));
                  if (decodedJson.context === 'redemption' && decodedJson.redemptionId) {
                    searchRedemptionId = decodedJson.redemptionId;
                  } else if (decodedJson.context === 'user' && decodedJson.utorid) {
                    scannedUtorid = decodedJson.utorid;
                  }
                } catch (decodeErr) {
                  console.warn('Base64 decode failed', decodeErr);
                }
              }
            }
          } catch (urlError) {
            console.error('URL parsing error:', urlError);
          }
        } 
        // If not a URL, try to parse as direct base64 data
        else {
          try {
            const decodedJson = JSON.parse(atob(decodeURIComponent(qrData.trim())));
            if (decodedJson.type === 'pointpulse') {
              if (decodedJson.context === 'redemption') {
                searchRedemptionId = decodedJson.redemptionId;
              } else if (decodedJson.context === 'user') {
                scannedUtorid = decodedJson.utorid;
              }
            }
          } catch (e) {
            // Not base64 encoded - fallback to treating as plain text
            if (!isNaN(parseInt(qrData))) {
              searchRedemptionId = qrData;
              console.log("Treating QR data as redemption ID:", searchRedemptionId);
            } else {
              scannedUtorid = qrData;
              console.log("Treating QR data as utorid:", scannedUtorid);
            }
          }
        }
        
        // If we couldn't extract anything meaningful, show error
        if (!searchRedemptionId && !scannedUtorid) {
          console.log("Unknown QR format, no valid data extracted");
          setStatus('error');
          setResult({ message: 'Invalid QR code format. Please scan a valid redemption or user QR code.' });
          return;
        }
      } catch (e) {
        console.error("Error processing QR data:", e);
        setStatus('error');
        setResult({ message: 'Error processing QR code: ' + e.message });
        return;
      }
    } else {
      // Use the manually entered redemption ID
      searchRedemptionId = redemptionId;
    }
    
    // If we have a utorid, fetch all pending redemptions for that user
    if (scannedUtorid) {
      try {
        // Set the user filter to show only this user's redemptions
        setUserFilter(scannedUtorid);
        
        // Reset page to 1 when filtering by user
        setPage(1);
        
        // Provide feedback that we're filtering by user
        toast.success(`Showing pending redemptions for user ${scannedUtorid}`);
        
        // Reset search states
        setStatus('idle');
        setRedemptionId('');
        return;
      } catch (error) {
        setStatus('error');
        setResult({ message: error.message || `Failed to find redemptions for user ${scannedUtorid}` });
        return;
      }
    }
    
    // Continue with regular redemption ID lookup if we have one
    if (!searchRedemptionId || isNaN(parseInt(searchRedemptionId))) {
      setStatus('error');
      setResult({ message: 'Please enter a valid redemption ID' });
      return;
    }
    
    try {
      // Use the cashier-specific lookup endpoint
      const data = await TransactionService.lookupRedemption(parseInt(searchRedemptionId));
      
      if (!data) {
        setStatus('error');
        setResult({ message: 'Redemption not found' });
        return;
      }
      
      // Update the input field to show the found redemption ID
      setRedemptionId(searchRedemptionId.toString());
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
  
  // Add a cleanup effect
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Parse query param on initial load (for direct link via QR on smartphones)
  const location = useLocation();

  // Auto-handle direct link with ?data param (e.g., scanned via system camera)
  useEffect(() => {
    if (location && location.search) {
      const params = new URLSearchParams(location.search);
      if (params.get('data') || params.get('redemptionId')) {
        // Pass full URL so existing parser can extract
        handleSearch(window.location.href);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                  <Button
                    onClick={() => handleSearch()}
                  >
                    Find Redemption
                  </Button>
                  <QrScanButton 
                    variant="outlined"
                    onClick={handleOpenScanner}
                  >
                    <FaQrcode /> Scan QR
                  </QrScanButton>
                </div>
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
          <PendingRedemptionsTitle>
            {userFilter ? (
              <>
                Showing <span style={{ color: theme.colors.primary.main }}>only</span> redemptions for: 
                <span style={{
                  margin: `0 ${theme.spacing.xs}`,
                  fontWeight: theme.typography.fontWeights.semiBold,
                  color: theme.colors.primary.main
                }}>
                  {userFilter}
                </span>
              </>
            ) : 'All Pending Redemption Requests'}
          </PendingRedemptionsTitle>
          
          {userFilter && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setUserFilter(null)}
              style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
            >
              <span>×</span> Clear Filter
            </Button>
          )}
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
              // Log more details about the redemption for debugging
              console.log(`Rendering redemption card #${redemption.id} for user: ${redemption.utorid}`);
              
              // Mark cards that match the current user filter
              const isHighlighted = userFilter && (
                redemption.utorid === userFilter || 
                redemption.userId === userFilter ||
                redemption.user?.utorid === userFilter
              );
              
              return (
                <RedemptionCard 
                  key={`redemption-${redemption.id}`} 
                  isProcessing={processingIds.includes(redemption.id)}
                >
                  <RedemptionHeader>
                    <h3>Redemption #{redemption.id}</h3>
                    <RedemptionAmount>-{redemption.redeemed || (redemption.amount ? Math.abs(redemption.amount) : 0)} pts</RedemptionAmount>
                  </RedemptionHeader>
                  
                  <RedemptionInfo>
                    <p>
                      <span>User:</span>
                      <span style={isHighlighted ? {
                        fontWeight: theme.typography.fontWeights.bold,
                        color: theme.colors.primary.main
                      } : {}}>
                        {redemption.utorid}
                      </span>
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
      
      {/* QR Scanner Modal */}
      <Modal
        isOpen={scannerModalOpen}
        onClose={handleCloseScanner}
        title="Scan Redemption QR Code"
        size="medium"
      >
        <ScannerContainer>
          <p>Position the customer's QR code within the scanning frame</p>
          
          <ScannerWrapper>
            <div id="qr-scanner-element" ref={scannerRef} style={{ width: '100%', height: '100%' }} />
            <ScannerOverlay />
          </ScannerWrapper>
          
          <Button 
            variant="outlined" 
            onClick={handleCloseScanner} 
            style={{ marginTop: theme.spacing.md }}
          >
            Cancel
          </Button>
        </ScannerContainer>
      </Modal>
    </div>
  );
};

export default ProcessRedemption; 
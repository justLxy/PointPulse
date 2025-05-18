import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import SuccessPage from '../../components/common/SuccessPage';
import Modal from '../../components/common/Modal';
import TransactionService from '../../services/transaction.service';
import PromotionService from '../../services/promotion.service';
import UserService from '../../services/user.service';
import theme from '../../styles/theme';
import { toast } from 'react-hot-toast';
import { FaUser, FaDollarSign, FaTag, FaClipboard, FaSearch, FaCheckCircle, FaMoneyBillWave, FaReceipt, FaTimesCircle, FaQrcode } from 'react-icons/fa';
import { Html5Qrcode } from 'html5-qrcode';
import { API_URL } from '../../services/api';

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.xl};
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
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
  margin-top: ${theme.spacing.md};
  
  img {
    width: 48px;
    height: 48px;
    border-radius: ${theme.radius.full};
    margin-right: ${theme.spacing.md};
    object-fit: cover;
  }
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
    margin: 0; /* override global margin-right on img inside UserInfo */
    border-radius: ${theme.radius.full};
  }
`;

const PromotionsContainer = styled.div`
  margin-top: ${theme.spacing.md};
`;

const PromotionsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: ${theme.spacing.md};
`;

const PromotionItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm};
  border: 1px solid ${({ isSelected }) => isSelected ? theme.colors.primary.main : theme.colors.border.light};
  border-radius: ${theme.radius.md};
  margin-bottom: ${theme.spacing.sm};
  cursor: pointer;
  transition: background-color ${theme.transitions.quick}, border-color ${theme.transitions.quick};
  background-color: ${({ isSelected }) => isSelected ? 'rgba(52, 152, 219, 0.1)' : 'transparent'};
  
  &:hover {
    background-color: ${({ isSelected }) => isSelected ? 'rgba(52, 152, 219, 0.15)' : 'rgba(0, 0, 0, 0.03)'};
  }
`;

const PromotionIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${theme.radius.md};
  background-color: ${theme.colors.accent.light};
  color: ${theme.colors.accent.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing.md};
`;

const PromotionInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0;
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeights.medium};
  }
  
  p {
    margin: ${theme.spacing.xs} 0 0;
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const PromotionValue = styled.div`
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography.fontSize.sm};
`;

const SummaryCard = styled(Card)`
  position: sticky;
  top: 80px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-of-type {
    border-bottom: none;
  }
  
  .label {
    color: ${theme.colors.text.secondary};
  }
  
  .value {
    font-weight: ${theme.typography.fontWeights.medium};
  }
`;

const TotalItem = styled(SummaryItem)`
  font-weight: ${theme.typography.fontWeights.bold};
  font-size: ${theme.typography.fontSize.lg};
  padding-top: ${theme.spacing.md};
  margin-top: ${theme.spacing.sm};
  border-top: 2px solid ${theme.colors.border.main};
  border-bottom: none;
  
  .label {
    color: ${theme.colors.text.primary};
  }
  
  .value {
    color: ${theme.colors.primary.main};
  }
`;

const PointsEarned = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.success.main};
`;

const SearchInput = styled.div`
  flex: 1;
  
  /* Override the default margin of Input component */
  & > div {
    margin-bottom: 0;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
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

// QR Scanner related components
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

const CreateTransaction = () => {
  const [step, setStep] = useState(1);
  const [utorid, setUtorid] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [automaticPromotions, setAutomaticPromotions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState(null);
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const scannerRef = useRef(null);
  const html5QrScannerRef = useRef(null);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Fetch available promotions
    const fetchPromotions = async () => {
      try {
        const response = await PromotionService.getPromotions();
        if (response && response.results) {
          const now = new Date();
          const activePromotions = response.results.filter(promo => {
            const startTime = new Date(promo.startTime);
            const endTime = promo.endTime ? new Date(promo.endTime) : null;
            return startTime <= now && (!endTime || endTime >= now);
          });

          // Separate automatic promotions from one-time promotions among active ones
          const automatic = activePromotions.filter(promo => promo.type === 'automatic');
          setAutomaticPromotions(automatic);
          setPromotions(activePromotions); // Store only active promotions
        }
      } catch (err) {
        console.error('Failed to fetch promotions:', err);
      }
    };
    
    fetchPromotions();
  }, []);
  
  // Update available promotions when user changes or promotions are loaded
  useEffect(() => {
    if (user && promotions.length > 0) {
      // For automatic promotions - show all of them
      const automaticPromos = promotions.filter(promo => promo.type === 'automatic');
      
      // For one-time promotions - only show those available to this user
      // userPromotions contains the promotions the user hasn't used yet
      const userOneTimePromotions = user.promotions || [];
      
      // Combine automatic and available one-time promotions
      setAvailablePromotions([...automaticPromos, ...userOneTimePromotions]);
    } else {
      setAvailablePromotions([]);
    }
  }, [user, promotions]);
  
  // Apply automatic promotions when amount changes and we have a user
  useEffect(() => {
    if (user && amount && parseFloat(amount) > 0) {
      // Filter automatic promotions that meet the minimum spending requirement
      const eligibleAutomaticPromotions = automaticPromotions.filter(
        promo => !promo.minSpending || parseFloat(amount) >= promo.minSpending
      );

      // Keep only one-time promotions from the current selection
      const oneTimePromotions = selectedPromotions.filter(promo => promo.type !== 'automatic');
      
      // Update selected promotions with eligible automatic promotions and existing one-time promotions
      setSelectedPromotions([...oneTimePromotions, ...eligibleAutomaticPromotions]);
    }
  }, [amount, user, automaticPromotions]);
  
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
          // Stop scanner once a code is detected
          if (html5QrScannerRef.current) {
            await html5QrScannerRef.current.stop();
            setIsScannerActive(false);
          }
          
          // Close the modal
          setScannerModalOpen(false);
          
          // Process the scanned QR code
          await handleUserSearch(decodedText);
        },
        () => {}
      );
      
      setIsScannerActive(true);
    } catch (error) {
      console.error('Error starting scanner:', error);
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
  
  // Add a cleanup effect
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);
  
  const handleUserSearch = async (qrData = null) => {
    let searchUtorid = qrData || utorid.trim();
    
    if (!searchUtorid) {
      setError('Please enter a UTORid or scan a QR code');
      return;
    }
    
    // If QR data is provided, try to parse it
    if (qrData) {
      try {
        const url = new URL(qrData.trim());
        const dataParam = url.searchParams.get('data');
        if (dataParam) {
          try {
            const decodedJson = JSON.parse(atob(decodeURIComponent(dataParam)));
            if (decodedJson && decodedJson.utorid) {
              searchUtorid = decodedJson.utorid;
            }
          } catch (decodeErr) {
            console.warn('Base64 decode failed', decodeErr);
          }
        }
      } catch (urlError) {
        // 不是 URL - 尝试直接解码 dataParam
        try {
          const decodedJson = JSON.parse(atob(decodeURIComponent(qrData.trim())));
          if (decodedJson && decodedJson.utorid) {
            searchUtorid = decodedJson.utorid;
          }
        } catch {}
      }
    }
    
    setError('');
    setSearchLoading(true);
    
    try {
      // Try to lookup user directly using the cashier-specific endpoint
      const userData = await UserService.lookupUserByUTORid(searchUtorid);
      
      // Update the input field to show the found utorid
      setUtorid(searchUtorid);
      setUser(userData);
      
      // Clear selected promotions when user changes
      setSelectedPromotions([]);
    } catch (err) {
      console.error('Search user error:', err);
      setError(err.message || 'User not found or you do not have permission to view this user');
      setUser(null);
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handlePromotionToggle = (promotion) => {
    // If a promotion has a minimum spending requirement and the current amount is below that requirement, don't allow it to be selected
    if (promotion.minSpending && parseFloat(amount || 0) < promotion.minSpending) {
      toast.error(`This promotion requires a minimum spending of $${promotion.minSpending.toFixed(2)}.`);
      return;
    }

    // Don't allow toggling of automatic promotions - they're automatically applied
    if (promotion.type === 'automatic') {
      toast('Automatic promotions are applied automatically when eligible.');
      return;
    }

    setSelectedPromotions((prevSelected) => {
      const isSelected = prevSelected.some(p => p.id === promotion.id);

      if (isSelected) {
        // If already selected, remove it
        return prevSelected.filter(p => p.id !== promotion.id);
      } else {
        // If not selected, add it (keep existing checks for minimum spending)
        const validPromotions = prevSelected.filter(p =>
          p.type === 'automatic' || // Keep automatic promotions
          !p.minSpending || parseFloat(amount || 0) >= p.minSpending
        );

        // Automatically cancel promotions that don't meet the criteria
        if (validPromotions.length !== prevSelected.length) {
          toast.error('Some promotions were deselected because the amount changed and they no longer meet the spending requirement.');
          return [...validPromotions, promotion]; // Add the new one after filtering old ones
        }

        // Add the newly selected promotion
        return [...prevSelected, promotion];
      }
    });
  };
  
  const calculateEarnedPoints = () => {
    const baseAmount = parseFloat(amount) || 0;
    // Default rate: 1 point per 25 cents
    let points = Math.round(baseAmount * 100 / 25);
    
    // Add points from one-time promotions
    const additionalPoints = selectedPromotions
      .filter(p => p.points)
      .reduce((sum, p) => sum + p.points, 0);
    
    // Apply rate promotions
    const ratePromotions = selectedPromotions.filter(p => p.rate);
    
    if (ratePromotions.length > 0) {
      // Filter applicable rate promotions based on minimum spending
      const applicableRatePromos = ratePromotions.filter(p => 
        !p.minSpending || baseAmount >= p.minSpending
      );
      
      if (applicableRatePromos.length > 0) {
        // Use the highest rate promotion
        const highestApplicableRate = Math.max(...applicableRatePromos.map(p => p.rate));
        
        // Calculate additional points from rate (not multiply)
        // For example: if rate is 0.01, add 1 extra point per dollar spent
        const rateAdditionalPoints = Math.round(baseAmount * highestApplicableRate * 100);
        points += rateAdditionalPoints;
      }
    }
    
    return points + additionalPoints;
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
  
  const handleSubmit = async () => {
    if (!user) {
      setError('Please search for a user first');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await TransactionService.createPurchase({
        utorid: user.utorid,
        spent: parseFloat(amount),
        promotionIds: selectedPromotions.map(p => p.id),
        remark: remark
      });
      
      setTransaction(response);
      setStep(2);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      console.error('Transaction creation error:', err);
      setError(err.message || 'Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    setStep(1);
    setUtorid('');
    setUser(null);
    setAmount('');
    setRemark('');
    setSelectedPromotions([]);
    setError('');
    setTransaction(null);
  };
  
  const renderStep1 = () => (
    <Container>
      <FormSection>
        <Card>
          <Card.Header>
            <Card.Title>Customer Information</Card.Title>
          </Card.Header>
          <Card.Body>
            <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'flex-start' }}>
              <SearchInput>
                <Input 
                  placeholder="Enter UTORid" 
                  value={utorid}
                  onChange={(e) => setUtorid(e.target.value)}
                  leftIcon={<FaUser size={16} />}
                />
              </SearchInput>
              <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                <Button 
                  onClick={() => handleUserSearch()} 
                  loading={searchLoading}
                  size="medium"
                  style={{ height: '40px' }}
                >
                  <FaSearch /> Search
                </Button>
                <QrScanButton 
                  variant="outlined"
                  onClick={handleOpenScanner}
                  size="medium"
                  style={{ height: '40px' }}
                >
                  <FaQrcode /> Scan QR
                </QrScanButton>
              </div>
            </div>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            {/* QR Scanner Modal */}
            <Modal
              isOpen={scannerModalOpen}
              onClose={handleCloseScanner}
              title="Scan Customer QR Code"
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
            
            {user && (
              <UserSection>
                <UserInfo>
                  <Avatar>
                    {user.avatarUrl ? (
                      (() => {
                        const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(user.avatarUrl);
                        // Fix for double slashes by ensuring avatarUrl doesn't have a leading slash when concatenated
                        const avatarPath = user.avatarUrl.startsWith('/') ? user.avatarUrl : `/${user.avatarUrl}`;
                        const baseSrc = isAbsolute ? user.avatarUrl : `${API_URL}${avatarPath}`;
                        return <img src={baseSrc} alt={user.name} />;
                      })()
                    ) : (
                      getInitials(user.name)
                    )}
                  </Avatar>
                  <UserInfoText>
                    <h3>{user.name}</h3>
                    <p>
                      {user.utorid}
                      <Badge verified={user.verified}>
                        {user.verified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </p>
                    <p>Current Points: {user.points}</p>
                  </UserInfoText>
                </UserInfo>
              </UserSection>
            )}
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Transaction Details</Card.Title>
          </Card.Header>
          <Card.Body>
            <Input 
              label="Amount ($)" 
              type="number" 
              step="0.01" 
              min="0" 
              placeholder="Enter purchase amount" 
              value={amount}
              onChange={(e) => {
                const newAmount = e.target.value;
                setAmount(newAmount);
                
                if (user && newAmount) {
                  // The automatic promotions will be applied via the useEffect
                  
                  // For one-time promotions, filter out those that don't meet the criteria
                  const validOneTimePromotions = selectedPromotions.filter(
                    promo => promo.type === 'automatic' || 
                           (!promo.minSpending || parseFloat(newAmount || 0) >= promo.minSpending)
                  );
                  
                  // Automatically cancel one-time promotions that don't meet the criteria
                  if (validOneTimePromotions.length !== selectedPromotions.length) {
                    setSelectedPromotions(validOneTimePromotions);
                    toast.error('Some promotions were deselected because they no longer meet the spending requirement.');
                  }
                }
              }}
              onBlur={() => {
                // Check if selected one-time promotions meet minimum spending requirements
                if (amount && selectedPromotions.length > 0) {
                  const validPromotions = selectedPromotions.filter(
                    promo => promo.type === 'automatic' || 
                           (!promo.minSpending || parseFloat(amount) >= promo.minSpending)
                  );
                  
                  // If there are promotions that don't meet the criteria, deselect them and show a notification
                  if (validPromotions.length !== selectedPromotions.length) {
                    setSelectedPromotions(validPromotions);
                    toast.error('Some promotions were deselected because they require higher spending.');
                  }
                }
              }}
              disabled={!user}
              leftIcon={<FaDollarSign size={16} />}
            />
            
            <Input 
              label="Remark (optional)" 
              placeholder="Add a note about this transaction" 
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              disabled={!user}
              leftIcon={<FaClipboard size={16} />}
            />
            
            <PromotionsContainer>
              <PromotionsTitle>
                <FaTag style={{ marginRight: theme.spacing.sm }} />
                Available Promotions
              </PromotionsTitle>
              
              {availablePromotions.length > 0 ? (
                availablePromotions.map((promotion) => {
                  // Determine if a promotion meets the minimum spending requirement
                  const isEligible = !promotion.minSpending || parseFloat(amount || 0) >= promotion.minSpending;
                  const isAutomatic = promotion.type === 'automatic';
                  const isSelected = selectedPromotions.some(p => p.id === promotion.id);
                  
                  return (
                    <PromotionItem 
                      key={promotion.id} 
                      isSelected={isSelected}
                      onClick={() => handlePromotionToggle(promotion)}
                      style={{
                        opacity: isEligible ? 1 : 0.6,
                        cursor: isEligible && !isAutomatic ? 'pointer' : 'not-allowed',
                        backgroundColor: isAutomatic && isEligible ? 'rgba(46, 204, 113, 0.1)' : isSelected ? 'rgba(52, 152, 219, 0.1)' : 'transparent',
                      }}
                    >
                      <PromotionIcon>
                        <FaTag />
                      </PromotionIcon>
                      <PromotionInfo>
                        <h4>{promotion.name} {isAutomatic && '(Automatic)'}</h4>
                        {promotion.minSpending && (
                          <p style={{ 
                            color: isEligible ? theme.colors.text.secondary : theme.colors.error.main 
                          }}>
                            Min. Spend: ${promotion.minSpending.toFixed(2)}
                            {!isEligible && ' (not eligible)'}
                          </p>
                        )}
                      </PromotionInfo>
                      <PromotionValue>
                        {promotion.rate ? `${promotion.rate}×` : `+${promotion.points}`}
                      </PromotionValue>
                      {isAutomatic && isEligible && (
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold', 
                          color: theme.colors.success.main,
                          marginLeft: theme.spacing.md 
                        }}>
                          Applied
                        </div>
                      )}
                    </PromotionItem>
                  );
                })
              ) : (
                <p>{user ? 'No promotions available for this user' : 'Please select a user to see available promotions'}</p>
              )}
            </PromotionsContainer>
          </Card.Body>
        </Card>
      </FormSection>
      
      <SummaryCard>
        <Card.Header>
          <Card.Title>Transaction Summary</Card.Title>
        </Card.Header>
        <Card.Body>
          <SummaryItem>
            <div className="label">Customer</div>
            <div className="value">{user ? user.name : '-'}</div>
          </SummaryItem>
          <SummaryItem>
            <div className="label">Purchase Amount</div>
            <div className="value">${parseFloat(amount || 0).toFixed(2)}</div>
          </SummaryItem>
          <SummaryItem>
            <div className="label">Promotions Applied</div>
            <div className="value">{selectedPromotions.length}</div>
          </SummaryItem>
          <SummaryItem>
            <div className="label">Points Earned</div>
            <div className="value">
              <PointsEarned>
                {amount ? calculateEarnedPoints() : 0} points
              </PointsEarned>
            </div>
          </SummaryItem>
          <TotalItem>
            <div className="label">Total</div>
            <div className="value">${parseFloat(amount || 0).toFixed(2)}</div>
          </TotalItem>
          
          <Button 
            fullWidth 
            style={{ marginTop: theme.spacing.lg }} 
            onClick={handleSubmit}
            disabled={!user || !amount || parseFloat(amount) <= 0 || isSubmitting}
            loading={isSubmitting}
          >
            Complete Transaction
          </Button>
        </Card.Body>
      </SummaryCard>
    </Container>
  );
  
  const renderStep2 = () => (
    <SuccessPage
      title="Transaction Completed!"
      description="The purchase transaction has been successfully processed"
      cardTitle="Transaction Details"
      details={[
        { 
          icon: <FaReceipt />, 
          label: "Transaction ID", 
          value: `#${transaction?.id}` 
        },
        { 
          icon: <FaUser />, 
          label: "Customer", 
          value: user?.name 
        },
        { 
          icon: <FaDollarSign />, 
          label: "Amount", 
          value: `$${parseFloat(amount).toFixed(2)}` 
        },
      ]}
      total={{
        label: "Points Earned",
        value: `${transaction?.earned || calculateEarnedPoints()} points`,
        isPositive: true
      }}
      buttonText="New Transaction"
      onButtonClick={handleReset}
    />
  );
  
  return (
    <div>
      <PageTitle>Create Transaction</PageTitle>
      
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      
      {isSubmitting && (
        <LoadingOverlay>
          <div>Processing transaction...</div>
        </LoadingOverlay>
      )}
    </div>
  );
};

export default CreateTransaction; 

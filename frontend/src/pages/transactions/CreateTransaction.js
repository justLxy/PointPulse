import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import TransactionService from '../../services/transaction.service';
import PromotionService from '../../services/promotion.service';
import UserService from '../../services/user.service';
import theme from '../../styles/theme';
import { toast } from 'react-hot-toast';
import { FaUser, FaDollarSign, FaTag, FaClipboard, FaSearch, FaCheckCircle } from 'react-icons/fa';

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

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${theme.spacing.xl};
  
  svg {
    font-size: 48px;
    color: ${theme.colors.success.main};
    margin-bottom: ${theme.spacing.lg};
  }
  
  h2 {
    margin: 0 0 ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize['2xl']};
  }
  
  p {
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing.xl};
  }
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

const CreateTransaction = () => {
  const [step, setStep] = useState(1);
  const [utorid, setUtorid] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [transaction, setTransaction] = useState(null);
  
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Fetch available promotions
    const fetchPromotions = async () => {
      try {
        const response = await PromotionService.getPromotions();
        if (response && response.results) {
          setPromotions(response.results);
        }
      } catch (err) {
        console.error('Failed to fetch promotions:', err);
      }
    };
    
    fetchPromotions();
  }, []);
  
  const handleUserSearch = async () => {
    if (!utorid.trim()) {
      setError('Please enter a UTORid');
      return;
    }
    
    setError('');
    setSearchLoading(true);
    
    try {
      const userData = await UserService.getUser(utorid);
      setUser(userData);
    } catch (err) {
      setError('User not found or you do not have permission to view this user');
      setUser(null);
    } finally {
      setSearchLoading(false);
    }
  };
  
  const handlePromotionToggle = (promotion) => {
    setSelectedPromotions((prevSelected) => {
      // If already selected, remove it
      if (prevSelected.some(p => p.id === promotion.id)) {
        return prevSelected.filter(p => p.id !== promotion.id);
      }
      // Otherwise add it
      return [...prevSelected, promotion];
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
      // Use the highest rate promotion
      const highestRate = Math.max(...ratePromotions.map(p => p.rate));
      
      // Apply minimum spending requirement if applicable
      const applicableRatePromos = ratePromotions.filter(p => 
        !p.minSpending || baseAmount >= p.minSpending
      );
      
      if (applicableRatePromos.length > 0) {
        const highestApplicableRate = Math.max(...applicableRatePromos.map(p => p.rate));
        points = Math.round(points * highestApplicableRate);
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
      const response = await TransactionService.createPurchase(
        user.utorid,
        parseFloat(amount),
        selectedPromotions.map(p => p.id),
        remark
      );
      
      setTransaction(response);
      setStep(2);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    } catch (err) {
      setError(err.message || 'Failed to create transaction');
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
              <Button 
                onClick={handleUserSearch} 
                loading={searchLoading}
                size="medium"
                style={{ height: '40px' }}
              >
                <FaSearch /> Search
              </Button>
            </div>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            {user && (
              <UserSection>
                <UserInfo>
                  <Avatar>{getInitials(user.name)}</Avatar>
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
              onChange={(e) => setAmount(e.target.value)}
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
              
              {user && user.promotions && user.promotions.length > 0 ? (
                user.promotions.map((promotion) => (
                  <PromotionItem 
                    key={promotion.id} 
                    isSelected={selectedPromotions.some(p => p.id === promotion.id)}
                    onClick={() => handlePromotionToggle(promotion)}
                  >
                    <PromotionIcon>
                      <FaTag />
                    </PromotionIcon>
                    <PromotionInfo>
                      <h4>{promotion.name}</h4>
                      {promotion.minSpending && (
                        <p>Min. Spend: ${promotion.minSpending.toFixed(2)}</p>
                      )}
                    </PromotionInfo>
                    <PromotionValue>
                      {promotion.rate ? `${promotion.rate}×` : `+${promotion.points}`}
                    </PromotionValue>
                  </PromotionItem>
                ))
              ) : (
                <p>No promotions available for this user</p>
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
    <Card>
      <Card.Body>
        <SuccessContainer>
          <FaCheckCircle />
          <h2>Transaction Completed!</h2>
          <p>The purchase transaction has been successfully processed</p>
          
          <div style={{ textAlign: 'left', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <SummaryItem>
              <div className="label">Transaction ID</div>
              <div className="value">#{transaction?.id}</div>
            </SummaryItem>
            <SummaryItem>
              <div className="label">Customer</div>
              <div className="value">{user?.name}</div>
            </SummaryItem>
            <SummaryItem>
              <div className="label">Amount</div>
              <div className="value">${parseFloat(amount).toFixed(2)}</div>
            </SummaryItem>
            <SummaryItem>
              <div className="label">Points Earned</div>
              <div className="value">
                <PointsEarned>
                  {transaction?.earned || calculateEarnedPoints()} points
                </PointsEarned>
              </div>
            </SummaryItem>
          </div>
          
          <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
            <Button variant="outlined" onClick={handleReset}>
              New Transaction
            </Button>
          </div>
        </SuccessContainer>
      </Card.Body>
    </Card>
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
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import SuccessPage from '../../components/common/SuccessPage';
import TransactionService from '../../services/transaction.service';
import UserService from '../../services/user.service';
import theme from '../../styles/theme';
import { toast } from 'react-hot-toast';
import { FaUser, FaExchangeAlt, FaClipboard, FaSearch, FaCheckCircle, FaLink } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-bottom: ${theme.spacing.md};
  margin-top: 0;
`;

const UserSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.default};
  border-radius: ${theme.radius.md};
  
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
    margin: 0;
    border-radius: ${theme.radius.full};
  }
`;

const SearchInput = styled.div`
  flex: 1;
  
  /* Override the default margin of Input component */
  & > div {
    margin-bottom: 0;
  }
`;

const SummaryCard = styled(Card)`
  position: sticky;
  top: 80px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  transition: background-color 0.2s ease;
  
  &:last-of-type {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  .label {
    color: ${theme.colors.text.secondary};
    font-weight: ${theme.typography.fontWeights.medium};
    display: flex;
    align-items: center;
    
    svg {
      margin-right: ${theme.spacing.sm};
      color: ${theme.colors.primary.main};
      font-size: 14px;
    }
  }
  
  .value {
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: ${theme.colors.text.primary};
  }
`;

const TotalItem = styled(SummaryItem)`
  font-weight: ${theme.typography.fontWeights.bold};
  font-size: ${theme.typography.fontSize.lg};
  padding: ${theme.spacing.lg} 0 ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
  border-top: 2px solid ${theme.colors.border.main};
  border-bottom: none;
  background-color: transparent;
  
  &:hover {
    background-color: transparent;
  }
  
  .label {
    color: ${theme.colors.text.primary};
    font-weight: ${theme.typography.fontWeights.bold};
  }
  
  .value {
    color: ${({ isPositive }) => isPositive ? theme.colors.success.main : theme.colors.error.main};
    font-weight: ${theme.typography.fontWeights.bold};
    position: relative;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    background-color: ${({ isPositive }) => isPositive ? 'rgba(72, 187, 120, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
    border-radius: ${theme.radius.md};
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: ${theme.radius.md};
      box-shadow: 0 0 0 2px ${({ isPositive }) => isPositive ? theme.colors.success.main : theme.colors.error.main};
      opacity: 0.3;
    }
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
  color: ${theme.colors.error.dark};
  margin-bottom: ${theme.spacing.md};
  border-radius: ${theme.radius.sm};
`;

const TransactionList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.md};
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border.light};
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${({ isSelected }) => isSelected ? 'rgba(52, 152, 219, 0.1)' : 'transparent'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${({ isSelected }) => isSelected ? 'rgba(52, 152, 219, 0.15)' : 'rgba(0, 0, 0, 0.03)'};
  }
`;

const TransactionIcon = styled.div`
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

const TransactionInfo = styled.div`
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

const TransactionAmount = styled.div`
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${({ positive }) => positive ? theme.colors.success.main : theme.colors.error.main};
  font-size: ${theme.typography.fontSize.sm};
`;

const SearchContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TransactionId = styled.span`
  color: ${theme.colors.primary.main};
  font-weight: ${theme.typography.fontWeights.medium};
`;

const CreateAdjustment = () => {
  const queryClient = useQueryClient();
  
  // States
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [userTransactions, setUserTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTransaction, setCreatedTransaction] = useState(null);
  
  // Calculate new balance preview
  const newBalance = selectedUser && adjustmentAmount
    ? Number(selectedUser.points) + Number(adjustmentAmount)
    : null;
  
  // Fetch user's transactions when a user is selected
  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchUserTransactions = async () => {
      try {
        setIsLoading(true);
        const response = await UserService.getTransactions({
          name: selectedUser.utorid
        });
        setUserTransactions(response.results || []);
      } catch (error) {
        toast.error('Failed to fetch user transactions');
        setError('Failed to fetch user transactions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserTransactions();
  }, [selectedUser]);
  
  // Search for user
  const handleUserSearch = async () => {
    if (!userSearch) {
      toast.error('Please enter a UTORid to search');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      const user = await UserService.searchUserByUTORid(userSearch);
      
      if (!user) {
        setError('User not found');
        setSelectedUser(null);
        return;
      }
      
      setSelectedUser(user);
    } catch (error) {
      setError('Failed to search for user');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter transactions based on search
  const filteredTransactions = transactionSearch 
    ? userTransactions.filter(tx => 
        tx.id.toString().includes(transactionSearch) || 
        tx.type.includes(transactionSearch.toLowerCase())
      )
    : userTransactions;
  
  // Handle transaction selection
  const handleTransactionSelect = (transaction) => {
    setSelectedTransaction(transaction);
  };
  
  // Reset all fields
  const handleReset = () => {
    setUserSearch('');
    setSelectedUser(null);
    setTransactionSearch('');
    setUserTransactions([]);
    setSelectedTransaction(null);
    setAdjustmentAmount('');
    setRemark('');
    setError('');
    setIsSuccess(false);
    setCreatedTransaction(null);
  };
  
  // Submit the adjustment transaction
  const handleSubmit = async () => {
    if (!selectedUser || !selectedTransaction) {
      setError('Please select a user and a transaction');
      return;
    }
    
    if (!adjustmentAmount || isNaN(Number(adjustmentAmount)) || Number(adjustmentAmount) === 0) {
      setError('Please enter a valid adjustment amount');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const adjustmentData = {
        utorid: selectedUser.utorid,
        type: "adjustment", // Ensure type is explicitly set
        amount: Number(adjustmentAmount),
        relatedId: selectedTransaction.id,
        remark: remark || '',
      };
      
      const result = await TransactionService.createAdjustment(adjustmentData);
      
      // Clear cache for transactions and the current user
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] }); // Invalidate current user data
      
      setCreatedTransaction(result);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error creating adjustment:', error);
      // Display specific backend error message if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create adjustment transaction';
      setError(errorMessage);
      toast.error(errorMessage); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <div>
      <PageTitle>Create Adjustment Transaction</PageTitle>
      
      {isSuccess ? (
        <SuccessPage
          title="Adjustment Created Successfully"
          description="The adjustment transaction has been created and the user's points balance has been updated immediately."
          cardTitle="Transaction Details"
          details={[
            { 
              icon: <FaClipboard />, 
              label: "Transaction ID", 
              value: `#${createdTransaction.id}` 
            },
            { 
              icon: <FaUser />, 
              label: "User", 
              value: createdTransaction.utorid 
            },
            { 
              icon: <FaLink />, 
              label: "Related Transaction", 
              value: `#${createdTransaction.relatedId}` 
            },
            { 
              icon: <FaClipboard />, 
              label: "Remark", 
              value: createdTransaction.remark || 'None' 
            },
          ]}
          total={{
            label: "Adjustment Amount",
            value: `${Number(createdTransaction.amount) > 0 ? '+' : ''}${createdTransaction.amount} points`,
            isPositive: Number(createdTransaction.amount) > 0
          }}
          buttonText="Create Another Adjustment"
          onButtonClick={handleReset}
        />
      ) : (
        <Container>
          <Card>
            <Card.Body>
              <FormSection>
                <UserSection>
                  <SectionTitle>Customer Information</SectionTitle>
                  
                  <SearchContainer>
                    <SearchInput>
                      <Input 
                        placeholder="Enter UTORid"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        leftIcon={<FaUser />}
                        onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
                      />
                    </SearchInput>
                    <Button onClick={handleUserSearch}>
                      <FaSearch /> Search
                    </Button>
                  </SearchContainer>
                  
                  {error && <ErrorMessage>{error}</ErrorMessage>}
                  
                  {selectedUser && (
                    <UserInfo>
                      {selectedUser.avatarUrl ? (
                        (() => {
                          const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(selectedUser.avatarUrl);
                          const avatarPath = selectedUser.avatarUrl.startsWith('/') ? selectedUser.avatarUrl : `/${selectedUser.avatarUrl}`;
                          const baseSrc = isAbsolute ? selectedUser.avatarUrl : `${API_URL}${avatarPath}`;
                          return <img src={baseSrc} alt={selectedUser.name} />;
                        })()
                      ) : (
                        <Avatar>{getInitials(selectedUser.name)}</Avatar>
                      )}
                      <UserInfoText>
                        <h3>{selectedUser.name}</h3>
                        <p>{selectedUser.utorid}</p>
                        <p>Points Balance: <strong>{selectedUser.points}</strong></p>
                      </UserInfoText>
                    </UserInfo>
                  )}
                </UserSection>
                
                {selectedUser && (
                  <>
                    <SectionTitle>Related Transaction</SectionTitle>
                    <Input 
                      placeholder="Search by transaction ID or type"
                      value={transactionSearch}
                      onChange={(e) => setTransactionSearch(e.target.value)}
                      leftIcon={<FaSearch />}
                    />
                    
                    {isLoading ? (
                      <LoadingSpinner text="Loading transactions..." />
                    ) : filteredTransactions.length > 0 ? (
                      <TransactionList>
                        {filteredTransactions.map(transaction => (
                          <TransactionItem 
                            key={transaction.id}
                            isSelected={selectedTransaction?.id === transaction.id}
                            onClick={() => handleTransactionSelect(transaction)}
                          >
                            <TransactionIcon>
                              {transaction.type === 'purchase' ? <FaUser /> : 
                                transaction.type === 'redemption' ? <FaExchangeAlt /> : 
                                <FaLink />}
                            </TransactionIcon>
                            <TransactionInfo>
                              <h4>Transaction <TransactionId>#{transaction.id}</TransactionId> - {transaction.type}</h4>
                              <p>
                                {transaction.remark || 'No remark'} • 
                                {transaction.createdAt && new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </TransactionInfo>
                            <TransactionAmount positive={transaction.amount > 0}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount} pts
                            </TransactionAmount>
                          </TransactionItem>
                        ))}
                      </TransactionList>
                    ) : (
                      <p>No transactions found</p>
                    )}
                    
                    <SectionTitle>Adjustment Details</SectionTitle>
                    <Input
                      label="Adjustment Amount ($)"
                      placeholder="Enter point amount (e.g. -100 or 50)"
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(e.target.value)}
                      type="number"
                      leftIcon={<FaExchangeAlt />}
                      helperText="Use negative value to subtract points, positive to add points"
                      required
                    />
                    
                    <Input
                      label="Remark (optional)"
                      placeholder="Add a note about this adjustment"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      leftIcon={<FaClipboard />}
                    />
                    
                    <Button 
                      fullWidth 
                      onClick={handleSubmit}
                      disabled={!selectedUser || !selectedTransaction || !adjustmentAmount}
                      style={{ marginTop: theme.spacing.lg }}
                    >
                      Complete Adjustment
                    </Button>
                  </>
                )}
              </FormSection>
            </Card.Body>
          </Card>
          
          {selectedUser && (
            <SummaryCard>
              <Card.Header>
                <Card.Title>Adjustment Summary</Card.Title>
              </Card.Header>
              <Card.Body>
                <SummaryItem>
                  <span className="label">Customer</span>
                  <span className="value">{selectedUser?.name || '-'}</span>
                </SummaryItem>
                
                <SummaryItem>
                  <span className="label">Current Points</span>
                  <span className="value">{selectedUser?.points || 0}</span>
                </SummaryItem>
                
                {selectedTransaction && (
                  <>
                    <SummaryItem>
                      <span className="label">Related Transaction</span>
                      <span className="value">#{selectedTransaction.id}</span>
                    </SummaryItem>
                    
                    <SummaryItem>
                      <span className="label">Transaction Type</span>
                      <span className="value" style={{ textTransform: 'capitalize' }}>
                        {selectedTransaction.type}
                      </span>
                    </SummaryItem>
                  </>
                )}
                
                {adjustmentAmount && (
                  <>
                    <SummaryItem>
                      <span className="label">Adjustment Amount</span>
                      <span className="value" style={{ 
                        color: Number(adjustmentAmount) > 0 ? theme.colors.success.main : theme.colors.error.main 
                      }}>
                        {Number(adjustmentAmount) > 0 ? '+' : ''}
                        {adjustmentAmount} pts
                      </span>
                    </SummaryItem>
                    
                    {newBalance !== null && (
                      <TotalItem isPositive={newBalance > Number(selectedUser.points)}>
                        <span className="label">New Balance</span>
                        <span className="value">
                          {newBalance} pts
                        </span>
                      </TotalItem>
                    )}
                  </>
                )}
              </Card.Body>
            </SummaryCard>
          )}
        </Container>
      )}
      
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner text="Processing..." />
        </LoadingOverlay>
      )}
    </div>
  );
};

export default CreateAdjustment; 
import React from 'react';
import styled from '@emotion/styled';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaEye, FaUserEdit, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import theme from '../../styles/theme';

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 180px 150px;
  padding: ${theme.spacing.md};
  font-weight: ${theme.typography.fontWeights.semiBold};
  background-color: ${theme.colors.background.default};
  border-bottom: 1px solid ${theme.colors.border.light};
  
  > div {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr 180px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 180px 150px;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.light};
  align-items: center;
  
  &:hover {
    background-color: ${theme.colors.background.default};
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr 180px;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-radius: ${theme.spacing.xs};
    border: 1px solid ${theme.colors.border.light};
    background-color: white;
  }
`;

const MobileLabel = styled.span`
  display: none;
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-right: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: 768px) {
    display: inline-block;
    min-width: 60px;
    text-align: left;
    margin-right: ${theme.spacing.md};
  }
`;

const UserHeader = styled.div`
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding-bottom: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.sm};
    border-bottom: 1px solid ${theme.colors.border.light};
  }
`;

const UserDetails = styled.div`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
  }
`;

const UserMeta = styled.div`
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
  }
`;

const UserStatusIndicator = styled.div`
  @media (max-width: 768px) {
    display: flex;
    justify-content: flex-end;
  }
`;

const UserName = styled.div`
  font-weight: ${theme.typography.fontWeights.medium};
`;

const UserUtorid = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const UserEmail = styled.div`
  @media (max-width: 768px) {
    word-break: break-all;
    display: flex;
    align-items: flex-start;
    width: 100%;
  }
`;

const UserRole = styled.div`
  display: flex;
  justify-content: center;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
    width: 100%;
    align-items: flex-start;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const BadgeWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  justify-content: center;
  
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.sm};
    max-width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    margin-left: ${theme.spacing.sm};
  }
`;

const PageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const PageInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: 768px) {
    text-align: center;
    width: 100%;
  }
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  
  svg {
    color: ${theme.colors.text.secondary};
    opacity: 0.6;
  }
  
  p {
    margin: 0;
  }
`;

const ButtonText = styled.span`
  @media (max-width: 768px) {
    display: inline;
    margin-left: ${theme.spacing.xs};
  }
`;

const StatusColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 768px) {
    justify-content: flex-start;
    margin-bottom: ${theme.spacing.sm};
    width: 100%;
    align-items: flex-start;
  }
`;

const UserList = ({ 
  users, 
  totalCount, 
  isLoading, 
  isSuperuser,
  isManager,
  filters,
  onFilterChange,
  onViewUser,
  onEditUser,
  renderUserBadges,
  onToggleSuspicious
}) => {
  // Either superuser or manager can edit users
  const canEditUser = isSuperuser || isManager;
  
  // Calculate pagination
  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(startIndex + filters.limit - 1, totalCount);
  
  return (
    <>
      {isLoading ? (
        <LoadingSpinner text="Loading users..." />
      ) : (
        <Card>
          <TableHeader>
            <div>User</div>
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>
          
          {users && users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <UserHeader>
                  <UserDetails>
                    <UserName>{user.name}</UserName>
                    <UserUtorid>{user.utorid}</UserUtorid>
                  </UserDetails>
                  <UserStatusIndicator>
                    {/* Remove renderUserBadges here - we'll use it in the StatusColumn */}
                  </UserStatusIndicator>
                </UserHeader>
                
                <UserEmail>
                  <MobileLabel>Email:</MobileLabel>
                  {user.email}
                </UserEmail>
                
                <UserRole>
                  <MobileLabel>Role:</MobileLabel>
                  <Badge
                    style={{
                      backgroundColor: 
                        user.role === 'superuser' ? '#3498db' : 
                        user.role === 'manager' ? '#27ae60' : 
                        user.role === 'cashier' ? '#f39c12' : 
                        '#95a5a6',
                      color: 'white'
                    }}
                  >
                    {user.role === 'regular' ? 'Regular' : 
                     user.role === 'manager' ? 'Manager' : 
                     user.role === 'cashier' ? 'Cashier' : 
                     user.role === 'superuser' ? 'Superuser' : 'Unknown'}
                  </Badge>
                </UserRole>
                
                <StatusColumn>
                  <MobileLabel>Status:</MobileLabel>
                  {renderUserBadges(user)}
                </StatusColumn>
                
                <ActionButtons>
                  <Button
                    size="small" 
                    variant="outlined"
                    onClick={() => onViewUser(user)}
                    title="View User"
                  >
                    <FaEye />
                  </Button>
                  
                  {/* Add suspicious toggle button for cashiers (Manager and above can use this) */}
                  {canEditUser && user.role === 'cashier' && (
                    <Button
                      size="small" 
                      variant="outlined"
                      onClick={() => onToggleSuspicious(user)}
                      style={{
                        borderColor: user.suspicious ? '#27ae60' : '#e74c3c',
                        color: user.suspicious ? '#27ae60' : '#e74c3c'
                      }}
                      title={user.suspicious ? "Clear suspicious flag" : "Mark as suspicious"}
                    >
                      <FaExclamationTriangle />
                    </Button>
                  )}
                </ActionButtons>
              </TableRow>
            ))
          ) : (
            <EmptyState>
              <FaInfoCircle size={48} />
              <p>No users found matching your filters.</p>
            </EmptyState>
          )}
        </Card>
      )}
      
      <PageControls>
        <PageInfo>
          Showing {users && users.length > 0 ? startIndex : 0} to {users && users.length > 0 ? endIndex : 0} of {totalCount} users
        </PageInfo>
        
        <Pagination>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onFilterChange('page', Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            style={{ minWidth: '80px' }}
          >
            Previous
          </Button>
          
          <PageInfo style={{ 
            minWidth: '100px', 
            textAlign: 'center', 
            whiteSpace: 'nowrap' 
          }}>
            Page {filters.page} of {totalPages > 0 ? totalPages : 1}
          </PageInfo>
          
          <Button
            size="small"
            variant="outlined"
            onClick={() => onFilterChange('page', filters.page + 1)}
            disabled={filters.page >= totalPages}
            style={{ minWidth: '80px' }}
          >
            Next
          </Button>
        </Pagination>
      </PageControls>
    </>
  );
};

export default UserList; 
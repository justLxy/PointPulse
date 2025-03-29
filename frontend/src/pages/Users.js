import { useState } from 'react';
import styled from '@emotion/styled';
import { useUsers } from '../hooks/useUsers';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';
import { FaSearch, FaUserPlus, FaEye, FaUserEdit, FaCheck, FaUserTag, FaUserTimes, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';
import React from 'react';

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  min-width: 250px;
`;

const FilterInput = styled.div`
  width: 200px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

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

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 150px 150px;
  padding: ${theme.spacing.md};
  font-weight: ${theme.typography.fontWeights.semiBold};
  background-color: ${theme.colors.background.default};
  border-bottom: 1px solid ${theme.colors.border.light};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr 100px;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 150px 150px;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.light};
  align-items: center;
  
  &:hover {
    background-color: ${theme.colors.background.default};
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr 100px;
  }
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    
    &:not(:last-child) {
      border-bottom: 1px solid ${theme.colors.border.light};
    }
  }
`;

const MobileLabel = styled.span`
  display: none;
  font-weight: ${theme.typography.fontWeights.semiBold};
  margin-right: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    display: inline;
  }
`;

const UserDetails = styled.div`
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-bottom: ${theme.spacing.sm};
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
    margin-bottom: ${theme.spacing.sm};
  }
`;

const UserRole = styled.div`
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.sm};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    width: 100%;
    
    button {
      flex: 1;
      min-width: 120px;
    }
  }
`;

const BadgeWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.sm};
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const ModalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  
  button {
    flex: 1;
  }
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
`;

const Users = () => {
  const { activeRole } = useAuth();
  const isSuperuser = activeRole === 'superuser';
  
  // State for filters and pagination
  const [filters, setFilters] = useState({
    name: '',
    role: '',
    verified: '',
    activated: '',
    page: 1,
    limit: 10,
  });
  
  // 调试响应
  React.useEffect(() => {
    console.log(`User filters changed: `, filters);
  }, [filters]);
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewUserDetails, setViewUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    utorid: '',
    name: '',
    email: '',
  });
  
  const [editData, setEditData] = useState({
    verified: false,
    suspicious: false,
    role: 'regular',
  });
  
  // Get users with current filters
  const getApiParams = () => {
    const apiParams = {
      page: filters.page,
      limit: filters.limit,
    };

    // 只有当name有内容时才添加
    if (filters.name) {
      apiParams.name = filters.name;
    }

    // 只有当选择了具体角色时才添加
    if (filters.role) {
      apiParams.role = filters.role;
    }

    // 转换字符串为布尔值，只有当有明确选择时才添加
    if (filters.verified === 'true') {
      apiParams.verified = true;
    } else if (filters.verified === 'false') {
      apiParams.verified = false;
    }

    // 转换字符串为布尔值，只有当有明确选择时才添加
    if (filters.activated === 'true') {
      apiParams.activated = true;
    } else if (filters.activated === 'false') {
      apiParams.activated = false;
    }

    console.log('User API params:', apiParams);
    return apiParams;
  };

  const { users, totalCount, isLoading, createUser, isCreatingUser, updateUser, isUpdatingUser } = useUsers(getApiParams());
  
  // 打印数据用于调试
  React.useEffect(() => {
    console.log('Users data:', { users, totalCount });
  }, [users, totalCount]);
  
  // Calculate pagination
  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(startIndex + filters.limit - 1, totalCount);
  
  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset page when filters change
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };
  
  // Handle create user
  const handleCreateUser = () => {
    if (!newUser.utorid || !newUser.name || !newUser.email) {
      return;
    }
    
    createUser(newUser, {
      onSuccess: () => {
        setCreateModalOpen(false);
        setNewUser({ utorid: '', name: '', email: '' });
      },
    });
  };
  
  // Handle update user
  const handleUpdateUser = () => {
    if (!selectedUser) return;
    
    const userData = { ...editData };
    
    updateUser(
      { userId: selectedUser.id, userData },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };
  
  // Set up user for editing
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditData({
      verified: user.verified,
      suspicious: user.suspicious || false,
      role: user.role,
    });
    setEditModalOpen(true);
  };
  
  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewUserDetails(true);
  };
  
  // Render badge for user status
  const renderUserBadges = (user) => (
    <BadgeWrapper>
      {user.verified ? (
        <Badge style={{ backgroundColor: '#27ae60', color: 'white' }}>Verified</Badge>
      ) : (
        <Badge style={{ backgroundColor: '#e74c3c', color: 'white' }}>Unverified</Badge>
      )}
      
      {user.suspicious && <Badge style={{ backgroundColor: '#f39c12', color: 'white' }}>Suspicious</Badge>}
      
      {user.lastLogin ? (
        <Badge style={{ backgroundColor: '#27ae60', color: 'white' }}>Active</Badge>
      ) : (
        <Badge style={{ backgroundColor: '#e74c3c', color: 'white' }}>Inactive</Badge>
      )}
    </BadgeWrapper>
  );
  
  return (
    <div>
      <PageTitle>User Management</PageTitle>
      
      <FilterSection>
        <SearchInput>
          <Input
            placeholder="Search by name or utorid"
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            leftIcon={<FaSearch />}
          />
        </SearchInput>
        
        <FilterInput>
          <Select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            placeholder="Role"
          >
            <option value="">All Roles</option>
            <option value="regular">Regular</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="superuser">Superuser</option>
          </Select>
        </FilterInput>
        
        <FilterInput>
          <Select
            value={filters.verified}
            onChange={(e) => handleFilterChange('verified', e.target.value)}
            placeholder="Verification"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </Select>
        </FilterInput>
        
        <FilterInput>
          <Select
            value={filters.activated}
            onChange={(e) => handleFilterChange('activated', e.target.value)}
            placeholder="Activity"
          >
            <option value="">All Activity</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </FilterInput>
        
        <Button onClick={() => setCreateModalOpen(true)}>
          <FaUserPlus /> Create User
        </Button>
      </FilterSection>
      
      <Card>
        <TableHeader>
          <div>User</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>
        
        {isLoading ? (
          <LoadingSpinner text="Loading users..." />
        ) : users && users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id}>
              <UserDetails>
                <div>
                  <MobileLabel>User:</MobileLabel>
                  <UserName>{user.name}</UserName>
                  <UserUtorid>{user.utorid}</UserUtorid>
                </div>
              </UserDetails>
              
              <UserEmail>
                <MobileLabel>Email:</MobileLabel>
                {user.email}
              </UserEmail>
              
              <UserRole>
                <MobileLabel>Role:</MobileLabel>
                <Badge 
                  style={{ 
                    backgroundColor: 
                      user.role === 'superuser'
                        ? '#3498db'  // 蓝色
                        : user.role === 'manager'
                        ? '#2ecc71'  // 绿色
                        : user.role === 'cashier'
                        ? '#f39c12'  // 橙色
                        : '#95a5a6', // 灰色
                    color: 'white'
                  }}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </UserRole>
              
              <div>
                <MobileLabel>Status:</MobileLabel>
                {renderUserBadges(user)}
              </div>
              
              <ActionButtons>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => handleViewUser(user)}
                >
                  <FaEye />
                </Button>
                
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={() => handleEditUser(user)}
                >
                  <FaUserEdit />
                </Button>
                
                {!user.verified && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    style={{ color: '#27ae60', borderColor: '#27ae60' }}
                    onClick={() => {
                      updateUser(
                        { 
                          userId: user.id, 
                          userData: { verified: true } 
                        },
                        {
                          onSuccess: () => {
                            // 可以在这里显示成功消息
                          },
                        }
                      );
                    }}
                    title="Verify User"
                  >
                    <FaCheck />
                  </Button>
                )}
              </ActionButtons>
            </TableRow>
          ))
        ) : (
          <EmptyState>No users found</EmptyState>
        )}
      </Card>
      
      {totalCount > 0 && (
        <PageControls>
          <PageInfo>
            Showing {startIndex} to {endIndex} of {totalCount} users
          </PageInfo>
          
          <Pagination>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
            >
              Previous
            </Button>
            
            <PageInfo>
              Page {filters.page} of {totalPages}
            </PageInfo>
            
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
              disabled={filters.page === totalPages}
            >
              Next
            </Button>
          </Pagination>
        </PageControls>
      )}
      
      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New User"
        size="medium"
      >
        <ModalContent>
          <ModalForm>
            <Input
              label="UTORid"
              value={newUser.utorid}
              onChange={(e) => setNewUser((prev) => ({ ...prev, utorid: e.target.value }))}
              placeholder="Enter UTORid"
              helperText="Unique, Alphanumeric, 8 characters"
              required
            />
            
            <Input
              label="Name"
              value={newUser.name}
              onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              helperText="1-50 characters"
              required
            />
            
            <Input
              label="Email"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              helperText="Valid University of Toronto email"
              required
            />
          </ModalForm>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => setCreateModalOpen(false)}
              disabled={isCreatingUser}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              loading={isCreatingUser}
            >
              Create User
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.name || ''}`}
        size="medium"
      >
        <ModalContent>
          <ModalForm>
            <Select
              label="Verification Status"
              value={editData.verified.toString()}
              onChange={(e) => setEditData((prev) => ({ ...prev, verified: e.target.value === 'true' }))}
            >
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </Select>
            
            {(selectedUser?.role === 'cashier' || editData.role === 'cashier') && (
              <Select
                label="Cashier Status"
                value={editData.suspicious.toString()}
                onChange={(e) => setEditData((prev) => ({ ...prev, suspicious: e.target.value === 'true' }))}
              >
                <option value="false">Normal</option>
                <option value="true">Suspicious</option>
              </Select>
            )}
            
            <Select
              label="Role"
              value={editData.role}
              onChange={(e) => setEditData((prev) => ({ ...prev, role: e.target.value }))}
            >
              {isSuperuser ? (
                <>
                  <option value="regular">Regular User</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="superuser">Superuser</option>
                </>
              ) : (
                <>
                  <option value="regular">Regular User</option>
                  <option value="cashier">Cashier</option>
                </>
              )}
            </Select>
          </ModalForm>
          
          <ModalActions>
            <Button
              variant="outlined"
              onClick={() => setEditModalOpen(false)}
              disabled={isUpdatingUser}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              loading={isUpdatingUser}
            >
              Update User
            </Button>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      {/* View User Details Modal */}
      <Modal
        isOpen={viewUserDetails}
        onClose={() => {
          setViewUserDetails(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="medium"
      >
        {selectedUser && (
          <ModalContent>
            <div>
              <h3>Account Information</h3>
              <div style={{ marginTop: theme.spacing.md }}>
                <p><strong>UTORid:</strong> {selectedUser.utorid}</p>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}</p>
                <p><strong>Points Balance:</strong> {selectedUser.points || 0}</p>
                <p><strong>Created At:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                <p><strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                <p><strong>Verified:</strong> {selectedUser.verified ? 'Yes' : 'No'}</p>
                {selectedUser.role === 'cashier' && (
                  <p><strong>Suspicious:</strong> {selectedUser.suspicious ? 'Yes' : 'No'}</p>
                )}
              </div>
              
              {selectedUser.promotions && selectedUser.promotions.length > 0 && (
                <div style={{ marginTop: theme.spacing.lg }}>
                  <h3>Available One-time Promotions</h3>
                  <ul>
                    {selectedUser.promotions.map((promo) => (
                      <li key={promo.id}>{promo.name} - {promo.points} points</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <ModalActions>
              <Button
                onClick={() => handleEditUser(selectedUser)}
                style={{ flex: 1 }}
              >
                Edit User
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setViewUserDetails(false);
                  setSelectedUser(null);
                }}
                style={{ flex: 1 }}
              >
                Close
              </Button>
            </ModalActions>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
};

export default Users; 
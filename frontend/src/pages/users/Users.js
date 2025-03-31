import { useState } from 'react';
import styled from '@emotion/styled';
import { useUsers } from '../../hooks/useUsers';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import theme from '../../styles/theme';
import React from 'react';

// Import the new components
import UserFilters from '../../components/user/UserFilters';
import UserList from '../../components/user/UserList';
import UserModals from '../../components/user/UserModals';

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
  grid-template-columns: 1fr 1fr 1fr 180px 150px;
  padding: ${theme.spacing.md};
  font-weight: ${theme.typography.fontWeights.semiBold};
  background-color: ${theme.colors.background.default};
  border-bottom: 1px solid ${theme.colors.border.light};
  
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
  display: flex;
  justify-content: center;
  
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.sm};
    justify-content: flex-start;
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

const BadgeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
  align-items: center;
  min-height: 26px;
  max-width: 150px;
  
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.sm};
    max-width: 100%;
    align-items: flex-start;
  }
`;

const Users = () => {
  const { currentUser } = useAuth();
  const isSuperuser = currentUser?.role === 'superuser';
  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'superuser';
  
  // State for filters and modals
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    verified: '',
    active: '',
    page: 1,
    limit: 10,
  });
  
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
    email: '',
  });
  
  // 调试响应
  React.useEffect(() => {
    console.log(`User filters changed: `, filters);
  }, [filters]);
  
  // Get users with current filters
  const getApiParams = () => {
    const apiParams = {
      page: filters.page,
      limit: filters.limit,
    };

    // 只有当search有内容时才添加
    if (filters.search) {
      apiParams.name = filters.search;
    }

    // 只有当选择了具体角色时才添加
    if (filters.role) {
      apiParams.role = filters.role;
    }

    // 转换字符串为布尔值，只有当有明确选择时才添加
    if (filters.verified === 'verified') {
      apiParams.verified = true;
    } else if (filters.verified === 'unverified') {
      apiParams.verified = false;
    }

    // 转换字符串为布尔值，只有当有明确选择时才添加
    if (filters.active === 'active') {
      apiParams.activated = true;
    } else if (filters.active === 'inactive') {
      apiParams.activated = false;
    }

    console.log('User API params:', apiParams);
    return apiParams;
  };

  // Call useUsers hook ONCE with the generated API parameters
  const { 
    users, 
    totalCount, 
    isLoading, 
    error, 
    refetch, 
    createUser, 
    updateUser, 
    isCreatingUser, 
    isUpdatingUser 
  } = useUsers(getApiParams()); 
  
  // 打印数据用于调试
  React.useEffect(() => {
    console.log('Users data:', { users, totalCount });
  }, [users, totalCount]);
  
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
    
    // 如果分配了任何角色且用户未验证，则自动验证用户
    if (userData.role && !userData.verified) {
      userData.verified = true;
    }
    
    updateUser(
      { userId: selectedUser.id, userData },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          setSelectedUser(null);
          // 成功后立即刷新用户列表
          refetch();
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
      email: user.email
    });
    setEditModalOpen(true);
  };
  
  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewUserDetails(true);
  };
  
  // Toggle suspicious flag for cashiers
  const handleToggleSuspicious = (user) => {
    if (!user || user.role !== 'cashier') return;
    
    const newSuspiciousStatus = !user.suspicious;
    const userData = {
      suspicious: newSuspiciousStatus
    };
    
    updateUser(
      { userId: user.id, userData },
      {
        onSuccess: () => {
          // Refresh user list after update
          refetch();
        },
      }
    );
  };
  
  // Render badge for user status
  const renderUserBadges = (user) => (
    <BadgeWrapper>
      <div style={{ display: 'flex', gap: theme.spacing.xs, marginBottom: '4px' }}>
        {user.verified ? (
          <Badge style={{ backgroundColor: '#27ae60', color: 'white' }}>Verified</Badge>
        ) : (
          <Badge style={{ backgroundColor: '#e74c3c', color: 'white' }}>Unverified</Badge>
        )}
        
        {user.lastLogin ? (
          <Badge style={{ backgroundColor: '#27ae60', color: 'white' }}>Active</Badge>
        ) : (
          <Badge style={{ backgroundColor: '#e74c3c', color: 'white' }}>Inactive</Badge>
        )}
      </div>
      
      {user.suspicious && (
        <div>
          <Badge style={{ backgroundColor: '#e74c3c', color: 'white' }}>Suspicious</Badge>
        </div>
      )}
    </BadgeWrapper>
  );
  
  return (
    <div>
      {/* User Filters Component */}
      <UserFilters
        isSuperuser={isSuperuser}
        isManager={isManager}
        filters={filters}
        onFilterChange={handleFilterChange}
        onCreateClick={() => setCreateModalOpen(true)}
      />
      
      {/* User List Component - Pass data from the single useUsers call */}
      <UserList
        users={users}
        totalCount={totalCount}
        isLoading={isLoading}
        isSuperuser={isSuperuser}
        isManager={isManager}
        filters={filters}
        onFilterChange={handleFilterChange}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        renderUserBadges={renderUserBadges}
        onToggleSuspicious={handleToggleSuspicious}
      />
      
      {/* User Modals Component */}
      <UserModals
        // Create modal props
        createModalOpen={createModalOpen}
        setCreateModalOpen={setCreateModalOpen}
        newUser={newUser}
        setNewUser={setNewUser}
        handleCreateUser={handleCreateUser}
        isCreatingUser={isCreatingUser}
        
        // Edit modal props
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        editData={editData}
        setEditData={setEditData}
        handleUpdateUser={handleUpdateUser}
        isUpdatingUser={isUpdatingUser}
        
        // View details modal props
        viewUserDetails={viewUserDetails}
        setViewUserDetails={setViewUserDetails}
        
        // Permissions
        isSuperuser={isSuperuser}
        isManager={isManager}
      />
    </div>
  );
};

export default Users; 
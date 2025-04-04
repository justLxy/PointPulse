import React from 'react';
import styled from '@emotion/styled';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import theme from '../../styles/theme';

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

const UserModals = ({
  // Create modal props
  createModalOpen,
  setCreateModalOpen,
  newUser,
  setNewUser,
  handleCreateUser,
  isCreatingUser,
  
  // Edit modal props
  editModalOpen,
  setEditModalOpen,
  selectedUser,
  setSelectedUser,
  editData,
  setEditData,
  handleUpdateUser,
  isUpdatingUser,
  
  // View details modal props
  viewUserDetails,
  setViewUserDetails,
  
  // Permissions
  isSuperuser,
  isManager
}) => {
  // Either superuser or manager can edit users
  const canEditUser = isSuperuser || isManager;
  
  return (
    <>
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
            <Input
              label="Email"
              value={editData.email || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              helperText="Valid University of Toronto email"
            />
            
            {!editData.verified && (
              <Button
                fullWidth
                onClick={() => setEditData((prev) => ({ ...prev, verified: true }))}
                style={{ marginBottom: theme.spacing.md }}
              >
                Verify User
              </Button>
            )}
            
            {editData.verified && (
              <div style={{ 
                backgroundColor: '#27ae60', 
                color: 'white', 
                padding: theme.spacing.md, 
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing.md 
              }}>
                User is verified. Verification cannot be revoked.
              </div>
            )}
            
            {(selectedUser?.role === 'cashier' || editData.role === 'cashier') && (
              <Select
                label="Cashier Status"
                value={editData.suspicious.toString()}
                onChange={(e) => setEditData((prev) => ({ ...prev, suspicious: e.target.value === 'true' }))}
              >
                <option value="false">Normal</option>
                <option value="true" style={{ color: '#e74c3c' }}>Suspicious</option>
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
              ) : isManager ? (
                <>
                  <option value="regular">Regular User</option>
                  <option value="cashier">Cashier</option>
                </>
              ) : (
                <>
                  <option value="regular">Regular User</option>
                </>
              )}
            </Select>
            
            {!editData.verified && editData.role && (
              <div style={{ 
                backgroundColor: '#3498db', 
                color: 'white', 
                padding: theme.spacing.md, 
                borderRadius: theme.radius.md,
                marginTop: theme.spacing.sm,
                marginBottom: theme.spacing.md,
                fontSize: theme.typography.fontSize.sm
              }}>
                Note: Assigning any role will automatically verify this user.
              </div>
            )}
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
                  <p><strong>Suspicious:</strong> {selectedUser.suspicious ? 
                    <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Yes</span> : 'No'}</p>
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
              {canEditUser && (
                <Button
                  onClick={() => {
                    setViewUserDetails(false);
                    if (selectedUser) {
                      setEditData({
                        verified: selectedUser.verified,
                        suspicious: selectedUser.suspicious || false,
                        role: selectedUser.role,
                        email: selectedUser.email
                      });
                      setEditModalOpen(true);
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  Edit User
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => {
                  setViewUserDetails(false);
                }}
                style={{ flex: 1 }}
              >
                Close
              </Button>
            </ModalActions>
          </ModalContent>
        )}
      </Modal>
    </>
  );
};

export default UserModals; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import theme from '../../styles/theme';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const PageContainer = styled.div`
  padding: ${theme.spacing.lg};
  max-width: 600px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text.primary};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const HelpText = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const CreateUser = () => {
  const [formData, setFormData] = useState({
    utorid: '',
    name: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // POST /users API call
      const response = await api.post('/users', formData);
      
      // Display the reset token to the cashier
      setResetToken(response.data.resetToken);
      
      // Show success message
      toast.success('User created successfully!');
      
      // Invalidate users query if it exists
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'An error occurred while creating the user. Please try again.'
      );
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageContainer>
      <PageTitle>Create New User</PageTitle>
      
      <HelpText>
        Create a new user account. The system will generate a password reset token 
        that you will need to provide to the user so they can activate their account.
      </HelpText>
      
      <Card>
        <Card.Body style={{ padding: theme.spacing.lg }}>
          {resetToken ? (
            <div>
              <h2 style={{ marginBottom: theme.spacing.md, color: theme.colors.primary.main }}>
                User Created Successfully
              </h2>
              <p style={{ marginBottom: theme.spacing.md }}>
                Please provide the user with the following reset token to activate their account:
              </p>
              <Card style={{ 
                background: theme.colors.background.alt, 
                padding: theme.spacing.md,
                marginBottom: theme.spacing.lg
              }}>
                <code>{resetToken}</code>
              </Card>
              <p style={{ marginBottom: theme.spacing.md }}>
                The user will need to use this token at: /auth/reset/:token
              </p>
              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <Button 
                  onClick={() => setResetToken(null)}
                  variant="secondary"
                >
                  Create Another User
                </Button>
                <Button 
                  onClick={() => navigate('/users')}
                >
                  Go to Users List
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ 
                  color: theme.colors.error.main, 
                  marginBottom: theme.spacing.md,
                  padding: theme.spacing.sm,
                  background: theme.colors.error.light,
                  borderRadius: theme.radius.md
                }}>
                  {error}
                </div>
              )}
              
              <FormGroup>
                <Input
                  name="utorid"
                  label="UTORid"
                  value={formData.utorid}
                  onChange={handleChange}
                  required
                  helperText="Unique, Alphanumeric, 8 characters"
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  helperText="1-50 characters"
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  helperText="Valid University of Toronto email"
                />
              </FormGroup>
              
              <Button 
                type="submit" 
                loading={loading}
                fullWidth
              >
                Create User
              </Button>
            </form>
          )}
        </Card.Body>
      </Card>
    </PageContainer>
  );
};

export default CreateUser; 
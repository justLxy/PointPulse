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
import { FaExclamationTriangle } from 'react-icons/fa';

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

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: ${theme.radius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  font-weight: 600;
  
  svg {
    color: #721c24;
    flex-shrink: 0;
    font-size: 20px;
  }
`;

const ErrorText = styled.p`
  color: #721c24;
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing.xs};
`;

const CreateUser = () => {
  const [formData, setFormData] = useState({
    utorid: '',
    name: '',
    email: ''
  });
  
  const [formErrors, setFormErrors] = useState({
    utorid: '',
    name: '',
    email: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const validateUTORid = (utorid) => {
    return /^[a-zA-Z0-9]{8}$/.test(utorid);
  };
  
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@(mail\.)?utoronto\.ca$/;
    return regex.test(email);
  };
  
  const validateName = (name) => {
    return name.length >= 1 && name.length <= 50;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const validateForm = () => {
    let valid = true;
    const newErrors = {
      utorid: '',
      name: '',
      email: ''
    };
    
    if (!validateUTORid(formData.utorid)) {
      newErrors.utorid = 'UTORid must be 8 alphanumeric characters';
      valid = false;
    }
    
    if (!validateName(formData.name)) {
      newErrors.name = 'Name must be between 1 and 50 characters';
      valid = false;
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Must be a valid University of Toronto email (@mail.utoronto.ca)';
      valid = false;
    }
    
    setFormErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/users', formData);
      
      setResetToken(response.data.resetToken);
      
      toast.success('User created successfully!');
      
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'An error occurred while creating the user. Please try again.'
      );
      toast.error(err.response?.data?.error || 'Failed to create user');
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
                The user will need to use this token to activate their account.
              </p>
              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <Button 
                  onClick={() => {
                    setResetToken(null);
                    setFormData({ utorid: '', name: '', email: '' });
                  }}
                  variant="secondary"
                >
                  Create Another User
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <ErrorAlert>
                  <FaExclamationTriangle />
                  <div>{error}</div>
                </ErrorAlert>
              )}
              
              <FormGroup>
                <Input
                  name="utorid"
                  label="UTORid"
                  value={formData.utorid}
                  onChange={handleChange}
                  required
                  helperText={formErrors.utorid ? '' : "Unique, Alphanumeric, 8 characters"}
                  error={formErrors.utorid}
                />
              </FormGroup>
              
              <FormGroup>
                <Input
                  name="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  helperText={formErrors.name ? '' : "1-50 characters"}
                  error={formErrors.name}
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
                  helperText={formErrors.email ? '' : "Valid University of Toronto email"}
                  error={formErrors.email}
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
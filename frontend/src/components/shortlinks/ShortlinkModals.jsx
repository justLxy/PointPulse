import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import theme from '../../styles/theme';
import { FaLink, FaCopy, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ShortlinkService from '../../services/shortlink.service';
import { hasRouteConflict } from '../../constants/routes';

const ModalContent = styled.div`
  padding: ${theme.spacing.lg};
`;

const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const ShortlinkPreview = styled.div`
  background: ${theme.colors.background.light};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.md};
  padding: ${theme.spacing.md};
  margin-top: ${theme.spacing.sm};
`;

const ShortlinkUrl = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-family: ${theme.typography.fontFamily.mono};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary.main};
  word-break: break-all;
`;

const CopyButton = styled(Button)`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
  min-width: auto;
`;

const ValidationMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${props => props.error ? theme.colors.error.main : theme.colors.success.main};
  background: ${props => props.error ? 
    `${theme.colors.error.main}08` : 
    `${theme.colors.success.main}08`};
  border: 1px solid ${props => props.error ? 
    `${theme.colors.error.main}20` : 
    `${theme.colors.success.main}20`};
  border-radius: ${theme.radius.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  margin-top: -${theme.spacing.md};
  margin-bottom: ${theme.spacing.xs};
  
  &::before {
    content: '${props => props.error ? '⚠️' : '✅'}';
    font-size: 12px;
  }
`;

const DeleteWarning = styled.div`
  background: linear-gradient(135deg, #fef3f2 0%, #fee4e2 100%);
  border: 1px solid #fecaca;
  border-radius: ${theme.radius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  }
  
  h4 {
    color: #dc2626;
    margin: 0 0 ${theme.spacing.sm} 0;
    font-size: ${theme.typography.fontSize.md};
    font-weight: ${theme.typography.fontWeights.semibold};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
  }
  
  p {
    color: #991b1b;
    margin: 0;
    font-size: ${theme.typography.fontSize.sm};
    line-height: 1.5;
  }
`;

const ShortlinkInfo = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: ${theme.radius.md};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
    border-radius: ${theme.radius.sm} 0 0 ${theme.radius.sm};
  }
  
  h4 {
    margin: 0 0 ${theme.spacing.md} 0;
    color: #1e293b;
    font-size: ${theme.typography.fontSize.md};
    font-weight: ${theme.typography.fontWeights.semibold};
  }
  
  p {
    margin: ${theme.spacing.sm} 0;
    color: #475569;
    font-size: ${theme.typography.fontSize.sm};
    line-height: 1.5;
    
    strong {
      color: #334155;
      font-weight: ${theme.typography.fontWeights.medium};
    }
  }
`;

/**
 * Modal for creating a new shortlink
 */
export const CreateShortlinkModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false, 
  eventId = null,
  eventName = '',
  suggestedSlug = '',
  suggestedUrl = ''
}) => {
  const [formData, setFormData] = useState({
    slug: '',
    targetUrl: '',
    eventId: eventId || null
  });
  const [errors, setErrors] = useState({});
  const [slugValidation, setSlugValidation] = useState({ isValid: true, message: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        slug: suggestedSlug || '',
        targetUrl: suggestedUrl || '',
        eventId: eventId || null
      });
      setErrors({});
      setSlugValidation({ isValid: true, message: '' });
    }
  }, [isOpen, suggestedSlug, suggestedUrl, eventId]);

  const validateSlug = async (slug) => {
    // 1. Required check
    if (!slug) {
      setSlugValidation({ isValid: false, message: 'Slug is required' });
      return;
    }

    // 2. Format validation
    if (!ShortlinkService.isValidSlug(slug)) {
      setSlugValidation({
        isValid: false,
        message: 'Slug can only contain letters, numbers, hyphens, and underscores',
      });
      return;
    }

    // 3. Route conflict check
    if (hasRouteConflict(slug)) {
      setSlugValidation({
        isValid: false,
        message: 'This slug conflicts with an existing page route',
      });
      return;
    }

    // 4. Uniqueness check (async)
    setSlugValidation({ isValid: false, message: 'Checking slug availability…' });
    const slugInfo = await ShortlinkService.checkSlugExists(slug);
    if (slugInfo?.exists) {
      let detailMsg = 'This slug is already taken';
      if (slugInfo.shortlink) {
        const { event, createdBy } = slugInfo.shortlink;
        const parts = [];
        if (event) parts.push(`by the event “${event.name}”`);
        if (createdBy) parts.push(`created by ${createdBy.utorid}`);
        if (parts.length) {
          detailMsg += ' ' + parts.join(' and ');
        }
      }
      setSlugValidation({ isValid: false, message: detailMsg });
      return;
    }

    // If all checks pass
    setSlugValidation({ isValid: true, message: 'Slug is available' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'slug') {
      validateSlug(value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!formData.slug) {
      newErrors.slug = 'Slug is required';
    } else if (!ShortlinkService.isValidSlug(formData.slug)) {
      newErrors.slug = 'Slug can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!formData.targetUrl) {
      newErrors.targetUrl = 'Target URL is required';
    } else if (!ShortlinkService.isValidUrl(formData.targetUrl)) {
      newErrors.targetUrl = 'Please enter a valid URL';
    }
    
    // Additionally respect async validation result
    if (!slugValidation.isValid) {
      newErrors.slug = slugValidation.message || 'Invalid slug';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      if (error.message.includes('already exists')) {
        setErrors({ slug: error.message });
      }
      // Don't show toast error here - it's handled by the mutation's onError callback
    }
  };



  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shortlinkUrl = formData.slug ? ShortlinkService.getShortlinkUrl(formData.slug) : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventId ? `Create Shortlink for ${eventName}` : 'Create Shortlink'}
      size="medium"
    >
      <ModalContent>
        <ModalForm onSubmit={handleSubmit}>
          <Input
            label="Shortlink Slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            placeholder="e.g., frosh2025"
            error={errors.slug}
            required
            helperText="Only letters, numbers, hyphens, and underscores allowed"
          />
          
          {slugValidation.message && (
            <ValidationMessage error={!slugValidation.isValid}>
              {slugValidation.message}
            </ValidationMessage>
          )}
          
          <Input
            label="Target URL"
            value={formData.targetUrl}
            onChange={(e) => handleInputChange('targetUrl', e.target.value)}
            placeholder="https://example.com/event"
            error={errors.targetUrl}
            required
            helperText="The URL that users will be redirected to"
          />
          
          {shortlinkUrl && (
            <ShortlinkPreview>
              <div style={{ marginBottom: theme.spacing.sm }}>
                <strong>Shortlink Preview:</strong>
              </div>
              <ShortlinkUrl>
                <FaLink size={14} />
                <span>{shortlinkUrl}</span>
                <CopyButton
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(shortlinkUrl)}
                >
                  <FaCopy size={12} />
                </CopyButton>
              </ShortlinkUrl>
            </ShortlinkPreview>
          )}
        </ModalForm>
        
        <ModalActions>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!slugValidation.isValid}
          >
            Create Shortlink
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

/**
 * Modal for editing an existing shortlink
 */
export const EditShortlinkModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  shortlink,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    slug: '',
    targetUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [slugValidation, setSlugValidation] = useState({ isValid: true, message: '' });

  useEffect(() => {
    if (isOpen && shortlink) {
      setFormData({
        slug: shortlink.slug || '',
        targetUrl: shortlink.targetUrl || '',
      });
      setErrors({});
      setSlugValidation({ isValid: true, message: '' });
    }
  }, [isOpen, shortlink]);

  const validateSlug = async (slug) => {
    if (!slug) {
      setSlugValidation({ isValid: false, message: 'Slug is required' });
      return;
    }

    if (!ShortlinkService.isValidSlug(slug)) {
      setSlugValidation({
        isValid: false,
        message: 'Slug can only contain letters, numbers, hyphens, and underscores',
      });
      return;
    }

    // Check if this slug conflicts with known routes
    if (hasRouteConflict(slug)) {
      setSlugValidation({
        isValid: false,
        message: 'This slug conflicts with an existing page route',
      });
      return;
    }

    // Skip uniqueness check if the slug hasn't changed
    if (slug === shortlink?.slug) {
      setSlugValidation({ isValid: true, message: 'Slug is unchanged' });
      return;
    }

    // Uniqueness check (async)
    setSlugValidation({ isValid: false, message: 'Checking slug availability…' });
    const slugInfo = await ShortlinkService.checkSlugExists(slug);
    if (slugInfo?.exists) {
      let detailMsg = 'This slug is already taken';
      if (slugInfo.shortlink) {
        const { event, createdBy } = slugInfo.shortlink;
        const parts = [];
        if (event) parts.push(`by the event “${event.name}”`);
        if (createdBy) parts.push(`created by ${createdBy.utorid}`);
        if (parts.length) {
          detailMsg += ' ' + parts.join(' and ');
        }
      }
      setSlugValidation({ isValid: false, message: detailMsg });
      return;
    }

    setSlugValidation({ isValid: true, message: 'Slug is available' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'slug') {
      validateSlug(value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!formData.slug) {
      newErrors.slug = 'Slug is required';
    } else if (!ShortlinkService.isValidSlug(formData.slug)) {
      newErrors.slug = 'Slug can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!formData.targetUrl) {
      newErrors.targetUrl = 'Target URL is required';
    } else if (!ShortlinkService.isValidUrl(formData.targetUrl)) {
      newErrors.targetUrl = 'Please enter a valid URL';
    }
    
    // Additionally respect async validation result
    if (!slugValidation.isValid) {
      newErrors.slug = slugValidation.message || 'Invalid slug';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(shortlink.id, formData);
      onClose();
    } catch (error) {
      if (error.message.includes('already exists')) {
        setErrors({ slug: error.message });
      }
      // Don't show toast error here - it's handled by the mutation's onError callback
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shortlinkUrl = formData.slug ? ShortlinkService.getShortlinkUrl(formData.slug) : '';

  if (!shortlink) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Shortlink"
      size="medium"
    >
      <ModalContent>
        <ModalForm onSubmit={handleSubmit}>
          <Input
            label="Shortlink Slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            placeholder="e.g., frosh2025"
            error={errors.slug}
            required
            helperText="Only letters, numbers, hyphens, and underscores allowed"
          />
          
          {slugValidation.message && (
            <ValidationMessage error={!slugValidation.isValid}>
              {slugValidation.message}
            </ValidationMessage>
          )}
          
          <Input
            label="Target URL"
            value={formData.targetUrl}
            onChange={(e) => handleInputChange('targetUrl', e.target.value)}
            placeholder="https://example.com/event"
            error={errors.targetUrl}
            required
            helperText="The URL that users will be redirected to"
          />
          
          {shortlinkUrl && (
            <ShortlinkPreview>
              <div style={{ marginBottom: theme.spacing.sm }}>
                <strong>Shortlink Preview:</strong>
              </div>
              <ShortlinkUrl>
                <FaLink size={14} />
                <span>{shortlinkUrl}</span>
                <CopyButton
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => copyToClipboard(shortlinkUrl)}
                >
                  <FaCopy size={12} />
                </CopyButton>
              </ShortlinkUrl>
            </ShortlinkPreview>
          )}
        </ModalForm>
        
        <ModalActions>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!slugValidation.isValid}
          >
            Update Shortlink
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
};

/**
 * Modal for deleting a shortlink
 */
export const DeleteShortlinkModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  shortlink,
  isLoading = false 
}) => {
  if (!shortlink) return null;

  const shortlinkUrl = ShortlinkService.getShortlinkUrl(shortlink.slug);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Shortlink"
      size="small"
    >
      <ModalContent>
        <DeleteWarning>
          <h4>⚠️ Are you sure?</h4>
          <p>This action cannot be undone. The shortlink will be permanently deleted.</p>
        </DeleteWarning>
        
        <ShortlinkInfo>
          <h4>Shortlink Details:</h4>
          <p><strong>Slug:</strong> {shortlink.slug}</p>
          <p><strong>URL:</strong> {shortlinkUrl}</p>
          <p><strong>Target:</strong> {shortlink.targetUrl}</p>
          {shortlink.event && (
            <p><strong>Event:</strong> {shortlink.event.name}</p>
          )}
        </ShortlinkInfo>
        
        <ModalActions>
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => onConfirm(shortlink.id)}
            loading={isLoading}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s ease',
              fontWeight: '600'
            }}
          >
            <FaTrash size={14} />
            Delete Shortlink
          </Button>
        </ModalActions>
      </ModalContent>
    </Modal>
  );
}; 
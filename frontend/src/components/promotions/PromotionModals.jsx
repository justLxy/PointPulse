import React from 'react';
import styled from '@emotion/styled';
import Modal from '../common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { FaExclamationTriangle } from 'react-icons/fa';
import theme from '../../styles/theme';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const FormRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const FormField = styled.div`
  flex: 1;
  position: relative;
`;

const StyledInput = styled(Input)`
  width: 100%;
  
  input, textarea {
    border-radius: ${theme.radius.md};
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    
    &:focus {
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
  }
`;

const StyledSelect = styled(Select)`
  width: 100%;
  
  select {
    border-radius: ${theme.radius.md};
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    
    &:focus {
      border-color: ${theme.colors.primary.main};
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(Button)`
  min-width: 120px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 640px) {
    width: 100%;
  }
`;

// 🟢 创建和编辑用的表单内容
const ModalTitle = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.bold};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.border.light};
  padding-bottom: ${theme.spacing.md};
`;

const DeleteWarning = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: ${theme.spacing.md};
  margin: ${theme.spacing.md} 0;
  background-color: ${theme.colors.error.light}20;
  border-radius: ${theme.radius.md};
  
  svg {
    font-size: 48px;
    color: ${theme.colors.error.main};
    margin-bottom: ${theme.spacing.md};
  }
  
  strong {
    font-size: ${theme.typography.fontSize.lg};
    margin-bottom: ${theme.spacing.sm};
  }
  
  p {
    color: ${theme.colors.text.secondary};
  }
`;

// Form component
const PromotionFormFields = ({ promotionData, onChange }) => {
  console.log("PromotionFormFields rendering with data:", JSON.stringify(promotionData, null, 2));
  return (
    <FormContainer>
      <FormSection>
        <FormField>
          <StyledInput
            label="Name"
            value={promotionData.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
          />
        </FormField>

        <FormField>
          <StyledInput
            label="Description"
            value={promotionData.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            multiline
            rows={3}
            required
          />
        </FormField>
      </FormSection>

      <FormSection>
        <FormField>
          <StyledSelect
            label="Type"
            value={promotionData.type}
            onChange={(e) => onChange('type', e.target.value)}
          >
            <option value="automatic">Automatic</option>
            <option value="one-time">One-time</option>
          </StyledSelect>
        </FormField>
      </FormSection>
      
      <FormSection>
        <FormField>
          <StyledInput
            label="Minimum Spending ($)"
            type="number"
            value={promotionData.minSpending}
            onChange={(e) => onChange('minSpending', e.target.value)}
            placeholder="Optional minimum spend"
            helperText="Leave empty for no minimum"
          />
        </FormField>

        {promotionData.type === 'automatic' && (
          <FormField>
            <StyledInput
              label="Rate"
              type="number"
              step="0.01"
              value={promotionData.rate}
              onChange={(e) => onChange('rate', e.target.value)}
              placeholder="Points multiplier, e.g. 2 for double points"
              helperText="Required for automatic promotions"
              required
            />
          </FormField>
        )}

        {promotionData.type === 'one-time' && (
          <FormField>
            <StyledInput
              label="Points"
              type="number"
              value={promotionData.points}
              onChange={(e) => onChange('points', e.target.value)}
              placeholder="Fixed points amount"
              helperText="Required for one-time promotions"
              required
            />
          </FormField>
        )}
      </FormSection>

      <FormRow>
        <FormField>
          <StyledInput
            label="Start Time"
            type="datetime-local"
            value={promotionData.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            required
          />
        </FormField>

        <FormField>
          <StyledInput
            label="End Time"
            type="datetime-local"
            value={promotionData.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            required
          />
        </FormField>
      </FormRow>
    </FormContainer>
  );
};

// Create Modal
export const CreatePromotionModal = ({ isOpen, onClose, promotionData, onChange, onSubmit, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="" size="medium">
    <div>
      <ModalTitle>Create New Promotion</ModalTitle>
      <PromotionFormFields promotionData={promotionData} onChange={onChange} />
      <ButtonContainer>
        <ActionButton variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</ActionButton>
        <ActionButton onClick={onSubmit} loading={isLoading}>Create Promotion</ActionButton>
      </ButtonContainer>
    </div>
  </Modal>
);

// Edit Modal
export const EditPromotionModal = ({ isOpen, onClose, promotionData, selectedPromotion, onChange, onSubmit, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="" size="medium">
    <div>
      <ModalTitle>Edit Promotion</ModalTitle>
      <PromotionFormFields promotionData={promotionData} onChange={onChange} />
      <ButtonContainer>
        <ActionButton variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</ActionButton>
        <ActionButton onClick={onSubmit} loading={isLoading}>Update Promotion</ActionButton>
      </ButtonContainer>
    </div>
  </Modal>
);

// Delete Modal
export const DeletePromotionModal = ({ isOpen, onClose, selectedPromotion, onDelete, isLoading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="" size="small">
    <div>
      <ModalTitle>Delete Promotion</ModalTitle>
      
      <DeleteWarning>
        <FaExclamationTriangle />
        <strong>{selectedPromotion?.name}</strong>
        <p>Are you sure you want to delete this promotion? This action cannot be undone.</p>
      </DeleteWarning>
      
      <ButtonContainer>
        <ActionButton variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</ActionButton>
        <ActionButton color="error" onClick={onDelete} loading={isLoading}>Delete Promotion</ActionButton>
      </ButtonContainer>
    </div>
  </Modal>
);

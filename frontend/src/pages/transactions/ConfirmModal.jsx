import styled from '@emotion/styled';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import theme from '../../styles/theme';

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const ConfirmText = styled.p`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  margin-top: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  line-height: 1.5;
`;

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'Please confirm this action.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <ConfirmText>{description}</ConfirmText>
      <ButtonGroup>
        <Button variant="outlined" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </ButtonGroup>
    </Modal>
  );
};

export default ConfirmDialog;

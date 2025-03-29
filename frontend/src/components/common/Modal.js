import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { createPortal } from 'react-dom';
import theme from '../../styles/theme';
import { IoMdClose } from 'react-icons/io';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  animation: ${fadeIn} 0.2s ease-out;
  overflow-y: auto;
  padding: ${theme.spacing.md};
`;

const ModalContainer = styled.div`
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.xl};
  width: 100%;
  max-width: ${({ size }) => {
    switch (size) {
      case 'small':
        return '400px';
      case 'large':
        return '800px';
      case 'xlarge':
        return '1000px';
      case 'medium':
      default:
        return '600px';
    }
  }};
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.3s ease-out;
  position: relative;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border.light};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xs};
  border-radius: ${theme.radius.full};
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${theme.colors.text.primary};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${theme.colors.primary.light};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  flex: 1;
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.light};
  display: flex;
  justify-content: ${({ align }) => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'between':
        return 'space-between';
      case 'end':
      default:
        return 'flex-end';
    }
  }};
  gap: ${theme.spacing.md};
`;

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  footer,
  footerAlign = 'end',
  closeOnOverlayClick = true,
}) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return createPortal(
    <ModalOverlay ref={overlayRef} onClick={handleOverlayClick}>
      <ModalContainer ref={modalRef} size={size}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close modal">
            <IoMdClose size={24} />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>{children}</ModalBody>
        
        {footer && <ModalFooter align={footerAlign}>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>,
    document.body
  );
};

export default Modal; 
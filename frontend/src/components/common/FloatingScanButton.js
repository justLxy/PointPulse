import { useState } from 'react';
import styled from '@emotion/styled';
import { FaQrcode } from 'react-icons/fa';
import ScanQRModal from '../user/ScanQRModal';
import theme from '../../styles/theme';

const ScanButton = styled.button`
  position: fixed;
  bottom: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${theme.colors.primary.main};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: ${theme.shadows.lg};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  z-index: 100;
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    background-color: ${theme.colors.primary.dark};
  }
  
  svg {
    font-size: 24px;
  }
  
  @media (max-width: 768px) {
    bottom: ${theme.spacing.lg};
    right: ${theme.spacing.lg};
    width: 48px;
    height: 48px;
  }
`;

const FloatingScanButton = () => {
  const [isScanQRModalOpen, setIsScanQRModalOpen] = useState(false);
  
  return (
    <>
      <ScanButton 
        onClick={() => setIsScanQRModalOpen(true)} 
        aria-label="Scan QR Code"
      >
        <FaQrcode />
      </ScanButton>
      
      <ScanQRModal
        isOpen={isScanQRModalOpen}
        onClose={() => setIsScanQRModalOpen(false)}
      />
    </>
  );
};

export default FloatingScanButton;
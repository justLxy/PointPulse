/**
 * QR Code Component
 * Uses the qrcode.react library: https://github.com/zpao/qrcode.react
 * This component provides a styled QR code with download functionality
 */
import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styled from '@emotion/styled';
import theme from '../../styles/theme';
import Button from './Button';
import { BsDownload } from 'react-icons/bs';

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background.paper};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.md};
`;

const StyledQRCode = styled.div`
  padding: ${theme.spacing.md};
  background-color: white;
  border-radius: ${theme.radius.md};
  border: 1px solid ${theme.colors.border.light};
  
  canvas {
    display: block;
  }
`;

const QRCodeValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  word-break: break-all;
  max-width: 250px;
`;

const QRCodeLabel = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeights.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const QRCode = ({ value, size = 200, level = 'H', label, renderAs = 'canvas', includeMargin = true }) => {
  const qrRef = useRef();
  
  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = url;
    link.click();
  };
  
  return (
    <QRCodeContainer>
      {label && <QRCodeLabel>{label}</QRCodeLabel>}
      
      <StyledQRCode ref={qrRef}>
        <QRCodeCanvas
          value={value}
          size={size}
          level={level}
          renderAs={renderAs}
          includeMargin={includeMargin}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </StyledQRCode>
      
      <QRCodeValue>{value}</QRCodeValue>
      
      <Button
        variant="outlined"
        size="small"
        onClick={downloadQRCode}
        fullWidth={false}
      >
        <BsDownload /> Download
      </Button>
    </QRCodeContainer>
  );
};

export default QRCode; 
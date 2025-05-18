import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import theme from '../../styles/theme';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { FaQrcode, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaCameraRetro, FaUser } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

// Scanner container
const ScannerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.md} 0;
`;

// Scanner outer wrapper
const ReaderWrapperOuter = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1/1;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.lg};
  margin: 0 auto;
`;

// Scanner inner wrapper
const ReaderWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: ${theme.radius.lg};
  
  // Adjust video element styles
  video {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  
  // Hide html5-qrcode default styles
  #qr-shaded-region {
    border: none !important;
    box-shadow: none !important;
  }
  
  #qr-code-full-region {
    display: none !important;
  }
  
  // Hide video controls
  div:has(> button) {
    display: none !important;
  }
`;

// Scanner overlay
const ScannerOverlayElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: ${theme.radius.lg};
  z-index: 100;
`;

// Scanner frame
const ScannerFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed ${theme.colors.primary.light};
  border-radius: ${theme.radius.lg};
`;

// Scanner corners
const ScannerCorner = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: ${theme.colors.primary.main};
  border-style: solid;
  border-width: 0;
  
  &.top-left {
    top: 15px;
    left: 15px;
    border-top-width: 3px;
    border-left-width: 3px;
    border-top-left-radius: 4px;
  }
  
  &.top-right {
    top: 15px;
    right: 15px;
    border-top-width: 3px;
    border-right-width: 3px;
    border-top-right-radius: 4px;
  }
  
  &.bottom-left {
    bottom: 15px;
    left: 15px;
    border-bottom-width: 3px;
    border-left-width: 3px;
    border-bottom-left-radius: 4px;
  }
  
  &.bottom-right {
    bottom: 15px;
    right: 15px;
    border-bottom-width: 3px;
    border-right-width: 3px;
    border-bottom-right-radius: 4px;
  }
`;

// Scan line animation
const ScanLine = styled(motion.div)`
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(0, 183, 255, 0) 0%,
    ${theme.colors.primary.light} 50%,
    rgba(0, 183, 255, 0) 100%
  );
`;

// Instructions
const Instructions = styled.div`
  background-color: ${theme.colors.background.paper};
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.sm};
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
  border-left: 3px solid ${theme.colors.primary.main};
  max-width: 350px;
  font-size: 0.9rem;
`;

// Result card
const ResultCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: ${props => props.status === 'success' 
    ? `linear-gradient(145deg, ${theme.colors.background.paper}, ${theme.colors.success.light}10)` 
    : `linear-gradient(145deg, ${theme.colors.background.paper}, ${theme.colors.error.light}10)`};
  border-radius: ${theme.radius.xl};
  box-shadow: ${theme.shadows.md};
  width: 100%;
  max-width: 350px;
  border: 1px solid ${props => props.status === 'success' ? theme.colors.success.light : theme.colors.error.light};
`;

// Icon wrapper
const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.status === 'success' ? theme.colors.success.light + '20' : theme.colors.error.light + '20'};
  margin-bottom: ${theme.spacing.md};
`;

// Success icon
const SuccessIcon = styled(FaCheckCircle)`
  font-size: 40px;
  color: ${theme.colors.success.main};
`;

// Error icon
const ErrorIcon = styled(FaExclamationTriangle)`
  font-size: 40px;
  color: ${theme.colors.error.main};
`;

// Result title
const ResultTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: ${props => props.status === 'success' ? theme.colors.success.dark : theme.colors.error.dark};
`;

// Result message
const ResultMessage = styled.p`
  text-align: center;
  margin: ${theme.spacing.sm} 0;
  color: ${theme.colors.text.primary};
  font-size: 0.9rem;
`;

// Button container
const ButtonsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

/**
 * ScanQRModal - Universal QR code scanning modal component
 * @param {boolean} isOpen - Whether the modal is displayed
 * @param {function} onClose - Callback function to close the modal
 */
const ScanQRModal = ({ isOpen, onClose }) => {
  const readerRef = useRef(null);
  const html5Ref = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupScanner();
    };
  }, []);
  
  // Listen for modal open state
  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setError('');
      
      // Short delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        initScanner();
      }, 300);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      cleanupScanner();
    }
  }, [isOpen]);
  
  // Initialize scanner
  const initScanner = async () => {
    if (!readerRef.current) return;
    
    try {
      const html5 = new Html5Qrcode(readerRef.current.id);
      html5Ref.current = html5;
      
      await html5.start(
        { facingMode: 'environment' },
        { 
          fps: 10, 
          qrbox: 250, 
          aspectRatio: 1,
          disableFlip: false,
          showTorchButtonIfSupported: false,
          showZoomSliderIfSupported: false
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {} // Error handling
      );
      
      setIsCameraActive(true);
    } catch (err) {
      console.error('QR scanner start error', err);
      setError('Unable to start camera. Please ensure camera permissions are granted.');
      setIsCameraActive(false);
    }
  };
  
  // Clean up scanner resources
  const cleanupScanner = async () => {
    if (!html5Ref.current) return;
    
    try {
      await html5Ref.current.stop();
    } catch (err) {
      console.warn('Scanner stop error:', err);
    }
    
    try {
      await html5Ref.current.clear();
    } catch (err) {
      console.warn('Scanner clear error:', err);
    }
    
    html5Ref.current = null;
    setIsCameraActive(false);
  };
  
  // Handle scan result
  const handleScan = async (decodedText) => {
    // Pause scanning
    if (html5Ref.current) {
      try {
        await html5Ref.current.pause(true);
      } catch (err) {
        console.warn('Scanner pause error:', err);
      }
    }
    
    console.log('Scanned content:', decodedText);
    
    // Process the scanned data - simplified to only extract utorid
    try {
      let recipientUtorid = '';
      
      // Handle composite format: URL + JSON
      if (decodedText.includes('\n\n')) {
        // Separate URL and JSON parts
        const parts = decodedText.split('\n\n');
        if (parts.length === 2) {
          const scanUrl = parts[0].trim(); // URL part
          
          // Handle URL part
          if (scanUrl && scanUrl.startsWith('http')) {
            try {
              // Parse URL
              const url = new URL(scanUrl);
              
              if (scanUrl.includes('/transfer')) {
                recipientUtorid = url.searchParams.get('utorid') || '';
              }
            } catch (err) {
              console.error('URL parsing error:', err);
            }
          }
          
          // Try to parse JSON part as backup
          if (!recipientUtorid) {
            try {
              const qrData = JSON.parse(parts[1]);
              if (qrData && qrData.utorid) {
                recipientUtorid = qrData.utorid;
              } 
            } catch (err) {
              console.error('JSON parsing error:', err);
            }
          }
        }
      } else if (decodedText.trim().startsWith('http')) {
        // Handle pure URL format
        try {
          const url = new URL(decodedText.trim());
          
          if (url.pathname.includes('/transfer')) {
            recipientUtorid = url.searchParams.get('utorid') || '';
          }
        } catch (err) {
          console.error('URL parsing error:', err);
        }
      } else {
        // Try to handle as pure JSON or plain text
        try {
          const qrData = JSON.parse(decodedText);
          
          if (qrData && qrData.utorid) {
            recipientUtorid = qrData.utorid;
          }
        } catch (err) {
          // Plain text, might be regular UTORID
          recipientUtorid = decodedText.trim();
        }
      }
      
      // Check if we found a utorid
      if (recipientUtorid) {
        setScanResult({
          status: 'success',
          recipientUtorid: recipientUtorid
        });
      } else {
        setScanResult({
          status: 'error',
          message: 'No user ID found in QR code. Please scan a valid user QR code.'
        });
      }
      
    } catch (err) {
      setScanResult({
        status: 'error',
        message: 'Unable to parse QR code data. Please ensure you are scanning a valid QR code.'
      });
    }
  };
  
  // Reset scan
  const handleRescan = async () => {
    setScanResult(null);
    setError('');
    
    // Restart scanner
    if (html5Ref.current) {
      try {
        await html5Ref.current.resume();
      } catch (err) {
        console.warn('Resume error:', err);
        // If unable to resume, try to fully reinitialize
        cleanupScanner();
        initScanner();
      }
    } else {
      initScanner();
    }
  };
  
  // Handle navigation to transfer page
  const handleNavigate = () => {
    if (!scanResult || scanResult.status !== 'success' || !scanResult.recipientUtorid) return;
    
    // First close the modal
    onClose();
    
    const target = `/transfer?utorid=${encodeURIComponent(scanResult.recipientUtorid)}`;
    if (isAuthenticated) {
      navigate(target, { replace: true });
    } else {
      navigate(`/login?returnUrl=${encodeURIComponent(target)}`, { replace: true });
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan User QR Code"
      size="medium"
    >
      <ScannerContainer>
        {!scanResult ? (
          <>
            <Instructions>
              <FaInfoCircle style={{ marginRight: theme.spacing.sm, color: theme.colors.primary.main }} />
              Please point your camera at a QR code to scan.
            </Instructions>
            
            <ReaderWrapperOuter>
              <ReaderWrapper id="qr-reader-modal" ref={readerRef} />
              
              <ScannerOverlayElements>
                <ScannerFrame />
                <ScannerCorner className="top-left" />
                <ScannerCorner className="top-right" />
                <ScannerCorner className="bottom-left" />
                <ScannerCorner className="bottom-right" />
                
                <ScanLine
                  initial={{ top: "20%" }}
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut" 
                  }}
                />
              </ScannerOverlayElements>
            </ReaderWrapperOuter>
            
            {error && (
              <div style={{ 
                color: theme.colors.error.main, 
                marginTop: theme.spacing.md,
                textAlign: 'center',
                padding: theme.spacing.md,
                backgroundColor: theme.colors.error.light + '20',
                borderRadius: theme.radius.md,
                maxWidth: '300px'
              }}>
                <FaExclamationTriangle style={{ marginRight: theme.spacing.sm }} />
                {error}
              </div>
            )}
          </>
        ) : (
          <ResultCard status={scanResult.status}>
            <IconWrapper status={scanResult.status}>
              {scanResult.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
            </IconWrapper>
            
            <ResultTitle status={scanResult.status}>
              {scanResult.status === 'success' ? 'Scan Successful' : 'Scan Failed'}
            </ResultTitle>
            
            {scanResult.message && (
              <ResultMessage>{scanResult.message}</ResultMessage>
            )}
            
            {scanResult.status === 'success' && (
              <ResultMessage>
                <FaUser style={{ marginRight: '8px', color: theme.colors.primary.main }} />
                User ID: {scanResult.recipientUtorid}
              </ResultMessage>
            )}
            
            <ButtonsContainer>
              {scanResult.status === 'success' ? (
                <Button onClick={handleNavigate}>
                  Transfer Points
                </Button>
              ) : (
                <Button variant="outlined" onClick={onClose}>
                  Close
                </Button>
              )}
            </ButtonsContainer>
          </ResultCard>
        )}
      </ScannerContainer>
    </Modal>
  );
};

export default ScanQRModal; 
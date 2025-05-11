import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../../styles/theme';
import EventService from '../../services/event.service';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { FaCheckCircle, FaTimesCircle, FaQrcode } from 'react-icons/fa';

const ScannerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.md} 0;
`;

const ReaderWrapperOuter = styled.div`
  position: relative;
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1/1;
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadows.lg};
`;

const ReaderWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: ${theme.radius.lg};
  
  // This targets the video element created by html5-qrcode
  video {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  
  // Hide default html5-qrcode scan region display
  #qr-shaded-region {
    border: none !important;
    box-shadow: none !important;
  }
  
  // Hide the center marker
  #qr-code-full-region {
    display: none !important;
  }
  
  // Make sure the video controls from html5-qrcode are hidden
  div:has(> button) {
    display: none !important;
  }
`;

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

const ScannerFrame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px dashed ${theme.colors.primary.light};
  border-radius: ${theme.radius.lg};
`;

const ScannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

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

const QrIcon = styled(FaQrcode)`
  font-size: 24px;
  color: ${theme.colors.primary.main};
  margin-right: ${theme.spacing.sm};
`;

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

const ResultCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  background: ${props => props.status === 'success' 
    ? `linear-gradient(145deg, ${theme.colors.background.paper}, ${theme.colors.success.light}10)` 
    : `linear-gradient(145deg, ${theme.colors.background.paper}, ${theme.colors.error.light}10)`};
  border-radius: ${theme.radius.xl};
  box-shadow: ${theme.shadows.lg};
  width: 100%;
  max-width: 350px;
  border: 1px solid ${props => props.status === 'success' ? theme.colors.success.light : theme.colors.error.light};
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${props => props.status === 'success' ? theme.colors.success.light + '20' : theme.colors.error.light + '20'};
  margin-bottom: ${theme.spacing.md};
`;

const SuccessIcon = styled(FaCheckCircle)`
  font-size: 50px;
  color: ${theme.colors.success.main};
`;

const ErrorIcon = styled(FaTimesCircle)`
  font-size: 50px;
  color: ${theme.colors.error.main};
`;

const ResultTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${props => props.status === 'success' ? theme.colors.success.dark : theme.colors.error.dark};
`;

const ResultMessage = styled.p`
  text-align: center;
  margin: ${theme.spacing.sm} 0;
  color: ${theme.colors.text.primary};
`;

const AttendeeInfo = styled.div`
  background-color: ${theme.colors.background.default + '80'};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radius.md};
  width: 100%;
  text-align: center;
  margin: ${theme.spacing.md} 0;
`;

const LoadingSpinner = styled(motion.div)`
  width: 48px;
  height: 48px;
  border: 5px solid ${theme.colors.primary.light};
  border-bottom-color: ${theme.colors.primary.main};
  border-radius: 50%;
  margin: ${theme.spacing.lg} 0;
`;

// New component to encapsulate the scanner functionality
const QrScanner = ({ eventId, onScanComplete }) => {
  const readerRef = useRef(null);
  const html5QrRef = useRef(null);
  
  // Ensure camera is properly released when scanner unmounts or modal closes
  const cleanupScanner = async () => {
    if (!html5QrRef.current) return;

    try {
      // Attempt to stop the video stream even if the scanner is paused or not fully started yet.
      await html5QrRef.current.stop();
    } catch (error) {
      // html5-qrcode throws an error if stop is called before start succeeds; we can safely ignore it.
      if (process.env.NODE_ENV !== 'production') {
        console.warn('html5-qrcode stop() warning:', error?.message || error);
      }
    }

    try {
      await html5QrRef.current.clear();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('html5-qrcode clear() warning:', error?.message || error);
      }
    }

    html5QrRef.current = null;
  };
  
  useEffect(() => {
    // Initialize scanner after component mounts
    const initScanner = async () => {
      try {
        if (!readerRef.current) return;
        
        const html5QrCode = new Html5Qrcode(readerRef.current.id);
        html5QrRef.current = html5QrCode;
        
        const onSuccess = async (decodedText) => {
          // Pause scanning while processing
          if (html5QrRef.current) {
            await html5QrRef.current.pause(true);
          }
          
          try {
            // Parse the decoded text which should be in format: "utorid|eventId"
            const parts = decodedText.trim().split('|');
            const scannedUtorid = parts[0];
            const scannedEventId = parts.length > 1 ? parts[1] : null;
            
            // Verify that scanned event ID matches current event ID
            if (!scannedEventId || scannedEventId !== eventId.toString()) {
              throw new Error('This QR code is for a different event. Please use the QR code specific to this event.');
            }
            
            // If validation passes, send check-in request to server
            const data = await EventService.checkinByScan(eventId, scannedUtorid);
            const date = data.checkedInAt ? new Date(data.checkedInAt) : new Date();
            onScanComplete({
              status: 'success',
              message: data.message,
              name: data.name,
              utorid: scannedUtorid,
              time: date.toLocaleString(),
            });
          } catch (err) {
            onScanComplete({ 
              status: 'error', 
              message: err.message || 'Check-in failed' 
            });
          }
        };
        
        const onFailure = () => {};
        
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: 250,
            aspectRatio: 1,
            disableFlip: false,
            showTorchButtonIfSupported: false,
            showZoomSliderIfSupported: false
          },
          onSuccess,
          onFailure
        );
        
      } catch (error) {
        console.error("Error initializing scanner:", error);
      }
    };
    
    // Short timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      initScanner();
    }, 300);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      cleanupScanner();
    };
  }, [eventId, onScanComplete]);
  
  return (
    <ReaderWrapperOuter>
      {/* The actual HTML5QrCode container */}
      <ReaderWrapper id={`qr-reader-${Date.now()}`} ref={readerRef} />
      
      {/* Our custom overlay elements */}
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
        
        <ScannerOverlay />
      </ScannerOverlayElements>
    </ReaderWrapperOuter>
  );
};

const ScannerModal = ({ isOpen, onClose, eventId, onScanSuccess }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerKey, setScannerKey] = useState(Date.now()); // Key to force remount

  const handleClose = () => {
    onClose();
  };

  const handleScanComplete = (result) => {
    setIsProcessing(false);
    setScanResult(result);
    
    // If scan was successful, trigger callback to parent
    if (result.status === 'success' && onScanSuccess) {
      onScanSuccess(result);
    }
  };

  const handleContinue = () => {
    setScanResult(null);
    // Force remount of scanner component with a new key
    setScannerKey(Date.now());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Attendee Check-in" size="large">
      <ScannerContainer>
        <AnimatePresence mode="wait">
          {!scanResult && !isProcessing && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Instructions>
                <QrIcon />
                <span>Position the QR code within the scanner frame</span>
              </Instructions>
              
              {/* Use key to force remount */}
              <QrScanner 
                key={scannerKey} 
                eventId={eventId} 
                onScanComplete={(result) => {
                  setIsProcessing(true);
                  // Add a small delay to show processing state
                  setTimeout(() => handleScanComplete(result), 500);
                }} 
              />
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <LoadingSpinner 
                animate={{ rotate: 360 }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear"
                }}
              />
              <p>Processing scan...</p>
            </motion.div>
          )}

          {scanResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <ResultCard status={scanResult.status}>
                <IconWrapper status={scanResult.status}>
                  {scanResult.status === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                </IconWrapper>
                
                <ResultTitle status={scanResult.status}>
                  {scanResult.status === 'success' ? 'Check-in Successful' : 'Check-in Failed'}
                </ResultTitle>
                
                <ResultMessage>{scanResult.message}</ResultMessage>
                
                {scanResult.name && (
                  <AttendeeInfo>
                    <h4 style={{ margin: '0 0 4px 0' }}>{scanResult.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: theme.colors.text.secondary }}>
                      {scanResult.utorid}
                    </p>
                  </AttendeeInfo>
                )}
                
                {scanResult.time && (
                  <p style={{ fontSize: '0.85rem', color: theme.colors.text.secondary, margin: 0 }}>
                    {scanResult.time}
                  </p>
                )}
                
                <Button 
                  onClick={handleContinue}
                  style={{ marginTop: theme.spacing.md }}
                >
                  Scan Next Attendee
                </Button>
              </ResultCard>
            </motion.div>
          )}
        </AnimatePresence>
      </ScannerContainer>
    </Modal>
  );
};

export default ScannerModal; 
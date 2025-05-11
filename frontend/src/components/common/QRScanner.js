import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import VConsole from 'vconsole';

const QRScanner = ({ onResult, onError }) => {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isMounted = true;
    let stream = null;

    if (process.env.NODE_ENV !== 'production') {
      new VConsole();
    }
   
    const timeout = setTimeout(() => {
      setCameraError('cant access camera, please check device permission or connection');
      onError && onError(new Error('Camera not found'));
    }, 10000);
    setTimeoutId(timeout);

    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (!isMounted) return;
      if (result) {
        clearTimeout(timeout);
        setCameraError(null);
        onResult(result.getText());
      }
      if (err && !(err instanceof codeReader.NotFoundException)) {
        setCameraError('scanning failed, please try again');
        onError && onError(err);
      }
    }).catch((err) => {
      clearTimeout(timeout);
      setCameraError('cant access camera, please check device permission or connection');
      onError && onError(err);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
 
      if (codeReader.reset) codeReader.reset();
      if (codeReader.stopDecoding) codeReader.stopDecoding();
      if (codeReader.stopContinuousDecode) codeReader.stopContinuousDecode();
    };
  }, [onResult, onError]);

  return (
    <div>
      {cameraError ? (
        <div style={{ color: 'red', textAlign: 'center', margin: '16px 0' }}>{cameraError}</div>
      ) : (
        <video ref={videoRef} style={{ width: '100%' }} />
      )}
    </div>
  );
};

export default QRScanner;
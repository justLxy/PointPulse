import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

const QRScanner = ({ onResult, onError }) => {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const lastScannedRef = useRef({ text: '', time: 0 });

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isMounted = true;
    let timeoutId = null;

    const timeout = setTimeout(() => {
      setCameraError('Cannot access camera. Please check device permissions or connection.');
      onError && onError(new Error('Camera not found'));
    }, 30000);
    timeoutId = timeout;

    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (!isMounted) return;

      if (result) {
        clearTimeout(timeoutId);
        setCameraError(null);

        const now = Date.now();
        const scannedText = result.getText();

        if (
          scannedText !== lastScannedRef.current.text ||
          now - lastScannedRef.current.time > 1500
        ) {
          lastScannedRef.current = { text: scannedText, time: now };
          onResult(scannedText);
        }
      }

      if (err && !(err instanceof NotFoundException)) {
        setCameraError('Scanning failed. Please try again.');
        onError && onError(err);
      }
    }).catch((err) => {
      clearTimeout(timeoutId);
      setCameraError('Cannot access camera. Please check device permissions or connection.');
      onError && onError(err);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (codeReader.reset) codeReader.reset();
      if (codeReader.stopDecoding) codeReader.stopDecoding();
      if (codeReader.stopContinuousDecode) codeReader.stopContinuousDecode();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
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
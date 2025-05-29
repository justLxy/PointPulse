import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ScanQRModal from '../../../components/user/ScanQRModal';
import { Html5Qrcode } from 'html5-qrcode';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div'
  },
  AnimatePresence: ({ children }) => children
}));

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
};

// Mock html5-qrcode
jest.mock('html5-qrcode', () => ({
  Html5Qrcode: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ScanQRModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn()
  };

  const mockNavigate = jest.fn();
  const mockAuth = {
    isAuthenticated: true
  };

  let qrCodeSuccessCallback;
  let qrCodeErrorCallback;
  let mockHtml5QrcodeInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset callbacks
    qrCodeSuccessCallback = null;
    qrCodeErrorCallback = null;
    
    // Setup mock Html5Qrcode instance
    mockHtml5QrcodeInstance = {
      start: jest.fn().mockImplementation((constraints, config, onSuccess, onError) => {
        qrCodeSuccessCallback = onSuccess;
        qrCodeErrorCallback = onError;
        return Promise.resolve();
      }),
      stop: jest.fn().mockResolvedValue(),
      clear: jest.fn().mockResolvedValue(),
      pause: jest.fn().mockResolvedValue(),
      resume: jest.fn().mockResolvedValue(),
    };

    // Setup Html5Qrcode constructor mock
    Html5Qrcode.mockImplementation(() => mockHtml5QrcodeInstance);
    
    // Setup other mocks
    const { useNavigate } = require('react-router-dom');
    const { useAuth } = require('../../../contexts/AuthContext');
    
    useNavigate.mockReturnValue(mockNavigate);
    useAuth.mockReturnValue(mockAuth);
  });

  it('renders modal when isOpen is true', async () => {
    render(<ScanQRModal {...defaultProps} />);
    
    expect(screen.getByText('Scan User QR Code')).toBeInTheDocument();
    expect(screen.getByText(/Please point your camera at a QR code to scan/i)).toBeInTheDocument();
  });

  it('does not render content when isOpen is false', () => {
    render(<ScanQRModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Scan User QR Code')).not.toBeInTheDocument();
  });

  it('shows error message when camera fails to start', async () => {
    mockHtml5QrcodeInstance.start.mockRejectedValueOnce(new Error('Camera error'));

    render(<ScanQRModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to start camera/i)).toBeInTheDocument();
    });
  });

  it('successfully scans URL format QR code', async () => {
    render(<ScanQRModal {...defaultProps} />);

    // Wait for scanner initialization
    await waitFor(() => {
      expect(Html5Qrcode).toHaveBeenCalled();
      expect(mockHtml5QrcodeInstance.start).toHaveBeenCalled();
    });

    const testData = {
      utorid: 'testuser',
      type: 'pointpulse',
      version: '1.0'
    };
    
    const encodedData = btoa(JSON.stringify(testData));
    const mockUrl = `https://example.com/transfer?data=${encodedData}`;

    // Simulate QR code scan
    await act(async () => {
      qrCodeSuccessCallback(mockUrl);
    });

    await waitFor(() => {
      expect(screen.getByText('Scan Successful')).toBeInTheDocument();
      expect(screen.getByText(/User ID: testuser/i)).toBeInTheDocument();
      expect(screen.getByText('Transfer Points')).toBeInTheDocument();
    });
  });

  it('successfully scans base64 format QR code', async () => {
    render(<ScanQRModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockHtml5QrcodeInstance.start).toHaveBeenCalled();
    });

    const testData = {
      utorid: 'base64user',
      type: 'pointpulse',
      version: '1.0'
    };
    
    const encodedData = btoa(JSON.stringify(testData));

    await act(async () => {
      qrCodeSuccessCallback(encodedData);
    });

    await waitFor(() => {
      expect(screen.getByText('Scan Successful')).toBeInTheDocument();
      expect(screen.getByText(/User ID: base64user/i)).toBeInTheDocument();
    });
  });

  it('handles invalid QR code data', async () => {
    render(<ScanQRModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockHtml5QrcodeInstance.start).toHaveBeenCalled();
    });

    await act(async () => {
      qrCodeSuccessCallback('invalid data');
    });

    await waitFor(() => {
      expect(screen.getByText('Scan Failed')).toBeInTheDocument();
      expect(screen.getByText(/Invalid QR code format/i)).toBeInTheDocument();
    });
  });

  it('handles QR code without utorid', async () => {
    render(<ScanQRModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockHtml5QrcodeInstance.start).toHaveBeenCalled();
    });

    const invalidData = btoa(JSON.stringify({ name: 'test' }));

    await act(async () => {
      qrCodeSuccessCallback(invalidData);
    });

    await waitFor(() => {
      expect(screen.getByText('Scan Failed')).toBeInTheDocument();
      expect(screen.getByText(/Invalid QR code format/i)).toBeInTheDocument();
    });
  });

  it('navigates to transfer page on success', async () => {
    render(<ScanQRModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockHtml5QrcodeInstance.start).toHaveBeenCalled();
    });

    const testData = {
      utorid: 'testuser',
      type: 'pointpulse',
      version: '1.0'
    };
    
    const encodedData = btoa(JSON.stringify(testData));

    await act(async () => {
      qrCodeSuccessCallback(encodedData);
    });

    await waitFor(() => {
      expect(screen.getByText('Transfer Points')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transfer Points'));

    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/transfer?data='),
      expect.objectContaining({ replace: true })
    );
  });

  it('redirects to login for unauthenticated users', async () => {
    const { useAuth } = require('../../../contexts/AuthContext');
    useAuth.mockReturnValue({ isAuthenticated: false });

    render(<ScanQRModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockHtml5QrcodeInstance.start).toHaveBeenCalled();
    });

    const testData = {
      utorid: 'testuser',
      type: 'pointpulse',
      version: '1.0'
    };
    
    const encodedData = btoa(JSON.stringify(testData));

    await act(async () => {
      qrCodeSuccessCallback(encodedData);
    });

    await waitFor(() => {
      expect(screen.getByText('Transfer Points')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transfer Points'));

    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringMatching(/^\/login\?returnUrl=/),
      expect.objectContaining({ replace: true })
    );
  });
});
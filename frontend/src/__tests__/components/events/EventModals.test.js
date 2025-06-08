import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import {
  CreateEventModal,
  EditEventModal,
  DeleteEventModal,
  RsvpEventModal
} from '../../../components/events/EventModals';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock the common components
jest.mock('../../../components/common/Modal', () => ({ 
  children, 
  isOpen, 
  onClose, 
  title 
}) => (
  isOpen ? (
    <div data-testid="modal">
      <div data-testid="modal-header">{title}</div>
      <div data-testid="modal-content">{children}</div>
      <button onClick={onClose} data-testid="modal-close">Close</button>
    </div>
  ) : null
));

jest.mock('../../../components/common/Button', () => ({ 
  children, 
  onClick, 
  loading,
  disabled,
  ...props 
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled || loading}
    data-testid="button"
    {...props}
  >
    {loading ? 'Loading...' : children}
  </button>
));

jest.mock('../../../components/common/Input', () => ({ 
  value, 
  onChange,
  type,
  multiline,
  ...props 
}) => (
  multiline ? (
    <textarea
      data-testid="input"
      value={value}
      onChange={onChange}
      {...props}
    />
  ) : (
    <input
      data-testid="input"
      type={type}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
));

const mockEventData = {
  name: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  startTime: '2024-06-01T10:00:00',
  endTime: '2024-06-01T12:00:00',
  capacity: '100',
  points: '50',
  published: false
};

const mockSelectedEvent = {
  id: 1,
  name: 'Selected Event',
  description: 'Selected Description',
  location: 'Selected Location',
  startTime: '2024-06-01T10:00:00Z',
  endTime: '2024-06-01T12:00:00Z',
  published: false
};

describe('CreateEventModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    eventData: mockEventData,
    handleFormChange: jest.fn(),
    handleCreateEvent: jest.fn(),
    isCreating: false,
    isManager: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    toast.error.mockClear();
    toast.success.mockClear();
  });

  it('renders when open and not when closed', () => {
    const { rerender } = render(<CreateEventModal {...defaultProps} />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    
    rerender(<CreateEventModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders form fields and handles form changes', () => {
    render(<CreateEventModal {...defaultProps} />);
    
    expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    
    const nameInput = screen.getByDisplayValue('Test Event');
    fireEvent.change(nameInput, { target: { value: 'New Event' } });
    
    expect(defaultProps.handleFormChange).toHaveBeenCalledWith('name', 'New Event');
  });

  it('handles manager vs non-manager features', () => {
    const { rerender } = render(<CreateEventModal {...defaultProps} isManager={true} />);
    expect(screen.getByDisplayValue('50')).toBeInTheDocument(); // Points field
    
    rerender(<CreateEventModal {...defaultProps} isManager={false} />);
    expect(screen.queryByDisplayValue('50')).not.toBeInTheDocument();
  });

  it('handles form submission and loading state', () => {
    const { rerender } = render(<CreateEventModal {...defaultProps} />);
    
    const createButton = screen.getByText('Create Event');
    fireEvent.click(createButton);
    expect(defaultProps.handleCreateEvent).toHaveBeenCalled();
    
    rerender(<CreateEventModal {...defaultProps} isCreating={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('validates file type when uploading background image', () => {
    const { container } = render(<CreateEventModal {...defaultProps} />);
    
    const fileInput = container.querySelector('input[type="file"]');
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    expect(toast.error).toHaveBeenCalledWith('Please select a valid image file (PNG, JPG, or GIF)');
  });

  it('validates file size when uploading background image', () => {
    const { container } = render(<CreateEventModal {...defaultProps} />);
    
    const fileInput = container.querySelector('input[type="file"]');
    // Create a file larger than 50MB (50 * 1024 * 1024 bytes)
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    expect(toast.error).toHaveBeenCalledWith('File size exceeds 50MB limit. Please choose a smaller image.');
  });
});

describe('EditEventModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    eventData: mockEventData,
    selectedEvent: mockSelectedEvent,
    handleFormChange: jest.fn(),
    handleUpdateEvent: jest.fn(),
    isUpdating: false,
    isManager: true,
    isDisabled: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    toast.error.mockClear();
    toast.success.mockClear();
  });

  it('renders with event name in title', () => {
    render(<EditEventModal {...defaultProps} />);
    expect(screen.getByTestId('modal-header')).toHaveTextContent('Edit Event: Selected Event');
  });

  it('handles publish checkbox for managers', () => {
    render(<EditEventModal {...defaultProps} />);
    
    const publishCheckbox = screen.getByRole('checkbox');
    fireEvent.click(publishCheckbox);
    
    expect(defaultProps.handleFormChange).toHaveBeenCalledWith('published', true);
  });

  it('handles disabled state for past events', () => {
    render(<EditEventModal {...defaultProps} isDisabled={true} />);
    
    const updateButton = screen.getByText('Update Event');
    expect(updateButton).toBeDisabled();
  });

  it('calls update handler on form submission', () => {
    render(<EditEventModal {...defaultProps} />);
    
    const updateButton = screen.getByText('Update Event');
    fireEvent.click(updateButton);
    
    expect(defaultProps.handleUpdateEvent).toHaveBeenCalled();
  });

  it('validates file size when uploading background image in edit mode', () => {
    const { container } = render(<EditEventModal {...defaultProps} />);
    
    const fileInput = container.querySelector('input[type="file"]');
    // Create a file larger than 50MB
    const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    expect(toast.error).toHaveBeenCalledWith('File size exceeds 50MB limit. Please choose a smaller image.');
  });
});

describe('DeleteEventModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedEvent: mockSelectedEvent,
    handleDeleteEvent: jest.fn(),
    isDeleting: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with event name and warning', () => {
    render(<DeleteEventModal {...defaultProps} />);
    
    expect(screen.getByText('Selected Event')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });

  it('handles delete action', () => {
    render(<DeleteEventModal {...defaultProps} />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(defaultProps.handleDeleteEvent).toHaveBeenCalled();
  });

  it('handles loading state', () => {
    render(<DeleteEventModal {...defaultProps} isDeleting={true} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('RsvpEventModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedEvent: mockSelectedEvent,
    isRsvpd: jest.fn(() => false),
    handleRsvp: jest.fn(),
    handleCancelRsvp: jest.fn(),
    isRsvping: false,
    isCancellingRsvp: false,
    formatDate: jest.fn(() => 'June 1, 2024'),
    formatTime: jest.fn(() => '10:00 AM')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders RSVP modal for non-RSVP\'d users', () => {
    render(<RsvpEventModal {...defaultProps} />);
    
    expect(screen.getByTestId('modal-header')).toHaveTextContent('RSVP to Event');
    expect(screen.getByText('Selected Event')).toBeInTheDocument();
  });

  it('renders cancel RSVP modal for RSVP\'d users', () => {
    const mockIsRsvpd = jest.fn(() => true);
    render(<RsvpEventModal {...defaultProps} isRsvpd={mockIsRsvpd} />);
    
    expect(screen.getByTestId('modal-header')).toHaveTextContent('Cancel RSVP');
    expect(screen.getByText(/Are you sure you want to cancel/)).toBeInTheDocument();
  });

  it('handles RSVP actions', () => {
    const { rerender } = render(<RsvpEventModal {...defaultProps} />);
    
    // Test RSVP
    const rsvpButton = screen.getByText('Confirm RSVP');
    fireEvent.click(rsvpButton);
    expect(defaultProps.handleRsvp).toHaveBeenCalled();
    
    // Test Cancel RSVP
    const mockIsRsvpd = jest.fn(() => true);
    rerender(<RsvpEventModal {...defaultProps} isRsvpd={mockIsRsvpd} />);
    
    const buttons = screen.getAllByTestId('button');
    const cancelRsvpButton = buttons.find(btn => btn.textContent === 'Cancel RSVP');
    fireEvent.click(cancelRsvpButton);
    expect(defaultProps.handleCancelRsvp).toHaveBeenCalled();
  });

  it('handles loading states', () => {
    const { rerender } = render(<RsvpEventModal {...defaultProps} isRsvping={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    const mockIsRsvpd = jest.fn(() => true);
    rerender(<RsvpEventModal {...defaultProps} isRsvpd={mockIsRsvpd} isCancellingRsvp={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}); 
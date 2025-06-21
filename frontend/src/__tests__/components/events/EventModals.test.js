import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import {
  CreateEventModal,
  EditEventModal,
  DeleteEventModal,
  RsvpEventModal
} from '../../../components/events/EventModals';
import theme from '../../../styles/theme';

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
  title: 'Tech Conference 2024',
  description: 'Annual technology conference',
  location: 'Convention Center',
  startTime: '2024-06-01T10:00:00',
  endTime: '2024-06-01T18:00:00',
  capacity: 500,
  points: 100
};

// Default props for modals
const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  eventData: mockEventData,
  handleFormChange: jest.fn(),
  handleCreateEvent: jest.fn(),
  isCreating: false,
  isManager: true,
  backgroundFile: null,
  setBackgroundFile: jest.fn(),
  backgroundPreview: null,
  setBackgroundPreview: jest.fn()
};

const deleteProps = {
  isOpen: true,
  onClose: jest.fn(),
  selectedEvent: { ...mockEventData, id: 1, name: 'Tech Conference 2024' },
  handleDeleteEvent: jest.fn(),
  isDeleting: false
};

// Helper function to setup modal
const setupModal = (Component, props) => {
  return render(<Component {...props} />);
};

describe('CreateEventModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with all required fields', () => {
    setupModal(CreateEventModal, defaultProps);

    // Required fields
    const inputs = screen.getAllByTestId('input');
    expect(inputs.find(input => input.getAttribute('label') === 'Event Name')).toBeInTheDocument();
    expect(inputs.find(input => input.getAttribute('label') === 'Description')).toBeInTheDocument();
    expect(inputs.find(input => input.getAttribute('label') === 'Location')).toBeInTheDocument();
    expect(inputs.find(input => input.getAttribute('label') === 'Start Time')).toBeInTheDocument();
    expect(inputs.find(input => input.getAttribute('label') === 'End Time')).toBeInTheDocument();
    expect(inputs.find(input => input.getAttribute('label') === 'Points')).toBeInTheDocument();

    // Optional fields
    expect(inputs.find(input => input.getAttribute('label') === 'Capacity')).toBeInTheDocument();
    expect(screen.getByText('Background Image')).toBeInTheDocument();
  });
});

describe('DeleteEventModal', () => {
  test('renders confirmation message and handles deletion', async () => {
    setupModal(DeleteEventModal, deleteProps);
    
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    expect(deleteButton).toBeInTheDocument();
    
    await userEvent.click(deleteButton);
    expect(deleteProps.handleDeleteEvent).toHaveBeenCalled();
  });
}); 
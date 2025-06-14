import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateUser from '../../../pages/users/CreateUser';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../../services/api', () => ({
  post: jest.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('CreateUser', () => {
  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CreateUser />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create user form', () => {
    renderComponent();

    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument();
  });

  it('validates form fields', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText('UTORid must be 8 alphanumeric characters')).toBeInTheDocument();
      expect(screen.getByText('Name must be between 1 and 50 characters')).toBeInTheDocument();
      expect(screen.getByText('Must be a valid University of Toronto email (@mail.utoronto.ca)')).toBeInTheDocument();
    });
  });

  it('creates user successfully', async () => {
    const mockResponse = {
      data: { resetToken: 'test-reset-token-123' }
    };
    api.post.mockResolvedValue(mockResponse);

    renderComponent();

    // Fill form using name attributes
    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: 'testuser' } });
    fireEvent.change(inputs[1], { target: { value: 'Test User' } });
    fireEvent.change(inputs[2], { target: { value: 'test@utoronto.ca' } });

    fireEvent.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText('User Created Successfully')).toBeInTheDocument();
      expect(screen.getByText('test-reset-token-123')).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith('/users', {
      utorid: 'testuser',
      name: 'Test User',
      email: 'test@utoronto.ca'
    });
    expect(toast.success).toHaveBeenCalledWith('User created successfully!');
  });

  it('handles creation error', async () => {
    const errorMessage = 'User already exists';
    api.post.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });

    renderComponent();

    // Fill and submit form
    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: 'testuser' } });
    fireEvent.change(inputs[1], { target: { value: 'Test User' } });
    fireEvent.change(inputs[2], { target: { value: 'test@utoronto.ca' } });
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('copies reset token to clipboard', async () => {
    const mockResponse = {
      data: { resetToken: 'test-reset-token-123' }
    };
    api.post.mockResolvedValue(mockResponse);
    navigator.clipboard.writeText.mockResolvedValue();

    renderComponent();

    // Create user first
    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: 'testuser' } });
    fireEvent.change(inputs[1], { target: { value: 'Test User' } });
    fireEvent.change(inputs[2], { target: { value: 'test@utoronto.ca' } });
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText('test-reset-token-123')).toBeInTheDocument();
    });

    // Click token to copy
    fireEvent.click(screen.getByText('test-reset-token-123'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-reset-token-123');
    });
  });

  it('resets form for creating another user', async () => {
    const mockResponse = {
      data: { resetToken: 'test-reset-token-123' }
    };
    api.post.mockResolvedValue(mockResponse);

    renderComponent();

    // Create user first
    const inputs = screen.getAllByDisplayValue('');
    fireEvent.change(inputs[0], { target: { value: 'testuser' } });
    fireEvent.change(inputs[1], { target: { value: 'Test User' } });
    fireEvent.change(inputs[2], { target: { value: 'test@utoronto.ca' } });
    fireEvent.click(screen.getByRole('button', { name: /create user/i }));

    await waitFor(() => {
      expect(screen.getByText('User Created Successfully')).toBeInTheDocument();
    });

    // Click "Create Another User"
    fireEvent.click(screen.getByRole('button', { name: /create another user/i }));

    await waitFor(() => {
      expect(screen.getByText('Create New User')).toBeInTheDocument();
      expect(screen.getAllByDisplayValue('')[0]).toHaveValue('');
    });
  });
}); 
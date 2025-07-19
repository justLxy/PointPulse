// src/__tests__/components/ShortlinkModals.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateShortlinkModal, EditShortlinkModal, DeleteShortlinkModal } from '../../../components/shortlinks/ShortlinkModals';

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock('../../../services/shortlink.service', () => ({
  __esModule: true,
  default: {
    isValidSlug: jest.fn((slug) => /^[a-zA-Z0-9-_]+$/.test(slug)),
    isValidUrl: jest.fn((url) => url.startsWith('http')),
    checkSlugExists: jest.fn(async (slug) => ({ exists: false })),
    getShortlinkUrl: jest.fn((slug) => `https://short.link/${slug}`),
  },
}));

jest.mock('../../../constants/routes', () => ({
  hasRouteConflict: jest.fn(() => false),
}));

const mockShortlink = {
  id: '123',
  slug: 'example',
  targetUrl: 'https://example.com',
  event: { name: 'Demo Event' },
  createdBy: { utorid: 'alice123' },
};

describe('CreateShortlinkModal', () => {
  it('renders with correct title and form', () => {
    const handleSubmit = jest.fn();
    const handleClose = jest.fn();

    render(
      <CreateShortlinkModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        eventId="1"
        eventName="Test Event"
        suggestedSlug="test-slug"
        suggestedUrl="https://test.com"
      />
    );

    // Check title
    expect(screen.getByText('Create Shortlink for Test Event')).toBeInTheDocument();
    
    // Check form elements exist
    expect(screen.getByText('Shortlink Slug')).toBeInTheDocument();
    expect(screen.getByText('Target URL')).toBeInTheDocument();
    expect(screen.getByText('Create Shortlink')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Check input values are pre-filled
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('test-slug');
    expect(inputs[1]).toHaveValue('https://test.com');
  });

  it('calls onClose when cancel is clicked', () => {
    const handleSubmit = jest.fn();
    const handleClose = jest.fn();

    render(
      <CreateShortlinkModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });
});

describe('EditShortlinkModal', () => {
  it('renders with pre-filled data', () => {
    const handleSubmit = jest.fn();
    const handleClose = jest.fn();

    render(
      <EditShortlinkModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        shortlink={mockShortlink}
      />
    );

    // Check title
    expect(screen.getByText('Edit Shortlink')).toBeInTheDocument();
    
    // Check form elements exist
    expect(screen.getByText('Shortlink Slug')).toBeInTheDocument();
    expect(screen.getByText('Target URL')).toBeInTheDocument();
    expect(screen.getByText('Update Shortlink')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Check input values are pre-filled
    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('example');
    expect(inputs[1]).toHaveValue('https://example.com');
  });

  it('does not render when shortlink is null', () => {
    const handleSubmit = jest.fn();
    const handleClose = jest.fn();

    render(
      <EditShortlinkModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
        shortlink={null}
      />
    );

    expect(screen.queryByText('Edit Shortlink')).not.toBeInTheDocument();
  });
});

describe('DeleteShortlinkModal', () => {
  it('calls onConfirm when delete is clicked', () => {
    const handleConfirm = jest.fn();
    const handleClose = jest.fn();

    render(
      <DeleteShortlinkModal
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        shortlink={mockShortlink}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Delete Shortlink/i }));

    expect(handleConfirm).toHaveBeenCalledWith('123');
  });
});

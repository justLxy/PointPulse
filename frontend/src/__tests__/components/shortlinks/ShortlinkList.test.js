import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import ShortlinkList from '../../../components/shortlinks/ShortlinkList';
import ShortlinkService from '../../../services/shortlink.service';
import { useAuth } from '../../../contexts/AuthContext';

// Mock dependencies
jest.mock('react-hot-toast');
jest.mock('../../../services/shortlink.service');
jest.mock('../../../contexts/AuthContext');

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaLink: () => <span data-testid="fa-link">🔗</span>,
  FaExternalLinkAlt: () => <span data-testid="fa-external">🔗</span>,
  FaCopy: () => <span data-testid="fa-copy">📋</span>,
  FaEdit: () => <span data-testid="fa-edit">✏️</span>,
  FaTrash: () => <span data-testid="fa-trash">🗑️</span>,
  FaCalendarAlt: () => <span data-testid="fa-calendar">📅</span>,
  FaUser: () => <span data-testid="fa-user">👤</span>,
  FaPlus: () => <span data-testid="fa-plus">➕</span>,
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('ShortlinkList', () => {
  const mockShortlinks = [
    {
      id: '1',
      slug: 'test-slug',
      targetUrl: 'https://example.com',
      createdAt: '2024-01-15T10:00:00Z',
      createdBy: {
        id: 'user1',
        name: 'John Doe',
        utorid: 'john.doe'
      },
      event: {
        id: 'event1',
        name: 'Test Event'
      }
    },
    {
      id: '2',
      slug: 'another-slug',
      targetUrl: 'https://another.com',
      createdAt: '2024-01-16T11:00:00Z',
      createdBy: {
        id: 'user2',
        name: 'Jane Smith',
        utorid: 'jane.smith'
      },
      event: null
    }
  ];

  const defaultProps = {
    shortlinks: mockShortlinks,
    isLoading: false,
    total: 2,
    page: 1,
    totalPages: 1,
    onPageChange: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onCreate: jest.fn(),
    canCreate: true,
    canEdit: true,
    canDelete: true,
    title: 'Test Shortlinks'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    ShortlinkService.getShortlinkUrl.mockImplementation((slug) => `https://short.link/${slug}`);
    useAuth.mockReturnValue({
      currentUser: {
        id: 'user1',
        role: 'user'
      }
    });
  });

  describe('Basic Rendering', () => {
    it('should render with title and create button', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      expect(screen.getByText('Test Shortlinks')).toBeInTheDocument();
      expect(screen.getByText('Create Shortlink')).toBeInTheDocument();
    });

    it('should render shortlink cards', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      expect(screen.getByText('test-slug')).toBeInTheDocument();
      expect(screen.getByText('another-slug')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('https://another.com')).toBeInTheDocument();
    });

    it('should render shortlink URLs', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      expect(screen.getByText('https://short.link/test-slug')).toBeInTheDocument();
      expect(screen.getByText('https://short.link/another-slug')).toBeInTheDocument();
    });

    it('should render creator information', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      expect(screen.getByText('By John Doe')).toBeInTheDocument();
      expect(screen.getByText('By Jane Smith')).toBeInTheDocument();
    });

    it('should render event information when available', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Event Link')).toBeInTheDocument();
    });

    it('should render creation dates', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      expect(screen.getByText(/Created Jan 15, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Created Jan 16, 2024/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(<ShortlinkList {...defaultProps} isLoading={true} />);
      
      expect(screen.getByText('Loading shortlinks...')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no shortlinks', () => {
      render(<ShortlinkList {...defaultProps} shortlinks={[]} />);
      
      expect(screen.getByText('No shortlinks found')).toBeInTheDocument();
      expect(screen.getByText('Create your first shortlink to get started.')).toBeInTheDocument();
    });
  });

  describe('Actions and Permissions', () => {
    it('should show create button when canCreate is true', () => {
      render(<ShortlinkList {...defaultProps} canCreate={true} />);
      
      expect(screen.getByText('Create Shortlink')).toBeInTheDocument();
    });

    it('should hide create button when canCreate is false', () => {
      render(<ShortlinkList {...defaultProps} canCreate={false} />);
      
      expect(screen.queryByText('Create Shortlink')).not.toBeInTheDocument();
    });

    it('should call onCreate when create button is clicked', () => {
      const onCreate = jest.fn();
      render(<ShortlinkList {...defaultProps} onCreate={onCreate} />);
      
      fireEvent.click(screen.getByText('Create Shortlink'));
      expect(onCreate).toHaveBeenCalled();
    });

    it('should show edit button for user\'s own shortlinks', () => {
      useAuth.mockReturnValue({
        currentUser: { id: 'user1', role: 'user' }
      });
      
      render(<ShortlinkList {...defaultProps} />);
      
      const editButtons = screen.getAllByTitle('Edit shortlink');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should show edit button for managers', () => {
      useAuth.mockReturnValue({
        currentUser: { id: 'manager1', role: 'manager' }
      });
      
      render(<ShortlinkList {...defaultProps} />);
      
      const editButtons = screen.getAllByTitle('Edit shortlink');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should hide edit button when user cannot edit', () => {
      useAuth.mockReturnValue({
        currentUser: { id: 'other-user', role: 'user' }
      });
      
      render(<ShortlinkList {...defaultProps} canEdit={false} />);
      
      expect(screen.queryByTitle('Edit shortlink')).not.toBeInTheDocument();
    });

    it('should call onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      render(<ShortlinkList {...defaultProps} onEdit={onEdit} />);
      
      const editButton = screen.getAllByTitle('Edit shortlink')[0];
      fireEvent.click(editButton);
      
      expect(onEdit).toHaveBeenCalledWith(mockShortlinks[0]);
    });

    it('should show delete button for user\'s own shortlinks', () => {
      useAuth.mockReturnValue({
        currentUser: { id: 'user1', role: 'user' }
      });
      
      render(<ShortlinkList {...defaultProps} />);
      
      const deleteButtons = screen.getAllByTitle('Delete shortlink');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = jest.fn();
      render(<ShortlinkList {...defaultProps} onDelete={onDelete} />);
      
      const deleteButton = screen.getAllByTitle('Delete shortlink')[0];
      fireEvent.click(deleteButton);
      
      expect(onDelete).toHaveBeenCalledWith(mockShortlinks[0]);
    });
  });

  describe('Copy Functionality', () => {
    it('should copy shortlink URL to clipboard', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      const copyButtons = screen.getAllByText('Copy Link');
      fireEvent.click(copyButtons[0]);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://short.link/test-slug');
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!');
    });

    it('should copy shortlink URL when copy icon is clicked', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      const copyIconButtons = screen.getAllByTitle('Copy shortlink');
      fireEvent.click(copyIconButtons[0]);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://short.link/test-slug');
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!');
    });
  });

  describe('Pagination', () => {
    it('should render pagination when totalPages > 1', () => {
      render(<ShortlinkList {...defaultProps} totalPages={3} page={2} />);
      
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not render pagination when totalPages <= 1', () => {
      render(<ShortlinkList {...defaultProps} totalPages={1} />);
      
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('should call onPageChange when pagination buttons are clicked', () => {
      const onPageChange = jest.fn();
      render(<ShortlinkList {...defaultProps} totalPages={3} page={2} onPageChange={onPageChange} />);
      
      fireEvent.click(screen.getByText('Previous'));
      expect(onPageChange).toHaveBeenCalledWith(1);
      
      fireEvent.click(screen.getByText('Next'));
      expect(onPageChange).toHaveBeenCalledWith(3);
      
      fireEvent.click(screen.getByText('1'));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should disable Previous button on first page', () => {
      render(<ShortlinkList {...defaultProps} totalPages={3} page={1} />);
      
      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      render(<ShortlinkList {...defaultProps} totalPages={3} page={3} />);
      
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle shortlinks without createdBy', () => {
      const shortlinksWithoutCreator = [
        {
          id: '1',
          slug: 'test-slug',
          targetUrl: 'https://example.com',
          createdAt: '2024-01-15T10:00:00Z',
          createdBy: null,
          event: null
        }
      ];
      
      render(<ShortlinkList {...defaultProps} shortlinks={shortlinksWithoutCreator} />);
      
      expect(screen.getByText('By Unknown')).toBeInTheDocument();
    });

    it('should handle shortlinks without event', () => {
      const shortlinksWithoutEvent = [
        {
          id: '1',
          slug: 'test-slug',
          targetUrl: 'https://example.com',
          createdAt: '2024-01-15T10:00:00Z',
          createdBy: { id: 'user1', name: 'John Doe' },
          event: null
        }
      ];
      
      render(<ShortlinkList {...defaultProps} shortlinks={shortlinksWithoutEvent} />);
      
      expect(screen.queryByText('Event Link')).not.toBeInTheDocument();
    });

    it('should handle shortlinks without createdAt', () => {
      const shortlinksWithoutDate = [
        {
          id: '1',
          slug: 'test-slug',
          targetUrl: 'https://example.com',
          createdAt: null,
          createdBy: { id: 'user1', name: 'John Doe' },
          event: null
        }
      ];
      
      render(<ShortlinkList {...defaultProps} shortlinks={shortlinksWithoutDate} />);
      
      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('should handle superuser permissions', () => {
      useAuth.mockReturnValue({
        currentUser: { id: 'superuser1', role: 'superuser' }
      });
      
      render(<ShortlinkList {...defaultProps} />);
      
      const editButtons = screen.getAllByTitle('Edit shortlink');
      const deleteButtons = screen.getAllByTitle('Delete shortlink');
      
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('External Links', () => {
    it('should render external links with proper attributes', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      const shortlinkLinks = screen.getAllByText(/https:\/\/short\.link/);
      const targetLinks = screen.getAllByText(/https:\/\/example\.com/);
      
      shortlinkLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
      
      targetLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Service Integration', () => {
    it('should call ShortlinkService.getShortlinkUrl for each shortlink', () => {
      render(<ShortlinkList {...defaultProps} />);
      
      expect(ShortlinkService.getShortlinkUrl).toHaveBeenCalledWith('test-slug');
      expect(ShortlinkService.getShortlinkUrl).toHaveBeenCalledWith('another-slug');
    });
  });
}); 
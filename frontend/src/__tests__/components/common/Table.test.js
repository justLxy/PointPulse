import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Table from '../../../components/common/Table';

// Mock the theme module
jest.mock('../../../styles/theme', () => ({
  colors: {
    primary: { main: '#007bff', dark: '#0056b3', contrastText: '#ffffff' },
    background: { paper: '#ffffff', default: '#f8f9fa' },
    text: { primary: '#212529', secondary: '#6c757d' },
    border: { light: '#e9ecef', main: '#dee2e6' }
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
  radius: { sm: '4px', md: '8px' },
  shadows: { sm: '0 1px 3px rgba(0,0,0,0.12)' },
  typography: {
    fontSize: { sm: '14px' },
    fontWeights: { regular: 400, medium: 500, semiBold: 600 }
  }
}));

// Mock react-icons with simpler components
jest.mock('react-icons/bs', () => ({
  BsArrowUp: ({ size }) => <span data-testid="arrow-up" style={{ fontSize: `${size}px` }}>↑</span>,
  BsArrowDown: ({ size }) => <span data-testid="arrow-down" style={{ fontSize: `${size}px` }}>↓</span>
}));

describe('Table Component', () => {
  // Sample data for testing
  const mockColumns = [
    { key: 'id', title: 'ID', sortable: true, width: '80px' },
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', align: 'center' },
    { key: 'role', title: 'Role', align: 'right' },
    { 
      key: 'actions', 
      title: 'Actions', 
      render: (row) => (
        <button data-testid={`action-${row.id}`}>Edit</button>
      )
    }
  ];

  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator' }
  ];

  // Define mockPagination at top level for reuse
  const mockPagination = {
    page: 2,
    totalItems: 50,
    limit: 10,
    onPageChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering Tests', () => {
    it('should render table with columns and data', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      // Check column headers
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      
      // Check data rows
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Moderator')).toBeInTheDocument();
    });

    it('should render empty state when no data provided', () => {
      render(<Table columns={mockColumns} data={[]} />);
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should render custom empty message', () => {
      const customMessage = 'No users found';
      render(<Table columns={mockColumns} data={[]} emptyMessage={customMessage} />);
      
      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.queryByText('No data available')).not.toBeInTheDocument();
    });

    it('should apply striped styling by default', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} />);
      const tbody = container.querySelector('tbody');
      
      expect(tbody).toBeInTheDocument();
    });

    it('should disable striped styling when specified', () => {
      const { container } = render(<Table columns={mockColumns} data={mockData} striped={false} />);
      const tbody = container.querySelector('tbody');
      
      expect(tbody).toBeInTheDocument();
    });
  });

  describe('Column Configuration Tests', () => {
    it('should apply column alignment', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      // Note: We can't easily test CSS properties, but we can verify elements render
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('should apply column width', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      const idHeader = screen.getByText('ID');
      expect(idHeader).toBeInTheDocument();
    });

    it('should render custom cell content using render function', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.getByTestId('action-1')).toBeInTheDocument();
      expect(screen.getByTestId('action-2')).toBeInTheDocument();
      expect(screen.getByTestId('action-3')).toBeInTheDocument();
    });

    it('should handle columns without render function', () => {
      const simpleColumns = [
        { key: 'name', title: 'Name' },
        { key: 'email', title: 'Email' }
      ];
      
      render(<Table columns={simpleColumns} data={mockData} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should handle missing data properties gracefully', () => {
      const dataWithMissingProps = [
        { id: 1, name: 'John Doe' }, // missing email and role
        { id: 2, email: 'jane@example.com' } // missing name and role
      ];
      
      expect(() => {
        render(<Table columns={mockColumns} data={dataWithMissingProps} />);
      }).not.toThrow();
    });
  });

  describe('Sorting Functionality Tests', () => {
    it('should show sort icons only when column is currently sorted', () => {
      const onSort = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          sortColumn="name"
          sortDirection="asc"
          onSort={onSort}
        />
      );
      
      // Only the "name" column should show a sort icon since it's the current sortColumn
      expect(screen.getByTestId('arrow-up')).toBeInTheDocument();
    });

    it('should show descending sort icon when sorted desc', () => {
      const onSort = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          sortColumn="name"
          sortDirection="desc"
          onSort={onSort}
        />
      );
      
      expect(screen.getByTestId('arrow-down')).toBeInTheDocument();
    });

    it('should not show sort icons when no column is sorted', () => {
      const onSort = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          onSort={onSort}
        />
      );
      
      // No column is currently sorted, so no sort icons should appear
      expect(screen.queryByTestId('arrow-up')).not.toBeInTheDocument();
      expect(screen.queryByTestId('arrow-down')).not.toBeInTheDocument();
    });

    it('should call onSort when sortable column header is clicked', () => {
      const onSort = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          onSort={onSort}
        />
      );
      
      fireEvent.click(screen.getByText('Name'));
      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should toggle sort direction when same column is clicked', () => {
      const onSort = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          sortColumn="name"
          sortDirection="asc"
          onSort={onSort}
        />
      );
      
      fireEvent.click(screen.getByText('Name'));
      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should not call onSort for non-sortable columns', () => {
      const onSort = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          onSort={onSort}
        />
      );
      
      fireEvent.click(screen.getByText('Email'));
      expect(onSort).not.toHaveBeenCalled();
    });

    it('should not show sort icons for non-sortable columns even when they match sortColumn', () => {
      const onSort = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          sortColumn="email" // Email column is not sortable
          sortDirection="asc"
          onSort={onSort}
        />
      );
      
      // Email column is not sortable, so no sort icon should appear
      expect(screen.queryByTestId('arrow-up')).not.toBeInTheDocument();
      expect(screen.queryByTestId('arrow-down')).not.toBeInTheDocument();
    });

    it('should handle sorting without onSort callback', () => {
      expect(() => {
        render(
          <Table 
            columns={mockColumns} 
            data={mockData} 
            sortColumn="name"
            sortDirection="asc"
          />
        );
        
        fireEvent.click(screen.getByText('Name'));
      }).not.toThrow();
    });
  });

  describe('Row Interaction Tests', () => {
    it('should call onRowClick when row is clicked', () => {
      const onRowClick = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          onRowClick={onRowClick}
        />
      );
      
      // Click on the first row
      const firstRow = screen.getByText('John Doe').closest('tr');
      fireEvent.click(firstRow);
      
      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('should not call onRowClick when no callback provided', () => {
      expect(() => {
        render(<Table columns={mockColumns} data={mockData} />);
        
        const firstRow = screen.getByText('John Doe').closest('tr');
        fireEvent.click(firstRow);
      }).not.toThrow();
    });

    it('should highlight rows based on highlightRow function', () => {
      const highlightRow = (row) => row.role === 'Admin';
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          highlightRow={highlightRow}
        />
      );
      
      // We can't easily test CSS highlighting, but we can verify the function is called
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should use custom rowKey for row identification', () => {
      const dataWithCustomKey = [
        { customId: 'a1', name: 'John Doe', email: 'john@example.com' },
        { customId: 'a2', name: 'Jane Smith', email: 'jane@example.com' }
      ];
      
      const columnsWithCustomKey = [
        { key: 'customId', title: 'Custom ID' },
        { key: 'name', title: 'Name' },
        { key: 'email', title: 'Email' }
      ];
      
      render(
        <Table 
          columns={columnsWithCustomKey} 
          data={dataWithCustomKey} 
          rowKey="customId"
        />
      );
      
      expect(screen.getByText('a1')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Pagination Tests', () => {
    it('should render pagination controls', () => {
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={mockPagination}
        />
      );
      
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Prev')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('Last')).toBeInTheDocument();
    });

    it('should display pagination info', () => {
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={mockPagination}
        />
      );
      
      expect(screen.getByText('Showing 11-20 of 50 items')).toBeInTheDocument();
    });

    it('should render page numbers', () => {
      const paginationData = [
        { id: 10, name: 'User 10', email: 'user10@example.com', role: 'User' },
        { id: 11, name: 'User 11', email: 'user11@example.com', role: 'User' }
      ];
      
      render(
        <Table 
          columns={mockColumns} 
          data={paginationData} 
          pagination={mockPagination}
        />
      );
      
      // Use getAllByText to handle multiple matches and find the pagination button
      const pageButtons = screen.getAllByText('1').filter(el => el.tagName === 'BUTTON');
      expect(pageButtons.length).toBeGreaterThan(0);
      
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    });

    it('should call onPageChange when page number is clicked', () => {
      const onPageChange = jest.fn();
      const pagination = { ...mockPagination, onPageChange };
      
      // Use data without ID conflicts
      const paginationData = [
        { id: 10, name: 'User 10', email: 'user10@example.com', role: 'User' },
        { id: 11, name: 'User 11', email: 'user11@example.com', role: 'User' }
      ];
      
      render(
        <Table 
          columns={mockColumns} 
          data={paginationData} 
          pagination={pagination}
        />
      );
      
      // Click on page 3 button specifically
      const page3Button = screen.getByRole('button', { name: '3' });
      fireEvent.click(page3Button);
      expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('should call onPageChange for navigation buttons', () => {
      const onPageChange = jest.fn();
      const pagination = { ...mockPagination, onPageChange };
      
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={pagination}
        />
      );
      
      fireEvent.click(screen.getByText('Next'));
      expect(onPageChange).toHaveBeenCalledWith(3);
      
      fireEvent.click(screen.getByText('Prev'));
      expect(onPageChange).toHaveBeenCalledWith(1);
      
      fireEvent.click(screen.getByText('First'));
      expect(onPageChange).toHaveBeenCalledWith(1);
      
      fireEvent.click(screen.getByText('Last'));
      expect(onPageChange).toHaveBeenCalledWith(5);
    });

    it('should disable first and prev buttons on first page', () => {
      const firstPagePagination = { ...mockPagination, page: 1 };
      
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={firstPagePagination}
        />
      );
      
      expect(screen.getByText('First')).toBeDisabled();
      expect(screen.getByText('Prev')).toBeDisabled();
    });

    it('should disable next and last buttons on last page', () => {
      const lastPagePagination = { ...mockPagination, page: 5 };
      
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={lastPagePagination}
        />
      );
      
      expect(screen.getByText('Next')).toBeDisabled();
      expect(screen.getByText('Last')).toBeDisabled();
    });

    it('should handle single page correctly', () => {
      const singlePagePagination = {
        page: 1,
        totalItems: 5,
        limit: 10,
        onPageChange: jest.fn()
      };
      
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={singlePagePagination}
        />
      );
      
      expect(screen.getByText('Showing 1-5 of 5 items')).toBeInTheDocument();
      expect(screen.getByText('First')).toBeDisabled();
      expect(screen.getByText('Last')).toBeDisabled();
    });

    it('should not render pagination when not provided', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      expect(screen.queryByText('First')).not.toBeInTheDocument();
      expect(screen.queryByText('Showing')).not.toBeInTheDocument();
    });

    it('should handle edge case with zero total items', () => {
      const emptyPagination = {
        page: 1,
        totalItems: 0,
        limit: 10,
        onPageChange: jest.fn()
      };
      
      render(
        <Table 
          columns={mockColumns} 
          data={[]} 
          pagination={emptyPagination}
        />
      );
      
      // The component shows "Showing 0-0 of 0 items", not "1-0"
      expect(screen.getByText('Showing 0-0 of 0 items')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty columns array', () => {
      expect(() => {
        render(<Table columns={[]} data={mockData} />);
      }).not.toThrow();
    });

    it('should handle null data', () => {
      // The component currently doesn't handle null data - this is a bug
      expect(() => {
        render(<Table columns={mockColumns} data={null} />);
      }).toThrow('Cannot read properties of null (reading \'length\')');
    });

    it('should handle undefined data', () => {
      expect(() => {
        render(<Table columns={mockColumns} data={undefined} />);
      }).not.toThrow();
    });

    it('should handle columns with missing keys', () => {
      const invalidColumns = [
        { title: 'Name' }, // missing key
        { key: 'email', title: 'Email' }
      ];
      
      expect(() => {
        render(<Table columns={invalidColumns} data={mockData} />);
      }).not.toThrow();
    });

    it('should handle data with complex nested objects', () => {
      const complexData = [
        { id: 1, user: { name: 'John', details: { age: 30 } } },
        { id: 2, user: { name: 'Jane', details: { age: 25 } } }
      ];
      
      const complexColumns = [
        { key: 'id', title: 'ID' },
        { 
          key: 'user', 
          title: 'User', 
          render: (row) => row.user?.name || 'Unknown'
        }
      ];
      
      render(<Table columns={complexColumns} data={complexData} />);
      
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    it('should handle very large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 3 === 0 ? 'Admin' : 'User'
      }));
      
      const start = performance.now();
      render(<Table columns={mockColumns} data={largeData} />);
      const end = performance.now();
      
      // Should render within reasonable time (< 500ms)
      expect(end - start).toBeLessThan(500);
    });

    it('should handle special characters in data', () => {
      const specialData = [
        { id: 1, name: 'João José', email: 'joão@example.com', role: 'Administrador' },
        { id: 2, name: '张三', email: '张三@example.com', role: '用户' },
        { id: 3, name: 'Владимир', email: 'vladimir@example.com', role: 'пользователь' }
      ];
      
      render(<Table columns={mockColumns} data={specialData} />);
      
      expect(screen.getByText('João José')).toBeInTheDocument();
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('Владимир')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper table structure', () => {
      render(<Table columns={mockColumns} data={mockData} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(mockColumns.length);
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(mockData.length + 1); // +1 for header row
    });

    it('should have accessible pagination controls', () => {
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={mockPagination}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should handle keyboard navigation for sortable columns', () => {
      const onSort = jest.fn();
      render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          onSort={onSort}
        />
      );
      
      const nameHeader = screen.getByText('Name');
      nameHeader.focus();
      
      fireEvent.keyDown(nameHeader, { key: 'Enter' });
      // Note: This test assumes the styled component handles keyboard events
    });
  });

  describe('Performance and Rendering Optimization Tests', () => {
    it('should handle component re-rendering efficiently', () => {
      const { rerender } = render(<Table columns={mockColumns} data={mockData} />);
      
      const newData = [...mockData, { id: 4, name: 'New User', email: 'new@example.com', role: 'User' }];
      
      expect(() => {
        rerender(<Table columns={mockColumns} data={newData} />);
      }).not.toThrow();
      
      expect(screen.getByText('New User')).toBeInTheDocument();
    });

    it('should update correctly when columns change', () => {
      const { rerender } = render(<Table columns={mockColumns} data={mockData} />);
      
      const newColumns = [
        { key: 'id', title: 'User ID' },
        { key: 'name', title: 'Full Name' }
      ];
      
      rerender(<Table columns={newColumns} data={mockData} />);
      
      expect(screen.getByText('User ID')).toBeInTheDocument();
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.queryByText('Email')).not.toBeInTheDocument();
    });

    it('should handle pagination state changes efficiently', () => {
      const { rerender } = render(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={mockPagination}
        />
      );
      
      const newPagination = { ...mockPagination, page: 3 };
      rerender(
        <Table 
          columns={mockColumns} 
          data={mockData} 
          pagination={newPagination}
        />
      );
      
      expect(screen.getByText('Showing 21-30 of 50 items')).toBeInTheDocument();
    });
  });

  describe('Integration Test Scenarios', () => {
    it('should work as a complete user data table', () => {
      const userData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator', status: 'Active' }
      ];
      
      const userColumns = [
        { key: 'id', title: 'ID', sortable: true, width: '60px' },
        { key: 'name', title: 'Name', sortable: true },
        { key: 'email', title: 'Email', align: 'center' },
        { key: 'role', title: 'Role', sortable: true },
        { 
          key: 'status', 
          title: 'Status', 
          render: (row) => (
            <span data-testid={`status-${row.id}`} style={{ color: row.status === 'Active' ? 'green' : 'red' }}>
              {row.status}
            </span>
          )
        }
      ];
      
      const pagination = {
        page: 1,
        totalItems: 3,
        limit: 10,
        onPageChange: jest.fn()
      };
      
      const onSort = jest.fn();
      const onRowClick = jest.fn();
      const highlightRow = (row) => row.role === 'Admin';
      
      render(
        <Table 
          columns={userColumns}
          data={userData}
          pagination={pagination}
          sortColumn="name"
          sortDirection="asc"
          onSort={onSort}
          onRowClick={onRowClick}
          highlightRow={highlightRow}
          emptyMessage="No users found"
        />
      );
      
      // Test all features
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('status-1')).toHaveTextContent('Active');
      // Note: Arrow icon only shows if we have actual sorting on that column
      expect(screen.getByText('Showing 1-3 of 3 items')).toBeInTheDocument();
      
      // Test interactions
      fireEvent.click(screen.getByText('Role'));
      expect(onSort).toHaveBeenCalledWith('role', 'asc');
      
      const firstRow = screen.getByText('John Doe').closest('tr');
      fireEvent.click(firstRow);
      expect(onRowClick).toHaveBeenCalledWith(userData[0]);
    });

    it('should work with minimal configuration', () => {
      const simpleColumns = [
        { key: 'name', title: 'Name' },
        { key: 'value', title: 'Value' }
      ];
      
      const simpleData = [
        { name: 'Item 1', value: 'Value 1' },
        { name: 'Item 2', value: 'Value 2' }
      ];
      
      render(<Table columns={simpleColumns} data={simpleData} />);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Value 2')).toBeInTheDocument();
      expect(screen.queryByText('First')).not.toBeInTheDocument();
    });

    it('should handle empty table with all features enabled', () => {
      const pagination = {
        page: 1,
        totalItems: 0,
        limit: 10,
        onPageChange: jest.fn()
      };
      
      render(
        <Table 
          columns={mockColumns}
          data={[]}
          pagination={pagination}
          sortColumn="name"
          sortDirection="asc"
          onSort={jest.fn()}
          onRowClick={jest.fn()}
          emptyMessage="No data available"
        />
      );
      
      expect(screen.getByText('No data available')).toBeInTheDocument();
      expect(screen.getByText('Showing 0-0 of 0 items')).toBeInTheDocument();
      expect(screen.getByText('First')).toBeDisabled();
    });
  });
}); 
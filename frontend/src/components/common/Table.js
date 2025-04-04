import styled from '@emotion/styled';
import { css } from '@emotion/react';
import theme from '../../styles/theme';
import { BsArrowUp, BsArrowDown } from 'react-icons/bs';

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadows.sm};
  background-color: ${theme.colors.background.paper};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-size: ${theme.typography.fontSize.sm};
`;

const TableHead = styled.thead`
  background-color: ${theme.colors.background.default};
  border-bottom: 2px solid ${theme.colors.border.light};
`;

const TableHeadCell = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  font-weight: ${theme.typography.fontWeights.semiBold};
  color: ${theme.colors.text.primary};
  position: relative;
  transition: background-color 0.2s;
  
  ${({ sortable }) =>
    sortable &&
    css`
      cursor: pointer;
      user-select: none;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    `}
  
  ${({ align }) =>
    align &&
    css`
      text-align: ${align};
    `}
    
  ${({ width }) =>
    width &&
    css`
      width: ${width};
    `}
`;

const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: ${theme.spacing.xs};
  vertical-align: middle;
`;

const TableBody = styled.tbody`
  & tr:nth-of-type(even) {
    background-color: ${theme.colors.background.default};
  }
  
  & tr:hover {
    background-color: rgba(52, 152, 219, 0.05);
  }
  
  ${({ striped }) =>
    striped &&
    css`
      & tr:nth-of-type(odd) {
        background-color: ${theme.colors.background.paper};
      }
      & tr:nth-of-type(even) {
        background-color: ${theme.colors.background.default};
      }
    `}
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border.light};
  
  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;
    `}
    
  ${({ highlight }) =>
    highlight &&
    css`
      background-color: rgba(52, 152, 219, 0.1) !important;
    `}
`;

const TableCell = styled.td`
  padding: ${theme.spacing.md};
  color: ${theme.colors.text.primary};
  
  ${({ align }) =>
    align &&
    css`
      text-align: ${align};
    `}
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-style: italic;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border.light};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

const PaginationInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: 768px) {
    text-align: center;
    width: 100%;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const PaginationButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 ${theme.spacing.sm};
  border-radius: ${theme.radius.sm};
  border: 1px solid ${theme.colors.border.main};
  background-color: ${({ active }) => (active ? theme.colors.primary.main : theme.colors.background.paper)};
  color: ${({ active }) => (active ? theme.colors.primary.contrastText : theme.colors.text.primary)};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${({ active }) => (active ? theme.typography.fontWeights.medium : theme.typography.fontWeights.regular)};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background-color: ${({ active }) => (active ? theme.colors.primary.dark : theme.colors.background.default)};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Table = ({
  columns,
  data = [],
  emptyMessage = 'No data available',
  striped = true,
  pagination,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  rowKey = 'id',
  highlightRow,
}) => {
  const handleSort = (column) => {
    if (!column.sortable || !onSort) return;
    
    const isAsc = sortColumn === column.key && sortDirection === 'asc';
    onSort(column.key, isAsc ? 'desc' : 'asc');
  };
  
  const renderSortIcon = (column) => {
    if (!column.sortable) return null;
    
    if (sortColumn === column.key) {
      return (
        <SortIcon>
          {sortDirection === 'asc' ? <BsArrowUp size={12} /> : <BsArrowDown size={12} />}
        </SortIcon>
      );
    }
    
    return null;
  };
  
  const renderPagination = () => {
    if (!pagination) return null;
    
    const { page, totalItems, limit, onPageChange } = pagination;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    
    const renderPageNumbers = () => {
      const pages = [];
      const maxPagesToShow = 5;
      
      let startPage = Math.max(1, page - 2);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationButton
            key={i}
            active={i === page}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationButton>
        );
      }
      
      return pages;
    };
    
    return (
      <Pagination>
        <PaginationInfo>
          Showing {Math.min(totalItems, (page - 1) * limit + 1)}-{Math.min(totalItems, page * limit)} of {totalItems} items
        </PaginationInfo>
        
        <PaginationControls>
          <PaginationButton
            disabled={page === 1}
            onClick={() => onPageChange(1)}
          >
            First
          </PaginationButton>
          
          <PaginationButton
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </PaginationButton>
          
          {renderPageNumbers()}
          
          <PaginationButton
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </PaginationButton>
          
          <PaginationButton
            disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            Last
          </PaginationButton>
        </PaginationControls>
      </Pagination>
    );
  };
  
  return (
    <TableWrapper>
      <StyledTable>
        <TableHead>
          <tr>
            {columns.map((column) => (
              <TableHeadCell
                key={column.key}
                align={column.align}
                width={column.width}
                sortable={column.sortable}
                onClick={() => handleSort(column)}
              >
                {column.title}
                {renderSortIcon(column)}
              </TableHeadCell>
            ))}
          </tr>
        </TableHead>
        
        <TableBody striped={striped}>
          {data.length > 0 ? (
            data.map((row) => (
              <TableRow
                key={row[rowKey]}
                clickable={!!onRowClick}
                onClick={() => onRowClick && onRowClick(row)}
                highlight={highlightRow && highlightRow(row)}
              >
                {columns.map((column) => (
                  <TableCell key={`${row[rowKey]}-${column.key}`} align={column.align}>
                    {column.render ? column.render(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState>{emptyMessage}</EmptyState>
              </td>
            </tr>
          )}
        </TableBody>
      </StyledTable>
      
      {renderPagination()}
    </TableWrapper>
  );
};

export default Table; 
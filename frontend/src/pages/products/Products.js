import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiShoppingBag, FiDollarSign, FiGift, FiChevronLeft, FiChevronRight, FiCreditCard, FiStar, FiCheckCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useProducts } from '../../hooks/useProducts';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import theme from '../../styles/theme';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

import ProductCard from '../../components/products/ProductCard';


const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    ${theme.colors.background.default} 0%, 
    #f0f7ff 50%, 
    ${theme.colors.background.default} 100%
  );
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.lg} ${theme.spacing.sm};
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const FilterSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.radius.xl};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.lg};
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.lg};
  }
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  
  h2 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.semiBold};
    color: ${theme.colors.text.primary};
    margin: 0;
  }
  
  svg {
    color: ${theme.colors.primary.main};
    font-size: 1.2rem;
  }
`;

const FilterControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const SearchRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
    align-items: stretch;
  }
`;

const CategorySelect = styled.select`
  min-width: 200px;
  height: 40px;
  padding: 0 ${theme.spacing.md};
  padding-right: ${theme.spacing.xl};
  font-size: ${theme.typography.fontSize.sm};
  background-color: ${theme.colors.background.paper};
  border: 1px solid ${theme.colors.border.main};
  border-radius: ${theme.radius.md};
  transition: border-color ${theme.transitions.quick}, box-shadow ${theme.transitions.quick};
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.sm} center;
  background-size: 16px;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
  
  &:hover {
    border-color: ${theme.colors.primary.light};
  }
  
  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
  }
`;

const SortSelect = styled(CategorySelect)`
  min-width: 180px;
`;

const PaymentTypeFilter = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: ${theme.spacing.xs};
  }
`;

const PaymentTypeButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.radius.md};
  background: ${props => props.active ? theme.colors.primary.main : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  white-space: nowrap;
  
  &:hover {
    ${props => !props.disabled && `
      border-color: ${theme.colors.primary.main};
      ${!props.active ? `
        background: rgba(52, 152, 219, 0.1);
        color: ${theme.colors.primary.main};
      ` : ''}
    `}
  }
  
  &:focus {
    outline: none;
    ${props => !props.disabled && `
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    `}
  }
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: ${theme.typography.fontSize.xs};
    flex: 1;
    min-width: 0;
    justify-content: center;
    
    svg {
      font-size: 0.875rem;
    }
  }
  
  @media (max-width: 480px) {
    flex-basis: calc(50% - ${theme.spacing.xs});
    flex-direction: column;
    gap: 2px;
    padding: ${theme.spacing.xs};
    
    span {
      font-size: 10px;
      line-height: 1.2;
      text-align: center;
    }
    
    svg {
      font-size: 14px;
    }
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.colors.text.secondary};
    font-size: 1.1rem;
    pointer-events: none;
    z-index: 1;
  }
  
  > div {
    margin-bottom: 0 !important;
  }
  
  input {
    padding-left: 40px !important;
    width: 100%;
    height: 40px;
    box-sizing: border-box;
  }
  
  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;



const StatsBar = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
    align-items: flex-start;
  }
`;

const StatsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  svg {
    color: ${theme.colors.primary.main};
  }
`;

const ProductsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

const PageControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
    align-items: flex-start;
  }
`;

const PageInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: 768px) {
    text-align: center;
    width: 100%;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const EmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing['3xl']} ${theme.spacing.md};
  text-align: center;
  color: ${theme.colors.text.secondary};
  
  svg {
    font-size: 4rem;
    margin-bottom: ${theme.spacing.lg};
    color: ${theme.colors.text.disabled};
  }
  
  h3 {
    font-size: ${theme.typography.fontSize.xl};
    font-weight: ${theme.typography.fontWeights.medium};
    margin-bottom: ${theme.spacing.sm};
    color: ${theme.colors.text.primary};
  }
  
  p {
    font-size: ${theme.typography.fontSize.md};
    max-width: 400px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get current user data for affordability check
  const { currentUser, availablePoints } = useCurrentUser();
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    priceType: searchParams.get('priceType') || '', // 'cash', 'points', 'both'
    affordable: searchParams.get('affordable') === 'true',
    inStockOnly: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || '', // 'points-asc', 'points-desc', 'cash-asc', 'cash-desc'
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 12,
  }));

  // Update URL when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (filters.search) newSearchParams.set('search', filters.search);
    if (filters.category) newSearchParams.set('category', filters.category);
    if (filters.priceType) newSearchParams.set('priceType', filters.priceType);
    if (filters.affordable) newSearchParams.set('affordable', 'true');
    if (filters.inStockOnly) newSearchParams.set('inStock', 'true');
    if (filters.sortBy) newSearchParams.set('sortBy', filters.sortBy);
    if (filters.page > 1) newSearchParams.set('page', filters.page.toString());
    
    setSearchParams(newSearchParams, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch products using the custom hook
  const { 
    products, 
    totalCount, 
    isLoading, 
    stats,
    categories
  } = useProducts({
    ...filters,
    userPoints: availablePoints || 0
  });

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  };

  // Handle search with debounce
  const [searchValue, setSearchValue] = useState(filters.search);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', searchValue);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit + 1;
  const endIndex = Math.min(startIndex + filters.limit - 1, totalCount);

  const handlePageChange = (page) => {
    handleFilterChange('page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build category options from API data
  const categoryOptions = [{ value: '', label: 'All Categories' }, ...(categories ?? [])];



  return (
    <PageContainer>
      <ContentWrapper>


        {/* Filters */}
        <FilterSection
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FilterHeader>
            <FiFilter />
            <h2>Find Products</h2>
          </FilterHeader>
          
          <FilterControls>
            <SearchRow>
              <SearchInputWrapper>
                <FiSearch className="search-icon" />
                <Input
                  type="text"
                  placeholder="Search by name"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </SearchInputWrapper>
              
              <CategorySelect
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </CategorySelect>
              
              <SortSelect
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="">No Sorting</option>
                <option value="points-asc">Points: Low to High</option>
                <option value="points-desc">Points: High to Low</option>
                <option value="cash-asc">Price: Low to High</option>
                <option value="cash-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </SortSelect>
            </SearchRow>
            
            <PaymentTypeFilter>
              <PaymentTypeButton
                active={filters.priceType === '' && !filters.affordable}
                onClick={() => {
                  handleFilterChange('priceType', '');
                  handleFilterChange('affordable', false);
                  handleFilterChange('inStockOnly', false);
                }}
              >
                <FiShoppingBag />
                <span>All Items</span>
              </PaymentTypeButton>
              
              <PaymentTypeButton
                active={filters.affordable}
                onClick={() => handleFilterChange('affordable', !filters.affordable)}
                disabled={!currentUser}
                title={!currentUser ? 'Please log in to use this filter' : 'Show only items you can afford'}
              >
                <FiCheckCircle />
                <span>Can Purchase</span>
              </PaymentTypeButton>
              
              <PaymentTypeButton
                active={filters.priceType === 'cash'}
                onClick={() => {
                  handleFilterChange('priceType', 'cash');
                  handleFilterChange('affordable', false);
                }}
              >
                <FiDollarSign />
                <span>Cash Only</span>
              </PaymentTypeButton>
              
              <PaymentTypeButton
                active={filters.priceType === 'points'}
                onClick={() => {
                  handleFilterChange('priceType', 'points');
                  handleFilterChange('affordable', false);
                }}
              >
                <FiStar />
                <span>Points Only</span>
              </PaymentTypeButton>
              
              <PaymentTypeButton
                active={filters.priceType === 'both'}
                onClick={() => {
                  handleFilterChange('priceType', 'both');
                  handleFilterChange('affordable', false);
                }}
              >
                <FiCreditCard />
                <span>Cash & Points</span>
              </PaymentTypeButton>
              
              {/* In Stock filter toggle */}
              <PaymentTypeButton
                active={filters.inStockOnly}
                onClick={() => handleFilterChange('inStockOnly', !filters.inStockOnly)}
                title="Show only items currently in stock"
              >
                <FiShoppingBag />
                <span>In Stock</span>
              </PaymentTypeButton>
            </PaymentTypeFilter>
          </FilterControls>
        </FilterSection>

        {/* Stats Bar */}
        <StatsBar
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <StatsInfo>
            <StatItem>
              <FiShoppingBag />
              <span>{totalCount} products found</span>
            </StatItem>
            {stats && (
              <>
                <StatItem>
                  <FiDollarSign />
                  <span>{stats.cashProducts} cash items</span>
                </StatItem>
                <StatItem>
                  <FiGift />
                  <span>{stats.pointsProducts} points items</span>
                </StatItem>
                {currentUser && (
                  <StatItem>
                    <FiCheckCircle />
                    <span>{stats.affordableProducts} affordable</span>
                  </StatItem>
                )}
              </>
            )}
          </StatsInfo>
        </StatsBar>

        {/* Loading State */}
        {isLoading && (
          <LoadingContainer>
            <LoadingSpinner text="Loading products..." />
          </LoadingContainer>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <ProductsGrid
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <AnimatePresence mode="wait">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.4 
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </ProductsGrid>
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <EmptyState
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FiShoppingBag />
            <h3>No products found</h3>
            <p>
              {filters.search || filters.category || filters.priceType || filters.affordable
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "There are currently no products available in the catalog."}
            </p>
          </EmptyState>
        )}

        {/* Pagination */}
        {!isLoading && products.length > 0 && totalPages > 1 && (
          <PageControls>
            <PageInfo>
              Showing {startIndex} to {endIndex} of {totalCount} products
            </PageInfo>
            
            <Pagination>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                style={{ minWidth: '80px' }}
              >
                <FiChevronLeft /> Previous
              </Button>
              
              <PageInfo style={{ 
                minWidth: '100px', 
                textAlign: 'center', 
                whiteSpace: 'nowrap' 
              }}>
                Page {filters.page} of {totalPages}
              </PageInfo>
              
              <Button
                size="small"
                variant="outlined"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
                style={{ minWidth: '80px' }}
              >
                Next <FiChevronRight />
              </Button>
            </Pagination>
          </PageControls>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

export default Products; 
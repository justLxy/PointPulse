import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

// Mock data for development - this will be replaced with real API calls later
const generateMockProducts = () => {
  const categories = ['beverages', 'snacks', 'meals', 'accessories', 'electronics'];
  const priceTypes = ['cash', 'points', 'both'];
  
  const products = [];
  
  const productNames = {
    beverages: [
      'Coca-Cola', 'Pepsi', 'Coffee', 'Green Tea', 'Energy Drink', 'Orange Juice',
      'Water Bottle', 'Iced Tea', 'Lemonade', 'Sports Drink'
    ],
    snacks: [
      'Potato Chips', 'Chocolate Bar', 'Granola Bar', 'Cookies', 'Crackers',
      'Trail Mix', 'Popcorn', 'Pretzels', 'Nuts', 'Candy'
    ],
    meals: [
      'Sandwich', 'Salad', 'Pizza Slice', 'Burrito', 'Soup', 'Pasta',
      'Burger', 'Wrap', 'Rice Bowl', 'Noodles'
    ],
    accessories: [
      'T-Shirt', 'Hoodie', 'Mug', 'Water Bottle', 'Keychain', 'Sticker Pack',
      'Notebook', 'Pen Set', 'Badge', 'Lanyard'
    ],
    electronics: [
      'Phone Charger', 'USB Cable', 'Headphones', 'Power Bank', 'Phone Case',
      'Bluetooth Speaker', 'Mouse Pad', 'Screen Cleaner', 'Adapter', 'Webcam'
    ]
  };

  const descriptions = {
    beverages: [
      'Refreshing drink perfect for any time of day',
      'Premium quality beverage with natural flavors',
      'Energizing drink to keep you going',
      'Healthy and delicious beverage option'
    ],
    snacks: [
      'Crunchy and satisfying snack for quick energy',
      'Perfect bite-sized treat for studying',
      'Healthy snack option packed with nutrients',
      'Delicious snack to satisfy your cravings'
    ],
    meals: [
      'Freshly prepared meal with quality ingredients',
      'Satisfying and nutritious meal option',
      'Quick and delicious meal for busy students',
      'Hearty meal to fuel your day'
    ],
    accessories: [
      'High-quality CSSU branded merchandise',
      'Essential accessory for every student',
      'Stylish and functional item',
      'Perfect gift or personal use item'
    ],
    electronics: [
      'Essential tech accessory for students',
      'High-quality electronic item',
      'Convenient and reliable device',
      'Perfect for your tech needs'
    ]
  };

  // High-quality product images from Unsplash
  const imageUrls = {
    beverages: [
      'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop'
    ],
    snacks: [
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571988840298-3b5301d5109b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1577906073491-20319b5d1cc8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop'
    ],
    meals: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop'
    ],
    accessories: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=300&fit=crop'
    ],
    electronics: [
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop'
    ]
  };

  let id = 1;
  categories.forEach(category => {
    const names = productNames[category];
    const categoryDescriptions = descriptions[category];
    const categoryImages = imageUrls[category];
    
    names.forEach((name, index) => {
      const priceType = priceTypes[Math.floor(Math.random() * priceTypes.length)];
      const basePrice = Math.random() * 50 + 5; // $5-$55
      const pointsMultiplier = 100; // 1 dollar = 100 points roughly
      
      products.push({
        id: id++,
        name: `${name}`,
        description: categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)],
        category: category,
        priceType: priceType,
        cashPrice: priceType !== 'points' ? Math.round(basePrice * 100) / 100 : null,
        pointsPrice: priceType !== 'cash' ? Math.round(basePrice * pointsMultiplier) : null,
        imageUrl: categoryImages[index % categoryImages.length],
        inStock: Math.random() > 0.1, // 90% chance of being in stock
        stockQuantity: Math.floor(Math.random() * 100) + 1,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating
        reviewCount: Math.floor(Math.random() * 50) + 1,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
    });
  });

  return products;
};

const mockProducts = generateMockProducts();

// Mock API function - this simulates a real API call
const fetchProducts = async (filters = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  let filteredProducts = [...mockProducts];
  
  // Apply filters
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category === filters.category
    );
  }
  
  if (filters.priceType) {
    filteredProducts = filteredProducts.filter(product =>
      product.priceType === filters.priceType
    );
  }
  
  // Apply affordability filter
  if (filters.affordable && filters.userPoints !== undefined) {
    filteredProducts = filteredProducts.filter(product => {
      if (!product.inStock) return false; // Can't buy out of stock items
      
      // Check if user can afford this product based on price type
      // Conversion rate: 1 point = $0.01, so $1 = 100 points
      switch (product.priceType) {
        case 'points':
          return product.pointsPrice <= filters.userPoints;
        case 'cash':
          // User can afford if they have enough points to cover the cash price
          // Cash price is in dollars, convert to points: $1 = 100 points
          const requiredPointsForCash = Math.ceil(product.cashPrice * 100);
          return requiredPointsForCash <= filters.userPoints;
        case 'both':
          // User can afford if they have enough points for either the points price OR the cash price
          const requiredPointsForCashOption = Math.ceil(product.cashPrice * 100);
          return product.pointsPrice <= filters.userPoints || requiredPointsForCashOption <= filters.userPoints;
        default:
          return true;
      }
    });
  }
  
  // Apply sorting
  if (filters.sortBy) {
    filteredProducts.sort((a, b) => {
      switch (filters.sortBy) {
        case 'points-asc':
          // Sort by points price (ascending), handle null values
          const aPoints = a.pointsPrice || (a.cashPrice ? a.cashPrice * 100 : 0);
          const bPoints = b.pointsPrice || (b.cashPrice ? b.cashPrice * 100 : 0);
          return aPoints - bPoints;
        case 'points-desc':
          // Sort by points price (descending), handle null values
          const aPointsDesc = a.pointsPrice || (a.cashPrice ? a.cashPrice * 100 : 0);
          const bPointsDesc = b.pointsPrice || (b.cashPrice ? b.cashPrice * 100 : 0);
          return bPointsDesc - aPointsDesc;
        case 'cash-asc':
          // Sort by cash price (ascending), handle null values
          const aCash = a.cashPrice || (a.pointsPrice ? a.pointsPrice / 100 : 0);
          const bCash = b.cashPrice || (b.pointsPrice ? b.pointsPrice / 100 : 0);
          return aCash - bCash;
        case 'cash-desc':
          // Sort by cash price (descending), handle null values
          const aCashDesc = a.cashPrice || (a.pointsPrice ? a.pointsPrice / 100 : 0);
          const bCashDesc = b.cashPrice || (b.pointsPrice ? b.pointsPrice / 100 : 0);
          return bCashDesc - aCashDesc;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  // Calculate stats
  const stats = {
    totalProducts: filteredProducts.length,
    cashProducts: filteredProducts.filter(p => p.priceType === 'cash' || p.priceType === 'both').length,
    pointsProducts: filteredProducts.filter(p => p.priceType === 'points' || p.priceType === 'both').length,
    inStockProducts: filteredProducts.filter(p => p.inStock).length,
    affordableProducts: filters.userPoints !== undefined 
      ? filteredProducts.filter(p => {
          if (!p.inStock) return false;
          // Conversion rate: 1 point = $0.01, so $1 = 100 points
          switch (p.priceType) {
            case 'points':
              return p.pointsPrice <= filters.userPoints;
            case 'cash':
              const requiredPointsForCash = Math.ceil(p.cashPrice * 100);
              return requiredPointsForCash <= filters.userPoints;
            case 'both':
              const requiredPointsForCashOption = Math.ceil(p.cashPrice * 100);
              return p.pointsPrice <= filters.userPoints || requiredPointsForCashOption <= filters.userPoints;
            default:
              return true;
          }
        }).length
      : 0,
  };
  
  // Apply pagination
  const { page = 1, limit = 12 } = filters;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  return {
    products: paginatedProducts,
    totalCount: filteredProducts.length,
    stats,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit),
      hasNext: endIndex < filteredProducts.length,
      hasPrev: page > 1,
    }
  };
};

export const useProducts = (filters = {}) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const queryKey = ['products', filters];
  
  const {
    data,
    isLoading: queryLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => fetchProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    onSuccess: () => {
      setIsInitialLoad(false);
    }
  });

  // Show loading only on initial load to avoid flickering during filtering
  const isLoading = isInitialLoad && queryLoading;

  const memoizedResult = useMemo(() => ({
    products: data?.products || [],
    totalCount: data?.totalCount || 0,
    stats: data?.stats || null,
    pagination: data?.pagination || null,
    isLoading,
    error,
    refetch
  }), [data, isLoading, error, refetch]);

  return memoizedResult;
};

export default useProducts; 
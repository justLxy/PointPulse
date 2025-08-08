import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import productService from '../services/product.service';
import { TIER_ORDER } from '../utils/tierUtils';

// Transform Square catalog objects into the product shape used by the UI
const transformSquareCatalog = (squareData = {}) => {
  const objects = squareData.objects || [];
  const countsArray = squareData.counts || [];
  const categoriesMap = {};
  const imagesMap = {};

  // Build counts map variationId -> quantity number
  const countsMap = countsArray.reduce((acc, c) => {
    acc[c.catalog_object_id] = parseInt(c.quantity, 10);
    return acc;
  }, {});

  // Build category map {id: name}
  objects
    .filter((obj) => obj.type === 'CATEGORY' && obj.category_data?.name)
    .forEach((cat) => {
      categoriesMap[cat.id] = cat.category_data.name;
    });

  // Build images map {id: url}
  objects
    .filter((obj) => obj.type === 'IMAGE' && obj.image_data?.url)
    .forEach((img) => {
      imagesMap[img.id] = img.image_data.url;
    });

  // Helper function to get REDEMPTION_TYPE from custom attributes
  const getRedemptionType = (customAttributes = {}) => {
    const redemptionTypeAttr = customAttributes['Square:900917c3-ced0-4a7f-9b29-643019029c10'];
    if (redemptionTypeAttr && redemptionTypeAttr.selection_uid_values && redemptionTypeAttr.selection_uid_values.length > 0) {
      const selectionUid = redemptionTypeAttr.selection_uid_values[0];
      // Map selection UIDs to our priceType values
      switch (selectionUid) {
        case 'DNS2HFR3QWJVANRMHR3Z33HS': // POINTS_ONLY
          return 'points';
        case 'N7HYPPYUIUQVU47KMS42LEZJ': // UNRESTRICTED
          return 'both';
        case 'XUS3MGN4PBW62D3NAGGPCMKE': // CASH_ONLY
          return 'cash';
        default:
          return 'cash'; // Default to cash if unknown
      }
    }
    return 'cash'; // Default to cash if no redemption type specified
  };

  // Helper function to get MINIMUM_TIER from custom attributes
  const getMinimumTier = (customAttributes = {}) => {
    const minimumTierAttr = customAttributes['Square:c0cc7a27-ffe5-45a3-9950-f9c6ee2b4e9d'];
    if (minimumTierAttr && minimumTierAttr.selection_uid_values && minimumTierAttr.selection_uid_values.length > 0) {
      const selectionUid = minimumTierAttr.selection_uid_values[0];
      // Map selection UIDs to tier values (based on Square definition)
      switch (selectionUid) {
        case 'MEQRTCP5FODCYRLAR4Q2CR6L': // BRONZE
          return 'BRONZE';
        case 'E2P4SQIGRFIUUBIEPWXZFJBZ': // SILVER
          return 'SILVER';
        case 'AVHPER2O6NUEZ2LIQZQ7QXC7': // GOLD
          return 'GOLD';
        case 'BLSAT5KZVGMQSRG7WXCEJDN2': // PLATINUM
          return 'PLATINUM';
        case 'YNT6HS4NYIG5OMSFMJQXFI6E': // DIAMOND
          return 'DIAMOND';
        case 'TQMOTZL7V4ULKLKE2NTR7ZHW': // UNRESTRICTED
          return null; // No tier restriction
        default:
          return 'BRONZE'; // Default to Bronze if unknown
      }
    }
    return 'BRONZE'; // Default to Bronze if no minimum tier specified
  };

  // Convert ITEM objects -> product model
  const products = objects
    .filter((obj) => obj.type === 'ITEM' && obj.item_data)
    .map((item) => {
      const { id, item_data } = item;

      // Determine category
      let categoryName = 'Other';
      if (item_data.categories && item_data.categories.length > 0) {
        const catId = item_data.categories[0].id;
        categoryName = categoriesMap[catId] || categoryName;
      }

      // Get redemption type from item-level custom attributes first
      let itemRedemptionType = getRedemptionType(item.custom_attribute_values);
      let itemMinimumTier = getMinimumTier(item.custom_attribute_values);

      // Build variations array
      const variationsArr = (item_data.variations || []).map((v) => {
        const vId = v.id;
        const priceCents = v.item_variation_data?.price_money?.amount;
        
        // Check variation-level custom attributes, fallback to item-level
        const variationRedemptionType = getRedemptionType(v.custom_attribute_values) || itemRedemptionType;
        const variationMinimumTier = getMinimumTier(v.custom_attribute_values) || itemMinimumTier;
        
        return {
          id: vId,
          name: v.item_variation_data?.name || 'Variant',
          cashPrice: priceCents !== undefined ? priceCents / 100 : null,
          pointsPrice: priceCents !== undefined ? priceCents * 4 : null, // 1 cent = 4 points (rough conversion)
          stockQuantity: countsMap[vId] ?? 0,
          inStock: (countsMap[vId] ?? 0) > 0,
          redemptionType: variationRedemptionType,
          minimumTier: variationMinimumTier,
        };
      });

      // Find first in-stock variation for display, or default to first one if all are OOS.
      const displayVar = variationsArr.find(v => v.inStock) || variationsArr[0] || { 
        cashPrice: 0, 
        pointsPrice: 0, 
        inStock: false, 
        stockQuantity: 0, 
        redemptionType: 'cash',
        minimumTier: 'BRONZE',
      };

      // Find image URL from the first image_id
      let imageUrl = null;
      if (item_data.image_ids && item_data.image_ids.length > 0) {
        const imageId = item_data.image_ids[0];
        imageUrl = imagesMap[imageId] || null;
      }

      const isAnyVariationInStock = variationsArr.some(v => v.inStock);

      // Determine final priceType based on the display variation's redemption type
      const finalPriceType = displayVar.redemptionType || 'cash';

      return {
        id,
        name: item_data.name,
        description: item_data.description || '',
        category: categoryName.toLowerCase(),
        priceType: finalPriceType,
        cashPrice: displayVar.cashPrice,
        pointsPrice: displayVar.pointsPrice,
        imageUrl,
        inStock: isAnyVariationInStock,
        stockQuantity: displayVar.stockQuantity,
        rating: undefined,
        reviewCount: undefined,
        createdAt: item.updated_at || item.created_at,
        variations: variationsArr,
        redemptionType: displayVar.redemptionType || 'cash',
        minimumTier: displayVar.minimumTier || 'BRONZE',
      };
    });

  // Build categories list for filters and exclude internal pseudo-categories
  const EXCLUDED_CATEGORY_NAMES = new Set(['cash only', 'points only']);
  const normalizeCategory = (value) => value.toLowerCase().replace(/[-_]+/g, ' ').trim();

  const categoriesList = Object.values(categoriesMap)
    .map((name) => name.toLowerCase())
    .filter((name) => !EXCLUDED_CATEGORY_NAMES.has(normalizeCategory(name)))
    .sort()
    .map((cat) => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }));

  return { products, categoriesList };
};

// Fetch products util which now calls backend proxy then transforms + filters
const fetchProducts = async (filters = {}) => {
  const squareRaw = await productService.getProducts();
  const { products: allProducts, categoriesList } = transformSquareCatalog(squareRaw);
  let products = [...allProducts];
  
  // Apply filters
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    products = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.category) {
    products = products.filter(product =>
      product.category === filters.category
    );
  }
  
  if (filters.priceType) {
    products = products.filter(product =>
      product.priceType === filters.priceType
    );
  }
  
  if (filters.inStockOnly) {
    products = products.filter((p) => p.inStock);
  }
  
  // Apply tier eligibility check - products are considered "in stock" only if user meets tier requirement
  if (filters.userTier !== undefined) {
    products = products.map(product => {
      // Check if any variation is accessible to the user
      const accessibleVariations = product.variations.filter(variation => 
        checkTierEligibility(filters.userTier, variation.minimumTier)
      );
      
      // If no variations are accessible, mark product as out of stock
      if (accessibleVariations.length === 0 && product.variations.length > 0) {
        return {
          ...product,
          inStock: false,
          variations: product.variations.map(v => ({ ...v, inStock: false }))
        };
      }
      
      // Update variations to reflect tier accessibility
      const updatedVariations = product.variations.map(variation => ({
        ...variation,
        inStock: variation.inStock && checkTierEligibility(filters.userTier, variation.minimumTier)
      }));
      
      // Product is in stock if any variation is accessible and in stock
      const isProductInStock = updatedVariations.some(v => v.inStock);
      
      return {
        ...product,
        inStock: isProductInStock,
        variations: updatedVariations
      };
    });
  }
  
  // Apply affordability filter
  if (filters.affordable && filters.userPoints !== undefined) {
    products = products.filter(product => {
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
    products.sort((a, b) => {
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
    totalProducts: products.length,
    cashProducts: products.filter(p => p.priceType === 'cash' || p.priceType === 'both').length,
    pointsProducts: products.filter(p => p.priceType === 'points' || p.priceType === 'both').length,
    bothProducts: products.filter(p => p.priceType === 'both').length,
    inStockProducts: products.filter(p => p.inStock).length,
    affordableProducts: filters.userPoints !== undefined 
      ? products.filter(p => {
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
  const paginatedProducts = products.slice(startIndex, endIndex);
  
  return {
    products: paginatedProducts,
    totalCount: products.length,
    stats,
    categories: categoriesList,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(products.length / limit),
      hasNext: endIndex < products.length,
      hasPrev: page > 1,
    }
  };
};

// Helper function to check if user meets minimum tier requirement
const checkTierEligibility = (userTier, requiredTier) => {
  if (!requiredTier || requiredTier === null) return true; // No tier restriction
  if (!userTier) return false; // User has no tier, can't access restricted items
  
  const userTierIndex = TIER_ORDER.indexOf(userTier);
  const requiredTierIndex = TIER_ORDER.indexOf(requiredTier);
  
  // User must have equal or higher tier (higher index in TIER_ORDER)
  return userTierIndex >= requiredTierIndex;
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
    categories: data?.categories || [],
    pagination: data?.pagination || null,
    isLoading,
    error,
    refetch
  }), [data, isLoading, error, refetch]);

  return memoizedResult;
};

export default useProducts; 
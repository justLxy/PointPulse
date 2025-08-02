/**
 * Known application routes that cannot be used as shortlink slugs
 * to avoid conflicts with existing pages
 */
export const KNOWN_ROUTES = [
  'dashboard',
  'profile', 
  'user-transactions',
  'promotions',
  'events',
  'products',
  'users',
  'transactions',
  'transfer',
  'login',
  'password-reset',
  'account-activation',
  'support',
  'privacy-policy',
  'terms-of-service',
];

/**
 * Check if a slug conflicts with known routes
 * @param {string} slug - The slug to check
 * @returns {boolean} True if there's a conflict
 */
export const hasRouteConflict = (slug) => {
  return KNOWN_ROUTES.includes(slug);
}; 
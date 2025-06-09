import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes.
 * 
 * This ensures that when users navigate between pages through the navigation header,
 * the new page always starts from the top regardless of the previous page's scroll position.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Use 'instant' to avoid animation delay
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop; 
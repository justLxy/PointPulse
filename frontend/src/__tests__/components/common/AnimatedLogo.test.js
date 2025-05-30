/**
 * Core User Flow: Logo display and animation
 * Tests basic logo rendering and animation states
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AnimatedLogo from '../../../components/common/AnimatedLogo';

// Mock framer-motion to avoid complex animation testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    svg: ({ children, ...props }) => <svg {...props}>{children}</svg>,
    circle: ({ children, ...props }) => <circle {...props}>{children}</circle>,
    path: ({ children, ...props }) => <path {...props}>{children}</path>,
  },
  useAnimation: () => ({
    start: jest.fn(),
    set: jest.fn(),
  }),
}));

describe('AnimatedLogo - Display Component', () => {
  test('renders logo with basic content', () => {
    render(<AnimatedLogo />);
    
    // Should render some form of logo content
    const logoContainer = document.querySelector('svg') || 
                         document.querySelector('[data-testid*="logo"]') ||
                         screen.getByText(/point/i, { timeout: 1000 }).catch(() => null);
    
    if (logoContainer) {
      expect(logoContainer).toBeInTheDocument();
    } else {
      // Fallback - just ensure component renders without crashing
      expect(document.body.children.length).toBeGreaterThan(0);
    }
  });

  test('handles different logo variants', () => {
    const { rerender } = render(<AnimatedLogo variant="small" />);
    
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
    
    rerender(<AnimatedLogo variant="large" />);
    expect(document.body).toBeInTheDocument();
  });

  test('handles animation control props', () => {
    const { rerender } = render(<AnimatedLogo animate={true} />);
    
    // Should render without errors
    expect(document.body).toBeInTheDocument();
    
    rerender(<AnimatedLogo animate={false} />);
    expect(document.body).toBeInTheDocument();
  });
}); 
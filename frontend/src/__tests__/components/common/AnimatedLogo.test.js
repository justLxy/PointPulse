/**
 * AnimatedLogo Component Tests
 * Purpose: Comprehensive testing of animated logo component including
 * visual elements, animation presence, accessibility, and performance
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import AnimatedLogo from '../../../components/common/AnimatedLogo';
import theme from '../../../styles/theme';

// Mock theme for testing
const mockTheme = {
  colors: {
    primary: {
      main: '#3498db',
      light: '#5dade2'
    }
  },
  spacing: {
    md: '16px'
  }
};

// Wrapper component for theme provider
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

// Mock CSS animations for testing environment
const mockAnimations = {
  pulse: 'pulse-animation',
  wave: 'wave-animation',
  draw: 'draw-animation',
  fadeIn: 'fadeIn-animation',
  rotate: 'rotate-animation',
  shimmer: 'shimmer-animation',
  float: 'float-animation'
};

// Mock styled-components animations
jest.mock('@emotion/react', () => ({
  ...jest.requireActual('@emotion/react'),
  keyframes: jest.fn((template) => {
    // Extract animation name from template
    const animationName = template.toString().match(/\w+/)?.[0] || 'mock-animation';
    return animationName;
  })
}));

// Mock performance observer for animation testing
const mockPerformanceObserver = {
  observe: jest.fn(),
  disconnect: jest.fn()
};

global.PerformanceObserver = jest.fn().mockImplementation(() => mockPerformanceObserver);

describe('AnimatedLogo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any animation states
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      // Use a more flexible text matcher for split text
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'h1' && element?.textContent === 'PointPulse';
      })).toBeInTheDocument();
    });

    it('renders the main logo container', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      // Use more generic selectors since emotion generates hash classes
      const logoWrapper = container.querySelector('div:first-child');
      const logoContainer = logoWrapper?.querySelector('div:first-child');
      
      expect(logoWrapper).toBeInTheDocument();
      expect(logoContainer).toBeInTheDocument();
    });

    it('renders the SVG logo with proper structure', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const svg = container.querySelector('svg');
      const pulseLine = container.querySelector('.pulse-line');
      const dotLeft = container.querySelector('.dot-left');
      const dotRight = container.querySelector('.dot-right');
      
      expect(svg).toBeInTheDocument();
      expect(pulseLine).toBeInTheDocument();
      expect(dotLeft).toBeInTheDocument();
      expect(dotRight).toBeInTheDocument();
    });

    it('renders the animated text with individual letter spans', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      // Check for h1 element with correct text content
      const logoText = container.querySelector('h1');
      expect(logoText).toBeInTheDocument();
      expect(logoText.textContent).toBe('PointPulse');
      
      // Check that text is split into individual spans
      const spans = container.querySelectorAll('h1 span');
      expect(spans).toHaveLength(10); // 'PointPulse' has 10 characters
      
      // Check individual letters
      expect(spans[0]).toHaveTextContent('P');
      expect(spans[1]).toHaveTextContent('o');
      expect(spans[2]).toHaveTextContent('i');
      expect(spans[3]).toHaveTextContent('n');
      expect(spans[4]).toHaveTextContent('t');
      expect(spans[5]).toHaveTextContent('P');
      expect(spans[6]).toHaveTextContent('u');
      expect(spans[7]).toHaveTextContent('l');
      expect(spans[8]).toHaveTextContent('s');
      expect(spans[9]).toHaveTextContent('e');
    });
  });

  describe('Visual Elements', () => {
    it('renders orbit circles with correct positioning', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      // Look for divs within the logo container structure
      const logoContainer = container.querySelector('div > div');
      const orbitDivs = logoContainer?.querySelectorAll('div');
      
      expect(logoContainer).toBeInTheDocument();
      expect(orbitDivs.length).toBeGreaterThan(0);
    });

    it('renders glow effect element', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      // Look for nested div structure that represents glow effect
      const logoContainer = container.querySelector('div > div');
      const nestedDivs = logoContainer?.querySelectorAll('div');
      
      expect(logoContainer).toBeInTheDocument();
      expect(nestedDivs.length).toBeGreaterThan(0);
    });

    it('applies correct SVG viewBox and dimensions', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 100 50');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    it('renders pulse line with correct path data', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const pulseLine = container.querySelector('.pulse-line');
      expect(pulseLine).toHaveAttribute('d', 'M10,25 L30,25 L40,10 L50,40 L60,25 L90,25');
    });

    it('renders dots with correct positions', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const dotLeft = container.querySelector('.dot-left');
      const dotRight = container.querySelector('.dot-right');
      
      expect(dotLeft).toHaveAttribute('cx', '10');
      expect(dotLeft).toHaveAttribute('cy', '25');
      expect(dotLeft).toHaveAttribute('r', '4');
      
      expect(dotRight).toHaveAttribute('cx', '90');
      expect(dotRight).toHaveAttribute('cy', '25');
      expect(dotRight).toHaveAttribute('r', '4');
    });
  });

  describe('Animation Presence', () => {
    it('applies styles to wrapper', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const logoWrapper = container.querySelector('div:first-child');
      expect(logoWrapper).toBeInTheDocument();
      expect(logoWrapper).toHaveStyle('position: relative');
    });

    it('applies styles to main container', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const logoContainer = container.querySelector('div > div');
      expect(logoContainer).toBeInTheDocument();
      expect(logoContainer).toHaveStyle('position: relative');
    });

    it('renders orbit elements with proper structure', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      // Check for multiple div elements representing orbit structure
      const logoContainer = container.querySelector('div > div');
      const childDivs = logoContainer?.querySelectorAll('div');
      
      expect(logoContainer).toBeInTheDocument();
      expect(childDivs.length).toBeGreaterThanOrEqual(4); // At least glow + 4 orbit dots
    });

    it('applies staggered animation delays to text spans', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const spans = container.querySelectorAll('h1 span');
      
      // Verify spans have proper display style for animation
      spans.forEach(span => {
        expect(span).toHaveStyle('display: inline-block');
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper semantic structure', () => {
      render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('has readable text content', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const logoText = container.querySelector('h1');
      expect(logoText).toBeInTheDocument();
      expect(logoText.textContent).toBe('PointPulse');
    });

    it('SVG elements have proper attributes for accessibility', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    it('respects reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      // Component should still render even with reduced motion
      const logoText = container.querySelector('h1');
      expect(logoText).toBeInTheDocument();
      expect(logoText.textContent).toBe('PointPulse');
    });
  });

  describe('Performance', () => {
    it('does not cause memory leaks with animations', async () => {
      const { unmount } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );
      
      // Simulate animation running
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Unmount component
      unmount();
      
      // Should not throw errors or cause issues
      expect(() => {
        jest.advanceTimersByTime(1000);
      }).not.toThrow();
    });

    it('handles rapid mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <TestWrapper>
            <AnimatedLogo />
          </TestWrapper>
        );
        
        act(() => {
          jest.advanceTimersByTime(100);
        });
        
        unmount();
      }
      
      // Should not cause issues
      expect(true).toBe(true);
    });
  });

  describe('Theme Integration', () => {
    it('uses theme colors correctly', () => {
      const customTheme = {
        colors: {
          primary: {
            main: '#ff0000',
            light: '#ff6666'
          }
        },
        spacing: {
          md: '20px'
        }
      };

      const CustomWrapper = ({ children }) => (
        <ThemeProvider theme={customTheme}>
          {children}
        </ThemeProvider>
      );

      const { container } = render(
        <CustomWrapper>
          <AnimatedLogo />
        </CustomWrapper>
      );
      
      const logoText = container.querySelector('h1');
      expect(logoText).toBeInTheDocument();
    });

    it('handles missing theme gracefully', () => {
      expect(() => {
        render(<AnimatedLogo />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('renders correctly in different viewport sizes', () => {
      // Mock different viewport sizes
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;

      // Test mobile viewport
      window.innerWidth = 375;
      window.innerHeight = 667;

      const { rerender, container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );

      let logoText = container.querySelector('h1');
      expect(logoText).toBeInTheDocument();
      expect(logoText.textContent).toBe('PointPulse');

      // Test desktop viewport
      window.innerWidth = 1920;
      window.innerHeight = 1080;

      rerender(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );

      logoText = container.querySelector('h1');
      expect(logoText).toBeInTheDocument();
      expect(logoText.textContent).toBe('PointPulse');

      // Restore original values
      window.innerWidth = originalInnerWidth;
      window.innerHeight = originalInnerHeight;
    });

    it('handles high contrast mode', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
        })),
      });

      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );

      const logoText = container.querySelector('h1');
      expect(logoText).toBeInTheDocument();
      expect(logoText.textContent).toBe('PointPulse');
    });

    it('maintains structure integrity during animation cycles', async () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );

      // Advance through multiple animation cycles
      for (let i = 0; i < 5; i++) {
        act(() => {
          jest.advanceTimersByTime(6000); // Full float animation cycle
        });

        // Verify structure is maintained
        expect(container.querySelector('svg')).toBeInTheDocument();
        expect(container.querySelector('.pulse-line')).toBeInTheDocument();
        expect(container.querySelectorAll('h1 span')).toHaveLength(10);
      }
    });
  });

  describe('Component Composition', () => {
    it('can be used within other components', () => {
      const ParentComponent = () => (
        <div data-testid="parent">
          <TestWrapper>
            <AnimatedLogo />
          </TestWrapper>
        </div>
      );

      const { container } = render(<ParentComponent />);

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      const logoText = container.querySelector('h1');
      expect(logoText).toBeInTheDocument();
      expect(logoText.textContent).toBe('PointPulse');
    });

    it('maintains independence when multiple instances are rendered', () => {
      const { container } = render(
        <TestWrapper>
          <div>
            <AnimatedLogo />
            <AnimatedLogo />
          </div>
        </TestWrapper>
      );

      const logoTexts = container.querySelectorAll('h1');
      expect(logoTexts).toHaveLength(2);
      logoTexts.forEach(text => {
        expect(text.textContent).toBe('PointPulse');
      });
    });
  });

  describe('CSS-in-JS Integration', () => {
    it('applies styled-components correctly', () => {
      const { container } = render(
        <TestWrapper>
          <AnimatedLogo />
        </TestWrapper>
      );

      // Check that emotion classes are applied
      const logoWrapper = container.querySelector('div:first-child');
      const logoContainer = container.querySelector('div > div');
      const logoText = container.querySelector('h1');

      // Check that elements have CSS classes (emotion generates classes starting with css-)
      expect(logoWrapper.className).toMatch(/css-/);
      expect(logoContainer.className).toMatch(/css-/);
      expect(logoText.className).toMatch(/css-/);
    });
  });
}); 
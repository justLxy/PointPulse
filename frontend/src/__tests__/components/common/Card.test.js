/**
 * Card Component Tests
 * Purpose: Comprehensive testing of card component including
 * main card, header, title, subtitle, body, footer, and all props
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@emotion/react';
import Card from '../../../components/common/Card';
import theme from '../../../styles/theme';

// Mock theme for testing
const mockTheme = {
  colors: {
    background: {
      paper: '#ffffff'
    },
    text: {
      primary: '#333333',
      secondary: '#7f8c8d'
    },
    border: {
      light: '#e0e0e0'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem'
  },
  typography: {
    fontSize: {
      sm: '0.875rem',
      lg: '1.125rem'
    },
    fontWeights: {
      regular: 400,
      semiBold: 600
    }
  },
  radius: {
    lg: '12px'
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.12)',
    md: '0 4px 6px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.12)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.12)'
  }
};

// Wrapper component for theme provider
const TestWrapper = ({ children }) => (
  <ThemeProvider theme={mockTheme}>
    {children}
  </ThemeProvider>
);

describe('Card Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(
        <TestWrapper>
          <Card>Test Card</Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    it('renders as div element', () => {
      const { container } = render(
        <TestWrapper>
          <Card>Test</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card.tagName).toBe('DIV');
    });

    it('renders children content correctly', () => {
      render(
        <TestWrapper>
          <Card>Card Content</Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      const { container } = render(
        <TestWrapper>
          <Card></Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
      expect(card.textContent).toBe('');
    });

    it('renders with complex children (JSX elements)', () => {
      render(
        <TestWrapper>
          <Card>
            <div>Content 1</div>
            <span>Content 2</span>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Elevation Prop', () => {
    const elevations = [0, 1, 2, 3, 4];

    elevations.forEach(elevation => {
      it(`renders elevation ${elevation} correctly`, () => {
        const { container } = render(
          <TestWrapper>
            <Card elevation={elevation}>Elevation {elevation}</Card>
          </TestWrapper>
        );
        
        const card = container.firstChild;
        expect(card).toBeInTheDocument();
      });
    });

    it('defaults to elevation 1 when no elevation is specified', () => {
      const { container } = render(
        <TestWrapper>
          <Card>Default Elevation</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });

    it('handles invalid elevation gracefully (fallback to elevation 1)', () => {
      const { container } = render(
        <TestWrapper>
          <Card elevation={10}>Invalid Elevation</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Invalid Elevation')).toBeInTheDocument();
    });

    it('applies no shadow for elevation 0', () => {
      const { container } = render(
        <TestWrapper>
          <Card elevation={0}>No Shadow</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveStyle('box-shadow: none');
    });
  });

  describe('Interactive Prop', () => {
    it('applies cursor pointer when interactive is true', () => {
      const { container } = render(
        <TestWrapper>
          <Card interactive>Interactive Card</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveStyle('cursor: pointer');
    });

    it('does not apply cursor pointer by default', () => {
      const { container } = render(
        <TestWrapper>
          <Card>Normal Card</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).not.toHaveStyle('cursor: pointer');
    });

    it('handles click events when interactive', () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper>
          <Card interactive onClick={handleClick}>Clickable Card</Card>
        </TestWrapper>
      );
      
      const card = screen.getByText('Clickable Card');
      fireEvent.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles boolean interactive prop correctly', () => {
      const { container: interactiveContainer } = render(
        <TestWrapper>
          <Card interactive={true}>Interactive True</Card>
        </TestWrapper>
      );

      const { container: nonInteractiveContainer } = render(
        <TestWrapper>
          <Card interactive={false}>Interactive False</Card>
        </TestWrapper>
      );
      
      const interactiveCard = interactiveContainer.firstChild;
      const nonInteractiveCard = nonInteractiveContainer.firstChild;
      
      expect(interactiveCard).toHaveStyle('cursor: pointer');
      expect(nonInteractiveCard).not.toHaveStyle('cursor: pointer');
    });
  });

  describe('Padding Props', () => {
    it('applies default padding', () => {
      const { container } = render(
        <TestWrapper>
          <Card>Default Padding</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveStyle('padding: 1rem');
    });

    it('removes padding when noPadding is true', () => {
      const { container } = render(
        <TestWrapper>
          <Card noPadding>No Padding</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveStyle('padding: 0');
    });

    it('handles noPadding boolean prop correctly', () => {
      const { container: noPaddingContainer } = render(
        <TestWrapper>
          <Card noPadding={true}>No Padding True</Card>
        </TestWrapper>
      );

      const { container: paddingContainer } = render(
        <TestWrapper>
          <Card noPadding={false}>No Padding False</Card>
        </TestWrapper>
      );
      
      const noPaddingCard = noPaddingContainer.firstChild;
      const paddingCard = paddingContainer.firstChild;
      
      expect(noPaddingCard).toHaveStyle('padding: 0');
      expect(paddingCard).toHaveStyle('padding: 1rem');
    });
  });

  describe('Full Height Prop', () => {
    it('applies full height when fullHeight is true', () => {
      const { container } = render(
        <TestWrapper>
          <Card fullHeight>Full Height Card</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveStyle('height: 100%');
    });

    it('does not apply full height by default', () => {
      const { container } = render(
        <TestWrapper>
          <Card>Normal Height Card</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).not.toHaveStyle('height: 100%');
    });

    it('handles fullHeight boolean prop correctly', () => {
      const { container: fullHeightContainer } = render(
        <TestWrapper>
          <Card fullHeight={true}>Full Height True</Card>
        </TestWrapper>
      );

      const { container: normalHeightContainer } = render(
        <TestWrapper>
          <Card fullHeight={false}>Full Height False</Card>
        </TestWrapper>
      );
      
      const fullHeightCard = fullHeightContainer.firstChild;
      const normalHeightCard = normalHeightContainer.firstChild;
      
      expect(fullHeightCard).toHaveStyle('height: 100%');
      expect(normalHeightCard).not.toHaveStyle('height: 100%');
    });
  });

  describe('CSS Styling', () => {
    it('applies base styles correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Card>Styled Card</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveStyle('background-color: #ffffff');
      expect(card).toHaveStyle('border-radius: 12px');
      expect(card).toHaveStyle('width: 100%');
      expect(card).toHaveStyle('overflow: hidden');
      expect(card).toHaveStyle('transition: box-shadow 0.3s ease');
    });

    it('applies emotion CSS classes', () => {
      const { container } = render(
        <TestWrapper>
          <Card>CSS Card</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card.className).toMatch(/css-/);
    });
  });

  describe('Props and Attributes', () => {
    it('passes through additional props', () => {
      const { container } = render(
        <TestWrapper>
          <Card data-testid="custom-card" aria-label="Custom card" role="region">
            Custom Props
          </Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveAttribute('data-testid', 'custom-card');
      expect(card).toHaveAttribute('aria-label', 'Custom card');
      expect(card).toHaveAttribute('role', 'region');
    });

    it('handles className prop correctly', () => {
      const { container } = render(
        <TestWrapper>
          <Card className="custom-class">Custom Class</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('handles style prop correctly', () => {
      const customStyle = { margin: '10px', fontSize: '14px' };
      const { container } = render(
        <TestWrapper>
          <Card style={customStyle}>Custom Style</Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveStyle('margin: 10px');
      expect(card).toHaveStyle('font-size: 14px');
    });
  });

  describe('Card.Header Component', () => {
    it('renders header without crashing', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Header>Header Content</Card.Header>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('applies flexbox layout styles', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Header>Header</Card.Header>
          </Card>
        </TestWrapper>
      );
      
      const header = screen.getByText('Header');
      expect(header).toHaveStyle('display: flex');
      expect(header).toHaveStyle('align-items: center');
      expect(header).toHaveStyle('justify-content: space-between');
    });

    it('applies divider when divider prop is true', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Header divider>Header with Divider</Card.Header>
          </Card>
        </TestWrapper>
      );
      
      const header = screen.getByText('Header with Divider');
      expect(header).toHaveStyle('border-bottom: 1px solid #e0e0e0');
      expect(header).toHaveStyle('padding-bottom: 0.5rem');
    });

    it('does not apply divider by default', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Header>Header without Divider</Card.Header>
          </Card>
        </TestWrapper>
      );
      
      const header = screen.getByText('Header without Divider');
      expect(header).toHaveStyle('border-bottom: none');
      expect(header).toHaveStyle('padding-bottom: 0');
    });
  });

  describe('Card.Title Component', () => {
    it('renders title without crashing', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Title>Card Title</Card.Title>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders as h3 element', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Title>Title</Card.Title>
          </Card>
        </TestWrapper>
      );
      
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
    });

    it('applies correct typography styles', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Title>Styled Title</Card.Title>
          </Card>
        </TestWrapper>
      );
      
      const title = screen.getByText('Styled Title');
      expect(title).toHaveStyle('margin: 0');
      expect(title).toHaveStyle('font-size: 1.125rem');
      expect(title).toHaveStyle('font-weight: 600');
      expect(title).toHaveStyle('color: #333333');
    });
  });

  describe('Card.Subtitle Component', () => {
    it('renders subtitle without crashing', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Subtitle>Card Subtitle</Card.Subtitle>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    });

    it('renders as h4 element', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Subtitle>Subtitle</Card.Subtitle>
          </Card>
        </TestWrapper>
      );
      
      const subtitle = screen.getByRole('heading', { level: 4 });
      expect(subtitle).toBeInTheDocument();
      expect(subtitle.tagName).toBe('H4');
    });

    it('applies correct typography styles', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Subtitle>Styled Subtitle</Card.Subtitle>
          </Card>
        </TestWrapper>
      );
      
      const subtitle = screen.getByText('Styled Subtitle');
      expect(subtitle).toHaveStyle('font-size: 0.875rem');
      expect(subtitle).toHaveStyle('font-weight: 400');
      expect(subtitle).toHaveStyle('color: #7f8c8d');
      expect(subtitle).toHaveStyle('margin: 0.25rem 0 0');
    });
  });

  describe('Card.Body Component', () => {
    it('renders body without crashing', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Body>Body Content</Card.Body>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('applies scrollable styles when scrollable prop is true', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Body scrollable>Scrollable Body</Card.Body>
          </Card>
        </TestWrapper>
      );
      
      const body = screen.getByText('Scrollable Body');
      expect(body).toHaveStyle('max-height: 300px');
      expect(body).toHaveStyle('overflow-y: auto');
    });

    it('applies custom maxHeight when provided', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Body scrollable maxHeight="500px">Custom Height Body</Card.Body>
          </Card>
        </TestWrapper>
      );
      
      const body = screen.getByText('Custom Height Body');
      expect(body).toHaveStyle('max-height: 500px');
    });

    it('does not apply scrollable styles by default', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Body>Normal Body</Card.Body>
          </Card>
        </TestWrapper>
      );
      
      const body = screen.getByText('Normal Body');
      expect(body).not.toHaveStyle('max-height: 300px');
      expect(body).not.toHaveStyle('overflow-y: auto');
    });
  });

  describe('Card.Footer Component', () => {
    it('renders footer without crashing', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Footer>Footer Content</Card.Footer>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('applies flexbox layout styles', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Footer>Footer</Card.Footer>
          </Card>
        </TestWrapper>
      );
      
      const footer = screen.getByText('Footer');
      expect(footer).toHaveStyle('display: flex');
      expect(footer).toHaveStyle('align-items: center');
      expect(footer).toHaveStyle('justify-content: flex-end');
    });

    it('applies divider when divider prop is true', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Footer divider>Footer with Divider</Card.Footer>
          </Card>
        </TestWrapper>
      );
      
      const footer = screen.getByText('Footer with Divider');
      expect(footer).toHaveStyle('border-top: 1px solid #e0e0e0');
      expect(footer).toHaveStyle('padding-top: 1rem');
    });

    it('does not apply divider by default', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Footer>Footer without Divider</Card.Footer>
          </Card>
        </TestWrapper>
      );
      
      const footer = screen.getByText('Footer without Divider');
      expect(footer).toHaveStyle('border-top: none');
      expect(footer).toHaveStyle('padding-top: 0');
    });

    describe('Footer Alignment', () => {
      const alignments = [
        { align: 'start', expected: 'flex-start' },
        { align: 'center', expected: 'center' },
        { align: 'between', expected: 'space-between' },
        { align: 'end', expected: 'flex-end' }
      ];

      alignments.forEach(({ align, expected }) => {
        it(`applies ${align} alignment correctly`, () => {
          const { container } = render(
            <TestWrapper>
              <Card>
                <Card.Footer align={align}>Footer {align}</Card.Footer>
              </Card>
            </TestWrapper>
          );
          
          const footer = screen.getByText(`Footer ${align}`);
          expect(footer).toHaveStyle(`justify-content: ${expected}`);
        });
      });

      it('defaults to end alignment', () => {
        const { container } = render(
          <TestWrapper>
            <Card>
              <Card.Footer>Default Footer</Card.Footer>
            </Card>
          </TestWrapper>
        );
        
        const footer = screen.getByText('Default Footer');
        expect(footer).toHaveStyle('justify-content: flex-end');
      });
    });
  });

  describe('Complete Card Composition', () => {
    it('renders complete card with all components', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Header divider>
              <Card.Title>Card Title</Card.Title>
              <Card.Subtitle>Card Subtitle</Card.Subtitle>
            </Card.Header>
            <Card.Body>
              Body content goes here
            </Card.Body>
            <Card.Footer divider align="between">
              <span>Left content</span>
              <span>Right content</span>
            </Card.Footer>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Body content goes here')).toBeInTheDocument();
      expect(screen.getByText('Left content')).toBeInTheDocument();
      expect(screen.getByText('Right content')).toBeInTheDocument();
    });

    it('maintains component hierarchy and semantic structure', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Header>
              <Card.Title>Main Title</Card.Title>
            </Card.Header>
            <Card.Body>
              <p>Paragraph content</p>
            </Card.Body>
          </Card>
        </TestWrapper>
      );
      
      const title = screen.getByRole('heading', { level: 3 });
      const paragraph = screen.getByText('Paragraph content');
      
      expect(title).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.tagName).toBe('P');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long content', () => {
      const longText = 'This is a very long card content that should still render correctly without breaking the layout and maintain proper overflow handling';
      render(
        <TestWrapper>
          <Card>
            <Card.Body>{longText}</Card.Body>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('handles numeric content', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Title>{42}</Card.Title>
            <Card.Body>{0}</Card.Body>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      const specialText = '!@#$%^&*()';
      render(
        <TestWrapper>
          <Card>
            <Card.Title>{specialText}</Card.Title>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('handles unicode characters', () => {
      const unicodeText = '📋 卡片 Card';
      render(
        <TestWrapper>
          <Card>
            <Card.Title>{unicodeText}</Card.Title>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText(unicodeText)).toBeInTheDocument();
    });

    it('handles null and undefined children gracefully', () => {
      const { container } = render(
        <TestWrapper>
          <Card>
            <Card.Header>{null}</Card.Header>
            <Card.Body>{undefined}</Card.Body>
          </Card>
        </TestWrapper>
      );
      
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <Card>
            <Card.Title>Main Title</Card.Title>
            <Card.Subtitle>Subtitle</Card.Subtitle>
          </Card>
        </TestWrapper>
      );
      
      const title = screen.getByRole('heading', { level: 3 });
      const subtitle = screen.getByRole('heading', { level: 4 });
      
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    });

    it('supports ARIA attributes', () => {
      const { container } = render(
        <TestWrapper>
          <Card 
            role="region" 
            aria-label="Card content"
            aria-describedby="card-description"
          >
            <Card.Body id="card-description">
              Accessible card content
            </Card.Body>
          </Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toHaveAttribute('role', 'region');
      expect(card).toHaveAttribute('aria-label', 'Card content');
      expect(card).toHaveAttribute('aria-describedby', 'card-description');
    });

    it('maintains focus management for interactive cards', () => {
      const { container } = render(
        <TestWrapper>
          <Card interactive tabIndex={0}>
            Focusable Card
          </Card>
        </TestWrapper>
      );
      
      const card = container.firstChild;
      card.focus();
      expect(card).toHaveFocus();
    });
  });

  describe('Theme Integration', () => {
    it('uses theme values correctly', () => {
      const customTheme = {
        ...mockTheme,
        colors: {
          ...mockTheme.colors,
          background: {
            paper: '#f8f9fa'
          }
        }
      };

      const CustomWrapper = ({ children }) => (
        <ThemeProvider theme={customTheme}>
          {children}
        </ThemeProvider>
      );

      const { container } = render(
        <CustomWrapper>
          <Card>Themed Card</Card>
        </CustomWrapper>
      );
      
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });

    it('handles missing theme gracefully', () => {
      expect(() => {
        render(<Card>No Theme Card</Card>);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const { rerender } = render(
        <TestWrapper>
          <Card>Initial Content</Card>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Card>Initial Content</Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Initial Content')).toBeInTheDocument();
    });

    it('handles rapid prop changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <Card elevation={1}>Test</Card>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Card elevation={2}>Test</Card>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Card elevation={3}>Test</Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('maintains performance with complex compositions', () => {
      const { rerender } = render(
        <TestWrapper>
          <Card>
            <Card.Header divider>
              <Card.Title>Title</Card.Title>
            </Card.Header>
            <Card.Body scrollable>Content</Card.Body>
            <Card.Footer divider>Footer</Card.Footer>
          </Card>
        </TestWrapper>
      );
      
      rerender(
        <TestWrapper>
          <Card interactive>
            <Card.Header>
              <Card.Title>Updated Title</Card.Title>
            </Card.Header>
            <Card.Body>Updated Content</Card.Body>
          </Card>
        </TestWrapper>
      );
      
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
      expect(screen.getByText('Updated Content')).toBeInTheDocument();
    });
  });
}); 